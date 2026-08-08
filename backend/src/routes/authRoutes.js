const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const requireAuth = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimit');
const { loginRules, changePasswordRules, validate } = require('../utils/validators');

router.post('/login', loginLimiter, loginRules, validate, authController.login);
router.get('/me', requireAuth, authController.me);
router.put('/password', requireAuth, changePasswordRules, validate, authController.changePassword);

module.exports = router;
