FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline --no-audit && npm cache clean --force

COPY . .

ARG VITE_API_URL=http://192.168.1.150/api/v1
ARG VITE_ENABLE_LOGS=false
ARG VITE_APP_VERSION=1.0.0

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ENABLE_LOGS=$VITE_ENABLE_LOGS
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV NODE_ENV=production

RUN npm run build

FROM nginx:1.25-alpine AS production

RUN apk add --no-cache curl

RUN rm -rf /etc/nginx/conf.d/default.conf && rm -rf /usr/share/nginx/html/*

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

RUN mkdir -p /var/cache/nginx/client_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp

RUN chown -R nginx:nginx /usr/share/nginx/html \
    /var/cache/nginx \
    /var/log/nginx \
    && chmod -R 755 /usr/share/nginx/html

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
