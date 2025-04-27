# Stage 1: build React app
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY public ./public
COPY src ./src

RUN npm ci \
 && npm run build

# Stage 2: serve with nginx
FROM nginx:stable-alpine

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets
COPY --from=builder /app/build /usr/share/nginx/html

# Nginx listens on 80 by default
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
