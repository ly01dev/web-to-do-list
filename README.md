# TodoList App - Full Stack Application

Ứng dụng quản lý công việc (Todo List) được xây dựng với Node.js/Express/MongoDB backend và React frontend.

## 🚀 Tính năng

### Người dùng thường

- ✅ Đăng ký và đăng nhập tài khoản
- ✅ Tạo, chỉnh sửa, xóa và hoàn thành công việc
- ✅ Thiết lập độ ưu tiên (Cao/Trung bình/Thấp)
- ✅ Thêm thời gian bắt đầu và dự kiến hoàn thành
- ✅ Đánh dấu công việc là công khai hoặc riêng tư
- ✅ Xem thống kê công việc cá nhân
- ✅ Cập nhật thông tin hồ sơ cá nhân

### Quản trị viên

- ✅ Xem tổng quan hệ thống với thống kê chi tiết
- ✅ Quản lý tất cả người dùng (xem, sửa, xóa)
- ✅ Thay đổi vai trò người dùng (user/admin)
- ✅ Kích hoạt/vô hiệu hóa tài khoản người dùng
- ✅ Xem thống kê công việc toàn hệ thống
- ✅ Theo dõi người dùng và công việc gần đây

## 🛠️ Công nghệ sử dụng

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **express-validator** - Input validation
- **cors** - Cross-origin resource sharing

### Frontend

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Client-side routing
- **React Bootstrap** - UI components
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Font Awesome** - Icons

## 📦 Cài đặt

### Yêu cầu hệ thống

- Node.js (v18+)
- MongoDB
- Git

### Backend

1. Clone repository:

```bash
git clone <repository-url>
cd du/backend
```

2. Cài đặt dependencies:

```bash
npm install
```

3. Tạo file `.env` từ `config.env`:

```bash
cp config.env .env
```

4. Cấu hình MongoDB trong file `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/todolist
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
PORT=4000
```

5. Khởi chạy server:

```bash
npm start
```

### Frontend

1. Chuyển đến thư mục frontend:

```bash
cd ../frontend
```

2. Cài đặt dependencies:

```bash
npm install
```

3. Khởi chạy development server:

```bash
npm run dev
```

## 🔧 Cấu hình

### Backend Routes

- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `PUT /api/auth/change-password` - Đổi mật khẩu

- `GET /api/todos` - Lấy danh sách todo
- `POST /api/todos` - Tạo todo mới
- `PUT /api/todos/:id` - Cập nhật todo
- `DELETE /api/todos/:id` - Xóa todo
- `PATCH /api/todos/:id/toggle` - Toggle trạng thái todo
- `GET /api/todos/public` - Lấy todo công khai
- `GET /api/todos/stats/summary` - Thống kê todo

- `GET /api/admin/users` - Quản lý người dùng (Admin)
- `PUT /api/admin/users/:id` - Cập nhật người dùng (Admin)
- `DELETE /api/admin/users/:id` - Xóa người dùng (Admin)
- `GET /api/admin/dashboard` - Dashboard admin

### Frontend Routes

- `/` - Trang chủ (chuyển hướng đến dashboard nếu đã đăng nhập)
- `/login` - Trang đăng nhập
- `/register` - Trang đăng ký
- `/dashboard` - Dashboard người dùng (cần đăng nhập)
- `/admin` - Admin dashboard (cần quyền admin)

## 👥 Sử dụng

### Đăng ký tài khoản

1. Truy cập `/register`
2. Điền thông tin cá nhân
3. Tạo tài khoản

### Đăng nhập

1. Truy cập `/login`
2. Nhập email và mật khẩu
3. Đăng nhập vào hệ thống

### Quản lý công việc

1. Vào Dashboard
2. Tab "Todo List" để xem và quản lý công việc
3. Tab "Thống kê" để xem báo cáo
4. Tab "Hồ sơ cá nhân" để cập nhật thông tin

### Admin Dashboard

1. Đăng nhập với tài khoản admin
2. Truy cập `/admin`
3. Tab "Tổng quan" để xem thống kê hệ thống
4. Tab "Quản lý người dùng" để quản lý người dùng

## 🔒 Bảo mật

- Mật khẩu được mã hóa với bcrypt
- JWT token cho authentication
- Middleware bảo vệ routes
- Validation input data
- CORS configuration
- Rate limiting (có thể thêm)

## 📊 Database Schema

### User

```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['user', 'admin'], default: 'user'),
  isActive: Boolean (default: true),
  profile: {
    firstName: String,
    lastName: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Todo

```javascript
{
  title: String (required),
  description: String,
  completed: Boolean (default: false),
  priority: String (enum: ['low', 'medium', 'high'], default: 'medium'),
  isPublic: Boolean (default: false),
  startDate: Date,
  dueDate: Date,
  user: ObjectId (ref: 'User', required),
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Backend (Production)

```bash
npm run build
npm start
```

### Frontend (Production)

```bash
npm run build
npm run preview
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📝 License

MIT License

## 👨‍💻 Tác giả

Được phát triển với ❤️ bằng React & Node.js
