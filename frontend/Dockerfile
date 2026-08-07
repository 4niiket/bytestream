# ==========================================
# 1. Build Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm ci

# Optional environment variable for API URL at build time
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Copy source code and build Vite static files
COPY . .
RUN npm run build

# ==========================================
# 2. Production Runtime Stage (Nginx)
# ==========================================
FROM nginx:alpine AS runner

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
