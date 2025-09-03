# Sistema Feria Puno - Backend

Backend para el sistema de gestión de la Feria Puno, desarrollado con Node.js, Express y MySQL.

## Estructura Modular del Sistema

El sistema está diseñado con una estructura modular que consta de:

1. **Módulo Central (Admin)**: Accesible solo para administradores. Permite gestionar todos los aspectos del sistema.
2. **Submódulos**:
   - **Autenticación**: Registro e inicio de sesión de usuarios.
   - **Productos**: Gestión de productos disponibles.
   - **Reportes**: Generación de informes y estadísticas.

## Requisitos

- Node.js (v14.x o superior)
- MySQL (v5.7 o superior) o MariaDB (v10.x o superior)

## Configuración para Cliente-Servidor Local

### En la máquina servidor (donde está la base de datos):

1. Instalar y configurar MySQL/MariaDB.
2. Ejecutar el script de inicialización de la base de datos (`database/init.sql`).
3. Configurar MySQL para aceptar conexiones remotas.
4. Obtener la IP de la máquina servidor.

### En la máquina cliente (donde se ejecutará la aplicación):

1. Clonar este repositorio.
2. Editar el archivo `.env` para configurar la conexión a la base de datos:
   ```
   DB_HOST=IP_DEL_SERVIDOR
   DB_USER=usuario_mysql
   DB_PASSWORD=contraseña_mysql
   DB_NAME=feria_puno_db
   ```
3. Instalar dependencias: `npm install`
4. Iniciar la aplicación: `npm start`

## Autenticación y Control de Acceso

- El sistema utiliza JWT (JSON Web Tokens) para la autenticación.
- Los tokens tienen diferentes tiempos de expiración según el rol del usuario.
- El módulo central es accesible solo para administradores.
- Ciertos submódulos requieren autenticación específica.
- Los clientes (como A07 - Ivan) acceden a la base de datos mediante tokens de acceso restringido.
- Cada token de acceso tiene permisos específicos asignados por el administrador.
- Los permisos determinan exactamente qué parte de la base de datos puede acceder cada usuario.

## Credenciales por defecto

```
Usuario: admin
Contraseña: admin123
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Obtener perfil de usuario

### Productos
- `GET /api/products` - Listar todos los productos
- `GET /api/products/:id` - Obtener un producto específico
- `POST /api/products` - Crear un nuevo producto (requiere autenticación)
- `PUT /api/products/:id` - Actualizar un producto (requiere autenticación)
- `DELETE /api/products/:id` - Eliminar un producto (requiere autenticación)

### Módulo Central (Admin)
- `GET /api/admin/dashboard` - Estadísticas generales
- `GET /api/admin/users` - Listar todos los usuarios
- `PUT /api/admin/users/role` - Cambiar rol de usuario
- `GET /api/admin/logs` - Ver registros de actividad

### Reportes
- `GET /api/reports/sales` - Reporte de ventas
- `GET /api/reports/top-products` - Productos más vendidos
- `GET /api/reports/top-customers` - Clientes más activos

### Tokens de Acceso Restringido
- `POST /api/access/generate` - Generar token de acceso con permisos específicos (solo admin)
- `POST /api/access/verify` - Verificar validez de un token de acceso
- `POST /api/access/revoke` - Revocar un token de acceso (solo admin)
- `GET /api/access/permissions` - Listar todos los permisos disponibles (solo admin)

## Desarrollo

Para ejecutar en modo desarrollo con recarga automática:

```
npm run dev
```
