FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies and additional tools
RUN npm ci
RUN npm install --save-dev wait-on

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Copy the entire project, including prisma directory
COPY . .

# Debug: Check if schema.prisma exists
RUN ls -la prisma || echo "Prisma directory not found during build"
RUN test -f prisma/schema.prisma && echo "Schema found" || echo "Schema NOT found"

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public directory
COPY --from=builder /app/public ./public

# Create uploads directory with proper permissions
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public/uploads

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy the built app
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# WICHTIG: Kopiere das Prisma-Verzeichnis vollständig
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Debug: Verify schema.prisma is copied
RUN ls -la prisma || echo "Prisma directory not found in final image"
RUN test -f prisma/schema.prisma && echo "Schema found in final image" || echo "Schema NOT found in final image"

# Copy script for database migrations
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Use the script as entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Start the application
CMD ["node", "server.js"]