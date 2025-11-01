# ============================================
# PRODUCTION DOCKERFILE - Using tsx runtime
# ============================================
FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache dumb-init curl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including devDependencies for tsx)
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Use non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Entrypoint with dumb-init
ENTRYPOINT ["dumb-init", "--"]

# Start with tsx (TypeScript runtime without compilation)
CMD ["npx", "tsx", "src/server.ts"]
