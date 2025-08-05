#!/bin/bash

# Nurtura Docker Management Script

case "$1" in
  "build")
    echo "Building Docker images..."
    docker-compose build
    ;;
  "up")
    echo "Starting Nurtura application..."
    docker-compose up -d
    echo "Application started! Frontend: http://localhost, Backend: http://localhost:5000"
    ;;
  "down")
    echo "Stopping Nurtura application..."
    docker-compose down
    ;;
  "dev")
    echo "Starting development environment..."
    docker-compose -f docker-compose.dev.yml up -d
    echo "Development environment started! Frontend: http://localhost:3000, Backend: http://localhost:5000"
    ;;
  "dev-down")
    echo "Stopping development environment..."
    docker-compose -f docker-compose.dev.yml down
    ;;
  "logs")
    if [ -z "$2" ]; then
      docker-compose logs -f
    else
      docker-compose logs -f "$2"
    fi
    ;;
  "restart")
    echo "Restarting Nurtura application..."
    docker-compose restart
    ;;
  "clean")
    echo "Cleaning up Docker resources..."
    docker-compose down -v --rmi all
    docker system prune -f
    ;;
  "status")
    echo "Docker containers status:"
    docker-compose ps
    ;;
  *)
    echo "Nurtura Docker Management"
    echo "Usage: $0 {build|up|down|dev|dev-down|logs|restart|clean|status}"
    echo ""
    echo "Commands:"
    echo "  build     - Build Docker images"
    echo "  up        - Start production environment"
    echo "  down      - Stop production environment"
    echo "  dev       - Start development environment"
    echo "  dev-down  - Stop development environment"
    echo "  logs      - Show logs (optionally specify service name)"
    echo "  restart   - Restart all services"
    echo "  clean     - Clean up all Docker resources"
    echo "  status    - Show container status"
    ;;
esac
