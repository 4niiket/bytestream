# ==========================================
# 1. Build Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma engine compatibility on Alpine
RUN apk add --no-cache openssl libc6-compat

# Copy dependency manifests and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (automatically triggers prisma generate via postinstall)
RUN npm ci

# Copy source code and build TypeScript
COPY . .
RUN npm run build

# ==========================================
# 2. Production Runner Stage
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Install OpenSSL for Prisma runtime on Alpine
RUN apk add --no-cache openssl libc6-compat

# Copy dependency manifests and install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy generated Prisma files and compiled dist directory
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/index.js"]
