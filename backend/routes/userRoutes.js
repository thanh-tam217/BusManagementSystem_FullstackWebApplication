const express = require('express');
const router = express.Router();
const { layDsNguoiDung, taoNguoiDung, xoaNguoiDung, capNhatNguoiDung, capNhatThongTinCaNhan, layThongTinCaNhan } = require('../controllers/userController');const { baoVe, phanQuyen } = require('../middleware/authMiddleware');

router.get('/profile', baoVe, layThongTinCaNhan);
router.put('/profile', baoVe, capNhatThongTinCaNhan);

// Tất cả các route này đều cần quyền Admin Hệ thống
router.use(baoVe);
router.use(phanQuyen('AdminHeThong', 'AdminBenXe'));



router.get('/', layDsNguoiDung);
router.post('/', taoNguoiDung);
router.delete('/:id', xoaNguoiDung);
router.put('/:id', capNhatNguoiDung); 


module.exports = router;