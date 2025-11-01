# ---------------------------
# 1️⃣ Base image
# ---------------------------
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (for better layer caching)
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# ---------------------------
# 2️⃣ Production image
# ---------------------------
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Copy only built files and necessary assets from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/uploads ./uploads

# Install only production dependencies
RUN npm ci --only=production

# Create uploads directory (if not copied)
RUN mkdir -p uploads/thumbnails

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Ensure correct permissions for uploads
RUN chown -R nodejs:nodejs uploads

# Switch to non-root user
USER nodejs

# Expose port (Railway will set PORT automatically)
EXPOSE 5000

# Health check for Railway uptime monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Start the application
CMD ["npm", "start"]
