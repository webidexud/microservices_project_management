# Sistema de Gestión de Proyectos - IDEXUD

Sistema web para la gestión de proyectos de extensión universitaria.

## 🚀 Inicio Rápido

### Requisitos Previos
- Docker y Docker Compose instalados
- Contenedor PostgreSQL `db_siexud_new` corriendo

### Paso 1: Verificar Base de Datos

```bash
# Verificar que el contenedor de BD está corriendo
docker ps | grep db_siexud_new

# Si no está corriendo, iniciarlo
docker start db_siexud_new
```

### Paso 2: Iniciar la Aplicación

```bash
# Navegar al directorio del proyecto
cd /home/user/microservices_project_management/project_management

# Construir e iniciar servicios
docker-compose up --build -d
```

### Paso 3: Verificar Conexión

```bash
# Ejecutar script de verificación
./verificar_conexion.sh
```

### Paso 4: Acceder a la Aplicación

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api/health
- **Test de Conexión:** http://localhost:3000/connection-test

## 📋 Comandos Útiles

```bash
# Ver logs
docker-compose logs -f

# Reiniciar servicios
docker-compose restart

# Detener servicios
docker-compose down

# Reconstruir todo
docker-compose down && docker-compose up --build -d
```

## 🔧 Solución de Problemas

### Problema: "Could not connect to database"

**Solución 1:** Usar configuración con red compartida

```bash
# Crear red compartida
docker network create siexud_shared_network

# Conectar BD a la red
docker network connect siexud_shared_network db_siexud_new

# Usar docker-compose alternativo
docker-compose -f docker-compose.red-compartida.yml up -d
```

**Solución 2:** Conectar manualmente a la red de la BD

```bash
# Obtener la red del contenedor de BD
docker inspect db_siexud_new | grep NetworkMode

# Conectar el backend a esa red
docker network connect [NOMBRE_RED] proyecto-gestion-backend
```

### Logs Detallados

```bash
# Ver logs del backend
docker logs -f proyecto-gestion-backend

# Ver logs del frontend
docker logs -f proyecto-gestion-frontend

# Entrar al contenedor backend
docker exec -it proyecto-gestion-backend sh
```

## 📁 Estructura del Proyecto

```
project_management/
├── backend/              # API REST (Node.js + Express)
│   ├── src/
│   │   ├── server.js
│   │   └── config/database.js
│   ├── package.json
│   └── Dockerfile
├── frontend/             # App Web (React + Vite)
│   ├── src/
│   │   ├── pages/       # Páginas
│   │   ├── components/  # Componentes
│   │   └── lib/         # Utilidades
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml    # Configuración principal
└── verificar_conexion.sh # Script de diagnóstico
```

## 🔐 Seguridad

⚠️ **IMPORTANTE:** Este proyecto tiene credenciales hardcodeadas para desarrollo.

Para producción:
1. Crear archivo `.env` con las credenciales
2. Modificar docker-compose.yml para usar variables de entorno
3. Agregar `.env` al `.gitignore`

Ver **CONEXION_BD.md** para más detalles.

## 📊 Funcionalidades

- ✅ Dashboard con métricas y gráficos
- ✅ Gestión de proyectos (CRUD)
- ✅ Catálogos maestros (8 tipos)
- ✅ Reportes
- ✅ Test de conexión a BD
- ✅ Modo oscuro
- ✅ Diseño responsive

## 🛠️ Stack Tecnológico

**Backend:**
- Node.js 18
- Express 4
- PostgreSQL (pg)

**Frontend:**
- React 18
- Vite 5
- TailwindCSS 3
- React Router 6
- TanStack Query (React Query)
- Recharts

**Infraestructura:**
- Docker
- Docker Compose
- Nginx

## 📖 Documentación Adicional

- **CONEXION_BD.md:** Guía detallada de conexión a PostgreSQL
- **verificar_conexion.sh:** Script automático de diagnóstico
- **docker-compose.red-compartida.yml:** Configuración alternativa

## 🔗 Endpoints de API

```
GET  /api/health              # Health check + info de BD
GET  /api/connection-status   # Estado de conexión
```

## 💡 Desarrollo

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📝 Notas

- El backend se conecta a una base de datos PostgreSQL externa (`db_siexud_new`)
- La aplicación usa el esquema `public` de la base de datos `nuevo_siexud`
- El frontend tiene datos mock que deben reemplazarse con llamadas API reales

## 🤝 Contribuir

Este es un proyecto interno de IDEXUD - Universidad Distrital.

## 📄 Licencia

Propiedad de IDEXUD - Universidad Distrital Francisco José de Caldas
