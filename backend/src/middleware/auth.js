const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

/**
 * Protege rotas administrativas. Espera um header:
 *   Authorization: Bearer <token>
 * O token é gerado no login (authController) e contém o id/username
 * do admin. Se estiver ausente, inválido ou expirado, a requisição
 * é rejeitada antes de chegar ao controller.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError(401, 'É necessário estar autenticado para acessar este recurso.'));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.admin = payload;
    next();
  } catch (err) {
    next(new ApiError(401, 'Sessão inválida ou expirada. Faça login novamente.'));
  }
}

module.exports = requireAuth;
