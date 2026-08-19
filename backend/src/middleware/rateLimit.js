import rateLimit from 'express-rate-limit'

// Rate limit geral da API — evita abuso básico em qualquer rota.
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limit estrito para login — mitiga brute force de credenciais.
// Chave por IP; combinado com o lockout por conta em authService, que
// cobre o caso de um único IP tentando várias contas ou vice-versa.
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Tente novamente mais tarde.' },
})
