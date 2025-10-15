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

# Build de producción
RUN npm run build

# Etapa 2: Producción con Nginx
FROM nginx:alpine

# Copiar build desde la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]