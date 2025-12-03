const express = require('express');
const router = express.Router();
const { layDsXe, taoXe, xoaXe, capNhatXe } = require('../controllers/xeController');
const { baoVe, phanQuyen } = require('../middleware/authMiddleware');

// Lấy danh sách (Ai cũng xem được, nhưng kết quả trả về khác nhau tùy Token)
// Lưu ý: route này cần 'baoVe' để biết ai đang gọi (req.user), nhưng nếu khách vãng lai (không token) gọi thì sao?

router.get('/', baoVe, layDsXe);

// Thêm xe: Chỉ Admin Hệ thống và Admin Bến
router.post('/', baoVe, phanQuyen('AdminHeThong', 'AdminBenXe'), taoXe);router.put('/:id', baoVe, phanQuyen('AdminHeThong', 'AdminBenXe'), capNhatXe);

// Xóa xe
router.delete('/:id', baoVe, phanQuyen('AdminHeThong', 'AdminBenXe'), xoaXe);

module.exports = router;