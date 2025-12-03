const express = require('express');
const router = express.Router();
const { dangKy, dangNhap } = require('../controllers/authController');

// Định nghĩa đường dẫn
// POST /api/auth/register
router.post('/register', dangKy);

// POST /api/auth/login
router.post('/login', dangNhap);

module.exports = router;