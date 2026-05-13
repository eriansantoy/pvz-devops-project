#!/bin/bash

# Configuration
INTRANET_IP="10.0.138.50"
# Get the primary private IP of the current machine
CURRENT_IP=$(hostname -I | awk '{print $1}')

echo "🔍 Identifying environment..."
echo "Current IP: $CURRENT_IP"

if [ "$CURRENT_IP" == "$INTRANET_IP" ]; then
    echo "🏠 Detected: INTRANET SERVER"
    PROJECT_DIR="$HOME/pvz-devops-project/intranet-app"
else
    echo "🌐 Detected: LANDING SERVER"
    PROJECT_DIR="$HOME/pvz-devops-project/landing-page"
fi

# Check if directory exists
if [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR"
    echo "🚀 Starting containers in $PROJECT_DIR..."

    sudo docker compose up -d

    echo "✅ Containers are coming up. Check logs with 'sudo docker compose logs -f'"
else
    echo "❌ Error: Project directory $PROJECT_DIR not found!"
    exit 1
fi
