# Multi-stage build cho toàn bộ dự án
FROM node:18-alpine AS base

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Cài đặt dependencies
RUN npm ci --only=production
RUN cd backend && npm ci --only=production
RUN cd frontend && npm ci

# Build stage
FROM base AS builder

# Copy source code
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Production stage
FROM node:18-alpine AS production

# Tạo user không phải root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy built frontend
COPY --from=builder --chown=nodejs:nodejs /app/frontend/dist /app/frontend/dist

# Copy backend
COPY --from=builder --chown=nodejs:nodejs /app/backend /app/backend
COPY --from=builder --chown=nodejs:nodejs /app/backend/node_modules /app/backend/node_modules

# Expose ports
EXPOSE 8001 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
CMD ["node", "backend/server.js"] 