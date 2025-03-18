# Compopedia

Compopedia ist eine Anwendung zur Verwaltung und Dokumentation von Komponenten innerhalb deiner Firma. Sie ermöglicht es Teammitgliedern, ihre Komponenten hochzuladen, zu kategorisieren und mit dem Rest des Teams zu teilen.

## Funktionen

- Benutzerauthentifizierung (Registrierung/Anmeldung)
- Komponenten-Management (Hochladen, Bearbeiten, Löschen)
- Kategorisierung von Komponenten
- Detailansicht von Komponenten mit Code-Blöcken und Bildern
- Responsive Design mit Tailwind CSS
- Benutzer-Dashboard zur Verwaltung eigener Komponenten
- Filterfunktion nach Kategorien
- Lazy Loading / Infinite Scrolling

## Technologiestack

- **Frontend**: Next.js 15 mit TypeScript, Tailwind CSS, App Router
- **Backend**: Next.js API Routes
- **Datenbank**: PostgreSQL mit Prisma ORM
- **Authentifizierung**: NextAuth.js
- **Containerisierung**: Docker & Docker Compose

## Lokale Einrichtung

### Voraussetzungen

- Node.js (v18 oder höher)
- npm
- Git
- Docker (optional, aber empfohlen)

### Schritt 1: Repository klonen

```bash
git clone https://github.com/an1lsalan/compopedia.git
cd compopedia
```

### Schritt 2: Abhängigkeiten installieren

```bash
npm install
```

### Schritt 3: Umgebungsvariablen einrichten

```bash
# .env.example nach .env kopieren
cp .env.example .env

# Bearbeite die .env-Datei und passe die Werte an
# Besonders wichtig ist NEXTAUTH_SECRET (kann mit `openssl rand -base64 32` generiert werden)
```

### Schritt 4: Datenbank einrichten

**Option A: Mit Docker (empfohlen):**

```bash
docker run -d -p 5432:5432 --name compopedia-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=compopedia \
  postgres:15
```

**Option B: Mit Docker Compose:**

```bash
# Startet sowohl die Datenbank als auch die Anwendung
docker compose up -d
```

**Option C: Lokale PostgreSQL-Installation:**

Stelle sicher, dass PostgreSQL installiert ist und läuft, und erstelle eine Datenbank namens `compopedia`.

### Schritt 5: Prisma-Migrationen ausführen

```bash
# Prisma Client generieren
npx prisma generate

# Datenbank-Migrationen ausführen
npx prisma migrate dev --name init
```

### Schritt 6: Anwendung starten

```bash
# Entwicklungsserver starten
npm run dev
```

Die Anwendung ist nun unter http://localhost:3100 erreichbar.

### Schritt 7: Prisma Studio (optional)

Um die Datenbank mit einer grafischen Oberfläche zu verwalten:

```bash
npx prisma studio
```

Prisma Studio ist dann unter http://localhost:5555 erreichbar.

## Deployment auf Coolify

### Voraussetzungen

- Zugriff auf eine Coolify-Instanz
- Ein Git-Repository mit dem Projekt-Code

### Schritt 1: Code in ein Git-Repository hochladen

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Schritt 2: Neues Projekt in Coolify erstellen

1. Melde dich bei deiner Coolify-Instanz an
2. Klicke auf "New Resource" oder "+"
3. Wähle "Application" als Ressourcentyp
4. Wähle dein Git-Repository aus
5. Wähle als Engine "Docker Compose"
6. Stelle sicher, dass der Pfad zur `docker-compose.yml` korrekt ist

### Schritt 3: Umgebungsvariablen konfigurieren

Füge folgende Umgebungsvariablen hinzu:
- `DATABASE_URL=postgresql://postgres:postgres@db:5432/compopedia?schema=public`
- `NEXTAUTH_URL=https://deine-domain.de` (deine tatsächliche Domain)
- `NEXTAUTH_SECRET=<sicherer-wert>` (generiere mit `openssl rand -base64 32`)

### Schritt 4: Domain konfigurieren

1. Unter der Projektkonfiguration, finde den Bereich "Domains"
2. Klicke auf "Add Domain"
3. Gib deine Domain ein (z.B. `compopedia.deine-domain.de`)
4. Aktiviere HTTPS (empfohlen)

### Schritt 5: DNS-Einträge einrichten

Erstelle einen A-Record oder CNAME-Record bei deinem DNS-Provider:
- **A-Record**: Setze `compopedia` als Host und die IP-Adresse deines Servers als Wert
- **CNAME-Record**: Alternativ einen CNAME-Record, der auf deine Hauptdomain verweist

