const TuyenXe = require('../models/TuyenXe');

// @desc    Lấy danh sách tuyến xe
// @route   GET /api/tuyen-xe
const layDsTuyen = async (req, res) => {
    try {
        const dsTuyen = await TuyenXe.find()
            .populate('diemDi', 'tenTinh')
            .populate('diemDen', 'tenTinh');
        res.json(dsTuyen);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Tạo tuyến xe mới
// @route   POST /api/tuyen-xe
// @access  Private (AdminHeThong, AdminBenXe)
const taoTuyen = async (req, res) => {
    try {
        const { diemDi, diemDen, thoiGianDiChuyen, quangDuong } = req.body;

        // Validate cơ bản: Điểm đi không được trùng điểm đến
        if (diemDi === diemDen) {
            return res.status(400).json({ message: 'Điểm đi và điểm đến không được trùng nhau' });
        }

        const tuyenMoi = await TuyenXe.create({
            diemDi,
            diemDen,
            thoiGianDiChuyen,
            quangDuong
        });

        res.status(201).json(tuyenMoi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { layDsTuyen, taoTuyen };