const express = require('express');
const router = express.Router();
const { layDsTuyen, taoTuyen, capNhatTuyen, xoaTuyen } = require('../controllers/tuyenXeController');
const { baoVe, phanQuyen } = require('../middleware/authMiddleware');

router.get('/', layDsTuyen);
router.post('/', baoVe, phanQuyen('AdminHeThong'), taoTuyen);
router.put('/:id', baoVe, phanQuyen('AdminHeThong'), capNhatTuyen);
router.delete('/:id', baoVe, phanQuyen('AdminHeThong'), xoaTuyen);

module.exports = router;