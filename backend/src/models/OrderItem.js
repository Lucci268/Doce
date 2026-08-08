const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');

/**
 * Guarda uma "fotografia" do item no momento do pedido (nome e preço).
 * Isso é proposital: se o admin mudar o preço ou apagar o item do
 * cardápio amanhã, o histórico de pedidos antigos não pode mudar.
 */
const OrderItem = sequelize.define(
  'OrderItem',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    itemId: { type: DataTypes.UUID, allowNull: true }, // referência ao item original, se ainda existir
    nome: { type: DataTypes.STRING(150), allowNull: false },
    preco: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    quantidade: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  },
  {
    tableName: 'order_items',
    timestamps: false,
  }
);

module.exports = OrderItem;
