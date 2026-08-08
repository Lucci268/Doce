const { Item } = require('../models');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/items — público. Qualquer visitante do site precisa ver o cardápio.
const listItems = asyncHandler(async (req, res) => {
  const items = await Item.findAll({ order: [['categoria', 'ASC'], ['ordem', 'ASC'], ['createdAt', 'ASC']] });
  res.json(items);
});

// POST /api/items — admin
const createItem = asyncHandler(async (req, res) => {
  const { nome, categoria, descricao, preco, promo, precoPromocional, imagemUrl, disponivel } = req.body;

  const item = await Item.create({
    nome,
    categoria,
    descricao: descricao || '',
    preco,
    promo: !!promo,
    precoPromocional: promo ? precoPromocional : null,
    imagemUrl: imagemUrl || null,
    disponivel: disponivel !== undefined ? disponivel : true,
  });

  res.status(201).json(item);
});

// PUT /api/items/:id — admin
const updateItem = asyncHandler(async (req, res) => {
  const item = await Item.findByPk(req.params.id);
  if (!item) throw new ApiError(404, 'Item não encontrado.');

  const { nome, categoria, descricao, preco, promo, precoPromocional, imagemUrl, disponivel } = req.body;

  item.set({
    ...(nome !== undefined && { nome }),
    ...(categoria !== undefined && { categoria }),
    ...(descricao !== undefined && { descricao }),
    ...(preco !== undefined && { preco }),
    ...(promo !== undefined && { promo: !!promo }),
    precoPromocional: promo ? precoPromocional : null,
    ...(imagemUrl !== undefined && { imagemUrl }),
    ...(disponivel !== undefined && { disponivel }),
  });

  await item.save();
  res.json(item);
});

// DELETE /api/items/:id — admin
const deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findByPk(req.params.id);
  if (!item) throw new ApiError(404, 'Item não encontrado.');

  await item.destroy();
  res.json({ message: 'Item excluído com sucesso.' });
});

module.exports = { listItems, createItem, updateItem, deleteItem };
