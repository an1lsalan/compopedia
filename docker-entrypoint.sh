#!/bin/sh
set -e

# Debug: Zeige das aktuelle Verzeichnis und den Inhalt
echo "Aktuelles Verzeichnis: $(pwd)"
echo "Verzeichnisinhalt:"
ls -la
echo "Prisma-Verzeichnis:"
ls -la prisma || echo "Prisma-Verzeichnis nicht gefunden"

# Warte auf Datenbank...
echo "Warte auf Datenbank..."
npx wait-on -t 60000 tcp:db:5432

# Bereinige die fehlgeschlagene Migration
echo "Bereinige fehlgeschlagene Migration..."
npx prisma db execute --stdin <<EOF
DELETE FROM "_prisma_migrations" WHERE migration_name = '20250317111133_add_headline_and_blocktype_to_textblock';
EOF

# Aktualisiere Datenbankschema mit Prisma db push
echo "Aktualisiere Datenbankschema mit prisma/schema.prisma..."
npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss

# Datenbankschema neu generieren
echo "Generiere Prisma Client..."
npx prisma generate --schema=./prisma/schema.prisma

# Starte die Anwendung
exec "$@"