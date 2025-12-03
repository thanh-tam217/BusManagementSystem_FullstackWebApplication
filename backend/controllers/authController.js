const NguoiDung = require('../models/NguoiDung');
const jwt = require('jsonwebtoken');

// Hàm tạo Token nhanh
const generateToken = (id, vaiTro, maBenQuanLy) => {
    return jwt.sign({ id, vaiTro, maBenQuanLy }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token hết hạn sau 30 ngày
    });
};

// @desc    Đăng ký tài khoản mới
// @route   POST /api/auth/register
const dangKy = async (req, res) => {
    try {
        const { hoTen, email, matKhau, soDienThoai, vaiTro, maBenQuanLy } = req.body;

        // 1. Kiểm tra xem email đã tồn tại chưa
        const userExists = await NguoiDung.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email này đã được sử dụng' });
        }

        // 2. Tạo người dùng mới
        // Lưu ý: Password đã được hash tự động bên Model rồi
        const user = await NguoiDung.create({
            hoTen,
            email,
            matKhau,
            soDienThoai,
            vaiTro: vaiTro || 'KhachHang', // Mặc định là Khách hàng nếu không gửi vaiTro
            maBenQuanLy: maBenQuanLy || null 
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                hoTen: user.hoTen,
                email: user.email,
                vaiTro: user.vaiTro,
                token: generateToken(user._id, user.vaiTro, user.maBenQuanLy),
            });
        } else {
            res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server: ' + error.message });
    }
};

// @desc    Đăng nhập & Lấy Token
// @route   POST /api/auth/login
const dangNhap = async (req, res) => {
    try {
        const { email, matKhau } = req.body;

        // 1. Tìm user theo email
        const user = await NguoiDung.findOne({ email });

        // 2. Kiểm tra password
        if (user && (await user.khopMatKhau(matKhau))) {
            res.json({
                _id: user._id,
                hoTen: user.hoTen,
                email: user.email,
                vaiTro: user.vaiTro,
                maBenQuanLy: user.maBenQuanLy,
                token: generateToken(user._id, user.vaiTro, user.maBenQuanLy), // Quan trọng: Gửi Token về
            });
        } else {
            res.status(401).json({ message: 'Sai email hoặc mật khẩu' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server: ' + error.message });
    }
};

module.exports = { dangKy, dangNhap };