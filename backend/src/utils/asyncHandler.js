/**
 * Envolve uma função de rota assíncrona e encaminha qualquer erro
 * para o middleware de tratamento de erros, sem precisar repetir
 * try/catch em todo controller.
 *
 * Uso: router.get('/', asyncHandler(async (req, res) => { ... }))
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
