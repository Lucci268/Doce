const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/upload/image — admin. Recebe multipart/form-data (campo "image").
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Nenhuma imagem foi enviada.');

  // Caminho público pelo qual o arquivo pode ser acessado (servido em /uploads).
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

module.exports = { uploadImage };
