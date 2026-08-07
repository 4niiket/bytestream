# Root Dockerfile for ByteStream API service
# To build: docker build -t bytestream .

FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

# Copy backend manifests and prisma configuration
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm ci

COPY backend/ .
RUN npm run build

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

RUN apk add --no-cache openssl libc6-compat

COPY backend/package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/index.js"]
