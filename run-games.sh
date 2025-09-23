#!/bin/bash

# Browser Games Development Server Script
# Usage: ./run-games.sh [start|stop|restart|logs]

COMPOSE_FILE="docker-compose.yml"
SERVICE_NAME="browser-games"

case "$1" in
  start)
    echo "Starting browser games server..."
    docker-compose up -d
    echo "Server started! Access your games at http://localhost:8080"
    echo "Directory listing will be available to browse individual games"
    ;;
  stop)
    echo "Stopping browser games server..."
    docker compose down
    echo "Server stopped."
    ;;
  restart)
    echo "Restarting browser games server..."
    docker compose down
    docker compose up -d
    echo "Server restarted! Access your games at http://localhost:8080"
    ;;
  logs)
    echo "Showing server logs..."
    docker compose logs -f $SERVICE_NAME
    ;;
  build)
    echo "Rebuilding and starting server..."
    docker compose up -d --build
    echo "Server rebuilt and started! Access your games at http://localhost:8080"
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|logs|build}"
    echo ""
    echo "Commands:"
    echo "  start   - Start the web server"
    echo "  stop    - Stop the web server"
    echo "  restart - Restart the web server"
    echo "  logs    - Show server logs"
    echo "  build   - Rebuild and start the server"
    echo ""
    echo "After starting, access your games at http://localhost:8080"
    exit 1
    ;;
esac