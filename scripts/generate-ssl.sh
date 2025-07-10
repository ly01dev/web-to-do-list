#!/bin/bash

# Script tạo SSL certificates cho development
# Chạy: chmod +x scripts/generate-ssl.sh && ./scripts/generate-ssl.sh

echo "Tạo SSL certificates cho development..."

# Tạo thư mục nginx/ssl nếu chưa có
mkdir -p nginx/ssl

# Tạo private key
openssl genrsa -out nginx/ssl/key.pem 2048

# Tạo certificate signing request
openssl req -new -key nginx/ssl/key.pem -out nginx/ssl/cert.csr -subj "/C=VN/ST=Hanoi/L=Hanoi/O=TodoList/OU=Development/CN=localhost"

# Tạo self-signed certificate
openssl x509 -req -in nginx/ssl/cert.csr -signkey nginx/ssl/key.pem -out nginx/ssl/cert.pem -days 365

# Xóa file CSR
rm nginx/ssl/cert.csr

echo "SSL certificates đã được tạo trong nginx/ssl/"
echo "Cert: nginx/ssl/cert.pem"
echo "Key: nginx/ssl/key.pem" 