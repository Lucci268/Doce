const env = require('../config/env');

/**
 * Middleware final: qualquer erro passado via next(err) cai aqui.
 * Mantém as respostas de erro em um formato único e consistente:
 *   { "error": "mensagem em português para mostrar ao usuário" }
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.isApiError ? err.statusCode : err.statusCode || 500;
  const message = err.isApiError || statusCode < 500 ? err.message : 'Ocorreu um erro interno no servidor.';

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: message,
    ...(!env.isProduction && statusCode >= 500 ? { stack: err.stack } : {}),
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Rota não encontrada.' });
}

module.exports = { errorHandler, notFoundHandler };
