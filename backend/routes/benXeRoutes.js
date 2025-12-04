const express = require('express');
const router = express.Router();
const { layDsBenXe, taoBenXe, capNhatBenXe, xoaBenXe } = require('../controllers/benXeController');
const { baoVe, phanQuyen } = require('../middleware/authMiddleware');

router.get('/', layDsBenXe);
router.post('/', baoVe, phanQuyen('AdminHeThong'), taoBenXe);
router.put('/:id', baoVe, phanQuyen('AdminHeThong'), capNhatBenXe);
router.delete('/:id', baoVe, phanQuyen('AdminHeThong'), xoaBenXe);

module.exports = router;