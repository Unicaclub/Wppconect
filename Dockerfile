FROM node:22.17.1-alpine AS base
WORKDIR /usr/src/wpp-server
ENV NODE_ENV=production PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install system dependencies
RUN apk update && \
    apk add --no-cache \
    vips-dev \
    fftw-dev \
    gcc \
    g++ \
    make \
    libc6-compat \
    python3 \
    py3-pip \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production --no-audit && \
    npm install sharp --ignore-engines && \
    npm cache clean --force

FROM base AS build
WORKDIR /usr/src/wpp-server
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Copy package files for build
COPY package.json package-lock.json* ./

# Install all dependencies (including dev dependencies)
RUN npm ci --no-audit

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Clean cache
RUN npm cache clean --force

# Final stage
FROM base
WORKDIR /usr/src/wpp-server/

# Install Chromium for Puppeteer
RUN apk add --no-cache chromium

# Copy built application from build stage
COPY --from=build /usr/src/wpp-server/dist/ ./dist/
COPY --from=build /usr/src/wpp-server/package.json ./

# Copy other necessary files
COPY . .

# Clean npm cache
RUN npm cache clean --force

# Expose port
EXPOSE 21465

# Start the application
ENTRYPOINT ["node", "dist/server.js"]
