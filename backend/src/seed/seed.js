/**
 * Script de inicialização do banco de dados.
 * Roda com: npm run seed
 *
 * - Cria as tabelas (se ainda não existirem)
 * - Cria o usuário admin definido no .env (se ainda não existir)
 * - Cria a linha de configurações padrão (se ainda não existir)
 * - Cria alguns itens de exemplo no cardápio (só se o cardápio estiver vazio)
 *
 * É seguro rodar mais de uma vez: nunca duplica nem apaga dados existentes.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { syncDatabase, Admin, Settings, Item } = require('../models');

const DEFAULT_ITEMS = [
  { nome: 'Bolo de Chocolate Belga', categoria: 'Bolos', preco: 89.9, descricao: 'Camadas fofinhas com ganache cremoso de chocolate meio amargo.', imagemUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop' },
  { nome: 'Red Velvet', categoria: 'Bolos', preco: 94.9, descricao: 'Massa aveludada com cream cheese e um toque de baunilha.', imagemUrl: 'https://images.unsplash.com/photo-1616690710400-a16d146927c5?q=80&w=600&auto=format&fit=crop' },
  { nome: 'Bolo de Cenoura com Brigadeiro', categoria: 'Bolos', preco: 79.9, promo: true, precoPromocional: 64.9, descricao: 'O clássico brasileiro, com cobertura generosa de brigadeiro.', imagemUrl: 'https://images.unsplash.com/photo-1605807646983-377bc5a76493?q=80&w=600&auto=format&fit=crop' },
  { nome: 'Torta de Limão Siciliano', categoria: 'Tortas', preco: 69.9, descricao: 'Base amanteigada, creme de limão e merengue maçaricado.', imagemUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?q=80&w=600&auto=format&fit=crop' },
  { nome: 'Torta Holandesa', categoria: 'Tortas', preco: 74.9, descricao: 'Biscoito, chocolate e chantilly em camadas irresistíveis.', imagemUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop' },
  { nome: 'Caixa de Brigadeiros Gourmet (12un)', categoria: 'Doces Finos', preco: 45.0, promo: true, precoPromocional: 36.9, descricao: 'Sabores variados: tradicional, ninho, pistache e maracujá.', imagemUrl: 'https://images.unsplash.com/photo-1548907040-4baa419e8225?q=80&w=600&auto=format&fit=crop' },
  { nome: 'Macarons Franceses (6un)', categoria: 'Doces Finos', preco: 38.0, descricao: 'Casquinha crocante e recheio macio em sabores selecionados.', imagemUrl: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?q=80&w=600&auto=format&fit=crop' },
  { nome: 'Coxinha Artesanal (10un)', categoria: 'Salgados', preco: 32.0, descricao: 'Massa cremosa e recheio de frango generoso, fritas na hora.', imagemUrl: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=600&auto=format&fit=crop' },
  { nome: 'Quiche de Alho-poró', categoria: 'Salgados', preco: 28.0, descricao: 'Massa amanteigada com recheio cremoso de alho-poró e queijo.', imagemUrl: 'https://images.unsplash.com/photo-1591985666643-1ecc67616216?q=80&w=600&auto=format&fit=crop' },
  { nome: 'Café Especial', categoria: 'Bebidas', preco: 8.0, descricao: 'Grãos selecionados, torra média, coado na hora.', imagemUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop' },
  { nome: 'Chá Gelado de Frutas Vermelhas', categoria: 'Bebidas', preco: 9.5, descricao: 'Refrescante, adoçado na medida certa.', imagemUrl: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?q=80&w=600&auto=format&fit=crop' },
];

async function run() {
  console.log('Sincronizando banco de dados...');
  await syncDatabase();

  const existingAdmin = await Admin.findOne({ where: { username: env.adminUsername } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(env.adminPassword, 10);
    await Admin.create({ username: env.adminUsername, passwordHash });
    console.log(`Admin "${env.adminUsername}" criado com a senha definida no .env.`);
  } else {
    console.log(`Admin "${env.adminUsername}" já existe — nada a fazer.`);
  }

  const existingSettings = await Settings.findByPk(1);
  if (!existingSettings) {
    await Settings.create({
      id: 1,
      endereco: 'Rua das Flores, 123 — Boa Viagem, Recife - PE',
      telefone: '5581999990000',
      horario: 'Terça a sábado: 9h às 19h · Domingo: 9h às 13h · Segunda: fechado',
      instagram: 'https://instagram.com/flordeacucar',
      taxaEntrega: 8,
      textoPromocao: 'Aproveite condições especiais em itens selecionados do nosso cardápio.',
    });
    console.log('Configurações padrão criadas.');
  } else {
    console.log('Configurações já existem — nada a fazer.');
  }

  const itemCount = await Item.count();
  if (itemCount === 0) {
    await Item.bulkCreate(DEFAULT_ITEMS);
    console.log(`${DEFAULT_ITEMS.length} itens de exemplo criados no cardápio.`);
  } else {
    console.log('O cardápio já tem itens — nada a fazer.');
  }

  console.log('Seed concluído com sucesso.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Erro ao rodar o seed:', err);
  process.exit(1);
});
