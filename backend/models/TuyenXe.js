const mongoose = require('mongoose');

const tuyenXeSchema = new mongoose.Schema({
    diemDi: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'TinhThanh', 
        required: true 
    },
    diemDen: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'TinhThanh', 
        required: true 
    },
    thoiGianDiChuyen: { type: Number, required: true }, // Tính bằng giờ hoặc phút
    quangDuong: { type: Number, required: true }, // Km
    
    // Tuyến này do bến nào khai thác (để Admin bến đó thấy và quản lý)
    maBenQuanLy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BenXe'
    }
}, { timestamps: true });

module.exports = mongoose.model('TuyenXe', tuyenXeSchema);