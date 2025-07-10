# Multi-stage build để tối ưu kích thước image
FROM node:18-alpine AS builder

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package files
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci --only=production

# Production stage
FROM node:18-alpine AS production

# Tạo user không phải root để bảo mật
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy dependencies từ builder stage
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy source code
COPY --chown=nodejs:nodejs . .

# Expose port
EXPOSE 8001

# Chuyển sang user nodejs
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
CMD ["node", "server.js"] 