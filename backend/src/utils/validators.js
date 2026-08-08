const { body, param, validationResult } = require('express-validator');
const ApiError = require('./ApiError');
const Order = require('../models/Order');

/**
 * Roda depois das regras "body(...)"/"param(...)" abaixo e transforma
 * qualquer erro de validação em um ApiError 400 com mensagem clara.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return next(new ApiError(400, firstError.msg));
  }
  next();
}

const itemRules = [
  body('nome').trim().notEmpty().withMessage('Informe o nome do item.').isLength({ max: 150 }),
  body('categoria').trim().notEmpty().withMessage('Informe a categoria do item.').isLength({ max: 80 }),
  body('descricao').optional({ checkFalsy: true }).isString().isLength({ max: 2000 }),
  body('preco').isFloat({ min: 0 }).withMessage('O preço deve ser um número maior ou igual a zero.'),
  body('promo').optional().isBoolean().toBoolean(),
  body('precoPromocional')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('O preço promocional deve ser um número maior ou igual a zero.')
    .custom((value, { req }) => {
      if (req.body.promo && Number(value) >= Number(req.body.preco)) {
        throw new Error('O preço promocional deve ser menor que o preço normal.');
      }
      return true;
    }),
  body('disponivel').optional().isBoolean().toBoolean(),
  body('imagemUrl').optional({ checkFalsy: true }).isString(),
];

const idParamRule = [param('id').isUUID().withMessage('Identificador inválido.')];

const loginRules = [
  body('username').trim().notEmpty().withMessage('Informe o usuário.'),
  body('password').notEmpty().withMessage('Informe a senha.'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Informe a senha atual.'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('A nova senha deve ter pelo menos 6 caracteres.'),
];

const settingsRules = [
  body('endereco').optional().trim().isLength({ max: 300 }),
  body('telefone').optional().trim().isLength({ max: 30 }),
  body('horario').optional().trim().isLength({ max: 300 }),
  body('instagram').optional().trim().isLength({ max: 300 }),
  body('taxaEntrega').optional().isFloat({ min: 0 }).withMessage('A taxa de entrega deve ser um número maior ou igual a zero.'),
  body('textoPromocao').optional().trim().isLength({ max: 500 }),
];

const orderRules = [
  body('nomeCliente').trim().notEmpty().withMessage('Informe o nome do cliente.').isLength({ max: 150 }),
  body('telefone').trim().notEmpty().withMessage('Informe o telefone do cliente.').isLength({ max: 30 }),
  body('tipoEntrega').isIn(Order.TIPOS).withMessage('Tipo de entrega inválido.'),
  body('endereco').if(body('tipoEntrega').equals('entrega')).trim().notEmpty().withMessage('Informe o endereço de entrega.'),
  body('formaPagamento').isIn(Order.PAGAMENTOS).withMessage('Forma de pagamento inválida.'),
  body('observacoes').optional({ checkFalsy: true }).isString().isLength({ max: 1000 }),
  body('itens').isArray({ min: 1 }).withMessage('O pedido precisa ter pelo menos um item.'),
  body('itens.*.id').isUUID().withMessage('Item de pedido inválido.'),
  body('itens.*.quantidade').isInt({ min: 1, max: 99 }).withMessage('Quantidade de item inválida.'),
];

const statusRules = [
  body('status').isIn(Order.STATUSES).withMessage('Status de pedido inválido.'),
];

module.exports = {
  validate,
  itemRules,
  idParamRule,
  loginRules,
  changePasswordRules,
  settingsRules,
  orderRules,
  statusRules,
};
