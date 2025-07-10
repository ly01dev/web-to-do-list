# 🐳 Docker Setup & Deployment Guide

## 📋 Yêu cầu hệ thống

- Docker Engine 20.10+
- Docker Compose 2.0+
- ít nhất 2GB RAM
- 10GB disk space

## 🚀 Quick Start

### 1. Development Environment

```bash
# Clone repository
git clone <your-repo>
cd du

# Copy environment file
cp env.example .env

# Chạy với Docker Compose
docker-compose up -d

# Xem logs
docker-compose logs -f
```

### 2. Production Environment

```bash
# Tạo SSL certificates
chmod +x scripts/generate-ssl.sh
./scripts/generate-ssl.sh

# Deploy
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## 📁 Cấu trúc Docker

```
du/
├── backend/
│   ├── Dockerfile          # Backend container
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile          # Frontend container
│   ├── nginx.conf          # Nginx config cho frontend
│   └── .dockerignore
├── nginx/
│   ├── nginx.conf          # Reverse proxy config
│   └── ssl/                # SSL certificates
├── scripts/
│   ├── generate-ssl.sh     # Tạo SSL certificates
│   └── deploy.sh           # Deploy script
├── docker-compose.yml      # Development setup
├── docker-compose.prod.yml # Production setup
└── Dockerfile              # Multi-stage build
```

## 🔧 Configuration

### Environment Variables

Tạo file `.env` từ `env.example`:

```bash
# MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-secure-password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Frontend
VITE_API_URL=http://localhost:8001/api
```

### SSL Certificates

Cho development:

```bash
./scripts/generate-ssl.sh
```

Cho production, sử dụng Let's Encrypt hoặc certificate từ CA.

## 🐳 Docker Commands

### Development

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Stop services
docker-compose down

# Rebuild và restart
docker-compose up -d --build
```

### Production

```bash
# Deploy
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Update
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## 🌐 Ports

- **Frontend**: 80 (HTTP), 443 (HTTPS)
- **Backend API**: 8001
- **MongoDB**: 27017
- **Nginx**: 80, 443

## 📊 Monitoring & Health Checks

### Health Check Endpoints

- Frontend: `http://localhost/`
- Backend: `http://localhost:8001/api/health`
- Nginx: `http://localhost/health`

### View Container Status

```bash
docker-compose ps
docker stats
```

## 🔒 Security

### Production Checklist

- [ ] Thay đổi default passwords
- [ ] Sử dụng strong JWT secret
- [ ] Cấu hình SSL certificates thực
- [ ] Enable firewall rules
- [ ] Regular security updates
- [ ] Backup strategy

### Security Headers

Nginx đã được cấu hình với:

- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Content-Security-Policy
- Strict-Transport-Security

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale backend services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Scale frontend services
docker-compose -f docker-compose.prod.yml up -d --scale frontend=2
```

### Load Balancer

Sử dụng nginx upstream để load balance:

```nginx
upstream backend {
    server backend1:8001;
    server backend2:8001;
    server backend3:8001;
}
```

## 🗄️ Database

### MongoDB Persistence

Data được lưu trong Docker volume:

```bash
# Backup
docker exec todolist-mongodb-prod mongodump --out /backup

# Restore
docker exec -i todolist-mongodb-prod mongorestore /backup
```

### Database Migration

```bash
# Connect to MongoDB
docker exec -it todolist-mongodb-prod mongosh

# Run migrations
docker exec -it todolist-backend-prod npm run migrate
```

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**

   ```bash
   # Kill process using port
   sudo lsof -ti:8001 | xargs kill -9
   ```

2. **Permission issues**

   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

3. **Container won't start**

   ```bash
   # Check logs
   docker-compose logs [service-name]

   # Rebuild
   docker-compose build --no-cache
   ```

4. **SSL certificate issues**
   ```bash
   # Regenerate certificates
   ./scripts/generate-ssl.sh
   ```

### Debug Commands

```bash
# Enter container
docker exec -it todolist-backend-prod sh

# View container resources
docker stats

# Check network
docker network ls
docker network inspect du_todolist-network
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [MongoDB Docker](https://hub.docker.com/_/mongo)

## 🤝 Support

Nếu gặp vấn đề, hãy:

1. Kiểm tra logs: `docker-compose logs -f`
2. Verify configuration files
3. Check system resources
4. Create issue với error details
