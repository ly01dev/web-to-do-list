#!/bin/bash

# Script test Docker setup
# Chạy: chmod +x scripts/test-docker.sh && ./scripts/test-docker.sh

set -e

echo "🧪 Testing Docker setup..."

# Kiểm tra Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker không được cài đặt"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose không được cài đặt"
    exit 1
fi

echo "✅ Docker và Docker Compose đã được cài đặt"

# Build images
echo "🔨 Building Docker images..."
docker-compose build

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 15

# Test MongoDB
echo "🗄️  Testing MongoDB..."
if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB: OK"
else
    echo "❌ MongoDB: FAILED"
    docker-compose logs mongodb
fi

# Test Backend
echo "🔧 Testing Backend..."
if curl -f http://localhost:8001/api/health > /dev/null 2>&1; then
    echo "✅ Backend: OK"
    curl -s http://localhost:8001/api/health | jq .
else
    echo "❌ Backend: FAILED"
    docker-compose logs backend
fi

# Test Frontend
echo "📱 Testing Frontend..."
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "✅ Frontend: OK"
else
    echo "❌ Frontend: FAILED"
    docker-compose logs frontend
fi

# Test API endpoints
echo "🔍 Testing API endpoints..."

# Test registration
echo "  Testing registration..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "profile": {
      "firstName": "Test",
      "lastName": "User"
    }
  }')

if echo "$REGISTER_RESPONSE" | grep -q "success"; then
    echo "✅ Registration: OK"
else
    echo "❌ Registration: FAILED"
    echo "$REGISTER_RESPONSE"
fi

# Test login
echo "  Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo "✅ Login: OK"
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
else
    echo "❌ Login: FAILED"
    echo "$LOGIN_RESPONSE"
fi

# Test todo creation (if login successful)
if [ ! -z "$TOKEN" ]; then
    echo "  Testing todo creation..."
    TODO_RESPONSE=$(curl -s -X POST http://localhost:8001/api/todos \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "title": "Test Todo",
        "description": "Test Description",
        "priority": "medium",
        "isPublic": false,
        "startDate": "2025-07-10T12:00",
        "dueDate": "2025-07-11T12:00"
      }')

    if echo "$TODO_RESPONSE" | grep -q "success"; then
        echo "✅ Todo creation: OK"
    else
        echo "❌ Todo creation: FAILED"
        echo "$TODO_RESPONSE"
    fi
fi

echo ""
echo "🎉 Docker test completed!"
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "📋 URLs:"
echo "  Frontend: http://localhost"
echo "  Backend API: http://localhost:8001/api"
echo "  Health Check: http://localhost:8001/api/health"

echo ""
echo "📝 Commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart: docker-compose restart" 