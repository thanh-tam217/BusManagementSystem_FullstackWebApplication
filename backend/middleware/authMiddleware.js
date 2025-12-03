const jwt = require('jsonwebtoken');
const NguoiDung = require('../models/NguoiDung');

// 1. Middleware xác thực: Kiểm tra xem có Token hợp lệ không?
const baoVe = async (req, res, next) => {
    let token;

    // Token thường được gửi trong Header dạng: "Bearer eyJhbGc..."
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Lấy chuỗi token (bỏ chữ "Bearer " đi)
            token = req.headers.authorization.split(' ')[1];

            // Giải mã token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Tìm user tương ứng trong DB và gắn vào req.user để các hàm sau dùng
            // (Không lấy mật khẩu trả về)
            req.user = await NguoiDung.findById(decoded.id).select('-matKhau');

            next(); // Cho phép đi tiếp
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Token không hợp lệ, vui lòng đăng nhập lại' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Không có quyền truy cập, thiếu Token' });
    }
};

// 2. Middleware phân quyền: Kiểm tra xem User có phải Admin không?
const phanQuyen = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
             return res.status(401).json({ message: 'Chưa đăng nhập' });
        }
        
        if (!roles.includes(req.user.vaiTro)) {
            return res.status(403).json({ 
                message: `Vai trò ${req.user.vaiTro} không có quyền thực hiện hành động này` 
            });
        }
        next();
    };
};

module.exports = { baoVe, phanQuyen };