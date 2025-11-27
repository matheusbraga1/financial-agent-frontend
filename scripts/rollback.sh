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

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Rollback - Financial Agent Frontend${NC}"
echo -e "${BLUE}========================================${NC}"

echo -e "\n${YELLOW}Available backup images:${NC}"
docker images "${IMAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}" | grep -E "backup|latest"

echo ""
read -p "Enter backup tag to rollback to (e.g., backup-20250127-120000): " BACKUP_TAG

if [ -z "$BACKUP_TAG" ]; then
    echo -e "${RED}❌ No backup tag provided${NC}"
    exit 1
fi

if ! docker images "${IMAGE_NAME}:${BACKUP_TAG}" | grep -q "$BACKUP_TAG"; then
    echo -e "${RED}❌ Image ${IMAGE_NAME}:${BACKUP_TAG} not found${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Rolling back to: ${IMAGE_NAME}:${BACKUP_TAG}${NC}"
read -p "Confirm rollback? (y/N): " CONFIRM

if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Rollback cancelled${NC}"
    exit 0
fi

echo -e "\n${YELLOW}Stopping current container...${NC}"
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

echo -e "\n${YELLOW}Starting container with backup image...${NC}"
docker run -d \
    --name "$CONTAINER_NAME" \
    --network "$NETWORK_NAME" \
    -p 3000:3000 \
    --restart unless-stopped \
    "${IMAGE_NAME}:${BACKUP_TAG}"

echo -e "\n${YELLOW}Checking health...${NC}"
sleep 5

for i in {1..10}; do
    if docker exec "$CONTAINER_NAME" curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Rollback successful!${NC}"
        docker ps | grep "$CONTAINER_NAME"
        exit 0
    fi
    echo "Attempt $i/10..."
    sleep 3
done

echo -e "${RED}❌ Rollback failed - health check timeout${NC}"
docker logs --tail 50 "$CONTAINER_NAME"
exit 1
