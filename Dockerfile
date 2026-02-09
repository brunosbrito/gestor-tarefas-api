# ----- build -----
FROM node:22 AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ----- runtime -----
FROM node:22-slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /usr/src/app/dist ./dist

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=256"

EXPOSE 3010
CMD ["node", "dist/main.js"]
