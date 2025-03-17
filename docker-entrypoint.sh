#!/bin/sh
set -e

# Debug: Zeige das aktuelle Verzeichnis und den Inhalt
echo "Aktuelles Verzeichnis: $(pwd)"
echo "Verzeichnisinhalt:"
ls -la
echo "Prisma-Verzeichnis:"
ls -la prisma || echo "Prisma-Verzeichnis nicht gefunden"

# Warte auf Datenbank
echo "Warte auf Datenbank..."
npx wait-on -t 60000 tcp:db:5432

# Prüfe, ob die schema.prisma-Datei existiert
if [ ! -f ./prisma/schema.prisma ]; then
  echo "FEHLER: prisma/schema.prisma nicht gefunden!"
  echo "Überprüfe folgende Pfade:"
  find / -name "schema.prisma" -type f 2>/dev/null || echo "Keine schema.prisma im gesamten Dateisystem gefunden."
  exit 1
fi

# Schema-Änderungen anwenden
echo "Aktualisiere Datenbankschema mit prisma/schema.prisma..."
NODE_ENV=production npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss

# Migrationen ausführen
echo "Führe Datenbankmigrationen aus..."
NODE_ENV=production npx prisma migrate deploy --schema=./prisma/schema.prisma

# Starte die Anwendung
exec "$@"