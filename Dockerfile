# ============================================================================
# Multi-stage Build - Frontend Only (Static Files)
# ============================================================================
# Stage 1: Build da aplicação
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependências
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit && npm cache clean --force

# Copiar código fonte
COPY . .

# Build arguments
ARG VITE_API_URL=http://192.168.1.150/api/v1
ARG VITE_ENABLE_LOGS=false
ARG VITE_APP_VERSION=1.0.0

# Environment variables para build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ENABLE_LOGS=$VITE_ENABLE_LOGS
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV NODE_ENV=production

# Build da aplicação
RUN npm run build

# Verificar build
RUN ls -lah dist/ && \
    echo "Build size: $(du -sh dist/ | cut -f1)"

# ============================================================================
# Stage 2: Container leve para manter os arquivos estáticos
# ============================================================================
FROM alpine:3.19

WORKDIR /app

# Instalar apenas o necessário para health checks
RUN apk add --no-cache curl

# Copiar arquivos buildados
COPY --from=builder /app/dist /app/dist

# Criar health check endpoint simples
RUN echo '#!/bin/sh' > /app/health.sh && \
    echo 'if [ -f /app/dist/index.html ]; then exit 0; else exit 1; fi' >> /app/health.sh && \
    chmod +x /app/health.sh

# Health check: verifica se os arquivos existem
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD /app/health.sh

# Labels para identificação
LABEL maintainer="Financial Agent Team"
LABEL description="Frontend static files for Financial Agent"
LABEL version="1.0.0"

# Container fica rodando aguardando o volume ser montado pelo nginx
CMD ["tail", "-f", "/dev/null"]
