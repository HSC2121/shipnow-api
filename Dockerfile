
# ShipNow API - Production Docker Image

FROM node:22-bookworm-slim

# Set the application working directory
WORKDIR /app

# Production defaults (can be overridden at runtime)
ENV NODE_ENV=production
ENV PORT=8080

# Install production dependencies using Docker layer caching
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source code
COPY src/ ./src/

# Prepare writable upload directories
RUN mkdir -p uploads/documents uploads/proofs uploads/licenses \
    && chown -R node:node /app

# Run the application without root privileges
USER node

# Document the container's default listening port
EXPOSE 8080

# Check that the API process responds
HEALTHCHECK --interval=30s --timeout=5s \
  --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + process.env.PORT + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start ShipNow
CMD ["node", "src/server.js"]
