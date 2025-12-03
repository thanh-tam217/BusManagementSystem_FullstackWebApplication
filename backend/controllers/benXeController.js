const BenXe = require('../models/BenXe');

// @desc    Lấy danh sách bến xe (có thể lọc theo Tỉnh)
// @route   GET /api/ben-xe?tinh=xxx
const layDsBenXe = async (req, res) => {
    try {
        let query = {};
        // Nếu trên URL có gửi ?tinh=ID_TINH thì lọc theo tỉnh đó
        if (req.query.tinh) {
            query.maTinh = req.query.tinh;
        }

        // .populate('maTinh') giúp lấy luôn tên tỉnh thay vì chỉ hiện ID loằng ngoằng
        const dsBen = await BenXe.find(query).populate('maTinh', 'tenTinh');
        res.json(dsBen);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Tạo bến xe mới
// @route   POST /api/ben-xe
// @access  Private (AdminHeThong)
const taoBenXe = async (req, res) => {
    try {
        const { tenBen, diaChi, soDienThoai, maTinh } = req.body;

        const benMoi = await BenXe.create({
            tenBen,
            diaChi,
            soDienThoai,
            maTinh
        });

        res.status(201).json(benMoi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { layDsBenXe, taoBenXe };