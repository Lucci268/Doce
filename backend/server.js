const app = require('./src/app');
const env = require('./src/config/env');
const { syncDatabase } = require('./src/models');

async function start() {
  try {
    await syncDatabase();
    app.listen(env.port, () => {
      console.log(`\nFlor de Açúcar — servidor rodando na porta ${env.port}`);
      console.log(`Site:  http://localhost:${env.port}`);
      console.log(`Admin: http://localhost:${env.port}/admin.html`);
      console.log(`API:   http://localhost:${env.port}/api\n`);
    });
  } catch (err) {
    console.error('Não foi possível iniciar o servidor:', err);
    process.exit(1);
  }
}

start();
