# Guía de Conexión a Base de Datos PostgreSQL Externa

## Configuración Actual

La aplicación está configurada para conectarse a:
- **Servidor:** db_siexud_new
- **Base de datos:** nuevo_siexud
- **Usuario:** admin
- **Puerto:** 5432

## Pasos para Conectar

### 1. Verificar que el contenedor de PostgreSQL esté corriendo

```bash
docker ps | grep db_siexud_new
```

Si no está corriendo, iniciarlo:
```bash
docker start db_siexud_new
```

### 2. Verificar la red del contenedor de base de datos

```bash
docker inspect db_siexud_new | grep NetworkMode
docker network ls
```

### 3. Opción A: Conectar usando external_links (Configuración actual)

El `docker-compose.yml` ya está configurado con `external_links`. Simplemente ejecutar:

```bash
cd /home/user/microservices_project_management/project_management
docker-compose up -d
```

### 4. Opción B: Si external_links no funciona, usar la misma red

Primero, identificar la red del contenedor de base de datos:

```bash
docker inspect db_siexud_new --format='{{range .NetworkSettings.Networks}}{{println .NetworkID}}{{end}}'
```

Luego, modificar `docker-compose.yml` para usar esa red:

```yaml
services:
  backend:
    # ... resto de configuración ...
    networks:
      - db_network

  frontend:
    # ... resto de configuración ...
    networks:
      - db_network

networks:
  db_network:
    external: true
    name: NOMBRE_DE_LA_RED_AQUI  # Reemplazar con el nombre real
```

### 5. Opción C: Conectar todos a una red compartida

Conectar el contenedor de base de datos existente a la red de este proyecto:

```bash
docker network create siexud_shared_network
docker network connect siexud_shared_network db_siexud_new
```

Luego modificar `docker-compose.yml`:

```yaml
networks:
  default:
    external: true
    name: siexud_shared_network
```

Y ejecutar:

```bash
docker-compose up -d
```

## Verificación de Conexión

### 1. Verificar logs del backend

```bash
docker logs proyecto-gestion-backend
```

Deberías ver:
```
✅ Conexión exitosa a PostgreSQL
   - Base de datos: nuevo_siexud
   - Host: db_siexud_new
```

### 2. Probar endpoint de salud

```bash
curl http://localhost:8000/api/health
```

### 3. Acceder a la interfaz de prueba

Abrir en el navegador:
```
http://localhost:3000/connection-test
```

## Solución de Problemas

### Error: "Could not connect to server"

**Causa:** Los contenedores no están en la misma red

**Solución:**
```bash
# Verificar redes
docker network inspect bridge

# Conectar manualmente
docker network connect bridge proyecto-gestion-backend
```

### Error: "ENOTFOUND db_siexud_new"

**Causa:** El nombre del host no se resuelve

**Solución:** Usar la IP del contenedor directamente

```bash
# Obtener IP
docker inspect db_siexud_new --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'

# Actualizar DB_HOST en docker-compose.yml con la IP
```

### Error: "Connection timeout"

**Causa:** Puerto no expuesto o firewall

**Solución:**
```bash
# Verificar que PostgreSQL escucha en 5432
docker exec db_siexud_new netstat -tlnp | grep 5432

# Verificar puerto expuesto
docker port db_siexud_new
```

### Error: "password authentication failed"

**Causa:** Credenciales incorrectas

**Solución:** Verificar las credenciales en el archivo `.env` o docker-compose.yml

## Recomendaciones de Seguridad

⚠️ **IMPORTANTE:** Las credenciales están hardcodeadas en el código. Para producción:

1. Crear archivo `.env`:
```bash
cat > .env <<EOF
DB_HOST=db_siexud_new
DB_PORT=5432
POSTGRES_DB=nuevo_siexud
POSTGRES_USER=admin
POSTGRES_PASSWORD=qZVmQxZPE532qu39gGoH7F1DqrbUlW
EOF
```

2. Modificar `docker-compose.yml`:
```yaml
environment:
  - DB_HOST=${DB_HOST}
  - DB_PORT=${DB_PORT}
  - POSTGRES_DB=${POSTGRES_DB}
  - POSTGRES_USER=${POSTGRES_USER}
  - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
```

3. Agregar `.env` al `.gitignore`:
```bash
echo ".env" >> .gitignore
```

## Comandos Útiles

```bash
# Reiniciar servicios
docker-compose restart

# Ver logs en tiempo real
docker-compose logs -f backend

# Ejecutar shell en el backend
docker exec -it proyecto-gestion-backend sh

# Probar conexión desde el backend
docker exec -it proyecto-gestion-backend sh -c "nc -zv db_siexud_new 5432"

# Detener todo
docker-compose down

# Reconstruir y levantar
docker-compose up --build -d
```
