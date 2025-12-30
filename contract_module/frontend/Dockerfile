# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Configurar npm para aceptar certificados auto-firmados
RUN npm config set strict-ssl false

# Copiar package.json primero
COPY package.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
