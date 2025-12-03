const express = require('express');
const router = express.Router();
const { layDsTuyen, taoTuyen } = require('../controllers/tuyenXeController');
const { baoVe, phanQuyen } = require('../middleware/authMiddleware');

router.get('/', layDsTuyen);
router.post('/', baoVe, phanQuyen('AdminHeThong'), taoTuyen);

module.exports = router;