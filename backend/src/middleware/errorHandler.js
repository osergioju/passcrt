import { AppError } from '../utils/AppError.js'
import { env } from '../config/env.js'

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    })
  }

  // Erros conhecidos do Prisma traduzidos para respostas amigáveis, sem
  // vazar detalhes de schema/query para o cliente.
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Já existe um registro com esses dados' })
  }
  if (err.code === 'P2003' || err.code === 'P2014') {
    return res
      .status(409)
      .json({ error: 'Operação bloqueada por vínculos com outros registros' })
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Recurso não encontrado' })
  }

  // Nunca vazar detalhes internos (stack, query, segredos) para o cliente.
  if (env.nodeEnv !== 'production') {
    console.error(err)
  } else {
    console.error(err.message)
  }

  return res.status(500).json({ error: 'Erro interno do servidor' })
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Rota não encontrada' })
}
