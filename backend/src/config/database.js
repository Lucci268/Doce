/**
 * Conexão com o banco de dados.
 *
 * Usamos SQLite por padrão: é um único arquivo (data/database.sqlite),
 * não exige instalar/configurar um servidor de banco separado, e é mais
 * do que suficiente para o volume de pedidos de uma confeitaria.
 *
 * Se um dia o negócio crescer e for preciso migrar para PostgreSQL ou
 * MySQL, basta trocar as opções abaixo — o resto do código (models,
 * controllers) não muda, pois tudo passa pelo Sequelize.
 */
const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', '..', 'data', 'database.sqlite'),
  logging: false, // troque para console.log se quiser ver as queries SQL geradas
});

module.exports = sequelize;
