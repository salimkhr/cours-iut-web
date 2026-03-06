# Étape 1 : Dépendances
FROM node:25-alpine3.22 AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Étape 2 : Build
FROM node:25-alpine3.22 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_TURNSTILE_TOKEN
ARG NEXT_PUBLIC_GIT_URL
ENV NEXT_PUBLIC_TURNSTILE_TOKEN=$NEXT_PUBLIC_TURNSTILE_TOKEN
ENV NEXT_PUBLIC_GIT_URL=$NEXT_PUBLIC_GIT_URL

RUN npm run build

# Étape 3 : Production
FROM node:25-alpine3.22 AS runner
WORKDIR /app
RUN addgroup -S nodejs && adduser -S -G nodejs nextjs

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
