#!/bin/sh
set -e

# Stelle sicher, dass die Datenbank verfügbar ist, bevor wir fortfahren
echo "Warte auf Datenbank..."
npx wait-on tcp:db:5432 -t 60000

# Schema-Änderungen anwenden
echo "Aktualisiere Datenbankschema..."
npx prisma db push --accept-data-loss

# Migrationen ausführen
echo "Führe Datenbankmigrationen aus..."
npx prisma migrate deploy

# Datenbankschema neu generieren
echo "Generiere Prisma Client..."
npx prisma generate

# Starte die Anwendung
exec "$@"