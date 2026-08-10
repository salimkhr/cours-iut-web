# -----------------------------
# Dependencies
# -----------------------------
FROM oven/bun:latest AS deps

RUN apt-get update && apt-get install -y libc6

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile


# -----------------------------
# Build
# -----------------------------
FROM oven/bun:latest AS builder

WORKDIR /app

# next build (Turbopack/SWC, natifs) crashe sous le runtime Bun : le build va
# jusqu'au bout (tous les artefacts .next sont écrits, "Finalizing page
# optimization" atteint), puis Bun panique en TERMINANT ses workers internes
# (SIGSEGV puis SIGILL dans napi_release_threadsafe_function — bug du moteur
# Bun, identique sur 3 tentatives avec des causes applicatives différentes
# écartées, cf. bun.report/1.3.14/Bn10d9b296i2FqkggC4664tE). bun reste utilisé
# pour l'installation des dépendances (deps stage, rapide) ; le build tourne
# sous Node pour éviter ce bug — même image de base (glibc), donc aucun
# changement pour les modules natifs déjà résolus par bun install.
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

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

RUN node node_modules/.bin/next build && node scripts/postbuild.js


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