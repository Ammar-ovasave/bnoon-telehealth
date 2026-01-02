#!/bin/bash
# Deploy/restart Azure App Service to pull latest container
# Usage: ./scripts/deploy.sh

set -e

# Configuration
RESOURCE_GROUP="bnoon-telehealth-rg"
APP_NAME="bnoon-telehealth"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Deploying Bnoon Telehealth ===${NC}"
echo "App Service: ${APP_NAME}"
echo "Resource Group: ${RESOURCE_GROUP}"
echo ""

# Restart to pull latest container
echo -e "${YELLOW}Restarting App Service...${NC}"
az webapp restart --name ${APP_NAME} --resource-group ${RESOURCE_GROUP}

echo -e "${YELLOW}Waiting for container to start...${NC}"
sleep 30

# Check status
HTTP_STATUS=$(curl -sL -o /dev/null -w "%{http_code}" https://${APP_NAME}.azurewebsites.net/)
if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "307" ]; then
    echo -e "${GREEN}Deployment successful! Site is responding with HTTP ${HTTP_STATUS}${NC}"
    echo "URL: https://${APP_NAME}.azurewebsites.net/"
else
    echo -e "${RED}Warning: Site returned HTTP ${HTTP_STATUS}. Check logs with:${NC}"
    echo "  ./scripts/logs.sh"
fi
