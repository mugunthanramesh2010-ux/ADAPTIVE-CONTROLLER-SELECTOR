# ACEP 4.0 Multi-Stage Production Container
FROM node:20-alpine AS production

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Copy application manifest and server
COPY package.json ./
COPY server.js ./
COPY web_app/ ./web_app/
COPY reports/ ./reports/
COPY papers/ ./papers/

# Expose production port
EXPOSE 8080

# Healthcheck configuration
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start production server
CMD ["node", "server.js"]
