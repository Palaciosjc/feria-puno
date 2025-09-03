

CREATE DATABASE IF NOT EXISTS feria_puno_db;
USE feria_puno_db;


CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    rol ENUM('admin', 'vendedor', 'usuario') NOT NULL DEFAULT 'usuario',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    token_acceso VARCHAR(255) NULL,
    token_expiracion DATETIME NULL
);

-- Tabla de Permiso
CREATE TABLE IF NOT EXISTS permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación Usuario-Permiso
CREATE TABLE IF NOT EXISTS usuario_permisos (
    usuario_id INT NOT NULL,
    permiso_id INT NOT NULL,
    otorgado_por INT NOT NULL,
    fecha_otorgado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, permiso_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE,
    FOREIGN KEY (otorgado_por) REFERENCES usuarios(id)
);

-- Tabla de Categorías
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Productos
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    categoria VARCHAR(100) NOT NULL,
    imagen VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    estado ENUM('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado') DEFAULT 'pendiente',
    direccion_entrega TEXT,
    telefono_contacto VARCHAR(20),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de Detalles de Pedido
CREATE TABLE IF NOT EXISTS detalles_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Crear un usuario administrador por defecto
-- Contraseña: admin123 (hasheada con bcrypt)
INSERT INTO usuarios (username, email, password, nombre, apellido, rol)
VALUES (
    'admin', 
    'admin@feriapuno.com',
    '$2a$10$XhLMaGLX.C3FMOdYYdaJrOuTNTM0A5KzXcUlHEKQBV3a1Nd1mFxR2',
    'Administrador', 
    'Sistema', 
    'admin'
) ON DUPLICATE KEY UPDATE id=id;

-- Insertar algunas categorías básicas
INSERT INTO categorias (nombre, descripcion) VALUES 
('Tubérculos', 'Productos como papa, camote, yuca, etc.'),
('Cereales', 'Productos como quinua, cañihua, kiwicha, etc.'),
('Frutas', 'Productos frutales de la región'),
('Artesanías', 'Artesanías y productos hechos a mano'),
('Lácteos', 'Productos lácteos como quesos, yogurt, etc.')
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Insertar algunos productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, stock, categoria, imagen) VALUES 
('Papa nativa', 'Papas nativas de la región de Puno, variedad mixta', 5.50, 100, 'Tubérculos', 'papa_nativa.jpg'),
('Quinua roja', 'Quinua roja orgánica de alta calidad', 12.80, 50, 'Cereales', 'quinua_roja.jpg'),
('Queso Paria', 'Queso tradicional de la región de Puno', 15.00, 30, 'Lácteos', 'queso_paria.jpg')
ON DUPLICATE KEY UPDATE id=id;

-- Insertar los permisos disponibles en el sistema
INSERT INTO permisos (nombre, descripcion) VALUES
('ver_productos', 'Permiso para ver la lista de productos'),
('crear_productos', 'Permiso para crear nuevos productos'),
('editar_productos', 'Permiso para modificar productos existentes'),
('eliminar_productos', 'Permiso para eliminar productos'),
('ver_ventas', 'Permiso para ver historial de ventas'),
('crear_ventas', 'Permiso para registrar nuevas ventas'),
('ver_clientes', 'Permiso para ver la lista de clientes'),
('ver_reportes_basicos', 'Permiso para ver reportes básicos'),
('ver_reportes_avanzados', 'Permiso para ver reportes avanzados')
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Crear un usuario específico para Ivan (A07) con permisos limitados
INSERT INTO usuarios (username, email, password, nombre, apellido, rol)
VALUES (
    'ivan', 
    'ivan@feriapuno.com',
    '$2a$10$XhLMaGLX.C3FMOdYYdaJrOuTNTM0A5KzXcUlHEKQBV3a1Nd1mFxR2',  -- misma contraseña: admin123
    'Ivan', 
    'Cliente A07', 
    'vendedor'
) ON DUPLICATE KEY UPDATE id=id;

-- Obtener los IDs para asignar permisos
SET @ivan_id = (SELECT id FROM usuarios WHERE username = 'ivan');
SET @admin_id = (SELECT id FROM usuarios WHERE username = 'admin');
SET @permiso_ver_productos = (SELECT id FROM permisos WHERE nombre = 'ver_productos');
SET @permiso_crear_ventas = (SELECT id FROM permisos WHERE nombre = 'crear_ventas');
SET @permiso_ver_ventas = (SELECT id FROM permisos WHERE nombre = 'ver_ventas');
SET @permiso_ver_reportes_basicos = (SELECT id FROM permisos WHERE nombre = 'ver_reportes_basicos');

-- Asignar permisos a Ivan
INSERT INTO usuario_permisos (usuario_id, permiso_id, otorgado_por)
VALUES
(@ivan_id, @permiso_ver_productos, @admin_id),
(@ivan_id, @permiso_crear_ventas, @admin_id),
(@ivan_id, @permiso_ver_ventas, @admin_id),
(@ivan_id, @permiso_ver_reportes_basicos, @admin_id);

-- Mensaje de confirmación
SELECT 'Base de datos inicializada correctamente con permisos de acceso restringido' AS mensaje;
