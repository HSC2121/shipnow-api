
# Stage 1: Install production dependencies
FROM node:22-bookworm-slim AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev \
    && npm cache clean --force


# Stage 2: Production runtime
FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /app

COPY --from=dependencies --chown=node:node \
  /app/node_modules ./node_modules

COPY --chown=node:node package.json ./
COPY --chown=node:node src/ ./src/

# Writable directories for uploads and Winston logs
RUN mkdir -p \
      uploads/documents \
      uploads/proofs \
      uploads/licenses \
      logs \
    && chown -R node:node /app/uploads /app/logs

USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s \
  --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + process.env.PORT + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "src/server.js"]
