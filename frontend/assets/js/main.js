const API_URL = "http://localhost:5000/api";

// Hàm hiển thị thông báo lỗi/thành công (Có thể nâng cấp sau)
function showToast(message, type = 'success') {
    alert(message); // Tạm thời dùng alert cho đơn giản
}

// Hàm kiểm tra xem đã đăng nhập chưa
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Hàm đăng xuất
// Hàm đăng xuất
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/frontend/index.html';
}