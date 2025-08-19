#!/bin/bash

echo "🚀 Setting up Project Management System..."

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads
mkdir -p docker/volumes

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env files if they don't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend .env file..."
    cat > backend/.env << EOF
DB_HOST=mysql
DB_PORT=3306
DB_USER=pmuser
DB_PASSWORD=pmpassword
DB_NAME=project_management
SESSION_SECRET=your-secret-key-change-in-production
PORT=8080
CORS_ORIGINS=http://localhost:3000
ENV=development
EOF
fi

if [ ! -f frontend/.env ]; then
    echo "📝 Creating frontend .env file..."
    cat > frontend/.env << EOF
VITE_API_URL=http://localhost:8080/graphql
VITE_WS_URL=ws://localhost:8080/graphql
EOF
fi

# Build and start Docker containers
echo "🐳 Building Docker containers..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
sleep 10

# Check if services are running
echo "✅ Checking service status..."
docker-compose ps

echo "🎉 Setup complete!"
echo ""
echo "📚 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend GraphQL: http://localhost:8080/playground"
echo "   Database Admin: http://localhost:8081"
echo ""
echo "🔧 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"