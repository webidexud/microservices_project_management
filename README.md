# 🌐 Sistema de Información Oficina de Extensión UD – 2025  
### **SIEXUD · Versión 2 (2025)**  

Bienvenido al repositorio oficial del **Sistema de Información de la Oficina de Extensión de la Universidad Distrital Francisco José de Caldas (SIEXUD)**, versión 2 para el año **2025**.  

Este proyecto tiene como objetivo **modernizar y centralizar** la gestión de información, automatizar procesos internos y mejorar la infraestructura digital de la Oficina de Extensión.

---

<p align="center">
  <img src="https://img.shields.io/badge/Estado-En%20Desarrollo-yellow?style=flat-square" />
  <img src="https://img.shields.io/badge/Arquitectura-Microservicios-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/Orquestación-Docker%20Compose-2496ED?style=flat-square&logo=docker&logoColor=white" />
</p>

---

## ✨ Descripción General

Este repositorio contiene la estructura base del nuevo **SIEXUD_V2_2025**, desarrollado bajo una arquitectura modular y escalable de **microservicios**, lo que permite:

- ✔ Mantenimiento independiente de cada componente  
- ✔ Mayores posibilidades de escalar horizontalmente  
- ✔ Integración mediante API Gateway con Nginx  
- ✔ Despliegue consistente en cualquier entorno gracias a Docker  

Actualmente el proyecto se encuentra en **fase activa de desarrollo**, definiendo componentes fundamentales y la lógica central del sistema.

---

# 📂 Estructura del Proyecto

El proyecto sigue una jerarquía clara y organizada:

```
Siexud_V2_2025/
├── .gitignore
├── README.md
├── docker-compose.yml
├── nginx
│   ├── Dockerfile
│   ├── .env
│   └── config                  # Configuración de nginx, carpetas sites-enable, sites-available, nginx.conf, etc
├── si_ofex
│   ├── Dockerfile
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   ├── src/
│   │   ├── config/           # Conexiones y configuraciones (DB, etc.)
│   │   |   └── database.js
│   │   ├── controllers/      # Lógica de las peticiones (req, res) 
│   │   |   └── userController.js
│   │   ├── middlewares/      # Funciones intermedias (auth, logs, errores)  // Por Definir
│   │   |   └── authMiddleware.js
│   │   ├── models/           # Definición de los datos (ej: con Sequelize o Knex)  // Por Definir
│   │   |   └── userModel.js
│   │   ├── public/           # Archivos estáticos (CSS, JS cliente, imágenes)
│   │   |   ├── css/
│   │   |   └── js/
│   │   ├── routes/           # Definición de las rutas de la API
│   │   |   └── userRoutes.js
│   │   ├── services/         # Lógica de negocio (separada de los controllers)
│   │   |   └── userService.js
│   │   ├── utils/            # Funciones de utilidad reutilizables  // Por Definir
│   │   |   └── helpers.js
│   │   ├── views/            # Plantillas EJS
│   │   |   ├── partials/
│   │   |   |   ├── header.ejs
│   │   |   |   └── footer.ejs
│   │   |   └── pages/
│   │   |       └── home.ejs
│   │   └── app.js            # Punto de entrada de la aplicación Expressc

...

 Otros microservicios

```

***

## 🚀 Despliegue con Docker y docker-compose

Para garantizar consistencia entre entornos y facilitar el despliegue, el proyecto utiliza Docker para empaquetar la aplicación y sus dependencias en un contenedor portable.

### Requisitos Previos

* [Docker](https://www.docker.com/get-started) instalado en tu máquina.
* [Docker compose](https://docs.docker.com/compose/install/) instalado en tu máquina local.

### Pasos para el desarrollo local

1.  **Clonar el Repositorio**
    # Clona el repositorio (incluye todos los branches)
    ```
    git clone <URL_DEL_REPOSITORIO>
    cd Siexud_V2_2025
    ```

    # Cambia al branch de desarrollo
    ```
    git checkout dev
    ```

2.  **Configurar las Variables de Entorno**

    <!-- Dentro del repositorio encontrará un documento `example.env` copie y haga los cambios para su configuración local o de producción -->

    Cambia las variables de entorno segun tu especificación 

    ```bash
    cp example.env .env
    ```
    Abre el archivo copiado y ajusta las variables según tu entorno (puertos, credenciales de la base de datos, etc.).

3.  **Construir y Ejecutar los Contenedores**
    
    Utilizando docker-compose para subir los servicios

    a. En el caso de que solo quiera subir un servicio definido en el archivo docker-compose.yml utilizar:

     ```bash
     docker compose <Nombre_del_microservicio_en_el_docker-compose.yml>
     ```
    b. En el caso de querer subir todos los servicios que posee el repositorio utilice: 

    ```bash
    docker compose up -d
    ```

5.  **Verificar el Funcionamiento**
    Una vez que los contenedores estén en ejecución, la aplicación estará disponible en la URL y el puerto que hayas configurado (por ejemplo, `http://localhost:3000`).

6.  **Detener los Contenedores**
    a. Para detener el servicio de algún modulo, ejecuta el siguiente comando en la terminal:
    ```bash
    docker compose down <Nombre_del_microservicio_en_el_docker-compose.yml>
    ```
    b. En el caso de querer detener todos los servicios que posee el repositorio utilice:
    ```bash
    dokcer compose down
    ```
***

# 🤝 Soporte y Contacto

**📧 Equipo DevOps – Oficina de Extensión UD**

Si encuentras fallas o deseas aportar, por favor abre un issue en este repositorio.

# 🎉 ¡Gracias por apoyar el desarrollo del SIEXUD 2025!
