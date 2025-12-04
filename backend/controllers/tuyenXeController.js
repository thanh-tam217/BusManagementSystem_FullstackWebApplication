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

// @desc    Cập nhật Tuyến Xe
// @route   PUT /api/tuyen-xe/:id
const capNhatTuyen = async (req, res) => {
    try {
        const { diemDi, diemDen, thoiGianDiChuyen, quangDuong } = req.body;
        const tuyen = await TuyenXe.findById(req.params.id);

        if (!tuyen) return res.status(404).json({ message: 'Không tìm thấy tuyến xe' });

        if (diemDi === diemDen) {
            return res.status(400).json({ message: 'Điểm đi và điểm đến không được trùng nhau' });
        }

        tuyen.diemDi = diemDi || tuyen.diemDi;
        tuyen.diemDen = diemDen || tuyen.diemDen;
        tuyen.thoiGianDiChuyen = thoiGianDiChuyen || tuyen.thoiGianDiChuyen;
        tuyen.quangDuong = quangDuong || tuyen.quangDuong;

        await tuyen.save();
        res.json(tuyen);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Nhớ export thêm hàm này:
module.exports = { layDsTuyen, taoTuyen, capNhatTuyen };

