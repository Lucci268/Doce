const sequelize = require('../config/database');
const Item = require('./Item');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Settings = require('./Settings');
const Admin = require('./Admin');

// Um pedido tem vários itens; cada item de pedido pertence a um pedido.
Order.hasMany(OrderItem, { as: 'itens', foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

/**
 * Cria as tabelas que ainda não existem (não apaga dados existentes).
 * Para mudanças de schema mais sérias no futuro, o ideal é migrar para
 * migrations reais do Sequelize — para o tamanho deste projeto, o
 * sync() automático é suficiente e muito mais simples de manter.
 */
async function syncDatabase() {
  await sequelize.sync();
}

module.exports = {
  sequelize,
  Item,
  Order,
  OrderItem,
  Settings,
  Admin,
  syncDatabase,
};
