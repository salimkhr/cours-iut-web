#!/bin/sh
# Démarre un PostgreSQL local dans le conteneur (utilisateur etudiant, authentification
# « trust » sur localhost), puis crée la base demandée (défaut : etudiant).
# Usage : demarrer-postgres [nom_base]
# Ensuite : DATABASE_URL=postgres://etudiant@localhost:5432/<nom_base>
set -eu
BASE="${1:-etudiant}"
PGBIN="$(ls -d /usr/lib/postgresql/*/bin | sort -V | tail -1)"
DONNEES="$HOME/pgdata"
if [ ! -d "$DONNEES" ]; then
    "$PGBIN/initdb" -D "$DONNEES" -U etudiant --auth=trust -E UTF8 >/dev/null
fi
if ! "$PGBIN/pg_ctl" -D "$DONNEES" status >/dev/null 2>&1; then
    "$PGBIN/pg_ctl" -D "$DONNEES" -o "-k /tmp -h localhost" -l "$HOME/postgres.log" -w start >/dev/null
fi
"$PGBIN/psql" -h localhost -U etudiant -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$BASE'" | grep -q 1 \
    || "$PGBIN/createdb" -h localhost -U etudiant "$BASE"
echo "PostgreSQL prêt : DATABASE_URL=postgres://etudiant@localhost:5432/$BASE"
