const mongoose = require('mongoose');

const veXeSchema = new mongoose.Schema({
    maKhachHang: { type: mongoose.Schema.Types.ObjectId, ref: 'NguoiDung' }, // Có thể null nếu khách vãng lai
    tenKhach: { type: String }, 
    sdtKhach: { type: String },
    maChuyen: { type: mongoose.Schema.Types.ObjectId, ref: 'ChuyenXe', required: true },
    maGhe: { type: [String], required: true },
    
    // Nếu nhân viên đặt hộ thì lưu ID nhân viên vào đây [cite: 128]
    maNhanVienBan: { type: mongoose.Schema.Types.ObjectId, ref: 'NguoiDung', default: null },
    
    ngayDat: { type: Date, default: Date.now },
    tongTien: { type: Number, required: true },
    
    trangThaiThanhToan: { 
        type: String, 
        enum: ['ChuaThanhToan', 'DaThanhToan', 'Huy'], 
        default: 'ChuaThanhToan' 
    }
}, { timestamps: true });

module.exports = mongoose.model('VeXe', veXeSchema);