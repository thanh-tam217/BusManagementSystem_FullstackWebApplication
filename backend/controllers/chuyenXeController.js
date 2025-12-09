const ChuyenXe = require('../models/ChuyenXe');
const TuyenXe = require('../models/TuyenXe');
const Xe = require('../models/Xe');

const NguoiDung = require('../models/NguoiDung');
const jwt = require('jsonwebtoken');

// const layDsChuyen = async (req, res) => {
//     try {
//         let query = {};
        
//         // Filter cho khách hàng tìm kiếm
//         if (req.query.diemDi) query.diemDi = req.query.diemDi; 
//         if (req.query.maBenKhoiHanh) query.benKhoiHanh = req.query.maBenKhoiHanh;
        
//         // Scope Control: Admin Bến chỉ xem chuyến của bến mình
//         if (req.user && req.user.vaiTro === 'AdminBenXe') {
//             query.benKhoiHanh = req.user.maBenQuanLy;
//         }

//         // --- LOGIC MỚI: TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI ---
//         // Tìm các chuyến đang "DangDi" hoặc "DangCho" mà thời gian dự kiến đến đã qua
//         const now = new Date();
        
//         // Cập nhật các chuyến đã quá giờ đến -> Thành 'DaKetThuc'
//         await ChuyenXe.updateMany(
//             {
//                 trangThai: { $in: ['DangCho', 'DangDi'] },
//                 thoiGianDuKienDen: { $lt: now } // Giờ đến nhỏ hơn giờ hiện tại
//             },
//             { $set: { trangThai: 'DaKetThuc' } }
//         );
//         // ---------------------------------------------------

//         const dsChuyen = await ChuyenXe.find(query)
//             .populate('maTuyen')
//             .populate('maXe', 'bienSo loaiXe')
//             .populate('maTaiXe', 'hoTen soDienThoai') // Populate thêm thông tin tài xế
//             .populate('benKhoiHanh', 'tenBen')
//             .populate('benDen', 'tenBen')
//             .sort({ thoiGianKhoiHanh: -1 }); // Sắp xếp chuyến mới nhất lên đầu
            
//         res.json(dsChuyen);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

const layDsChuyen = async (req, res) => {
    try {
        let query = {};
        let currentUser = null;

        console.log("--- TÌM KIẾM CHUYẾN ---");
        console.log("Query Params:", req.query);

        // 1. GIẢI MÃ TOKEN (Nếu có) để xác định Admin Bến
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                currentUser = await NguoiDung.findById(decoded.id).select('-matKhau');
            } catch (error) {
                console.log("Token lỗi hoặc là khách vãng lai.");
            }
        }

        // 2. XỬ LÝ LỌC THEO TUYẾN (Quan trọng)
        if (req.query.diemDi || req.query.diemDen) {
            let tuyenQuery = {};
            // Chuyển đổi sang ObjectId nếu cần thiết, hoặc để Mongoose tự cast
            if (req.query.diemDi) tuyenQuery.diemDi = req.query.diemDi;
            if (req.query.diemDen) tuyenQuery.diemDen = req.query.diemDen;

            console.log("Đang tìm Tuyến với điều kiện:", tuyenQuery);
            const matchingTuyens = await TuyenXe.find(tuyenQuery).select('_id');
            const tuyenIds = matchingTuyens.map(t => t._id);
            
            console.log(`Tìm thấy ${tuyenIds.length} tuyến phù hợp.`);
            
            // Nếu không tìm thấy tuyến nào phù hợp -> Trả về rỗng luôn
            if (tuyenIds.length === 0) {
                return res.json([]);
            }

            query.maTuyen = { $in: tuyenIds };
        }

        // 3. XỬ LÝ LỌC THEO NGÀY (Fix lỗi lệch múi giờ)
        if (req.query.ngayDi) {
            const dateStr = req.query.ngayDi; // YYYY-MM-DD
            // Tạo khoảng thời gian từ 00:00:00 đến 23:59:59 của ngày đó (theo giờ Server/UTC)
            const startOfDay = new Date(dateStr);
            const endOfDay = new Date(dateStr);
            endOfDay.setHours(23, 59, 59, 999);

            query.thoiGianKhoiHanh = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }

        // 4. PHÂN QUYỀN (Nếu là Admin Bến -> Chỉ thấy chuyến bến mình)
        if (currentUser && currentUser.vaiTro === 'AdminBenXe') {
            console.log(`Admin Bến [${currentUser.hoTen}] đang xem. Lọc bến: ${currentUser.maBenQuanLy}`);
            query.benKhoiHanh = currentUser.maBenQuanLy;
        }

        // 5. TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI (Các chuyến quá hạn)
        const now = new Date();
        await ChuyenXe.updateMany(
            { trangThai: { $in: ['DangCho', 'DangDi'] }, thoiGianDuKienDen: { $lt: now } },
            { $set: { trangThai: 'DaKetThuc' } }
        );

        // 6. TRẢ KẾT QUẢ
        const dsChuyen = await ChuyenXe.find(query)
            .populate({ path: 'maTuyen', populate: { path: 'diemDi diemDen', select: 'tenTinh' } })
            .populate('maXe', 'bienSo loaiXe')
            .populate('maTaiXe', 'hoTen soDienThoai')
            .populate('benKhoiHanh', 'tenBen')
            .populate('benDen', 'tenBen')
            .sort({ thoiGianKhoiHanh: 1 }); // Sắp xếp giờ chạy tăng dần

        console.log(`=> Kết quả: ${dsChuyen.length} chuyến.`);
        res.json(dsChuyen);

    } catch (error) {
        console.error("Lỗi API Chuyến Xe:", error);
        res.status(500).json({ message: error.message });
    }
};


