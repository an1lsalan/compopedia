FROM node:18-alpine AS base

# Grundlegende Pakete installieren
RUN apk add --no-cache libc6-compat curl postgresql-client

# Dependencies Stage
FROM base AS deps
WORKDIR /app

# Kopiere package.json und lock-Dateien
COPY package.json package-lock.json* ./

# Installiere Dependencies 
RUN npm ci --production=false
RUN npm install --save-dev wait-on

# Sharp für Bildverarbeitung explizit installieren
RUN npm install sharp

# Builder Stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Kopiere das gesamte Projekt
COPY . .

# Debug-Ausgabe für Prisma-Schema
RUN ls -la prisma || echo "Prisma directory not found during build"
RUN test -f prisma/schema.prisma && echo "Schema found" || echo "Schema NOT found"

# Umgebungsvariablen setzen
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Prisma Client generieren
RUN npx prisma generate

# Anwendung bauen
RUN npm run build

# Runner Stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Den nextjs-Benutzer für mehr Sicherheit verwenden
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Public-Verzeichnis kopieren
COPY --from=builder /app/public ./public

# Prisma-Verzeichnis und Client kopieren
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/sharp ./node_modules/sharp

# Berechtigungen für den Prerender-Cache setzen
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Die gebaute App kopieren
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Debug: Prisma-Schema überprüfen
RUN ls -la prisma || echo "Prisma directory not found in final image"
RUN test -f prisma/schema.prisma && echo "Schema found in final image" || echo "Schema NOT found in final image"

# Startskript kopieren und ausführbar machen
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# PostgreSQL-Client installieren
RUN apk add --no-cache postgresql-client

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Healthcheck für Coolify
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget -q --spider http://localhost:3000/api/health || exit 1

# Start-Skript als Entrypoint verwenden
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Anwendung starten
CMD ["node", "server.js"]