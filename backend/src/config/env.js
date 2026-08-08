/**
 * Carrega o .env e expõe as variáveis de ambiente já validadas.
 * Centralizar isso aqui evita "process.env.X" espalhado pelo projeto
 * e falha rápido (com mensagem clara) se algo essencial não foi configurado.
 */
require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(
      `A variável de ambiente ${name} não foi definida. Copie o arquivo .env.example para .env e preencha os valores.`
    );
  }
  return value;
}

module.exports = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: required('ADMIN_PASSWORD'),
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim()),
  isProduction: process.env.NODE_ENV === 'production',
};
