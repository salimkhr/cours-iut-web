# -------------------------------
# Étape Build
# -------------------------------
FROM node:20.18-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm ci

COPY . .

ARG BACKEND_IA_API_URL
ARG NEXT_PUBLIC_BACKEND_IA_API_URL
ENV BACKEND_IA_API_URL=$BACKEND_IA_API_URL
ENV NEXT_PUBLIC_BACKEND_IA_API_URL=$NEXT_PUBLIC_BACKEND_IA_API_URL

RUN npm run build

# -------------------------------
# Étape Production
# -------------------------------
FROM node:20.18-alpine AS runner
WORKDIR /app

RUN addgroup -S nodejs && adduser -S -G nodejs nextjs

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
