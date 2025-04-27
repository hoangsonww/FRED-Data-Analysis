# Stage 1: compile TypeScript
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json tsconfig.json ./
COPY src ./src
RUN npm ci \
 && npm run build

# Stage 2: runtime image
FROM node:18-alpine

WORKDIR /app

# Only pull in what's needed to run
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built files
COPY --from=builder /app/dist ./dist
# If you need env vars file:
COPY .env ./

EXPOSE 4000

CMD ["npm", "run", "start"]
