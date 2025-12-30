FROM postgres:15-alpine

# Configurar zona horaria
RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/America/Bogota /etc/localtime \
    && echo "America/Bogota" > /etc/timezone \
    && apk del tzdata
ENV TZ=America/Bogota

# Copiar script de inicialización
COPY ./src/init.sql /docker-entrypoint-initdb.d/
# COPY ./src/seed-data.sql /docker-entrypoint-initdb.d/

# Asegurar permisos
RUN chmod a+r /docker-entrypoint-initdb.d/*

EXPOSE 5432