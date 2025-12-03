const Xe = require('../models/Xe');

// @desc    Lấy danh sách xe
// @logic   Nếu là AdminBenXe -> Chỉ thấy xe bến mình. Nếu là AdminHeThong/Khach -> Thấy hết (hoặc lọc theo params)
// @route   GET /api/xe
const layDsXe = async (req, res) => {
    try {
        let query = {};

        // SCOPE CONTROL: Nếu là Admin Bến, bắt buộc chỉ lấy xe của bến mình
        if (req.user && req.user.vaiTro === 'AdminBenXe') {
            query.maBen = req.user.maBenQuanLy;
        } 
        // Nếu client gửi param lọc theo bến (dành cho khách hàng tìm kiếm)
        else if (req.query.maBen) {
            query.maBen = req.query.maBen;
        }

        const dsXe = await Xe.find(query).populate('maBen', 'tenBen');
        res.json(dsXe);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Thêm xe mới
// @route   POST /api/xe
// @access  Private (AdminHeThong, AdminBenXe)
const taoXe = async (req, res) => {
    try {
        const { bienSo, loaiXe, soGhe, trangThai } = req.body;
        let maBen;

        // LOGIC PHÂN QUYỀN:
        // 1. Nếu là Admin Bến Xe: Bắt buộc xe phải thuộc bến của họ
        if (req.user.vaiTro === 'AdminBenXe') {
            maBen = req.user.maBenQuanLy;
        } 
        // 2. Nếu là Admin Hệ Thống: Có quyền chỉ định xe này thuộc bến nào
        else if (req.user.vaiTro === 'AdminHeThong') {
            maBen = req.body.maBen; 
            if (!maBen) return res.status(400).json({ message: 'Admin hệ thống phải chọn bến xe' });
        }

        // Kiểm tra biển số trùng
        const xeTonTai = await Xe.findOne({ bienSo });
        if (xeTonTai) {
            return res.status(400).json({ message: 'Biển số xe này đã tồn tại' });
        }

        const xeMoi = await Xe.create({
            bienSo,
            loaiXe,
            soGhe,
            maBen, // ID bến được gán tự động hoặc do Admin HT chọn
            trangThai
        });

        res.status(201).json(xeMoi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Xóa xe
// @route   DELETE /api/xe/:id
const xoaXe = async (req, res) => {
    try {
        const xe = await Xe.findById(req.params.id);

        if (!xe) {
            return res.status(404).json({ message: 'Không tìm thấy xe' });
        }

        // SCOPE CONTROL: Nếu là Admin Bến, phải kiểm tra xem xe này có thuộc bến mình không
        if (req.user.vaiTro === 'AdminBenXe' && xe.maBen.toString() !== req.user.maBenQuanLy.toString()) {
            return res.status(403).json({ message: 'Bạn không có quyền xóa xe của bến khác' });
        }

        await xe.deleteOne();
        res.json({ message: 'Đã xóa xe thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Cập nhật thông tin xe
// @route   PUT /api/xe/:id
const capNhatXe = async (req, res) => {
    try {
        const { bienSo, loaiXe, soGhe, trangThai } = req.body;
        const xe = await Xe.findById(req.params.id);

        if (!xe) {
            return res.status(404).json({ message: 'Không tìm thấy xe' });
        }

        // Scope Control: Check quyền
        if (req.user.vaiTro === 'AdminBenXe' && xe.maBen.toString() !== req.user.maBenQuanLy.toString()) {
            return res.status(403).json({ message: 'Không có quyền sửa xe bến khác' });
        }

        xe.bienSo = bienSo || xe.bienSo;
        xe.loaiXe = loaiXe || xe.loaiXe;
        xe.soGhe = soGhe || xe.soGhe;
        xe.trangThai = trangThai || xe.trangThai;

        const updatedXe = await xe.save();
        res.json(updatedXe);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { layDsXe, taoXe, xoaXe, capNhatXe };