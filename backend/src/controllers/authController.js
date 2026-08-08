const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin } = require('../models');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ where: { username } });
  // Mensagem genérica de propósito: não revelamos se foi o usuário ou a senha que errou.
  if (!admin) throw new ApiError(401, 'Usuário ou senha incorretos.');

  const senhaOk = await bcrypt.compare(password, admin.passwordHash);
  if (!senhaOk) throw new ApiError(401, 'Usuário ou senha incorretos.');

  const token = jwt.sign({ id: admin.id, username: admin.username }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

  res.json({ token, username: admin.username });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const admin = await Admin.findByPk(req.admin.id);
  if (!admin) throw new ApiError(404, 'Administrador não encontrado.');

  const senhaOk = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!senhaOk) throw new ApiError(401, 'Senha atual incorreta.');

  admin.passwordHash = await bcrypt.hash(newPassword, 10);
  await admin.save();

  res.json({ message: 'Senha atualizada com sucesso.' });
});

const me = asyncHandler(async (req, res) => {
  res.json({ id: req.admin.id, username: req.admin.username });
});

module.exports = { login, changePassword, me };
