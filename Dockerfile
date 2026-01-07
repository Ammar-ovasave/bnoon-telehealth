# ================================
# Multi-stage Dockerfile for Next.js App
# Optimized for both development and production
# Supports pre-built artifacts from CI/CD pipeline
# ================================
#
# Pipeline Integration:
#   - If .next/ exists in build context → skips npm ci AND npm run build
#   - USE_PREBUILT=true signals pre-built artifact usage
#
# Usage:
#   Local:    docker build --target production -t bnoon-telehealth .
#   Pipeline: docker build --target production --build-arg USE_PREBUILT=true -t bnoon-telehealth .
# ================================

# ============ Base Stage ============
FROM node:20-alpine AS base

RUN apk add --no-cache \
    libc6-compat \
    ca-certificates \
    dumb-init \
    curl

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# ============ Build Stage ============
# Optimized: skips npm ci entirely when pre-built artifact exists
FROM base AS build

# Flag to indicate pre-built artifact from pipeline
ARG USE_PREBUILT=false

# Build arguments for metadata injection
ARG GIT_COMMIT=unknown
ARG GIT_SHORT_SHA=unknown
ARG GIT_BRANCH=unknown
ARG GIT_TAG=unknown
ARG BUILD_DATE=unknown
ARG BUILD_NUMBER=unknown
ARG BUILD_ID=unknown
ARG APP_VERSION=unknown
ARG RELEASE_VERSION=unknown

# Copy source code first (includes pre-built .next/ if from pipeline)
COPY . .

# Conditional build: skip npm ci when pre-built artifact exists
# This saves ~35s when using pipeline pre-built artifacts
RUN set -e; \
    echo ""; \
    echo "============================================"; \
    echo "       Bnoon Telehealth Build Stage        "; \
    echo "============================================"; \
    echo ""; \
    \
    if [ -d ".next" ] && [ -d ".next/standalone" ]; then \
        echo "✅ Found pre-built .next/ with standalone output"; \
        echo "   USE_PREBUILT=${USE_PREBUILT}"; \
        echo "   ⏭️  Skipping npm ci (dependencies bundled in standalone)"; \
        echo "   ⏭️  Skipping npm run build (already built)"; \
        echo ""; \
        ls -la .next/ | head -10; \
    else \
        echo "📦 Building from source..."; \
        echo ""; \
        echo "1️⃣  Installing dependencies..."; \
        npm ci --legacy-peer-deps --no-audit --no-fund --prefer-offline; \
        echo ""; \
        echo "2️⃣  Running Next.js build..."; \
        npm run build; \
        \
        echo ""; \
        echo "✅ Build completed successfully"; \
    fi; \
    \
    echo ""; \
    echo "Build output:"; \
    ls -la .next/ 2>/dev/null | head -10 || echo "No .next/ found"; \
    echo ""

# Create build-info.json for runtime metadata
RUN echo "{\"version\":\"${RELEASE_VERSION}\",\"commit\":\"${GIT_COMMIT}\",\"branch\":\"${GIT_BRANCH}\",\"buildDate\":\"${BUILD_DATE}\",\"buildNumber\":\"${BUILD_NUMBER}\"}" > .next/build-info.json

# ============ Production Stage ============
FROM base AS production

# Re-declare build arguments for labels
ARG GIT_COMMIT=unknown
ARG GIT_SHORT_SHA=unknown
ARG GIT_BRANCH=unknown
ARG GIT_TAG=unknown
ARG BUILD_DATE=unknown
ARG BUILD_NUMBER=unknown
ARG BUILD_ID=unknown
ARG APP_VERSION=unknown
ARG RELEASE_VERSION=unknown
ARG USE_PREBUILT=false

# OCI-compliant + custom labels
LABEL org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.authors="Bnoon Team" \
      org.opencontainers.image.url="https://bnoon.sa" \
      org.opencontainers.image.source="https://dev.azure.com/ovasave-production/ovasave/_git/bnoon-telehealth" \
      org.opencontainers.image.version="${RELEASE_VERSION}" \
      org.opencontainers.image.revision="${GIT_COMMIT}" \
      org.opencontainers.image.vendor="Bnoon" \
      org.opencontainers.image.title="Bnoon Telehealth" \
      org.opencontainers.image.description="Bnoon Telehealth Next.js Application" \
      git.commit="${GIT_COMMIT}" \
      git.shortCommit="${GIT_SHORT_SHA}" \
      git.branch="${GIT_BRANCH}" \
      git.tag="${GIT_TAG}" \
      build.date="${BUILD_DATE}" \
      build.number="${BUILD_NUMBER}" \
      build.id="${BUILD_ID}" \
      build.prebuilt="${USE_PREBUILT}" \
      app.name="bnoon-telehealth" \
      app.version="${RELEASE_VERSION}"

# Runtime environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    TZ=Asia/Riyadh \
    HOSTNAME="0.0.0.0" \
    APP_VERSION="${RELEASE_VERSION}" \
    GIT_COMMIT="${GIT_COMMIT}" \
    GIT_BRANCH="${GIT_BRANCH}" \
    BUILD_DATE="${BUILD_DATE}"

# Copy standalone build output
# Next.js standalone output includes only necessary files
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/build-info.json ./.next/build-info.json

USER nextjs
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -sf http://localhost:3000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
