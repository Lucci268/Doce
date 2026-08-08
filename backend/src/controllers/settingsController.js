const { Settings } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/settings — público
const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.findByPk(1);
  res.json(settings);
});

// PUT /api/settings — admin
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.findByPk(1);
  const { endereco, telefone, horario, instagram, taxaEntrega, textoPromocao } = req.body;

  settings.set({
    ...(endereco !== undefined && { endereco }),
    ...(telefone !== undefined && { telefone }),
    ...(horario !== undefined && { horario }),
    ...(instagram !== undefined && { instagram }),
    ...(taxaEntrega !== undefined && { taxaEntrega }),
    ...(textoPromocao !== undefined && { textoPromocao }),
  });

  await settings.save();
  res.json(settings);
});

module.exports = { getSettings, updateSettings };
