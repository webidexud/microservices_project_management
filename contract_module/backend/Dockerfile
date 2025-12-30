FROM node:20-alpine

# Install dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client

# Configurar zona horaria
RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/America/Bogota /etc/localtime \
    && echo "America/Bogota" > /etc/timezone \
    && apk del tzdata
ENV TZ=America/Bogota

WORKDIR /app

# 1. Copiar SOLO package.json primero (para mejor cache de Docker)
COPY package*.json ./

# 2. Instalar dependencias (esto debe ejecutarse)
RUN npm install

# 3. Instalar nodemon globalmente
RUN npm install -g nodemon

# 4. Copiar el resto del código
COPY . .

# 5. Verificar que las dependencias se instalaron
RUN ls -la node_modules/ | head -10

# 6. Verificar que express está instalado
RUN ls node_modules/ | grep express

# Crear usuario no-root (PERO esto puede causar problemas con permisos)
# RUN addgroup -g 1001 -S nodejs && \
#     adduser -S nextjs -u 1001 && \
#     chown -R nextjs:nodejs /app
# USER nextjs

# Por ahora, quita el usuario no-root para debugging
USER root

EXPOSE 3000

CMD ["nodemon", "--exec", "npm", "start"]