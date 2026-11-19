# syntax=docker/dockerfile:1.7
# =============================================================================
# Kit-GesPro (GP-13) · Imagen de producción
# =============================================================================
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-fund --no-audit

FROM node:24-alpine AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4500 \
    NODE_OPTIONS=--disable-warning=ExperimentalWarning
WORKDIR /app

# Dependencias + código (sin pruebas, docs ni versión autónoma)
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY public ./public
COPY sql ./sql
COPY scripts/migrate.mjs ./scripts/migrate.mjs

# Directorio para SQLite (solo si no se configura DATABASE_URL)
RUN mkdir -p /app/data && chown -R node:node /app/data
USER node

EXPOSE 4500
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/healthz" >/dev/null || exit 1

CMD ["node", "src/server.mjs"]
