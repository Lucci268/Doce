const express = require('express');
const router = express.Router();

const itemController = require('../controllers/itemController');
const requireAuth = require('../middleware/auth');
const { itemRules, idParamRule, validate } = require('../utils/validators');

// Pública — qualquer visitante do site precisa ver o cardápio.
router.get('/', itemController.listItems);

// Administrativas — exigem login.
router.post('/', requireAuth, itemRules, validate, itemController.createItem);
router.put('/:id', requireAuth, idParamRule, itemRules, validate, itemController.updateItem);
router.delete('/:id', requireAuth, idParamRule, validate, itemController.deleteItem);

module.exports = router;
