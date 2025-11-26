#!/bin/bash
# ==============================================================================
# Docker Helper Commands for Dev Container
# ==============================================================================
# Source this file or use these aliases in your shell

# Docker Compose with correct project name
alias dcp='docker compose -p project-chronos'

# Common shortcuts
alias dcps='docker compose -p project-chronos ps'
alias dclogs='docker compose -p project-chronos logs -f'
alias dcrestart='docker compose -p project-chronos restart'

# Database connection
alias db-connect='psql -h timescaledb -p 5432 -U prometheus -d chronos_db'

# Load environment variables
load-env() {
    set -a
    source /workspace/.env
    set +a
    echo "✅ Environment variables loaded from .env"
}

# Show database info
db-info() {
    echo "📊 Database Connection Info:"
    echo "  Host: timescaledb (or localhost:5432 from host)"
    echo "  Database: chronos_db"
    echo "  User: prometheus"
    echo "  Password: <REDACTED_PASSWORD>"
    echo ""
    echo "Connect with: db-connect"
}

echo "✅ Docker helpers loaded!"
echo ""
echo "Available commands:"
echo "  dcp       - docker compose -p project-chronos"
echo "  dcps      - Show running containers"
echo "  dclogs    - Follow logs"
echo "  dcrestart - Restart services"
echo "  db-connect - Connect to database"
echo "  db-info   - Show database connection info"
echo ""
echo "Usage: source /workspace/.devcontainer/docker-helpers.sh"
