# Use a imagem oficial do Node.js (a mais recente)
FROM node:latest

# Crie e defina o diretório de trabalho no container
WORKDIR /usr/src/app

# Copie o package.json e o package-lock.json para o container
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Copie o restante dos arquivos da aplicação para o container
COPY . .

# Compile o código TypeScript para JavaScript (usando o comando do NestJS)
RUN npm run build

# Exponha a porta que a API irá rodar
EXPOSE 3000

# Defina o comando para rodar a aplicação
CMD ["npm", "run", "start:prod"]
