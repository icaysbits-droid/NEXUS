FROM node:20-slim

WORKDIR /app

# Copiamos package.json primero para aprovechar la caché de capas
COPY package*.json ./

RUN npm install

# Copiamos el resto del código
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]