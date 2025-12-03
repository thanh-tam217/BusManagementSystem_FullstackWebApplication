const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const nguoiDungSchema = new mongoose.Schema({
    hoTen: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    matKhau: { type: String, required: true },
    soDienThoai: { type: String, required: true },
    diaChi: { type: String },
    gioiTinh: { type: String, enum: ['Nam', 'Nu', 'Khac'] },
    ngaySinh: { type: Date },
    
    // Phân quyền
    vaiTro: { 
        type: String, 
        enum: ['KhachHang', 'AdminHeThong', 'AdminBenXe', 'NhanVienBanVe', 'TaiXe'], 
        default: 'KhachHang' 
    },
    
    // Quan trọng: Scope Control - Người này thuộc bến nào?
    maBenQuanLy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'BenXe',
        default: null 
    },
    
    trangThai: { 
        type: String, 
        enum: ['DangHoatDong', 'BiKhoa'], 
        default: 'DangHoatDong' 
    }
}, { timestamps: true });

// Middleware: Tự động mã hóa mật khẩu trước khi Lưu
nguoiDungSchema.pre('save', async function(next) {
    if (!this.isModified('matKhau')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.matKhau = await bcrypt.hash(this.matKhau, salt);
});

// Hàm phụ: Kiểm tra mật khẩu khi đăng nhập
nguoiDungSchema.methods.khopMatKhau = async function(matKhauNhapVao) {
    return await bcrypt.compare(matKhauNhapVao, this.matKhau);
};

module.exports = mongoose.model('NguoiDung', nguoiDungSchema);