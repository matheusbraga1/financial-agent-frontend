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

# Instalar rsync para copiar arquivos eficientemente
RUN apk add --no-cache curl rsync

# Copiar arquivos buildados para diretório temporário (não será sobrescrito pelo volume)
COPY --from=builder /app/dist /app/dist-build

# Criar script de inicialização que copia arquivos para o volume montado
RUN echo '#!/bin/sh' > /app/init.sh && \
    echo 'echo "📦 Copying new frontend files to shared volume..."' >> /app/init.sh && \
    echo 'echo "Source: /app/dist-build/"' >> /app/init.sh && \
    echo 'echo "Target: /app/dist/"' >> /app/init.sh && \
    echo '' >> /app/init.sh && \
    echo '# Copy files from build to volume (delete old files)' >> /app/init.sh && \
    echo 'rsync -av --delete /app/dist-build/ /app/dist/' >> /app/init.sh && \
    echo '' >> /app/init.sh && \
    echo 'echo "✅ Frontend files updated in volume"' >> /app/init.sh && \
    echo 'echo "📂 Volume contents:"' >> /app/init.sh && \
    echo 'ls -lah /app/dist/' >> /app/init.sh && \
    echo '' >> /app/init.sh && \
    echo 'echo "🔄 Container ready - keeping alive..."' >> /app/init.sh && \
    echo 'tail -f /dev/null' >> /app/init.sh && \
    chmod +x /app/init.sh

# Criar health check endpoint simples
RUN echo '#!/bin/sh' > /app/health.sh && \
    echo 'if [ -f /app/dist/index.html ]; then exit 0; else exit 1; fi' >> /app/health.sh && \
    chmod +x /app/health.sh

# Health check: verifica se os arquivos existem no volume
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD /app/health.sh

# Labels para identificação
LABEL maintainer="Financial Agent Team"
LABEL description="Frontend static files for Financial Agent"
LABEL version="1.0.0"

# Usar script de inicialização que copia arquivos para o volume
CMD ["/app/init.sh"]
