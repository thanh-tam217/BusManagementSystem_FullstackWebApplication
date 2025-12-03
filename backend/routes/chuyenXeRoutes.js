const express = require('express');
const router = express.Router();
const { layDsChuyen, taoChuyen, capNhatChuyen, xoaChuyen } = require('../controllers/chuyenXeController');
const { baoVe, phanQuyen } = require('../middleware/authMiddleware');

router.get('/', layDsChuyen);
// Chỉ Admin Bến Xe mới được tạo chuyến (theo yêu cầu [cite: 152])
router.post('/', baoVe, phanQuyen('AdminBenXe'), taoChuyen);
router.put('/:id', baoVe, phanQuyen('AdminBenXe'), capNhatChuyen);
router.delete('/:id', baoVe, phanQuyen('AdminBenXe'), xoaChuyen);

module.exports = router;