// @desc    Tạo chuyến xe mới
// @route   POST /api/chuyen-xe
// @access  Private (AdminBenXe)
const taoChuyen = async (req, res) => {
    try {
        const { maTuyen, maXe, maTaiXe, thoiGianKhoiHanh, giaVe } = req.body;
        
        // 1. Lấy thông tin người tạo (Admin Bến)
        const maBenAdmin = req.user.maBenQuanLy;
        
        // 2. Validate Xe: Xe này có thuộc bến này không?
        const xe = await Xe.findById(maXe);
        if (!xe) return res.status(404).json({ message: 'Không tìm thấy xe' });
        
        if (req.user.vaiTro === 'AdminBenXe' && xe.maBen.toString() !== maBenAdmin.toString()) {
            return res.status(403).json({ message: 'Xe này không thuộc bến của bạn' });
        }

        // 3. Lấy thông tin Tuyến để tính giờ đến
        const tuyen = await TuyenXe.findById(maTuyen);
        if (!tuyen) return res.status(404).json({ message: 'Không tìm thấy tuyến' });

        // Tính thời gian đến = Thời gian đi + Thời gian di chuyển (giờ)
        const timeStart = new Date(thoiGianKhoiHanh);
        const timeEnd = new Date(timeStart.getTime() + tuyen.thoiGianDiChuyen * 60 * 60 * 1000);

        // 4. Tạo chuyến
        // Lưu ý: benKhoiHanh mặc định là bến của Admin tạo [cite: 152]
        // benDen tạm thời lấy theo logic Tuyến hoặc gửi từ Client (ở đây ta giả định Admin phải chọn Bến Đến)
        // Để đơn giản: ta yêu cầu gửi benDen từ body, hoặc map từ TuyenXe (nếu TuyenXe có lưu Ben)
        
        const chuyenMoi = await ChuyenXe.create({
            maTuyen,
            maXe,
            maTaiXe,
            benKhoiHanh: maBenAdmin, // Bắt buộc là bến của Admin
            benDen: req.body.benDen, // Admin phải chọn bến đến
            thoiGianKhoiHanh,
            thoiGianDuKienDen: timeEnd,
            giaVe,
            trangThai: 'DangCho'
        });

        res.status(201).json(chuyenMoi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cập nhật chuyến xe
// @route   PUT /api/chuyen-xe/:id
const capNhatChuyen = async (req, res) => {
    try {
        const { maTuyen, maXe, benDen, thoiGianKhoiHanh, giaVe, trangThai } = req.body;
        const chuyen = await ChuyenXe.findById(req.params.id);

        if (!chuyen) return res.status(404).json({ message: 'Không tìm thấy chuyến' });

        // Check quyền: Chỉ sửa chuyến của bến mình
        if (req.user.vaiTro === 'AdminBenXe' && chuyen.benKhoiHanh.toString() !== req.user.maBenQuanLy.toString()) {
            return res.status(403).json({ message: 'Không có quyền sửa chuyến bến khác' });
        }

        // Nếu có thay đổi giờ đi hoặc tuyến -> Phải tính lại giờ đến
        let timeEnd = chuyen.thoiGianDuKienDen;
        if (thoiGianKhoiHanh || maTuyen) {
            const tuyenMoi = await TuyenXe.findById(maTuyen || chuyen.maTuyen);
            const start = new Date(thoiGianKhoiHanh || chuyen.thoiGianKhoiHanh);
            timeEnd = new Date(start.getTime() + tuyenMoi.thoiGianDiChuyen * 60 * 60 * 1000);
        }

        chuyen.maTuyen = maTuyen || chuyen.maTuyen;
        chuyen.maXe = maXe || chuyen.maXe;
        chuyen.benDen = benDen || chuyen.benDen;
        chuyen.thoiGianKhoiHanh = thoiGianKhoiHanh || chuyen.thoiGianKhoiHanh;
        chuyen.thoiGianDuKienDen = timeEnd;
        chuyen.giaVe = giaVe || chuyen.giaVe;
        chuyen.trangThai = trangThai || chuyen.trangThai;

        await chuyen.save();
        res.json(chuyen);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Xóa chuyến xe
// @route   DELETE /api/chuyen-xe/:id
const xoaChuyen = async (req, res) => {
    try {
        const chuyen = await ChuyenXe.findById(req.params.id);
        if (!chuyen) return res.status(404).json({ message: 'Không tìm thấy' });

        if (req.user.vaiTro === 'AdminBenXe' && chuyen.benKhoiHanh.toString() !== req.user.maBenQuanLy.toString()) {
            return res.status(403).json({ message: 'Không có quyền xóa' });
        }

        await chuyen.deleteOne();
        res.json({ message: 'Đã xóa chuyến xe' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = { layDsChuyen, taoChuyen, capNhatChuyen, xoaChuyen };

