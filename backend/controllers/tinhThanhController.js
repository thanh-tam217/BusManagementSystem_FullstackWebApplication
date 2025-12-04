const TinhThanh = require('../models/TinhThanh');
const BenXe = require('../models/BenXe'); 

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

// @desc    Cập nhật Tỉnh Thành
// @route   PUT /api/tinh-thanh/:id
const capNhatTinhThanh = async (req, res) => {
    try {
        const { tenTinh } = req.body;
        const tinh = await TinhThanh.findById(req.params.id);

        if (!tinh) return res.status(404).json({ message: 'Không tìm thấy tỉnh thành' });

        tinh.tenTinh = tenTinh || tinh.tenTinh;
        
        await tinh.save();
        res.json(tinh);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Xóa tỉnh thành
// @route   DELETE /api/tinh-thanh/:id
const xoaTinhThanh = async (req, res) => {
    try {
        const idTinh = req.params.id;

        // 1. KIỂM TRA AN TOÀN: Tỉnh này có bến xe nào không?
        const benTonTai = await BenXe.findOne({ maTinh: idTinh });
        if (benTonTai) {
            return res.status(400).json({ 
                message: `Không thể xóa! Tỉnh này đang chứa bến xe "${benTonTai.tenBen}". Hãy xóa bến trước.` 
            });
        }

        // 2. Nếu sạch sẽ thì cho xóa
        await TinhThanh.findByIdAndDelete(idTinh);
        res.json({ message: 'Đã xóa tỉnh thành thành công' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Nhớ export thêm hàm này:
module.exports = { layDsTinhThanh, taoTinhThanh, capNhatTinhThanh, xoaTinhThanh };
