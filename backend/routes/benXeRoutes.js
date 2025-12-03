const express = require('express');
const router = express.Router();
const { layDsBenXe, taoBenXe } = require('../controllers/benXeController');
const { baoVe, phanQuyen } = require('../middleware/authMiddleware');

router.get('/', layDsBenXe);
router.post('/', baoVe, phanQuyen('AdminHeThong'), taoBenXe);

module.exports = router;