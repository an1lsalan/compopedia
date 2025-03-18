#!/bin/sh
set -e

# Debug-Informationen anzeigen
echo "➡️ Starte Compopedia..."
echo "📂 Aktuelles Verzeichnis: $(pwd)"
echo "🔍 Prisma-Verzeichnis:"
ls -la prisma || echo "❌ Prisma-Verzeichnis nicht gefunden"

# Warte auf Datenbank...
echo "⏳ Warte auf Datenbank..."
npx wait-on -t 60000 tcp:db:5432

if [ $? -ne 0 ]; then
  echo "❌ Datenbank-Verbindung fehlgeschlagen"
  exit 1
fi
echo "✅ Datenbank ist bereit"

# Prisma-Aktionen mit Fehlerbehandlung
echo "🔄 Führe Prisma-Aktionen aus..."

# Versuche fehlgeschlagene Migration zu löschen (ignoriere Fehler)
echo "🧹 Bereinige fehlgeschlagene Migration..."
npx prisma db execute --stdin <<EOF || echo "⚠️ Keine fehlgeschlagene Migration zu bereinigen"
DELETE FROM "_prisma_migrations" WHERE migration_name = '20250317111133_add_headline_and_blocktype_to_textblock';
EOF

# Versuche db push mit Fehlerbehandlung
echo "⬆️ Aktualisiere Datenbankschema..."
npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss

if [ $? -ne 0 ]; then
  echo "⚠️ Prisma db push fehlgeschlagen. Versuche prisma migrate deploy..."
  npx prisma migrate deploy --schema=./prisma/schema.prisma
  
  if [ $? -ne 0 ]; then
    echo "❌ Datenbank-Migration fehlgeschlagen. Versuche die Anwendung trotzdem zu starten..."
  fi
else
  echo "✅ Datenbankschema erfolgreich aktualisiert"
fi

# Datenbankschema neu generieren
echo "🔄 Generiere Prisma Client..."
npx prisma generate --schema=./prisma/schema.prisma

if [ $? -ne 0 ]; then
  echo "⚠️ Prisma Client konnte nicht generiert werden. Versuche die Anwendung trotzdem zu starten..."
else
  echo "✅ Prisma Client erfolgreich generiert"
fi

# PostgreSQL Parameter über psql setzen (optional)
echo "🔧 Optimiere PostgreSQL für Binärdaten..."
PGPASSWORD=postgres psql -h db -U postgres -d compopedia -c "ALTER SYSTEM SET max_locks_per_transaction = 128;" || echo "⚠️ Konnte PostgreSQL nicht optimieren"

# Prüfe, ob alles bereit ist
echo "🚀 Alle Vorbereitungen abgeschlossen. Starte die Anwendung..."

# Starte die Anwendung
exec "$@"