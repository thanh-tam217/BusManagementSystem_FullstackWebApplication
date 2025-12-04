const express = require('express');
const router = express.Router();
const { getDoanhThuTheoNam } = require('../controllers/thongKeController');
const { baoVe, phanQuyen } = require('../middleware/authMiddleware');

// Chỉ Admin Hệ Thống và Admin Bến được xem
router.get('/doanh-thu-nam', baoVe, phanQuyen('AdminHeThong', 'AdminBenXe'), getDoanhThuTheoNam);

module.exports = router;