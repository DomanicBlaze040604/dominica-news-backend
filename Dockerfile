# 1️⃣ Use Node.js 18 Alpine as the base image
FROM node:18-alpine AS builder

# 2️⃣ Set working directory
WORKDIR /app

# 3️⃣ Copy package files
COPY package*.json ./

# 4️⃣ Install ALL dependencies (including dev)
RUN npm ci

# 5️⃣ Copy source code
COPY . .

# 6️⃣ Build TypeScript -> dist/
RUN npm run build

# 7️⃣ Remove dev dependencies (keeps only production)
RUN npm prune --production

# 8️⃣ Create uploads directory
RUN mkdir -p dist/uploads/thumbnails

# 9️⃣ Create non-root user
RUN addgroup -g 1001 -S nodejs \
 && adduser -S nodejs -u 1001 \
 && chown -R nodejs:nodejs /app

# 10️⃣ Use a clean, lightweight final image
FROM node:18-alpine

WORKDIR /app

# Copy production node_modules and built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy any public assets (optional)
# COPY --from=builder /app/uploads ./uploads

# Create uploads directory for runtime
RUN mkdir -p dist/uploads/thumbnails \
 && addgroup -g 1001 -S nodejs \
 && adduser -S nodejs -u 1001 \
 && chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Start the application
CMD ["node", "dist/server.js"]
