FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN ls -l dist

EXPOSE 3000

CMD ["node", "dist/main"]