const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const requireAuth = require('../middleware/auth');
const { orderLimiter } = require('../middleware/rateLimit');
const { orderRules, idParamRule, statusRules, validate } = require('../utils/validators');

// Pública — cliente finalizando a compra no site.
router.post('/', orderLimiter, orderRules, validate, orderController.createOrder);

// Administrativas.
router.get('/', requireAuth, orderController.listOrders);
router.get('/stats', requireAuth, orderController.orderStats);
router.put('/:id/status', requireAuth, idParamRule, statusRules, validate, orderController.updateStatus);

module.exports = router;
