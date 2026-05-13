#!/bin/bash

# Configuration
INTRANET_IP="10.0.138.50"
CURRENT_IP=$(hostname -I | awk '{print $1}')

echo "🔍 Identifying environment for shutdown..."

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
    echo "🛑 Stopping containers in $PROJECT_DIR..."

    sudo docker compose stop

    echo "✅ Environment cleaned up."
else
    echo "❌ Error: Could not find directory $PROJECT_DIR to stop the app."
    exit 1
fi
