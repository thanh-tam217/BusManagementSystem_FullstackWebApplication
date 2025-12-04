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


// @desc    Cập nhật bến xe
// @route   PUT /api/ben-xe/:id
const capNhatBenXe = async (req, res) => {
    try {
        const { tenBen, diaChi, soDienThoai, maTinh } = req.body;
        const ben = await BenXe.findById(req.params.id);

        if (!ben) return res.status(404).json({ message: 'Bến xe không tồn tại' });

        ben.tenBen = tenBen || ben.tenBen;
        ben.diaChi = diaChi || ben.diaChi;
        ben.soDienThoai = soDienThoai || ben.soDienThoai;
        ben.maTinh = maTinh || ben.maTinh;

        await ben.save();
        res.json(ben);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Xóa bến xe (Bổ sung thêm cho đủ bộ)
const xoaBenXe = async (req, res) => {
    try {
        // Cần kiểm tra xem có xe/chuyến nào thuộc bến này không trước khi xóa (Tạm bỏ qua để đơn giản)
        await BenXe.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xóa bến xe' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { layDsBenXe, taoBenXe, capNhatBenXe, xoaBenXe };
