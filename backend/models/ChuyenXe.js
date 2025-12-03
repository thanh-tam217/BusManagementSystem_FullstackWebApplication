const mongoose = require('mongoose');

const chuyenXeSchema = new mongoose.Schema({
    maTuyen: { type: mongoose.Schema.Types.ObjectId, ref: 'TuyenXe', required: true },
    maXe: { type: mongoose.Schema.Types.ObjectId, ref: 'Xe', required: true },
    maTaiXe: { type: mongoose.Schema.Types.ObjectId, ref: 'NguoiDung' }, // [cite: 99]
    
    benKhoiHanh: { type: mongoose.Schema.Types.ObjectId, ref: 'BenXe', required: true },
    benDen: { type: mongoose.Schema.Types.ObjectId, ref: 'BenXe', required: true },
    
    thoiGianKhoiHanh: { type: Date, required: true },
    thoiGianDuKienDen: { type: Date, required: true },
    
    giaVe: { type: Number, required: true },
    trangThai: { 
        type: String, 
        enum: ['DangCho', 'DangDi', 'DaKetThuc', 'Huy'], 
        default: 'DangCho' 
    }
}, { timestamps: true });

module.exports = mongoose.model('ChuyenXe', chuyenXeSchema);