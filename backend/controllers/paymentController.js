const moment = require('moment');
const querystring = require('qs'); // Dùng thư viện qs đã cài
const crypto = require('crypto');

// --- CẤU HÌNH VNPAY SANDBOX CHUẨN ---
const vnp_TmnCode = "ODPMQGEO";
const vnp_HashSecret = "21W70C3DVYAINTVBCJBGKZMEC44ESZMW";
const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const vnp_ReturnUrl = "http://127.0.0.1:5500/frontend/ve-cua-toi.html";

const createPaymentUrl = (req, res) => {
    try {
        const { amount, bankCode } = req.body;
        
        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');
        let orderId = moment(date).format('DDHHmmss'); // Mã đơn hàng ngắn gọn

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan ve xe';
        vnp_Params['vnp_OrderType'] = 'other';
        // QUAN TRỌNG: Ép kiểu số nguyên cho amount
        vnp_Params['vnp_Amount'] = parseInt(amount) * 100; 
        vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrl;
        vnp_Params['vnp_IpAddr'] = '127.0.0.1'; // Gán cứng IP để tránh lỗi ::1
        vnp_Params['vnp_CreateDate'] = createDate;
        
        if(bankCode) {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        // Sắp xếp tham số (Bước quan trọng nhất để chữ ký đúng)
        vnp_Params = sortObject(vnp_Params);

        // Tạo chữ ký
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", vnp_HashSecret);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
        
        vnp_Params['vnp_SecureHash'] = signed;
        
        let vnpUrl = vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false });

        console.log("VNPay URL:", vnpUrl); // In ra terminal để debug nếu cần
        res.json({ url: vnpUrl });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Hàm sắp xếp object theo bảng chữ cái (Bắt buộc của VNPay)
function sortObject(obj) {
	let sorted = {};
	let str = [];
	let key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) {
		str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

module.exports = { createPaymentUrl };