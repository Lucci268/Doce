const { Order, OrderItem, Item, Settings, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/orders — público.
 *
 * Importante: os preços do pedido são calculados aqui no servidor a
 * partir do preço atual de cada item no banco — nunca confiamos no
 * preço que o navegador envia. Isso evita que alguém manipule a
 * requisição e feche um pedido com valores inventados.
 */
const createOrder = asyncHandler(async (req, res) => {
  const { nomeCliente, telefone, tipoEntrega, endereco, formaPagamento, observacoes, itens } = req.body;

  const result = await sequelize.transaction(async (t) => {
    const itemIds = itens.map((i) => i.id);
    const dbItems = await Item.findAll({ where: { id: itemIds }, transaction: t });

    if (dbItems.length !== new Set(itemIds).size) {
      throw new ApiError(400, 'Um ou mais itens do pedido não foram encontrados no cardápio.');
    }

    const indisponivel = dbItems.find((i) => i.disponivel === false);
    if (indisponivel) {
      throw new ApiError(400, `O item "${indisponivel.nome}" não está mais disponível.`);
    }

    let subtotal = 0;
    const snapshots = itens.map((pedidoItem) => {
      const dbItem = dbItems.find((i) => i.id === pedidoItem.id);
      const precoUnitario =
        dbItem.promo && dbItem.precoPromocional != null ? Number(dbItem.precoPromocional) : Number(dbItem.preco);
      subtotal += precoUnitario * pedidoItem.quantidade;
      return {
        itemId: dbItem.id,
        nome: dbItem.nome,
        preco: precoUnitario,
        quantidade: pedidoItem.quantidade,
      };
    });

    const settings = await Settings.findByPk(1, { transaction: t });
    const taxaEntrega = tipoEntrega === 'entrega' ? Number(settings?.taxaEntrega || 0) : 0;
    const total = subtotal + taxaEntrega;

    const order = await Order.create(
      {
        nomeCliente,
        telefone,
        tipoEntrega,
        endereco: tipoEntrega === 'entrega' ? endereco : '',
        formaPagamento,
        observacoes: observacoes || '',
        subtotal,
        taxaEntrega,
        total,
        status: 'Pendente',
      },
      { transaction: t }
    );

    await OrderItem.bulkCreate(
      snapshots.map((s) => ({ ...s, orderId: order.id })),
      { transaction: t }
    );

    return order;
  });

  const fullOrder = await Order.findByPk(result.id, { include: [{ association: 'itens' }] });
  res.status(201).json(fullOrder);
});

// GET /api/orders — admin
const listOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    include: [{ association: 'itens' }],
    order: [['createdAt', 'DESC']],
  });
  res.json(orders);
});

// GET /api/orders/stats — admin
const orderStats = asyncHandler(async (req, res) => {
  const orders = await Order.findAll();
  const total = orders.length;
  const pendentes = orders.filter((o) => o.status === 'Pendente').length;
  const receita = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const entregas = orders.filter((o) => o.tipoEntrega === 'entrega').length;
  res.json({ total, pendentes, receita, entregas });
});

// PUT /api/orders/:id/status — admin
const updateStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) throw new ApiError(404, 'Pedido não encontrado.');

  order.status = req.body.status;
  await order.save();
  res.json(order);
});

module.exports = { createOrder, listOrders, orderStats, updateStatus };
