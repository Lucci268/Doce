/**
 * Erro "esperado" da aplicação (ex: item não encontrado, senha errada).
 * Os controllers lançam `throw new ApiError(404, 'Item não encontrado')`
 * e o middleware de erro (errorHandler.js) transforma isso na resposta
 * JSON correta, com o status HTTP certo.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isApiError = true;
  }
}

module.exports = ApiError;
