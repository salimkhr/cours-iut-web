# -------------------------------
# Étape 1 : Dépendances
# -------------------------------
FROM node:20.18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copier uniquement les fichiers de dépendances
COPY package*.json ./
RUN npm ci

# -------------------------------
# Étape 2 : Build de l'application
# -------------------------------
FROM node:20.18-alpine AS builder
WORKDIR /app

# Copier les dépendances installées
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables d'environnement pour le build si nécessaire
# ARG NEXT_PUBLIC_API_URL
# ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# -------------------------------
# Étape 3 : Image de production
# -------------------------------
FROM node:20.18-alpine AS runner
WORKDIR /app

# Utilisateur non-root
RUN addgroup -S nodejs && adduser -S -G nodejs nextjs

ENV NODE_ENV=production
ENV PORT=3000

# Copier uniquement le nécessaire
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Lancement du serveur
CMD ["node", "server.js"]