const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const env = require('./config/env');
const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Segurança básica de headers HTTP.
// contentSecurityPolicy fica desligado por padrão porque o front-end
// carrega a fonte do Google Fonts; se preferir, configure a CSP manualmente.
app.use(helmet({ contentSecurityPolicy: false }));

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);

app.use(morgan(env.isProduction ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Imagens enviadas pelo admin.
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API.
app.use('/api', apiRoutes);

// Front-end estático (a pasta /frontend fica um nível acima de /backend).
const frontendPath = path.join(__dirname, '..', '..', 'frontend');
app.use(express.static(frontendPath));

// Qualquer rota que não seja /api ou /uploads cai no front-end (SPA-friendly).
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) next();
  });
});

app.use('/api', notFoundHandler);
app.use(errorHandler);

module.exports = app;
