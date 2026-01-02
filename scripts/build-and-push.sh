#!/bin/bash
# Build and push Docker image to Azure Container Registry
# Usage: ./scripts/build-and-push.sh [tag]

set -e

# Configuration
ACR_NAME="ovasavestage"
IMAGE_NAME="bnoon/telehealth/webapp"
TAG="${1:-latest}"
SECRETS_DIR="${SECRETS_DIR:-/tmp/bnoon-secrets}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Bnoon Telehealth Docker Build ===${NC}"
echo "ACR: ${ACR_NAME}.azurecr.io"
echo "Image: ${IMAGE_NAME}:${TAG}"
echo ""

# Check for required secret file
if [ ! -f "${SECRETS_DIR}/FIREBASE_SERVICE_ACCOUNT" ]; then
    echo -e "${RED}Error: Firebase secret not found at ${SECRETS_DIR}/FIREBASE_SERVICE_ACCOUNT${NC}"
    echo "Create it with: echo '<json>' > ${SECRETS_DIR}/FIREBASE_SERVICE_ACCOUNT"
    exit 1
fi

# Login to ACR
echo -e "${YELLOW}Logging in to ACR...${NC}"
az acr login --name ${ACR_NAME}

# Build for linux/amd64 (Azure App Service requirement)
echo -e "${YELLOW}Building Docker image for linux/amd64...${NC}"
DOCKER_BUILDKIT=1 docker build \
  --platform linux/amd64 \
  --secret id=FIREBASE_SERVICE_ACCOUNT,src=${SECRETS_DIR}/FIREBASE_SERVICE_ACCOUNT \
  --target production \
  -t ${ACR_NAME}.azurecr.io/${IMAGE_NAME}:${TAG} \
  -t ${ACR_NAME}.azurecr.io/${IMAGE_NAME}:latest \
  .

# Push to ACR
echo -e "${YELLOW}Pushing to ACR...${NC}"
docker push ${ACR_NAME}.azurecr.io/${IMAGE_NAME}:${TAG}
docker push ${ACR_NAME}.azurecr.io/${IMAGE_NAME}:latest

echo -e "${GREEN}Done! Image pushed to ${ACR_NAME}.azurecr.io/${IMAGE_NAME}:${TAG}${NC}"
