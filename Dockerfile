# Build stage
FROM node:16-alpine AS builder

WORKDIR /app

# Install build dependencies (Python and make for node-sass)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy application files
COPY . .

# Build the Vue.js application
RUN npm run build

# Production stage
FROM node:16-alpine

WORKDIR /app

# Install runtime dependencies (Python for node-sass if needed in production, wget for healthcheck)
RUN apk add --no-cache python3 make g++ wget

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files and source from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/api ./api
COPY --from=builder /app/server.js ./
COPY --from=builder /app/migrate.js ./
COPY --from=builder /app/database ./database
COPY healthcheck.sh /app/healthcheck.sh

# Make healthcheck executable
RUN chmod +x /app/healthcheck.sh

# Expose port (default 80, configurable via PORT env var)
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD sh /app/healthcheck.sh

# Start the application
CMD ["npm", "start"]

