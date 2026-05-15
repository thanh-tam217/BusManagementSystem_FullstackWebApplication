# Bus Management System — Hệ Thống Quản Lý Xe Buýt

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

A full-stack web application for managing bus operations — routes, drivers, schedules, tickets, and more.

Ứng dụng web full-stack phục vụ quản lý hoạt động xe buýt — tuyến đường, tài xế, lịch trình, vé xe, và nhiều hơn nữa.

[English](#english) · [Tiếng Việt](#tiếng-việt)

</div>

---

## English

### Overview

**Bus Management System** is a full-stack web application built with **Node.js**, **Express**, and **MongoDB**. It provides a centralized platform for bus operators to manage their entire fleet operations — from vehicle and route management to staff administration, ticket booking, and analytics reporting.

### Features

| Feature | Description |
|---|---|
| **Authentication** | Secure user registration and login with role-based access control |
| **Bus & Route Management** | Add, edit, and manage buses and their assigned routes |
| **Driver & Staff Management** | Manage driver profiles, assignments, and employee records |
| **Online Ticket Booking** | Allow passengers to search, book, and purchase bus tickets |
| **Schedule Tracking** | View and manage bus timetables and real-time schedule updates |
| **Reports & Statistics** | Generate operational reports and performance dashboards |

### Getting Started

#### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- npm or yarn

#### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/thanh-tam217/BusManagementSystem_FullstackWebApplication.git
   cd BusManagementSystem_FullstackWebApplication
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## Tiếng Việt

### Giới Thiệu

**HỆ THỐNG QUẢN LÝ CHUYẾN XE KHÁCH** là ứng dụng web full-stack được xây dựng bằng **Node.js**, **Express** và **MongoDB**. Hệ thống cung cấp một nền tảng tập trung giúp các đơn vị vận tải quản lý toàn bộ hoạt động — từ quản lý xe và tuyến đường, quản lý nhân viên, đến đặt vé trực tuyến và báo cáo thống kê.

### Tính Năng

| Tính năng | Mô tả |
|---|---|
| **Xác thực người dùng** | Đăng ký và đăng nhập an toàn với phân quyền theo vai trò |
| **Quản lý xe & tuyến đường** | Thêm, sửa, xóa thông tin xe và tuyến đường hoạt động |
| **Quản lý tài xế & nhân viên** | Quản lý hồ sơ tài xế, phân công và thông tin nhân sự |
| **Đặt vé / Mua vé online** | Hành khách có thể tìm kiếm, đặt và mua vé xe trực tuyến |
| **Theo dõi lịch trình** | Xem và quản lý lịch chạy xe, cập nhật trạng thái thời gian thực |
| **Báo cáo & Thống kê** | Tạo báo cáo hoạt động và bảng thống kê hiệu suất |

### Công Nghệ Sử Dụng

| Tầng | Công nghệ |
|---|---|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Cơ sở dữ liệu** | MongoDB (Mongoose ODM) |
| **Xác thực** | JWT (JSON Web Tokens) |

### Hướng Dẫn Cài Đặt

#### Yêu Cầu

Đảm bảo bạn đã cài đặt:
- [Node.js](https://nodejs.org/) (phiên bản 16 trở lên)
- [MongoDB](https://www.mongodb.com/) (cục bộ hoặc MongoDB Atlas)
- npm hoặc yarn

#### Cài Đặt

1. **Clone repository**
   ```bash
   git clone https://github.com/thanh-tam217/BusManagementSystem_FullstackWebApplication.git
   cd BusManagementSystem_FullstackWebApplication
   ```

2. **Cài đặt các thư viện phụ thuộc**
   ```bash
   npm install
   ```

3. **Cấu hình biến môi trường**

   Tạo file `.env` trong thư mục gốc:
   ```env
   PORT=5000
   MONGO_URI=chuỗi_kết_nối_mongodb_của_bạn
   JWT_SECRET=khóa_bí_mật_jwt
   ```

4. **Khởi chạy server**
   ```bash
   npm run dev
   ```
