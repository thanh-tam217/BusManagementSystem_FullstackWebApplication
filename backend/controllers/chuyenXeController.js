const ChuyenXe = require('../models/ChuyenXe');
const TuyenXe = require('../models/TuyenXe');
const Xe = require('../models/Xe');

// @desc    Lấy danh sách chuyến xe (Có lọc tìm kiếm cho khách)
// @route   GET /api/chuyen-xe
// const layDsChuyen = async (req, res) => {
//     try {
//         let query = {};
        
//         // Filter cho khách hàng tìm kiếm: diemDi, diemDen, ngayDi
//         if (req.query.diemDi) query.diemDi = req.query.diemDi; // Cần xử lý join bảng phức tạp hơn nếu lọc theo Tỉnh, tạm thời để sau
//         if (req.query.maBenKhoiHanh) query.benKhoiHanh = req.query.maBenKhoiHanh;
        
//         // Scope Control: Admin Bến chỉ xem chuyến của bến mình
//         if (req.user && req.user.vaiTro === 'AdminBenXe') {
//             query.benKhoiHanh = req.user.maBenQuanLy;
//         }

//         const dsChuyen = await ChuyenXe.find(query)
//             .populate('maTuyen')
//             .populate('maXe', 'bienSo loaiXe')
//             .populate('benKhoiHanh', 'tenBen')
//             .populate('benDen', 'tenBen');
            
//         res.json(dsChuyen);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };


const layDsChuyen = async (req, res) => {
    try {
        let query = {};
        
        // Filter cho khách hàng tìm kiếm
        if (req.query.diemDi) query.diemDi = req.query.diemDi; 
        if (req.query.maBenKhoiHanh) query.benKhoiHanh = req.query.maBenKhoiHanh;
        
        // Scope Control: Admin Bến chỉ xem chuyến của bến mình
        if (req.user && req.user.vaiTro === 'AdminBenXe') {
            query.benKhoiHanh = req.user.maBenQuanLy;
        }

        // --- LOGIC MỚI: TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI ---
        // Tìm các chuyến đang "DangDi" hoặc "DangCho" mà thời gian dự kiến đến đã qua
        const now = new Date();
        
        // Cập nhật các chuyến đã quá giờ đến -> Thành 'DaKetThuc'
        await ChuyenXe.updateMany(
            {
                trangThai: { $in: ['DangCho', 'DangDi'] },
                thoiGianDuKienDen: { $lt: now } // Giờ đến nhỏ hơn giờ hiện tại
            },
            { $set: { trangThai: 'DaKetThuc' } }
        );
        // ---------------------------------------------------

        const dsChuyen = await ChuyenXe.find(query)
            .populate('maTuyen')
            .populate('maXe', 'bienSo loaiXe')
            .populate('maTaiXe', 'hoTen soDienThoai') // Populate thêm thông tin tài xế
            .populate('benKhoiHanh', 'tenBen')
            .populate('benDen', 'tenBen')
            .sort({ thoiGianKhoiHanh: -1 }); // Sắp xếp chuyến mới nhất lên đầu
            
        res.json(dsChuyen);
    } catch (error) {
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