### Schritt 6: Deployment starten

Klicke auf "Save" oder "Deploy" und warte, bis das Deployment abgeschlossen ist.

## Deployment auf Portainer

### Voraussetzungen

- Zugriff auf eine Portainer-Instanz
- Docker und Docker Compose auf dem Server

### Schritt 1: Code auf den Server übertragen

```bash
# Entweder per Git
git clone https://github.com/dein-username/compopedia.git

# Oder per scp/rsync
scp -r ./compopedia user@dein-server:/pfad/zum/ziel
```

### Schritt 2: In Portainer einrichten

1. Melde dich bei deiner Portainer-Instanz an
2. Gehe zu "Stacks" und klicke auf "Add stack"
3. Gib einen Namen für den Stack ein (z.B. "compopedia")
4. Entweder:
   - Lade die `docker-compose.yml` hoch
   - Oder kopiere den Inhalt in das "Web editor"-Feld

### Schritt 3: Umgebungsvariablen konfigurieren

Füge folgende Umgebungsvariablen hinzu:
- `DATABASE_URL=postgresql://postgres:postgres@db:5432/compopedia?schema=public`
- `NEXTAUTH_URL=https://deine-domain.de` (deine tatsächliche Domain)
- `NEXTAUTH_SECRET=<sicherer-wert>` (generiere mit `openssl rand -base64 32`)

### Schritt 4: Stack deployen

Klicke auf "Deploy the stack" und warte, bis das Deployment abgeschlossen ist.

### Schritt 5: Reverse Proxy einrichten

Konfiguriere einen Reverse Proxy (z.B. Traefik, Nginx, Caddy), um den Traffic zur deiner Anwendung weiterzuleiten.

## Nutzung der Anwendung

### Registrierung und Anmeldung

1. Öffne die Anwendung in deinem Browser
2. Klicke auf "Registrieren", um ein neues Konto zu erstellen
3. Gib deinen Namen, E-Mail und Passwort ein
4. Nach der Registrierung wirst du automatisch angemeldet

### Komponenten hochladen

1. Klicke auf "Upload" im Header-Menü
2. Fülle das Formular aus:
   - Titel und Beschreibung der Komponente
   - Wähle eine Kategorie oder erstelle eine neue
   - Füge Code-Blöcke hinzu
   - Lade Bilder hoch (optional)
3. Klicke auf "Komponente hochladen"

### Komponenten durchsuchen

1. Klicke auf "Components" im Header-Menü
2. Nutze die Kategorie-Filter, um bestimmte Komponenten zu finden
3. Scrolle nach unten, um mehr Komponenten zu laden (Lazy Loading)
4. Klicke auf eine Komponente, um ihre Details anzusehen

### Dashboard

1. Klicke auf "Dashboard" im Header-Menü
2. Hier findest du eine Übersicht deiner hochgeladenen Komponenten
3. Unter "Account" kannst du deine Kontoeinstellungen verwalten
4. Unter "Meine Komponenten" kannst du deine Komponenten bearbeiten oder löschen

## Fehlerbehebung

### Datenbank-Verbindungsprobleme

Wenn du Probleme mit der Datenbankverbindung hast:

1. Überprüfe, ob der PostgreSQL-Server läuft:
   ```bash
   docker ps  # Wenn du Docker verwendest
   ```

2. Überprüfe die Verbindungszeichenfolge in deiner `.env`-Datei

3. Stelle sicher, dass der Datenbankbenutzer die richtigen Berechtigungen hat

### TypeScript-Fehler

Bei TypeScript-Fehlern bzgl. NextAuth:

1. Stelle sicher, dass die NextAuth-Typen korrekt erweitert wurden (siehe `src/types/next-auth.d.ts`)
2. Führe `npm run dev` neu aus, um den TypeScript-Server neu zu starten

### Container-Probleme

Bei Problemen mit Docker-Containern:

1. Überprüfe die Container-Logs:
   ```bash
   docker logs compopedia-app
   docker logs compopedia-db
   ```

2. Starte die Container neu:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Weitere Informationen findest du in der [LICENSE](LICENSE)-Datei.

## Beitragen

Beiträge sind willkommen! Bitte öffne einen Issue oder einen Pull Request.

## Roadmap

Geplante Funktionen für zukünftige Versionen:

- Suchfunktion für Komponenten
- Team-Management und Berechtigungen
- Versionierung von Komponenten
- Tagging-System
- Kommentare und Diskussionen zu Komponenten
- Statistik-Dashboard
- Integration mit CI/CD-Pipelines