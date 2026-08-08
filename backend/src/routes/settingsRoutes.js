const express = require('express');
const router = express.Router();

const settingsController = require('../controllers/settingsController');
const requireAuth = require('../middleware/auth');
const { settingsRules, validate } = require('../utils/validators');

router.get('/', settingsController.getSettings);
router.put('/', requireAuth, settingsRules, validate, settingsController.updateSettings);

module.exports = router;
