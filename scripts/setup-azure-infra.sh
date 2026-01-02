#!/bin/bash
# One-time Azure infrastructure setup for bnoon-telehealth
# This script creates all required Azure resources
# Usage: ./scripts/setup-azure-infra.sh

set -e

# Configuration
RESOURCE_GROUP="bnoon-telehealth-rg"
LOCATION="uaenorth"
APP_SERVICE_PLAN="bnoon-telehealth-plan"
APP_NAME="bnoon-telehealth"
ACR_NAME="ovasavestage"
IMAGE_NAME="bnoon/telehealth/webapp"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Bnoon Telehealth Azure Infrastructure Setup ===${NC}"
echo ""

# 1. Create Resource Group
echo -e "${YELLOW}1. Creating Resource Group...${NC}"
az group create --name ${RESOURCE_GROUP} --location ${LOCATION} -o json | jq '{name, location}'

# 2. Create App Service Plan (Linux, B1 tier)
echo -e "${YELLOW}2. Creating App Service Plan...${NC}"
az appservice plan create \
  --name ${APP_SERVICE_PLAN} \
  --resource-group ${RESOURCE_GROUP} \
  --sku B1 \
  --is-linux \
  --location ${LOCATION} \
  -o json | jq '{name, sku: .sku.name}'

# 3. Create Web App for Containers
echo -e "${YELLOW}3. Creating Web App...${NC}"
az webapp create \
  --name ${APP_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --plan ${APP_SERVICE_PLAN} \
  --runtime "NODE:20-lts" \
  -o json | jq '{name, defaultHostName}'

# 4. Enable System-Assigned Managed Identity
echo -e "${YELLOW}4. Enabling Managed Identity...${NC}"
PRINCIPAL_ID=$(az webapp identity assign --name ${APP_NAME} --resource-group ${RESOURCE_GROUP} --query principalId -o tsv)
echo "Principal ID: ${PRINCIPAL_ID}"

# 5. Grant ACR Pull permission to Managed Identity
echo -e "${YELLOW}5. Granting ACR Pull permission...${NC}"
ACR_ID=$(az acr show --name ${ACR_NAME} --query id -o tsv)
az role assignment create \
  --assignee ${PRINCIPAL_ID} \
  --role AcrPull \
  --scope ${ACR_ID} \
  -o json | jq '{roleDefinitionName}'

# 6. Configure container settings with Managed Identity
echo -e "${YELLOW}6. Configuring container settings...${NC}"
az webapp config container set \
  --name ${APP_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --container-image-name ${ACR_NAME}.azurecr.io/${IMAGE_NAME}:latest \
  --container-registry-url https://${ACR_NAME}.azurecr.io \
  -o none

az resource update \
  --ids $(az webapp show -n ${APP_NAME} -g ${RESOURCE_GROUP} --query id -o tsv)/config/web \
  --set properties.acrUseManagedIdentityCreds=true \
  -o none

# 7. Configure app settings
echo -e "${YELLOW}7. Configuring app settings...${NC}"
echo "Enter environment variables (or press Enter to skip):"

read -p "FIREBASE_SERVICE_ACCOUNT (JSON, single line): " FIREBASE_SA
read -p "AGORA_APP_ID: " AGORA_ID
read -p "AGORA_APP_CERTIFICATE: " AGORA_CERT
read -p "JWT_SECRET: " JWT_SECRET

if [ -n "$FIREBASE_SA" ]; then
    az webapp config appsettings set \
      --name ${APP_NAME} \
      --resource-group ${RESOURCE_GROUP} \
      --settings \
        FIREBASE_SERVICE_ACCOUNT="${FIREBASE_SA}" \
        AGORA_APP_ID="${AGORA_ID}" \
        AGORA_APP_CERTIFICATE="${AGORA_CERT}" \
        JWT_SECRET="${JWT_SECRET}" \
        WEBSITES_PORT="3000" \
      -o none
    echo -e "${GREEN}App settings configured${NC}"
else
    echo "Skipping app settings - configure manually in Azure Portal"
fi

# 8. Enable logging
echo -e "${YELLOW}8. Enabling logging...${NC}"
az webapp log config \
  --name ${APP_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --docker-container-logging filesystem \
  --web-server-logging filesystem \
  -o none

echo ""
echo -e "${GREEN}=== Setup Complete ===${NC}"
echo "App Service URL: https://${APP_NAME}.azurewebsites.net"
echo ""
echo "Next steps:"
echo "1. Build and push your Docker image: ./scripts/build-and-push.sh"
echo "2. Deploy: ./scripts/deploy.sh"
echo "3. View logs: ./scripts/logs.sh"
