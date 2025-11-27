#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

IMAGE_NAME="financial-agent-frontend"
CONTAINER_NAME="financial-agent-frontend"
NETWORK_NAME="financial-agent-network"
API_URL="http://192.168.1.150/api/v1"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Financial Agent Frontend - Deploy${NC}"
echo -e "${BLUE}========================================${NC}"

if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    exit 1
fi

if ! docker network ls | grep -q "$NETWORK_NAME"; then
    echo -e "${YELLOW}⚠️  Network $NETWORK_NAME not found, creating...${NC}"
    docker network create "$NETWORK_NAME"
fi

echo -e "\n${YELLOW}[1/6] Creating backup...${NC}"
if docker ps -a | grep -q "$CONTAINER_NAME"; then
    BACKUP_TAG="backup-$(date +%Y%m%d-%H%M%S)"
    docker commit "$CONTAINER_NAME" "${IMAGE_NAME}:${BACKUP_TAG}"
    echo -e "${GREEN}✓ Backup created: ${IMAGE_NAME}:${BACKUP_TAG}${NC}"
else
    echo -e "${YELLOW}! No running container to backup${NC}"
fi

echo -e "\n${YELLOW}[2/6] Building Docker image...${NC}"
docker build \
    --build-arg VITE_API_URL="$API_URL" \
    --build-arg VITE_ENABLE_LOGS=false \
    --build-arg VITE_APP_VERSION="$(git rev-parse --short HEAD 2>/dev/null || echo 'manual')" \
    -t "${IMAGE_NAME}:latest" \
    -t "${IMAGE_NAME}:$(date +%Y%m%d-%H%M%S)" \
    .

echo -e "${GREEN}✓ Image built successfully${NC}"

echo -e "\n${YELLOW}[3/6] Stopping old container...${NC}"
docker stop "$CONTAINER_NAME" 2>/dev/null || echo "No container to stop"
docker rm "$CONTAINER_NAME" 2>/dev/null || echo "No container to remove"

echo -e "\n${YELLOW}[4/6] Starting new container...${NC}"
docker run -d \
    --name "$CONTAINER_NAME" \
    --network "$NETWORK_NAME" \
    -p 3000:3000 \
    --restart unless-stopped \
    "${IMAGE_NAME}:latest"

echo -e "${GREEN}✓ Container started${NC}"

echo -e "\n${YELLOW}[5/6] Waiting for health check...${NC}"
sleep 5

MAX_RETRIES=12
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker exec "$CONTAINER_NAME" curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Health check passed${NC}"
        break
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "Attempt $RETRY_COUNT/$MAX_RETRIES..."
    sleep 5

    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo -e "${RED}❌ Health check failed after $MAX_RETRIES attempts${NC}"
        echo -e "${YELLOW}Container logs:${NC}"
        docker logs --tail 50 "$CONTAINER_NAME"

        echo -e "${YELLOW}Rolling back...${NC}"
        docker stop "$CONTAINER_NAME"
        docker rm "$CONTAINER_NAME"

        if [ -n "$BACKUP_TAG" ]; then
            docker run -d \
                --name "$CONTAINER_NAME" \
                --network "$NETWORK_NAME" \
                -p 3000:3000 \
                --restart unless-stopped \
                "${IMAGE_NAME}:${BACKUP_TAG}"
            echo -e "${GREEN}✓ Rolled back to ${BACKUP_TAG}${NC}"
        fi

        exit 1
    fi
done

echo -e "\n${YELLOW}[6/6] Cleaning up...${NC}"
docker image prune -f

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Deployment Successful!${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "\n${BLUE}Container Status:${NC}"
docker ps | grep "$CONTAINER_NAME"

echo -e "\n${BLUE}Access URLs:${NC}"
echo -e "  Frontend: ${GREEN}http://192.168.1.150${NC}"
echo -e "  Health:   ${GREEN}http://192.168.1.150/health${NC}"

echo -e "\n${BLUE}Recent Logs:${NC}"
docker logs --tail 20 "$CONTAINER_NAME"

echo -e "\n${BLUE}Useful Commands:${NC}"
echo -e "  View logs:    ${YELLOW}docker logs -f $CONTAINER_NAME${NC}"
echo -e "  Enter shell:  ${YELLOW}docker exec -it $CONTAINER_NAME sh${NC}"
echo -e "  Stop:         ${YELLOW}docker stop $CONTAINER_NAME${NC}"
echo -e "  Restart:      ${YELLOW}docker restart $CONTAINER_NAME${NC}"
