# Bac à sable des agents etudiant-fragile et etudiant-rapide (pipeline content-writer v3).
#
# Construction (depuis la racine du dépôt) :
#   docker build -t cours-iut-bac:1 docker/etudiant-sandbox
#
# Lancement par l'orchestrateur (une instance par relecture, voir
# .claude/skills/content-writer-v3/bac-a-sable.md) :
#   docker run -d --rm --network none --name cours-iut-bac-<run-id> \
#     -v "<dossier>:/work" --shm-size 1g --memory 3g --cpus 2 --pids-limit 512 \
#     --cap-drop ALL --security-opt no-new-privileges cours-iut-bac:1
#
# Runtimes : node + Chromium headless (image Playwright), bun, php 8.3 (CLI,
# serveur intégré, PDO SQLite/MySQL), python 3.12, rust stable (cargo, crates web
# pré-téléchargées), PostgreSQL (« demarrer-postgres »), sqlite3, git.
# Le réseau est coupé à l'exécution : rien ne se télécharge pendant une relecture
# (ni crate, ni paquet npm, ni CDN). Bootstrap et Bootstrap Icons sont embarqués et
# servis à la place du CDN jsDelivr par rendu-html.

FROM mcr.microsoft.com/playwright:v1.64.1-noble

ENV DEBIAN_FRONTEND=noninteractive \
    LANG=C.UTF-8 \
    TZ=Europe/Paris

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      php-cli php-sqlite3 php-mysql php-mbstring php-xml php-intl php-curl \
      python3 python3-venv python3-pip \
      build-essential pkg-config \
      sqlite3 postgresql git jq tree less ca-certificates curl tzdata \
 && rm -rf /var/lib/apt/lists/*

# bun (même version que le poste de dev)
RUN npm install -g bun@1.4.4 && bun --version

# Outils du bac à sable : rendu HTML (Playwright déjà présent dans l'image pour les
# navigateurs ; le paquet npm est installé localement à /opt/bac) + copies CDN.
WORKDIR /opt/bac
COPY package.json rendu-html.mjs demarrer-postgres.sh ./
RUN sed -i 's/\r$//' rendu-html.mjs demarrer-postgres.sh \
 && npm install --omit=dev --no-audit --no-fund \
 && printf '#!/bin/sh\nexec node /opt/bac/rendu-html.mjs "$@"\n' > /usr/local/bin/rendu-html \
 && install -m 755 /opt/bac/demarrer-postgres.sh /usr/local/bin/demarrer-postgres \
 && chmod 755 /usr/local/bin/rendu-html /opt/bac/rendu-html.mjs

# Utilisateur non root
RUN useradd -m -s /bin/bash etudiant \
 && mkdir -p /work && chown etudiant:etudiant /work
USER etudiant
ENV HOME=/home/etudiant \
    CARGO_HOME=/home/etudiant/.cargo \
    RUSTUP_HOME=/home/etudiant/.rustup \
    PATH=/home/etudiant/.cargo/bin:$PATH \
    CARGO_NET_OFFLINE=true

# rust stable, profil minimal (rustc, cargo, rust-std) + rustfmt et clippy
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \
      | sh -s -- -y --profile minimal --default-toolchain stable -c rustfmt -c clippy \
 && cargo --version

# Préchauffe : un projet cargo vide compile hors ligne, et les crates des sections
# web du module Rust (axum, tokio, serde, tower-http, sqlx) sont téléchargées dans le
# cache du registre pour qu'un « cargo add » / « cargo build » hors ligne les trouve.
RUN cd /tmp && cargo new --quiet chauffe && cd chauffe && cargo build --quiet --offline \
 && CARGO_NET_OFFLINE=false cargo add --quiet axum tokio --features tokio/full \
 && CARGO_NET_OFFLINE=false cargo add --quiet serde --features derive \
 && CARGO_NET_OFFLINE=false cargo add --quiet serde_json \
 && CARGO_NET_OFFLINE=false cargo add --quiet tower-http --features cors,fs \
 && CARGO_NET_OFFLINE=false cargo add --quiet sqlx --features runtime-tokio,postgres,macros \
 && CARGO_NET_OFFLINE=false cargo fetch --quiet \
 && cd / && rm -rf /tmp/chauffe

WORKDIR /work
# Le conteneur reste vivant ; les étudiants n'y entrent que par docker exec.
CMD ["sleep", "infinity"]
