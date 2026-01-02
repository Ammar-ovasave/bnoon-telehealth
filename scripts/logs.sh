#!/bin/bash
# View Azure App Service container logs
# Usage: ./scripts/logs.sh [--tail]

set -e

# Configuration
RESOURCE_GROUP="bnoon-telehealth-rg"
APP_NAME="bnoon-telehealth"

# Colors
YELLOW='\033[1;33m'
NC='\033[0m'

if [ "$1" = "--tail" ] || [ "$1" = "-f" ]; then
    echo -e "${YELLOW}=== Streaming Logs (Ctrl+C to stop) ===${NC}"
    gtimeout 60 az webapp log tail --name ${APP_NAME} --resource-group ${RESOURCE_GROUP} 2>&1 || echo "Log stream ended"
else
    echo -e "${YELLOW}=== Downloading Logs ===${NC}"
    TEMP_DIR=$(mktemp -d)
    az webapp log download --name ${APP_NAME} --resource-group ${RESOURCE_GROUP} --log-file ${TEMP_DIR}/logs.zip 2>/dev/null
    unzip -o ${TEMP_DIR}/logs.zip -d ${TEMP_DIR}/logs 2>/dev/null

    echo ""
    echo -e "${YELLOW}=== Docker Container Logs ===${NC}"
    cat ${TEMP_DIR}/logs/LogFiles/*docker*.log 2>/dev/null | tail -50

    rm -rf ${TEMP_DIR}

    echo ""
    echo "Use --tail or -f to stream live logs"
fi
