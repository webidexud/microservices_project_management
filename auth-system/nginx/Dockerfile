FROM nginx:alpine

# Copiar configuración personalizada
COPY nginx.conf /etc/nginx/nginx.conf

# Crear directorio para SSL (opcional)
RUN mkdir -p /etc/nginx/ssl

# Crear directorio para archivos estaticos por proyecto
RUN mkdir /statics

# Exponer puertos
EXPOSE 80 443

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]