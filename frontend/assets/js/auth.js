async function handleLogin(event) {
    event.preventDefault(); // Chặn việc reload trang

    // 1. Lấy dữ liệu từ form
    const email = document.getElementById('email').value;
    const matKhau = document.getElementById('password').value;
    const btnSubmit = document.querySelector('button[type="submit"]');

    // Reset thông báo lỗi
    const errorMsg = document.getElementById('error-msg');
    errorMsg.style.display = 'none';

    try {
        btnSubmit.disabled = true;
        btnSubmit.innerText = 'Đang xử lý...';

        // 2. Gọi API Backend
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, matKhau }) // Lưu ý: key phải là 'matKhau' khớp với Backend
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Đăng nhập thất bại');
        }

        // 3. Đăng nhập thành công -> Lưu Token và User info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
            id: data._id,
            hoTen: data.hoTen,
            vaiTro: data.vaiTro,
            maBenQuanLy: data.maBenQuanLy
        }));

        // 4. Chuyển hướng dựa trên Vai trò (Role)
        // (Tạm thời chúng ta sẽ tạo các trang này ở bước sau, giờ cứ chuyển hướng trước)
        if (data.vaiTro === 'AdminHeThong') {
            window.location.href = 'admin/dashboard-system.html';
        } else if (data.vaiTro === 'AdminBenXe') {
            window.location.href = 'admin/dashboard-station.html';
        } else if (data.vaiTro === 'NhanVienBanVe') {
            window.location.href = 'staff/dashboard.html';
        } else {
            window.location.href = 'index.html'; // Khách hàng
        }

    } catch (error) {
        errorMsg.innerText = error.message;
        errorMsg.style.display = 'block';
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerText = 'Đăng nhập';
    }
}

// --- THÊM PHẦN NÀY VÀO auth.js ---

async function handleRegister(event) {
    event.preventDefault();

    const hoTen = document.getElementById('hoTen').value;
    const email = document.getElementById('email').value;
    const soDienThoai = document.getElementById('soDienThoai').value;
    const matKhau = document.getElementById('matKhau').value;
    const btnSubmit = document.querySelector('button[type="submit"]');
    const alertMsg = document.getElementById('alert-msg');

    // Reset thông báo
    alertMsg.style.display = 'none';
    btnSubmit.disabled = true;
    btnSubmit.innerText = 'Đang xử lý...';

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                hoTen,
                email,
                soDienThoai,
                matKhau,
                vaiTro: 'KhachHang' // Mặc định là Khách Hàng
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            window.location.href = 'login.html';
        } else {
            throw new Error(data.message || 'Đăng ký thất bại');
        }

    } catch (error) {
        alertMsg.className = 'alert alert-danger';
        alertMsg.innerText = error.message;
        alertMsg.style.display = 'block';
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerText = 'ĐĂNG KÝ NGAY';
    }
}

// Cập nhật Event Listener để nhận biết đang ở trang nào
document.addEventListener('DOMContentLoaded', () => {
    // Nếu đang ở trang Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Nếu đang ở trang Register (MỚI)
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});


// // Gắn sự kiện khi file được load
// document.addEventListener('DOMContentLoaded', () => {
//     const loginForm = document.getElementById('loginForm');
//     if (loginForm) {
//         loginForm.addEventListener('submit', handleLogin);
//     }
// });