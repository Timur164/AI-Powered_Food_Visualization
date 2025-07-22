#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Food Visualization App - Docker Setup${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if .env file exists in backend
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Warning: backend/.env file not found.${NC}"
    echo -e "${YELLOW}Please create backend/.env with your API keys:${NC}"
    echo -e "${YELLOW}OPENAI_API_KEY=your_api_key_here${NC}"
    echo -e "${YELLOW}REPLICATE_API_TOKEN=your_replicate_token_here${NC}"
    exit 1
fi

# Function to show usage
show_usage() {
    echo -e "${GREEN}Usage:${NC}"
    echo -e "  ${YELLOW}./run.sh dev${NC}     - Run in development mode (localhost backend)"
    echo -e "  ${YELLOW}./run.sh prod${NC}    - Run in production mode (Render backend)"
    echo -e "  ${YELLOW}./run.sh stop${NC}    - Stop all containers"
    echo -e "  ${YELLOW}./run.sh clean${NC}   - Stop and remove all containers and images"
    echo -e "  ${YELLOW}./run.sh logs${NC}    - Show logs from all containers"
    echo ""
    echo -e "${GREEN}Development Mode:${NC}"
    echo -e "  - Frontend: http://localhost:8080"
    echo -e "  - Backend: http://localhost:8002 (local Docker container)"
    echo -e "  - Uses local backend with hot reloading"
    echo -e "  - Requires API keys in backend/.env"
    echo ""
    echo -e "${GREEN}Production Mode:${NC}"
    echo -e "  - Frontend: http://localhost:3000"
    echo -e "  - Backend: https://ai-powered-food-visualization.onrender.com (deployed on Render)"
    echo -e "  - Uses deployed Render backend"
    echo -e "  - No local backend needed"
}

# Function to run development mode
run_dev() {
    echo -e "${GREEN}Starting development mode...${NC}"
    echo -e "${YELLOW}Frontend will be available at: http://localhost:8080${NC}"
    echo -e "${YELLOW}Backend will be available at: http://localhost:8002${NC}"
    echo -e "${YELLOW}Using local backend with hot reloading${NC}"
    docker-compose -f docker-compose.dev.yml up --build
}

# Function to run production mode
run_prod() {
    echo -e "${GREEN}Starting production mode...${NC}"
    echo -e "${YELLOW}Frontend will be available at: http://localhost:3000${NC}"
    echo -e "${YELLOW}Backend will use: https://ai-powered-food-visualization.onrender.com${NC}"
    echo -e "${YELLOW}Using deployed Render backend${NC}"
    docker-compose -f docker-compose.prod.yml up --build
}

# Function to stop containers
stop_containers() {
    echo -e "${GREEN}Stopping containers...${NC}"
    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.prod.yml down
}

# Function to clean everything
clean_all() {
    echo -e "${GREEN}Cleaning up...${NC}"
    docker-compose -f docker-compose.dev.yml down --rmi all --volumes --remove-orphans
    docker-compose -f docker-compose.prod.yml down --rmi all --volumes --remove-orphans
    docker system prune -f
}

# Function to show logs
show_logs() {
    echo -e "${GREEN}Showing logs...${NC}"
    docker-compose -f docker-compose.dev.yml logs -f
}

# Main script logic
case "$1" in
    "dev")
        run_dev
        ;;
    "prod")
        run_prod
        ;;
    "stop")
        stop_containers
        ;;
    "clean")
        clean_all
        ;;
    "logs")
        show_logs
        ;;
    *)
        show_usage
        exit 1
        ;;
esac 