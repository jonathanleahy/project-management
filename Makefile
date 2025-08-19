.PHONY: help setup start stop restart logs clean test build seed

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

setup: ## Initial setup of the project
	@chmod +x scripts/setup.sh
	@./scripts/setup.sh

start: ## Start all services
	docker-compose up -d

stop: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

logs: ## View logs from all services
	docker-compose logs -f

logs-backend: ## View backend logs
	docker-compose logs -f backend

logs-frontend: ## View frontend logs
	docker-compose logs -f frontend

logs-mysql: ## View MySQL logs
	docker-compose logs -f mysql

clean: ## Clean up containers and volumes
	docker-compose down -v
	rm -rf uploads/*
	rm -rf docker/volumes/*

test: ## Run all tests
	@echo "Running backend tests..."
	cd backend && go test ./...
	@echo "Running frontend tests..."
	cd frontend && npm test

test-e2e: ## Run end-to-end tests
	cd frontend && npm run cypress:run

build: ## Build all services
	docker-compose build

rebuild: ## Rebuild and restart all services
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

seed: ## Seed database with sample data
	docker exec -i pm_mysql mysql -upmuser -ppmpassword < scripts/seed.sql

shell-backend: ## Open shell in backend container
	docker exec -it pm_backend sh

shell-frontend: ## Open shell in frontend container
	docker exec -it pm_frontend sh

shell-mysql: ## Open MySQL shell
	docker exec -it pm_mysql mysql -upmuser -ppmpassword project_management

migrate: ## Run database migrations
	docker exec pm_mysql mysql -upmuser -ppmpassword project_management < database/migrations/001_initial.sql

dev-backend: ## Run backend in development mode (local)
	cd backend && go run cmd/server/main.go

dev-frontend: ## Run frontend in development mode (local)
	cd frontend && npm start

install-frontend: ## Install frontend dependencies
	cd frontend && npm install

install-backend: ## Install backend dependencies
	cd backend && go mod download

gqlgen: ## Generate GraphQL code
	cd backend && go run github.com/99designs/gqlgen generate