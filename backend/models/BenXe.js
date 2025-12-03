const mongoose = require('mongoose');

const benXeSchema = new mongoose.Schema({
    tenBen: { type: String, required: true },
    diaChi: { type: String, required: true },
    soDienThoai: { type: String },
    maTinh: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'TinhThanh', // Liên kết sang bảng TinhThanh
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('BenXe', benXeSchema);