const express = require('express');
const router = express.Router();
const { datVe, layVeCuaToi, layGheDaDat, traCuuVe, capNhatThanhToan } = require('../controllers/veXeController');
const { baoVe } = require('../middleware/authMiddleware');

// Khách đặt vé (Cần đăng nhập)
router.post('/', baoVe, datVe);

// Khách xem lịch sử vé (Cần đăng nhập)
router.get('/cua-toi', baoVe, layVeCuaToi);

// Public API: Lấy danh sách ghế đã đặt để vẽ sơ đồ (Ai cũng xem được để chọn ghế)
router.get('/theo-chuyen/:maChuyen', layGheDaDat);

router.get('/tra-cuu', traCuuVe);

router.post('/cap-nhat-thanh-toan', capNhatThanhToan); // Không cần baoVe để VNPay gọi (hoặc client gọi nhanh)

module.exports = router;