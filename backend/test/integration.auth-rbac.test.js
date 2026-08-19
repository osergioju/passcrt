import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer, createHttpClient } from './helpers/testServer.js'
import { createUserFixture, createClientFixture, createCategoryFixture, cleanupFixtures } from './helpers/fixtures.js'
import { prisma } from '../src/config/prisma.js'
import { ROLES } from '../src/config/permissions.js'

describe('Autenticação, RBAC e controle de acesso por credencial', () => {
  let server
  let adminMaster
  let plainUser
  let client
  let category

  before(async () => {
    server = await startTestServer()
    ;[adminMaster, plainUser] = await Promise.all([
      createUserFixture(ROLES.ADMIN_MASTER),
      createUserFixture(ROLES.USER),
    ])
    client = await createClientFixture()
    category = await createCategoryFixture()
  })

  after(async () => {
    await cleanupFixtures({
      userIds: [adminMaster.id, plainUser.id],
      clientIds: [client.id],
      categoryIds: [category.id],
    })
    await server.close()
    await prisma.$disconnect()
  })

  it('rejeita login com senha incorreta', async () => {
    const http = createHttpClient(server.baseUrl)
    const res = await http.post('/auth/login', { email: adminMaster.email, password: 'senha-errada' })
    assert.equal(res.status, 401)
  })

  it('aceita login com credenciais corretas e devolve um access token', async () => {
    const http = createHttpClient(server.baseUrl)
    const res = await http.post('/auth/login', { email: adminMaster.email, password: adminMaster.password })
    assert.equal(res.status, 200)
    assert.ok(res.data.accessToken)
    assert.equal(res.data.user.email, adminMaster.email)
    assert.ok(res.data.user.roles.includes(ROLES.ADMIN_MASTER))
  })

  it('bloqueia um USER de criar cliente (403) mas permite ao ADMIN_MASTER', async () => {
    const asUser = createHttpClient(server.baseUrl)
    const loginUser = await asUser.post('/auth/login', { email: plainUser.email, password: plainUser.password })
    asUser.setAccessToken(loginUser.data.accessToken)

    const forbidden = await asUser.post('/clients', { name: 'Cliente Não Autorizado' })
    assert.equal(forbidden.status, 403)

    const asAdmin = createHttpClient(server.baseUrl)
    const loginAdmin = await asAdmin.post('/auth/login', { email: adminMaster.email, password: adminMaster.password })
    asAdmin.setAccessToken(loginAdmin.data.accessToken)

    const allowed = await asAdmin.post('/clients', { name: 'Cliente Autorizado ' + Date.now() })
    assert.equal(allowed.status, 201)
    await prisma.client.delete({ where: { id: allowed.data.client.id } })
  })

  it('exige token válido para acessar rotas autenticadas', async () => {
    const http = createHttpClient(server.baseUrl)
    const res = await http.get('/clients')
    assert.equal(res.status, 401)
  })

  describe('controle de acesso por credencial (item 3/13 do escopo)', () => {
    // A permissão de role (credentials.view_password) é o primeiro
    // portão — só ADMIN e ADMIN_MASTER a possuem por padrão. Dentro
    // disso, a concessão por credencial (CredentialPermission) decide
    // quem, entre os ADMINs, pode de fato revelar aquela senha
    // específica. Um USER comum nunca passa nem do primeiro portão,
    // mesmo que alguém tente conceder acesso à credencial para ele.
    let credentialId
    let adminMasterClient
    let grantedAdminClient
    let ungrantedAdminClient
    let plainUserClient
    let grantedAdmin
    let ungrantedAdmin

    before(async () => {
      ;[grantedAdmin, ungrantedAdmin] = await Promise.all([
        createUserFixture(ROLES.ADMIN),
        createUserFixture(ROLES.ADMIN),
      ])

      adminMasterClient = createHttpClient(server.baseUrl)
      const login = await adminMasterClient.post('/auth/login', {
        email: adminMaster.email,
        password: adminMaster.password,
      })
      adminMasterClient.setAccessToken(login.data.accessToken)

      const created = await adminMasterClient.post('/credentials', {
        name: 'Credencial de Teste',
        clientId: client.id,
        categoryId: category.id,
        username: 'usuario.teste',
        password: 'senha-secreta-da-credencial',
        accessUserIds: [grantedAdmin.id],
      })
      assert.equal(created.status, 201)
      credentialId = created.data.credential.id

      grantedAdminClient = createHttpClient(server.baseUrl)
      const grantedLogin = await grantedAdminClient.post('/auth/login', {
        email: grantedAdmin.email,
        password: grantedAdmin.password,
      })
      grantedAdminClient.setAccessToken(grantedLogin.data.accessToken)

      ungrantedAdminClient = createHttpClient(server.baseUrl)
      const ungrantedLogin = await ungrantedAdminClient.post('/auth/login', {
        email: ungrantedAdmin.email,
        password: ungrantedAdmin.password,
      })
      ungrantedAdminClient.setAccessToken(ungrantedLogin.data.accessToken)

      plainUserClient = createHttpClient(server.baseUrl)
      const plainLogin = await plainUserClient.post('/auth/login', {
        email: plainUser.email,
        password: plainUser.password,
      })
      plainUserClient.setAccessToken(plainLogin.data.accessToken)
    })

    after(async () => {
      await cleanupFixtures({ userIds: [grantedAdmin.id, ungrantedAdmin.id] })
    })

    it('permite ao ADMIN com concessão explícita revelar a senha', async () => {
      const res = await grantedAdminClient.post(`/credentials/${credentialId}/password`)
      assert.equal(res.status, 200)
      assert.equal(res.data.password, 'senha-secreta-da-credencial')
    })

    it('bloqueia um ADMIN sem concessão de ver a senha (403), mesmo com a permissão de role', async () => {
      const res = await ungrantedAdminClient.post(`/credentials/${credentialId}/password`)
      assert.equal(res.status, 403)
    })

    it('ainda assim, o ADMIN sem concessão consegue ver os metadados (role vê tudo, senha é que é restrita)', async () => {
      const res = await ungrantedAdminClient.get(`/credentials/${credentialId}`)
      assert.equal(res.status, 200)
    })

    it('bloqueia um USER comum de sequer tentar revelar a senha — falta a permissão de role', async () => {
      const res = await plainUserClient.post(`/credentials/${credentialId}/password`)
      assert.equal(res.status, 403)
    })
  })

  describe('auditoria', () => {
    it('exige a permissão audit.view (USER comum recebe 403)', async () => {
      const asUser = createHttpClient(server.baseUrl)
      const login = await asUser.post('/auth/login', { email: plainUser.email, password: plainUser.password })
      asUser.setAccessToken(login.data.accessToken)

      const res = await asUser.get('/audit')
      assert.equal(res.status, 403)
    })

    it('permite ao ADMIN_MASTER listar o log e reflete o próprio login como evento', async () => {
      const asAdmin = createHttpClient(server.baseUrl)
      const login = await asAdmin.post('/auth/login', { email: adminMaster.email, password: adminMaster.password })
      asAdmin.setAccessToken(login.data.accessToken)

      const res = await asAdmin.get(`/audit?userId=${adminMaster.id}&action=LOGIN`)
      assert.equal(res.status, 200)
      assert.ok(res.data.total >= 1)
      assert.ok(res.data.logs.every((log) => log.action === 'LOGIN'))
    })
  })
})
