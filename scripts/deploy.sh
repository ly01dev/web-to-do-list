#!/bin/bash

# Script deploy cho production
# Chạy: chmod +x scripts/deploy.sh && ./scripts/deploy.sh

set -e

echo "🚀 Bắt đầu deploy TodoList app..."

# Kiểm tra Docker và Docker Compose
if ! command -v docker &> /dev/null; then
    echo "❌ Docker không được cài đặt"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose không được cài đặt"
    exit 1
fi

# Kiểm tra file .env
if [ ! -f .env ]; then
    echo "⚠️  File .env không tồn tại, tạo từ env.example..."
    cp env.example .env
    echo "📝 Vui lòng cập nhật file .env với các giá trị thực tế"
    exit 1
fi

# Load environment variables
source .env

# Tạo SSL certificates nếu chưa có
if [ ! -f nginx/ssl/cert.pem ] || [ ! -f nginx/ssl/key.pem ]; then
    echo "🔐 Tạo SSL certificates..."
    chmod +x scripts/generate-ssl.sh
    ./scripts/generate-ssl.sh
fi

# Build và start services
echo "🔨 Building Docker images..."
docker-compose -f docker-compose.prod.yml build

echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Kiểm tra health
echo "🏥 Kiểm tra health của các services..."
sleep 10

# Kiểm tra MongoDB
if docker-compose -f docker-compose.prod.yml exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB: OK"
else
    echo "❌ MongoDB: FAILED"
fi

# Kiểm tra Backend
if curl -f http://localhost:8001/api/health > /dev/null 2>&1; then
    echo "✅ Backend: OK"
else
    echo "❌ Backend: FAILED"
fi

# Kiểm tra Frontend
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "✅ Frontend: OK"
else
    echo "❌ Frontend: FAILED"
fi

echo "🎉 Deploy hoàn tất!"
echo "📱 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost:8001/api"
echo "📊 MongoDB: localhost:27017"

echo ""
echo "📋 Các lệnh hữu ích:"
echo "  Xem logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  Stop services: docker-compose -f docker-compose.prod.yml down"
echo "  Restart: docker-compose -f docker-compose.prod.yml restart" 