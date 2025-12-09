const VeXe = require('../models/VeXe');
const ChuyenXe = require('../models/ChuyenXe');

// @desc    Đặt vé (Hỗ trợ đặt nhiều ghế 1 lúc)
const datVe = async (req, res) => {
    try {
        const { maChuyen, maGhe, tongTien, maKhachHang, tenKhach, sdtKhach } = req.body;
        // maGhe bây giờ là mảng: ["A01", "A02"]

        // 1. Kiểm tra ghế trùng: Tìm xem trong DB có vé nào chứa bất kỳ ghế nào trong danh sách maGhe không
        const veDaTonTai = await VeXe.findOne({
            maChuyen: maChuyen,
            maGhe: { $in: maGhe }, // Kiểm tra xem có ghế nào nằm trong mảng maGhe đã tồn tại không
            trangThaiThanhToan: { $ne: 'Huy' }
        });

        if (veDaTonTai) {
            // Logic tìm ra ghế nào bị trùng để báo lỗi cụ thể
            const gheTrung = veDaTonTai.maGhe.filter(g => maGhe.includes(g));
            return res.status(400).json({ message: `Ghế ${gheTrung.join(', ')} đã có người đặt sớm hơn. Vui lòng chọn lại.` });
        }

        // 2. Tạo vé gộp
        const veMoi = await VeXe.create({
            maKhachHang: maKhachHang || null,
            tenKhach: tenKhach || 'Khách lẻ',
            sdtKhach: sdtKhach || '',
            maChuyen,
            maGhe, // Lưu nguyên mảng ["A01", "A02"]
            tongTien,
            maNhanVienBan: req.user.vaiTro !== 'KhachHang' ? req.user._id : null,
            trangThaiThanhToan: req.user.vaiTro !== 'KhachHang' ? 'DaThanhToan' : 'ChuaThanhToan'
        });

        res.status(201).json({ message: 'Đặt vé thành công', ve: veMoi });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy danh sách ghế ĐÃ ĐẶT của 1 chuyến (Để vẽ sơ đồ)
const layGheDaDat = async (req, res) => {
    try {
        const dsVe = await VeXe.find({
            maChuyen: req.params.maChuyen,
            trangThaiThanhToan: { $ne: 'Huy' }
        }).select('maGhe');

        // Gộp tất cả mảng ghế lại thành 1 mảng duy nhất
        // Ví dụ: Vé 1 ["A01"], Vé 2 ["A02", "A03"] => ["A01", "A02", "A03"]
        let allSeats = [];
        dsVe.forEach(v => {
            allSeats = allSeats.concat(v.maGhe);
        });

        res.json(allSeats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Tra cứu vé (Cải tiến tìm theo Tên, SĐT, ID)
const traCuuVe = async (req, res) => {
    try {
        const { keyword } = req.query;
        let query = {};

        if (keyword) {
            query = {
                $or: [
                    { sdtKhach: { $regex: keyword, $options: 'i' } }, // Tìm SĐT
                    { tenKhach: { $regex: keyword, $options: 'i' } }, // Tìm Tên (Mới thêm)
                    // Kiểm tra nếu keyword là ID hợp lệ thì mới tìm theo ID
                    (keyword.match(/^[0-9a-fA-F]{24}$/) ? { _id: keyword } : {}) 
                ]
            };
            // Lọc bỏ object rỗng nếu keyword ko phải ID
            query.$or = query.$or.filter(condition => Object.keys(condition).length > 0);
        }

        const dsVe = await VeXe.find(query)
            .populate({
                path: 'maChuyen',
                populate: { path: 'maXe benKhoiHanh benDen' }
            })
            .sort({ createdAt: -1 }); // Mới nhất lên đầu

        res.json(dsVe);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Hàm lịch sử của khách (Giữ nguyên hoặc cập nhật logic hiển thị mảng ghế nếu cần)
const layVeCuaToi = async (req, res) => {
    try {
        const dsVe = await VeXe.find({ maKhachHang: req.user._id })
            .populate({
                path: 'maChuyen',
                populate: { path: 'benKhoiHanh benDen' }
            })
            .sort({ ngayDat: -1 });
        res.json(dsVe);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cập nhật trạng thái thanh toán (Dùng cho VNPay Return)
const capNhatThanhToan = async (req, res) => {
    try {
        const { maVe, trangThai } = req.body;
        // Cập nhật trạng thái
        await VeXe.findByIdAndUpdate(maVe, { trangThaiThanhToan: trangThai });
        res.json({ message: 'Cập nhật thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const huyVe = async (req, res) => {
    try {
        const ve = await VeXe.findById(req.params.id).populate('maChuyen');

        if (!ve) {
            return res.status(404).json({ message: 'Không tìm thấy vé' });
        }

        // Kiểm tra logic: Nếu xe đã chạy rồi thì có cho hủy không? (Tùy chọn)
        // Hiện tại tôi cho phép hủy thoải mái để bạn test
        
        ve.trangThaiThanhToan = 'Huy';
        await ve.save();

        res.json({ message: 'Đã hủy vé thành công, ghế đã được giải phóng.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Nhớ export thêm hàm này:
module.exports = { datVe, layVeCuaToi, layGheDaDat, traCuuVe, capNhatThanhToan, huyVe };
