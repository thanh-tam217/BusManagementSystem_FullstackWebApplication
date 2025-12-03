const express = require('express');
const router = express.Router();
const { layDsTinhThanh, taoTinhThanh } = require('../controllers/tinhThanhController');
const { baoVe, phanQuyen } = require('../middleware/authMiddleware');

// Ai cũng xem được
router.get('/', layDsTinhThanh);

// Chỉ AdminHeThong mới được thêm tỉnh
router.post('/', baoVe, phanQuyen('AdminHeThong'), taoTinhThanh);

module.exports = router;