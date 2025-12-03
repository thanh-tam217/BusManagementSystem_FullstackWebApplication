const mongoose = require('mongoose');

const tinhThanhSchema = new mongoose.Schema({
    tenTinh: { 
        type: String, 
        required: true,
        unique: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('TinhThanh', tinhThanhSchema);