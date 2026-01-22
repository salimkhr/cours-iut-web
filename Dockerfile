# -------------------------------
# Étape 1 : Dépendances
# -------------------------------
FROM node:20.18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# -------------------------------
# Étape 2 : Build
# -------------------------------
FROM node:20.18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# -------------------------------
# Étape 3 : Production
# -------------------------------
FROM node:20.18-alpine AS runner
WORKDIR /app
RUN addgroup -S nodejs && adduser -S -G nodejs nextjs

ENV NODE_ENV=production
ENV PORT=3000
ENV WS_PORT=3001

# Copier node_modules complets (pour socket.io)
COPY --from=builder /app/node_modules ./node_modules

# Copier les fichiers standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copier le serveur WebSocket et le script de démarrage
COPY --from=builder --chown=nextjs:nodejs /app/ws-server.js ./ws-server.js
COPY --chown=nextjs:nodejs start.sh ./start.sh
RUN chmod +x start.sh

USER nextjs
EXPOSE 3000
EXPOSE 3001

CMD ["./start.sh"]