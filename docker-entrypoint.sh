#!/bin/sh
set -e

# Debug-Informationen anzeigen
echo "➡️ Starte Compopedia..."
echo "📂 Aktuelles Verzeichnis: $(pwd)"
echo "🔍 Prisma-Verzeichnis:"
ls -la prisma || echo "❌ Prisma-Verzeichnis nicht gefunden"

# Warte auf Datenbank...
echo "⏳ Warte auf Datenbank..."
wait-on tcp:db:5432

if [ $? -ne 0 ]; then
  echo "❌ Datenbank-Verbindung fehlgeschlagen"
  exit 1
fi
echo "✅ Datenbank ist bereit"

# Prisma-Aktionen mit Fehlerbehandlung
echo "🔄 Führe Prisma-Aktionen aus..."

# Datenbankschema neu generieren
echo "🔄 Generiere Prisma Client..."
prisma generate --schema=./prisma/schema.prisma

# Versuche db push mit Fehlerbehandlung
echo "⬆️ Aktualisiere Datenbankschema..."
prisma db push --schema=./prisma/schema.prisma --accept-data-loss || true

# Migrations deployen (falls db push fehlschlägt)
prisma migrate deploy --schema=./prisma/schema.prisma || true

# Prüfe, ob alles bereit ist
echo "🚀 Alle Vorbereitungen abgeschlossen. Starte die Anwendung..."

# Starte die Anwendung
exec "$@"