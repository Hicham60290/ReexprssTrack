#!/bin/bash
# ==============================================================================
# ReExpressTrack - Production Deployment Script
# ==============================================================================

set -e  # Exit on error

echo "======================================================================"
echo "  ReExpressTrack - Production Deployment"
echo "======================================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}Error: This script should NOT be run as root${NC}"
   echo "Please run as: ./DEPLOY.sh"
   exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker first: https://docs.docker.com/engine/install/"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not available${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"
echo ""

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}Error: backend/.env file not found${NC}"
    echo "Please create backend/.env with production credentials"
    exit 1
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${RED}Error: frontend/.env file not found${NC}"
    echo "Please create frontend/.env with production configuration"
    exit 1
fi

echo -e "${GREEN}✓ Environment files found${NC}"
echo ""

# Stop any existing containers
echo "Stopping existing containers..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || true
echo ""

# Pull latest images
echo "Pulling base images..."
docker compose -f docker-compose.prod.yml pull postgres redis minio
echo ""

# Build the application images
echo "Building application images..."
docker compose -f docker-compose.prod.yml build --no-cache
echo ""

# Start the services
echo "Starting services..."
docker compose -f docker-compose.prod.yml up -d
echo ""

# Wait for services to be healthy
echo "Waiting for services to start..."
sleep 10

# Check service status
echo ""
echo "Service Status:"
docker compose -f docker-compose.prod.yml ps
echo ""

# Run database migrations
echo "Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy || {
    echo -e "${YELLOW}Warning: Failed to run migrations. Database might not be ready yet.${NC}"
    echo "You can run migrations manually later with:"
    echo "  docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy"
}
echo ""

# Check logs for errors
echo "Checking for startup errors..."
docker compose -f docker-compose.prod.yml logs --tail=20 backend | grep -i error || true
docker compose -f docker-compose.prod.yml logs --tail=20 frontend | grep -i error || true
echo ""

echo "======================================================================"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo "======================================================================"
echo ""
echo "Services running:"
echo "  - Backend API:  http://127.0.0.1:3000"
echo "  - Frontend:     http://127.0.0.1:8080"
echo "  - PostgreSQL:   127.0.0.1:5432"
echo "  - Redis:        127.0.0.1:6380"
echo "  - MinIO API:    http://127.0.0.1:9000"
echo "  - MinIO Console: http://127.0.0.1:9001"
echo ""
echo "Next steps:"
echo "  1. Configure Nginx reverse proxy (see nginx-production.conf)"
echo "  2. Test the application at https://reexpresstrack.com"
echo "  3. Monitor logs: docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "Useful commands:"
echo "  - View logs:     docker compose -f docker-compose.prod.yml logs -f"
echo "  - Stop services: docker compose -f docker-compose.prod.yml down"
echo "  - Restart:       docker compose -f docker-compose.prod.yml restart"
echo "  - Shell access:  docker compose -f docker-compose.prod.yml exec backend sh"
echo ""
