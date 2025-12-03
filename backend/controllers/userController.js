const NguoiDung = require('../models/NguoiDung');
const bcrypt = require('bcryptjs');

// @desc    Lấy danh sách người dùng
// @logic   AdminHeThong: Thấy hết. AdminBenXe: Chỉ thấy nhân viên bến mình.
const layDsNguoiDung = async (req, res) => {
    try {
        let query = {};

        // LOGIC SCOPE: Admin Bến chỉ thấy người của bến mình
        if (req.user.vaiTro === 'AdminBenXe') {
            query.maBenQuanLy = req.user.maBenQuanLy;
            // Không cho thấy Admin Hệ Thống (để bảo mật)
            query.vaiTro = { $ne: 'AdminHeThong' };
        }

        const users = await NguoiDung.find(query)
            .select('-matKhau')
            .populate('maBenQuanLy', 'tenBen')
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Tạo người dùng mới
const taoNguoiDung = async (req, res) => {
    try {
        const { hoTen, email, matKhau, soDienThoai, vaiTro, maBenQuanLy } = req.body;

        // LOGIC SCOPE KHI TẠO:
        let finalMaBen = maBenQuanLy;
        
        // Nếu người tạo là Admin Bến -> Bắt buộc nhân viên mới phải thuộc bến này
        if (req.user.vaiTro === 'AdminBenXe') {
            finalMaBen = req.user.maBenQuanLy;
            
            // Chặn: Admin Bến không được phép tạo Admin Hệ Thống hoặc Admin Bến khác
            if (vaiTro === 'AdminHeThong' || vaiTro === 'AdminBenXe') {
                return res.status(403).json({ message: 'Bạn không có quyền tạo Admin' });
            }
        }

        const userExists = await NguoiDung.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Email đã tồn tại' });

        const user = await NguoiDung.create({
            hoTen,
            email,
            matKhau,
            soDienThoai,
            vaiTro,
            maBenQuanLy: finalMaBen
        });

        res.status(201).json({ message: 'Tạo tài khoản thành công', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Xóa người dùng
// @route   DELETE /api/users/:id
const xoaNguoiDung = async (req, res) => {
    try {
        await NguoiDung.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xóa người dùng' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { layDsNguoiDung, taoNguoiDung, xoaNguoiDung };