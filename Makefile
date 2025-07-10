# Makefile cho TodoList Docker Management

.PHONY: help build up down restart logs clean test deploy prod ssl

# Default target
help:
	@echo "🐳 TodoList Docker Management"
	@echo ""
	@echo "Commands:"
	@echo "  build     - Build Docker images"
	@echo "  up        - Start development environment"
	@echo "  down      - Stop all services"
	@echo "  restart   - Restart all services"
	@echo "  logs      - View logs"
	@echo "  clean     - Clean up containers and images"
	@echo "  test      - Run Docker tests"
	@echo "  deploy    - Deploy to production"
	@echo "  prod      - Start production environment"
	@echo "  ssl       - Generate SSL certificates"
	@echo "  help      - Show this help"

# Development commands
build:
	@echo "🔨 Building Docker images..."
	docker-compose build

up:
	@echo "🚀 Starting development environment..."
	docker-compose up -d

down:
	@echo "🛑 Stopping all services..."
	docker-compose down

restart:
	@echo "🔄 Restarting services..."
	docker-compose restart

logs:
	@echo "📋 Viewing logs..."
	docker-compose logs -f

# Production commands
prod:
	@echo "🚀 Starting production environment..."
	docker-compose -f docker-compose.prod.yml up -d

prod-down:
	@echo "🛑 Stopping production services..."
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	@echo "📋 Viewing production logs..."
	docker-compose -f docker-compose.prod.yml logs -f

# Utility commands
clean:
	@echo "🧹 Cleaning up..."
	docker-compose down -v --rmi all
	docker system prune -f

test:
	@echo "🧪 Running Docker tests..."
	chmod +x scripts/test-docker.sh
	./scripts/test-docker.sh

deploy:
	@echo "🚀 Deploying to production..."
	chmod +x scripts/deploy.sh
	./scripts/deploy.sh

ssl:
	@echo "🔐 Generating SSL certificates..."
	chmod +x scripts/generate-ssl.sh
	./scripts/generate-ssl.sh

# Database commands
db-backup:
	@echo "💾 Backing up database..."
	docker exec todolist-mongodb mongodump --out /backup
	docker cp todolist-mongodb:/backup ./backup

db-restore:
	@echo "📥 Restoring database..."
	docker cp ./backup todolist-mongodb:/backup
	docker exec todolist-mongodb mongorestore /backup

# Monitoring commands
status:
	@echo "📊 Service status:"
	docker-compose ps

stats:
	@echo "📈 Container statistics:"
	docker stats --no-stream

health:
	@echo "🏥 Health checks:"
	@echo "Backend:"
	curl -s http://localhost:8001/api/health | jq . || echo "Backend not responding"
	@echo "Frontend:"
	curl -s -o /dev/null -w "%{http_code}" http://localhost:80 || echo "Frontend not responding"

# Development helpers
dev-setup:
	@echo "⚙️  Setting up development environment..."
	cp env.example .env
	@echo "📝 Please update .env file with your configuration"
	@echo "🔐 Generating SSL certificates..."
	chmod +x scripts/generate-ssl.sh
	./scripts/generate-ssl.sh
	@echo "✅ Development setup complete!"

# Quick start
start: build up
	@echo "🎉 TodoList is starting up!"
	@echo "📱 Frontend: http://localhost"
	@echo "🔧 Backend: http://localhost:8001/api"
	@echo "📋 Logs: make logs"

stop: down
	@echo "🛑 TodoList stopped" 