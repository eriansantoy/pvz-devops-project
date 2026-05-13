#!/bin/bash

## Configuration
CSV_FILE="plants.csv"
API_URL="http://10.0.138.50:8080/plants"

# Check if jq is installed
if ! command -v jq &>/dev/null; then
    echo "❌ Error: 'jq' is not installed. Please install it with: sudo apt install jq"
    exit 1
fi

echo "🌱 Starting plant migration to API..."

# Skip the header (tail -n +2) and read the CSV line by line
cat "$CSV_FILE" | while IFS=, read -r id name damage sun_cost description image_url; do

    # Remove surrounding quotes from description and image_url if they exist
    # and use jq to create a safe JSON object
    JSON_PAYLOAD=$(jq -n \
        --arg n "$name" \
        --arg d "$damage" \
        --arg s "$sun_cost" \
        --arg desc "$description" \
        --arg img "$image_url" \
        '{name: $n, damage: ($d|tonumber), sun_cost: ($s|tonumber), description: $desc, image_url: $img}')

    echo "Sending: $name..."

    # Send the POST request
    RESPONSE=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "$JSON_PAYLOAD")

    echo "Response: $RESPONSE"
done

echo "✅ Migration complete!"!/bin/sh
