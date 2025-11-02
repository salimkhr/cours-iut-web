# -------------------------------
# Étape Build
# -------------------------------
FROM node:20.18-alpine AS builder
WORKDIR /app

# Installer libc6-compat si nécessaire
RUN apk add --no-cache libc6-compat

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer dépendances directement ici (plus de "deps" séparé)
RUN npm ci

# Copier le code source
COPY . .

# Variables safe pour le build
ARG BACKEND_IA_API_URL
ARG NEXT_PUBLIC_BACKEND_IA_API_URL
ENV BACKEND_IA_API_URL=$BACKEND_IA_API_URL
ENV NEXT_PUBLIC_BACKEND_IA_API_URL=$NEXT_PUBLIC_BACKEND_IA_API_URL

# Build Next.js
RUN npm run build

# -------------------------------
# Étape Production
# -------------------------------
FROM node:20.18-alpine AS runner
WORKDIR /app

# Créer utilisateur non-root
RUN addgroup -S nodejs && adduser -S -G nodejs nextjs

# Variables runtime
ENV NODE_ENV=production
ENV PORT=3000

# Copier build depuis builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
