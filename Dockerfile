FROM node:22

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci || npm install

COPY . .

ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/main.js"]
