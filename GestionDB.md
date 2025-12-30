# Gestión de Base de Datos PostgreSQL con Adminer

Este proyecto levanta un entorno de base de datos PostgreSQL junto con Adminer como cliente web para la gestión de bases de datos, usando Docker Compose.

## 📦 Servicios incluidos

- **PostgreSQL**: motor de base de datos.
- **Adminer**: interfaz web ligera para gestionar bases de datos.

---

## 🚀 Iniciar los servicios

Asegúrate de tener [Docker](https://docs.docker.com/get-docker/) y [Docker Compose](https://docs.docker.com/compose/) instalados.

1. Clona el repositorio (si aplica) o ubícate en el directorio del proyecto.
2. Crea un archivo `.env` o copia el de `example.env` con el siguiente contenido:

```env
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=midb
DB_PORT=5432
PORT=5001
path_host_vol=./data
path_cont_vol=/var/lib/postgresql/data

3. Verificar o Modificar el archivo `01-init.sql`

    Este archivo se encarga de que la base de datos se actualice cada que se inicie desde 0 el servicio.
    En caso de que la base de datos ya tenga volumenes anteriores se deben eliminar estos para que funcione el nuevo esquema
    en caso de que se haya actualizado, por lo tanto se debe:

    ## En caso de que se haya inicializado anteriormente la base de datos

    ### I- Eliminar los volumenes únicamente del servicio de la base de datos
        ```
            docker compose down si_db_general -v
        ```
    ### II- Subir de nuevo el servicio de la base de datos
        ```
            docker compose up si_db_general --build -d
        ```


4. Ingresar al contenedor con adminer para ver y gestionar la base de datos

Una vez ya inicie la base de datos se debe ingresar al adminer para ver los cambios pertinentes
realizados al inicializar la base de datos, en este caso estará en la dirección `http://localhost:PORT_adminer`

 ## En el caso de que no este inicializado el adminer

 ```
    docker compose up adminer -d
 ```

