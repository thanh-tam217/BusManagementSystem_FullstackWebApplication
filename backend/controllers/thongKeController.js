
// const VeXe = require('../models/VeXe');
// const mongoose = require('mongoose'); // Bắt buộc

// // @desc    Thống kê doanh thu (Bản chuẩn Full chức năng)
// const getDoanhThuTheoNam = async (req, res) => {
//     try {
//         console.log(`--- DEBUG THỐNG KÊ [${req.user.vaiTro}] ---`);
        
//         const currentYear = new Date().getFullYear();
//         const selectedYear = parseInt(req.query.year) || currentYear;
//         const selectedBen = req.query.maBen; 

//         // Pipeline cơ bản (Giống nhau cho cả 2 vai trò)
//         const pipeline = [
//             {
//                 $lookup: {
//                     from: 'chuyenxes',
//                     localField: 'maChuyen',
//                     foreignField: '_id',
//                     as: 'chuyenInfo'
//                 }
//             },
//             { $unwind: '$chuyenInfo' },
//             {
//                 $match: {
//                     trangThaiThanhToan: 'DaThanhToan',
//                     ngayDat: {
//                         $gte: new Date(`${selectedYear}-01-01`),
//                         $lte: new Date(`${selectedYear}-12-31`)
//                     }
//                 }
//             }
//         ];

//         // --- XỬ LÝ PHÂN QUYỀN & LỌC (QUAN TRỌNG) ---
//         let filterCondition = {};

//         // TRƯỜNG HỢP 1: Admin Bến Xe -> Bắt buộc chỉ lấy vé của bến mình
//         if (req.user.vaiTro === 'AdminBenXe') {
//             console.log("- Admin Bến đang xem. ID Bến:", req.user.maBenQuanLy);
//             if (!req.user.maBenQuanLy) {
//                 console.log("!!! CẢNH BÁO: User này là AdminBenXe nhưng không có maBenQuanLy");
//                 // Trả về rỗng luôn để tránh lỗi
//                 return res.json({ year: selectedYear, data: Array(12).fill(0) });
//             }
//             // Ép kiểu ObjectId để Mongo so sánh chính xác
//             filterCondition['chuyenInfo.benKhoiHanh'] = new mongoose.Types.ObjectId(req.user.maBenQuanLy);
//         } 
//         // TRƯỜNG HỢP 2: Admin Hệ Thống -> Nếu có chọn bến thì lọc, không thì lấy hết
//         else if (req.user.vaiTro === 'AdminHeThong' && selectedBen) {
//             console.log("- Admin Hệ thống đang lọc theo bến:", selectedBen);
//             filterCondition['chuyenInfo.benKhoiHanh'] = new mongoose.Types.ObjectId(selectedBen);
//         }

//         // Áp dụng điều kiện lọc vào pipeline (nếu có)
//         if (Object.keys(filterCondition).length > 0) {
//             pipeline[1].$match = { ...pipeline[1].$match, ...filterCondition };
//         }

//         // --- TIẾP TỤC GROUP & SUM ---
//         pipeline.push(
//             {
//                 $group: {
//                     _id: { $month: '$ngayDat' },
//                     total: { $sum: '$tongTien' }
//                 }
//             },
//             { $sort: { '_id': 1 } }
//         );

//         const results = await VeXe.aggregate(pipeline);
//         console.log("- Kết quả tìm thấy:", results.length, "tháng có dữ liệu.");

//         // Chuẩn hóa data 12 tháng
//         let monthlyData = Array(12).fill(0);
//         results.forEach(item => {
//             monthlyData[item._id - 1] = item.total;
//         });

//         res.json({
//             year: selectedYear,
//             data: monthlyData
//         });

//     } catch (error) {
//         console.error("LỖI API:", error);
//         res.status(500).json({ message: error.message });
//     }
// };

// module.exports = { getDoanhThuTheoNam };

const VeXe = require('../models/VeXe');
const mongoose = require('mongoose');

// @desc    Thống kê doanh thu (Fix lỗi Aggregate)
const getDoanhThuTheoNam = async (req, res) => {
    try {
        console.log(`--- DEBUG THỐNG KÊ [${req.user.vaiTro}] ---`);
        
        const currentYear = new Date().getFullYear();
        const selectedYear = parseInt(req.query.year) || currentYear;
        const selectedBen = req.query.maBen;

        // Khởi tạo các biến điều kiện
        let startYear = new Date(`${selectedYear}-01-01`);
        let endYear = new Date(`${selectedYear}-12-31`);
        endYear.setHours(23, 59, 59, 999);

        // 1. Tạo Pipeline (Mảng các bước xử lý)
        const pipeline = [
            // Bước 1: Join với bảng ChuyenXe để lấy thông tin Bến
            {
                $lookup: {
                    from: 'chuyenxes',
                    localField: 'maChuyen',
                    foreignField: '_id',
                    as: 'chuyenInfo'
                }
            },
            { $unwind: '$chuyenInfo' }, // Giải nén mảng

            // Bước 2: Lọc dữ liệu cơ bản (Đã thanh toán & Trong năm)
            {
                $match: {
                    trangThaiThanhToan: 'DaThanhToan',
                    ngayDat: { $gte: startYear, $lte: endYear }
                }
            }
        ];

        // 2. Thêm điều kiện lọc theo Vai trò (Thao tác trực tiếp vào mảng pipeline)
        
        // Nếu là Admin Bến Xe: Bắt buộc lọc theo bến của họ
        if (req.user.vaiTro === 'AdminBenXe') {
            if (req.user.maBenQuanLy) {
                // Thêm điều kiện vào bước $match hiện tại (index 2)
                pipeline[2].$match['chuyenInfo.benKhoiHanh'] = new mongoose.Types.ObjectId(req.user.maBenQuanLy);
                console.log("- Lọc theo Bến Admin:", req.user.maBenQuanLy);
            }
        } 
        // Nếu là Admin Hệ Thống và có chọn bến
        else if (req.user.vaiTro === 'AdminHeThong' && selectedBen) {
            pipeline[2].$match['chuyenInfo.benKhoiHanh'] = new mongoose.Types.ObjectId(selectedBen);
            console.log("- Lọc theo Bến được chọn:", selectedBen);
        }

        // Bước 3: Group và Tính tổng (Thêm vào cuối mảng pipeline)
        pipeline.push(
            {
                $group: {
                    _id: { $month: '$ngayDat' }, // Group theo tháng (1-12)
                    total: { $sum: '$tongTien' } // Cộng dồn tiền
                }
            },
            { $sort: { '_id': 1 } } // Sắp xếp tháng tăng dần
        );

        // 3. Thực thi Aggregate
        // Quan trọng: Truyền đúng biến pipeline (là 1 mảng) vào hàm aggregate
        const results = await VeXe.aggregate(pipeline);

        console.log("- Kết quả tìm thấy:", results.length, "tháng có doanh thu.");

        // 4. Chuẩn hóa dữ liệu trả về (Đủ 12 tháng)
        let monthlyData = Array(12).fill(0);
        results.forEach(item => {
            monthlyData[item._id - 1] = item.total;
        });

        res.json({
            year: selectedYear,
            data: monthlyData
        });

    } catch (error) {
        console.error("LỖI API:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDoanhThuTheoNam };