const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');

// Rota de login para admin frontend
router.post('/login', adminAuthController.login);

module.exports = router;
