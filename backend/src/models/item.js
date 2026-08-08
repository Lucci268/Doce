const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');

/**
 * Item do cardápio (bolo, torta, doce, salgado, bebida...).
 */
const Item = sequelize.define(
  'Item',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    categoria: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '',
    },
    preco: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    promo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    precoPromocional: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    imagemUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    disponivel: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    ordem: {
      // permite, no futuro, controlar a ordem de exibição manualmente
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'items',
    timestamps: true,
  }
);

module.exports = Item;
