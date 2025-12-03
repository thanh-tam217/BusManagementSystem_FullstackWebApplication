const TinhThanh = require('../models/TinhThanh');

// @desc    Lấy danh sách tất cả tỉnh thành
// @route   GET /api/tinh-thanh
// @access  Public (Ai cũng xem được để chọn vé)
const layDsTinhThanh = async (req, res) => {
    try {
        const dsTinh = await TinhThanh.find().sort({ tenTinh: 1 }); // Sắp xếp A-Z
        res.json(dsTinh);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Thêm tỉnh thành mới
// @route   POST /api/tinh-thanh
// @access  Private (Chỉ AdminHeThong)
const taoTinhThanh = async (req, res) => {
    try {
        const { tenTinh } = req.body;
        
        // Kiểm tra trùng
        const tinhTonTai = await TinhThanh.findOne({ tenTinh });
        if (tinhTonTai) {
            return res.status(400).json({ message: 'Tỉnh này đã tồn tại' });
        }

        const tinhMoi = await TinhThanh.create({ tenTinh });
        res.status(201).json(tinhMoi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { layDsTinhThanh, taoTinhThanh };