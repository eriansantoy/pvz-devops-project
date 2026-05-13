#!/bin/bash

## Configuration
CSV_FILE="$1"
API_URL="http://10.0.138.50:8080/plants"

if ! command -v jq &>/dev/null; then
    echo "❌ Error: 'jq' is not installed."
    exit 1
fi

echo "🌱 Starting plant migration to API..."

while read -r line; do
    # 1. Extraer la URL (todo lo que está después de la última coma)
    image_url="${line##*,}"

    # 2. Quitar la URL y la última coma de la línea para procesar el resto
    rest="${line%,*}"

    # 3. Ahora el resto es: id,nombre,daño,costo,descripcion
    # Podemos extraer la descripción (lo que queda después de la 4ta coma)
    # Pero para no complicarnos con los índices, usamos un pequeño truco de 'cut'
    id=$(echo "$rest" | cut -d',' -f1)
    name=$(echo "$rest" | cut -d',' -f2)
    damage=$(echo "$rest" | cut -d',' -f3)
    sun_cost=$(echo "$rest" | cut -d',' -f4)

    # La descripción es todo lo que queda después de la 4ta columna
    # 'cut -d, -f5-' toma desde la columna 5 hasta el final (incluyendo comas internas)
    description=$(echo "$rest" | cut -d',' -f5- | sed 's/^"//;s/"$//')

    # Crear JSON con jq
    JSON_PAYLOAD=$(jq -n \
        --arg n "$name" \
        --arg d "$damage" \
        --arg s "$sun_cost" \
        --arg desc "$description" \
        --arg img "$image_url" \
        '{name: $n, damage: ($d|tonumber), sun_cost: ($s|tonumber), description: $desc, image_url: $img}')

    echo "Sending: $name..."

    RESPONSE=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "$JSON_PAYLOAD")

    echo "Response: $RESPONSE"

done <"$CSV_FILE"

echo "✅ Migration complete!"
