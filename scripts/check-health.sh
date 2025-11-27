#!/bin/bash

CONTAINER_NAME="financial-agent-frontend"

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Checking frontend health..."

if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}❌ Container is not running${NC}"
    exit 1
fi

if docker exec "$CONTAINER_NAME" curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
    exit 0
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "Container logs:"
    docker logs --tail 20 "$CONTAINER_NAME"
    exit 1
fi
