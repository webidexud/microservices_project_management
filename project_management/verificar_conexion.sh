#!/bin/bash

# Script de Verificación de Conexión a PostgreSQL
# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "================================================"
echo "  Verificación de Conexión PostgreSQL"
echo "================================================"
echo ""

# 1. Verificar que Docker está corriendo
echo -e "${BLUE}[1/6]${NC} Verificando Docker..."
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker no está corriendo o no tienes permisos${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker está corriendo${NC}"
echo ""

# 2. Verificar contenedor de base de datos
echo -e "${BLUE}[2/6]${NC} Verificando contenedor db_siexud_new..."
if docker ps | grep -q "db_siexud_new"; then
    DB_STATUS=$(docker inspect db_siexud_new --format='{{.State.Status}}')
    echo -e "${GREEN}✅ Contenedor encontrado (Status: $DB_STATUS)${NC}"

    # Obtener IP del contenedor
    DB_IP=$(docker inspect db_siexud_new --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' | head -n1)
    if [ ! -z "$DB_IP" ]; then
        echo -e "   IP: ${YELLOW}$DB_IP${NC}"
    fi

    # Obtener red del contenedor
    DB_NETWORK=$(docker inspect db_siexud_new --format='{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}')
    echo -e "   Red(es): ${YELLOW}$DB_NETWORK${NC}"
else
    echo -e "${RED}❌ Contenedor db_siexud_new no encontrado o no está corriendo${NC}"
    echo -e "${YELLOW}   Intenta: docker start db_siexud_new${NC}"
    exit 1
fi
echo ""

# 3. Verificar puerto PostgreSQL
echo -e "${BLUE}[3/6]${NC} Verificando puerto PostgreSQL..."
if docker exec db_siexud_new pg_isready -U admin > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL está escuchando correctamente${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL podría no estar listo${NC}"
fi
echo ""

# 4. Verificar contenedores de la aplicación
echo -e "${BLUE}[4/6]${NC} Verificando contenedores de la aplicación..."

if docker ps | grep -q "proyecto-gestion-backend"; then
    echo -e "${GREEN}✅ Backend corriendo${NC}"
    BACKEND_NETWORK=$(docker inspect proyecto-gestion-backend --format='{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}')
    echo -e "   Red(es): ${YELLOW}$BACKEND_NETWORK${NC}"
else
    echo -e "${YELLOW}⚠️  Backend no está corriendo${NC}"
fi

if docker ps | grep -q "proyecto-gestion-frontend"; then
    echo -e "${GREEN}✅ Frontend corriendo${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend no está corriendo${NC}"
fi
echo ""

# 5. Probar conectividad de red
echo -e "${BLUE}[5/6]${NC} Probando conectividad de red..."
if docker ps | grep -q "proyecto-gestion-backend"; then
    # Intentar ping desde backend a db
    if docker exec proyecto-gestion-backend sh -c "ping -c 1 db_siexud_new > /dev/null 2>&1"; then
        echo -e "${GREEN}✅ Backend puede alcanzar db_siexud_new${NC}"
    else
        echo -e "${RED}❌ Backend NO puede alcanzar db_siexud_new${NC}"
        echo -e "${YELLOW}   Posible solución: Conectar a la misma red${NC}"

        # Sugerir comando
        MAIN_DB_NETWORK=$(echo $DB_NETWORK | awk '{print $1}')
        echo -e "${YELLOW}   Ejecuta: docker network connect $MAIN_DB_NETWORK proyecto-gestion-backend${NC}"
    fi

    # Intentar conectar al puerto 5432
    if docker exec proyecto-gestion-backend sh -c "nc -zv db_siexud_new 5432 > /dev/null 2>&1"; then
        echo -e "${GREEN}✅ Puerto 5432 accesible desde backend${NC}"
    else
        echo -e "${RED}❌ Puerto 5432 NO accesible${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No se puede probar - backend no está corriendo${NC}"
fi
echo ""

# 6. Probar endpoint de API
echo -e "${BLUE}[6/6]${NC} Probando endpoint de salud..."
if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API responde correctamente${NC}"

    # Verificar conexión a BD
    DB_CONNECTION=$(curl -s http://localhost:8000/api/health | grep -o '"success":[^,]*')
    if echo "$DB_CONNECTION" | grep -q "true"; then
        echo -e "${GREEN}✅ Conexión a base de datos exitosa${NC}"
    else
        echo -e "${RED}❌ Conexión a base de datos fallida${NC}"
    fi
else
    echo -e "${RED}❌ API no responde (¿backend corriendo?)${NC}"
fi
echo ""

# Resumen y recomendaciones
echo "================================================"
echo "  RESUMEN"
echo "================================================"
echo ""

# Comprobar si todo está bien
if docker ps | grep -q "db_siexud_new" && \
   docker ps | grep -q "proyecto-gestion-backend" && \
   curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Todo parece estar funcionando correctamente${NC}"
    echo ""
    echo "Puedes acceder a:"
    echo -e "  - Frontend: ${BLUE}http://localhost:3000${NC}"
    echo -e "  - Backend API: ${BLUE}http://localhost:8000/api/health${NC}"
    echo -e "  - Test de Conexión: ${BLUE}http://localhost:3000/connection-test${NC}"
else
    echo -e "${YELLOW}⚠️  Hay problemas de conexión${NC}"
    echo ""
    echo "Comandos sugeridos:"
    echo ""
    echo "1. Iniciar servicios:"
    echo -e "   ${BLUE}docker-compose up -d${NC}"
    echo ""
    echo "2. Ver logs del backend:"
    echo -e "   ${BLUE}docker logs -f proyecto-gestion-backend${NC}"
    echo ""
    echo "3. Conectar a la misma red (si es necesario):"
    MAIN_DB_NETWORK=$(echo $DB_NETWORK | awk '{print $1}')
    echo -e "   ${BLUE}docker network connect $MAIN_DB_NETWORK proyecto-gestion-backend${NC}"
    echo ""
    echo "4. Reconstruir y reiniciar:"
    echo -e "   ${BLUE}docker-compose down && docker-compose up --build -d${NC}"
fi
echo ""
