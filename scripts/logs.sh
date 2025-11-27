#!/bin/bash

CONTAINER_NAME="financial-agent-frontend"

if [ "$1" = "-f" ] || [ "$1" = "--follow" ]; then
    docker logs -f "$CONTAINER_NAME"
else
    LINES=${1:-50}
    docker logs --tail "$LINES" "$CONTAINER_NAME"
fi
