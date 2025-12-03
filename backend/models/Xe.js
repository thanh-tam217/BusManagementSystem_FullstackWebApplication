const mongoose = require('mongoose');

const xeSchema = new mongoose.Schema({
    bienSo: { type: String, required: true, unique: true },
    loaiXe: { type: String, default: 'Giường nằm' }, // [cite: 83]
    soGhe: { type: Number, default: 29 }, // [cite: 84]
    
    // Xe thuộc bến nào quản lý?
    maBen: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'BenXe', 
        required: true 
    },
    trangThai: {
        type: String,
        enum: ['DangCho', 'DangChay', 'BaoDuong'], // [cite: 19]
        default: 'DangCho'
    }
}, { timestamps: true });

module.exports = mongoose.model('Xe', xeSchema);