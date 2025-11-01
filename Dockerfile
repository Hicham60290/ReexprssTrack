# ============================================
# STAGE 1: BUILD
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Build de l'application TypeScript
RUN npm run build

# ============================================
# STAGE 2: PRODUCTION
# ============================================
FROM node:20-alpine

WORKDIR /app

# Installer dumb-init pour gérer les signaux correctement
RUN apk add --no-cache dumb-init

# Copier les dépendances de production uniquement
COPY package*.json ./
RUN npm ci --only=production

# Copier le client Prisma généré
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copier le code compilé
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Changer les permissions
RUN chown -R nodejs:nodejs /app

# Utiliser l'utilisateur non-root
USER nodejs

# Exposer le port
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Point d'entrée avec dumb-init
ENTRYPOINT ["dumb-init", "--"]

# Commande de démarrage
CMD ["node", "dist/server.js"]
