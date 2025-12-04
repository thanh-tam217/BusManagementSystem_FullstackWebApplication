const express = require('express');
const router = express.Router();
const { layDsTinhThanh, taoTinhThanh, capNhatTinhThanh, xoaTinhThanh } = require('../controllers/tinhThanhController');
const { baoVe, phanQuyen } = require('../middleware/authMiddleware');

// Ai cũng xem được
router.get('/', layDsTinhThanh);

// Chỉ AdminHeThong mới được thêm tỉnh
router.post('/', baoVe, phanQuyen('AdminHeThong'), taoTinhThanh);
router.put('/:id', baoVe, phanQuyen('AdminHeThong'), capNhatTinhThanh);
router.delete('/:id', baoVe, phanQuyen('AdminHeThong'), xoaTinhThanh);

module.exports = router;