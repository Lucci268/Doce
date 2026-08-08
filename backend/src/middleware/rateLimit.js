const rateLimit = require('express-rate-limit');

/**
 * Limita tentativas de login: evita força bruta na senha do admin.
 * 10 tentativas a cada 15 minutos por IP.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Limita criação de pedidos: evita spam/flood no sistema de pedidos.
 * 20 pedidos a cada 10 minutos por IP é bastante folga para uso legítimo.
 */
const orderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: { error: 'Muitos pedidos enviados em pouco tempo. Aguarde alguns minutos e tente novamente.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, orderLimiter };
