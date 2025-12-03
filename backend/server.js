const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Import các Routes (Nên đưa hết lên đây)
const authRoutes = require('./routes/authRoutes');
const tinhThanhRoutes = require('./routes/tinhThanhRoutes');
const benXeRoutes = require('./routes/benXeRoutes');
const xeRoutes = require('./routes/xeRoutes')
const tuyenXeRoutes = require('./routes/tuyenXeRoutes');
const chuyenXeRoutes = require('./routes/chuyenXeRoutes');
const veXeRoutes = require('./routes/veXeRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Load biến môi trường
dotenv.config();

console.log("TEST MONGO_URI:", process.env.MONGO_URI);

// Kết nối Database
connectDB();

// Khởi tạo app
const app = express();

// --- MIDDLEWARE (Bắt buộc phải nằm trên Routes) ---
app.use(express.json()); 
app.use(cors()); 


// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/tinh-thanh', tinhThanhRoutes);
app.use('/api/ben-xe', benXeRoutes);
app.use('/api/xe', xeRoutes);
app.use('/api/tuyen-xe', tuyenXeRoutes);
app.use('/api/chuyen-xe', chuyenXeRoutes);
app.use('/api/ve-xe', veXeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);



app.get('/', (req, res) => {
    res.send('API Hệ thống vé xe đang chạy...');
});

// Chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});