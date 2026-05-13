#!/bin/bash

# Configuration
INTRANET_IP="10.0.138.50"
CURRENT_IP=$(hostname -I | awk '{print $1}')

echo "🔍 Identifying environment to fetch logs..."

if [ "$CURRENT_IP" == "$INTRANET_IP" ]; then
    echo "🏠 Detected: INTRANET SERVER"
    LOG_FILE="/home/ubuntu/pvz-devops-project/intranet-app/logs/app.log"
else
    echo "🌐 Detected: LANDING SERVER"
    LOG_FILE="/home/ubuntu/pvz-devops-project/landing-page/logs/app.log"
fi

# Check if log file exists
if [ -f "$LOG_FILE" ]; then
    echo "📋 Opening log file: $LOG_FILE"
    echo "💡 (Press Ctrl+C to stop watching)"
    echo "--------------------------------------------------"

    # tail -f follows the file in real-time
    # -n 50 shows the last 50 lines immediately
    tail -f -n 50 "$LOG_FILE"
else
    echo "❌ Error: Log file not found at $LOG_FILE"
    echo "Check if the application is running and has permissions to write to the logs folder."
    exit 1
fi
