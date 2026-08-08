const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Usuário administrador. Suporta mais de um registro caso, no futuro,
 * a confeitaria queira dar acesso ao painel para mais de uma pessoa —
 * hoje o seed cria apenas um.
 */
const Admin = sequelize.define(
  'Admin',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING(60), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: 'admins',
    timestamps: true,
  }
);

module.exports = Admin;
