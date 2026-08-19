import { createApp } from '../../src/app.js'

// Sobe a app Express numa porta efêmera para os testes de integração
// falarem com ela via fetch, do mesmo jeito que um cliente real faria
// — sem depender de nenhuma lib de HTTP mock.
export async function startTestServer() {
  const app = createApp()
  const server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  const { port } = server.address()
  return {
    baseUrl: `http://127.0.0.1:${port}/api`,
    close: () => new Promise((resolve) => server.close(resolve)),
  }
}

// Wrapper fino sobre fetch que mantém o cookie de refresh entre
// chamadas (como um navegador faria), já que o backend usa cookie
// httpOnly para o refresh token.
export function createHttpClient(baseUrl) {
  let cookie = null
  let accessToken = null

  async function request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' }
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`
    if (cookie) headers.Cookie = cookie

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    const setCookie = res.headers.get('set-cookie')
    if (setCookie) cookie = setCookie

    const text = await res.text()
    const data = text ? JSON.parse(text) : null
    return { status: res.status, data }
  }

  return {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    delete: (path) => request('DELETE', path),
    setAccessToken: (token) => {
      accessToken = token
    },
  }
}
