const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');

const STATUSES = ['Pendente', 'Em preparo', 'Pronto', 'Saiu para entrega', 'Entregue', 'Cancelado'];
const TIPOS = ['retirada', 'entrega'];
const PAGAMENTOS = ['pix', 'cartao', 'dinheiro'];

const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    nomeCliente: { type: DataTypes.STRING(150), allowNull: false },
    telefone: { type: DataTypes.STRING(30), allowNull: false },
    tipoEntrega: {
      type: DataTypes.ENUM(...TIPOS),
      allowNull: false,
      defaultValue: 'retirada',
    },
    endereco: { type: DataTypes.STRING(300), allowNull: true, defaultValue: '' },
    formaPagamento: {
      type: DataTypes.ENUM(...PAGAMENTOS),
      allowNull: false,
      defaultValue: 'pix',
    },
    observacoes: { type: DataTypes.TEXT, allowNull: true, defaultValue: '' },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    taxaEntrega: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: {
      type: DataTypes.ENUM(...STATUSES),
      allowNull: false,
      defaultValue: 'Pendente',
    },
  },
  {
    tableName: 'orders',
    timestamps: true,
  }
);

Order.STATUSES = STATUSES;
Order.TIPOS = TIPOS;
Order.PAGAMENTOS = PAGAMENTOS;

module.exports = Order;
