# ---------------------------
# 1️⃣ Base image (Builder Stage)
# ---------------------------
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build


# ---------------------------
# 2️⃣ Production image (Runtime Stage)
# ---------------------------
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Copy only essential build artifacts and files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# ✅ Create uploads directory (safe even if missing in repo)
RUN mkdir -p uploads/thumbnails

# Install only production dependencies
RUN npm ci --only=production

# ✅ Security: Create a non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# ✅ Ensure correct permissions for uploads folder
RUN chown -R nodejs:nodejs uploads

# Switch to non-root user
USER nodejs

# Expose the app port (Railway injects PORT automatically)
EXPOSE 5000

# ✅ Health check for Railway
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-5000}/api/health || exit 1

# ✅ Start the application
CMD ["npm", "start"]
