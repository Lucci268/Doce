const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Tabela "singleton": guarda sempre uma única linha (id fixo = 1) com
 * as configurações gerais do site (contato, textos, taxa de entrega).
 */
const Settings = sequelize.define(
  'Settings',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: 1 },
    endereco: { type: DataTypes.STRING(300), allowNull: false, defaultValue: '' },
    telefone: { type: DataTypes.STRING(30), allowNull: false, defaultValue: '' },
    horario: { type: DataTypes.STRING(300), allowNull: false, defaultValue: '' },
    instagram: { type: DataTypes.STRING(300), allowNull: false, defaultValue: '' },
    taxaEntrega: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    textoPromocao: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
  },
  {
    tableName: 'settings',
    timestamps: true,
  }
);

module.exports = Settings;
