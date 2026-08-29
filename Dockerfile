# -----------------------------
# Dependencies
# -----------------------------
# Épinglé sur la version de `packageManager` (package.json) : `latest` a cassé le
# build en changeant de format de lockfile sous nos pieds sans avertissement.
FROM oven/bun:1.4.0 AS deps

RUN apt-get update && apt-get install -y libc6

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile


# -----------------------------
# Build
# -----------------------------
FROM oven/bun:1.4.0 AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_TURNSTILE_TOKEN
ARG NEXT_PUBLIC_GIT_URL
ARG NEXT_PUBLIC_RESTRICT_EMAIL_DOMAIN=false
# Hash du commit deploye : .git est exclu du contexte (.dockerignore), donc git rev-parse
# ne marche pas ici — Dokploy/CI doit passer --build-arg COMMIT_SHA=<sha>. Repli "dev" sinon.
ARG COMMIT_SHA

ENV NEXT_PUBLIC_TURNSTILE_TOKEN=$NEXT_PUBLIC_TURNSTILE_TOKEN
ENV NEXT_PUBLIC_GIT_URL=$NEXT_PUBLIC_GIT_URL
ENV NEXT_PUBLIC_RESTRICT_EMAIL_DOMAIN=$NEXT_PUBLIC_RESTRICT_EMAIL_DOMAIN
ENV COMMIT_SHA=$COMMIT_SHA

# Turbopack (défaut de `next build` depuis Next 16) crashe le NAPI de Bun à la
# terminaison de ses workers internes (SIGSEGV puis SIGILL dans
# napi_release_threadsafe_function, cf. bun.report/1.3.14/Bn10d9b296i2FqkggC4664tE) —
# apparu avec le passage à next 16.3.0 hier (nouveau binaire natif Turbopack/SWC).
# --webpack reste sous Bun (pas de Node dans l'image) en évitant ce chemin de code.
RUN bunx next build --webpack && bun run postbuild


# -----------------------------
# Production
# -----------------------------
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache vips curl && \
    addgroup -S nodejs && \
    adduser -S -G nodejs nextjs

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]