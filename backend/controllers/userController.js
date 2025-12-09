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

// @desc    Cập nhật thông tin người dùng
// @route   PUT /api/users/:id
const capNhatNguoiDung = async (req, res) => {
    try {
        const { hoTen, soDienThoai, vaiTro, matKhau } = req.body;
        const user = await NguoiDung.findById(req.params.id);

        if (!user) return res.status(404).json({ message: 'User không tồn tại' });

        // Check quyền: Admin Bến chỉ được sửa nhân viên của bến mình
        if (req.user.vaiTro === 'AdminBenXe') {
            if (user.maBenQuanLy?.toString() !== req.user.maBenQuanLy.toString()) {
                return res.status(403).json({ message: 'Không có quyền sửa nhân viên bến khác' });
            }
            // Không cho phép Admin Bến sửa vaiTro thành Admin Hệ Thống
            if (vaiTro === 'AdminHeThong') {
                return res.status(403).json({ message: 'Không được phép nâng quyền này' });
            }
        }

        user.hoTen = hoTen || user.hoTen;
        user.soDienThoai = soDienThoai || user.soDienThoai;
        user.vaiTro = vaiTro || user.vaiTro;
        
        // Nếu có gửi mật khẩu mới thì cập nhật (Middleware pre-save sẽ tự hash)
        if (matKhau) {
            user.matKhau = matKhau;
        }

        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const layThongTinCaNhan = async (req, res) => {
    try {
        // req.user._id có được nhờ middleware baoVe giải mã token
        const user = await NguoiDung.findById(req.user._id).select('-matKhau'); // Không trả về mật khẩu

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const capNhatThongTinCaNhan = async (req, res) => {
    try {
        // Lấy ID từ Token (req.user._id) thay vì params để bảo mật
        const user = await NguoiDung.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        // Cập nhật các trường cho phép
        user.hoTen = req.body.hoTen || user.hoTen;
        user.soDienThoai = req.body.soDienThoai || user.soDienThoai;
        user.diaChi = req.body.diaChi || user.diaChi;
        user.gioiTinh = req.body.gioiTinh || user.gioiTinh;
        user.ngaySinh = req.body.ngaySinh || user.ngaySinh;

        // Nếu muốn đổi mật khẩu
        if (req.body.matKhauMoi) {
            user.matKhau = req.body.matKhauMoi;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            hoTen: updatedUser.hoTen,
            email: updatedUser.email,
            vaiTro: updatedUser.vaiTro,
            soDienThoai: updatedUser.soDienThoai,
            maBenQuanLy: updatedUser.maBenQuanLy
            // Đã xóa dòng token để tránh lỗi nếu chưa import
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Nhớ export thêm hàm này:
module.exports = { layDsNguoiDung, taoNguoiDung, xoaNguoiDung, capNhatNguoiDung, capNhatThongTinCaNhan, layThongTinCaNhan };
