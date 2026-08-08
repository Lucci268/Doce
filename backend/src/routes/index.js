const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.use('/auth', require('./authRoutes'));
router.use('/items', require('./itemRoutes'));
router.use('/orders', require('./orderRoutes'));
router.use('/settings', require('./settingsRoutes'));
router.use('/upload', require('./uploadRoutes'));

module.exports = router;
