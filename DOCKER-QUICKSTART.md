# 🚀 Docker Quick Start Guide

## ⚡ Bắt đầu nhanh (5 phút)

### 1. Cài đặt Docker

```bash
# Windows/Mac: Tải Docker Desktop
# Linux:
sudo apt-get update
sudo apt-get install docker.io docker-compose
```

### 2. Clone và setup

```bash
git clone <your-repo>
cd du

# Setup development environment
make dev-setup
```

### 3. Chạy ứng dụng

```bash
# Bắt đầu tất cả services
make start

# Hoặc từng bước:
make build
make up
```

### 4. Truy cập ứng dụng

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8001/api
- **Health Check**: http://localhost:8001/api/health

## 🛠️ Lệnh cơ bản

```bash
# Xem help
make help

# Start/Stop
make up          # Start development
make down        # Stop all services
make restart     # Restart services

# Logs & Monitoring
make logs        # View logs
make status      # Service status
make health      # Health checks

# Production
make prod        # Start production
make deploy      # Deploy to production

# Testing
make test        # Run tests
```

## 🔧 Troubleshooting

### Port conflicts

```bash
# Kill process using port 8001
sudo lsof -ti:8001 | xargs kill -9

# Hoặc thay đổi port trong docker-compose.yml
```

### Container không start

```bash
# Xem logs
make logs

# Rebuild
make clean
make build
make up
```

### Permission issues

```bash
# Fix permissions
sudo chown -R $USER:$USER .
chmod +x scripts/*.sh
```

## 📋 Checklist

- [ ] Docker và Docker Compose đã cài đặt
- [ ] File `.env` đã được tạo và cấu hình
- [ ] SSL certificates đã được tạo
- [ ] Services đang chạy (`make status`)
- [ ] Health checks pass (`make health`)
- [ ] Có thể truy cập frontend và backend

## 🎯 Next Steps

1. **Development**: Sử dụng `make up` và `make logs`
2. **Testing**: Chạy `make test` để kiểm tra
3. **Production**: Sử dụng `make deploy`
4. **Monitoring**: Sử dụng `make health` và `make stats`

## 📚 Tài liệu chi tiết

Xem `README-Docker.md` để biết thêm chi tiết về:

- Cấu hình nâng cao
- Security best practices
- Scaling và monitoring
- Troubleshooting chi tiết
