const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware para verificar el token JWT
const authenticateToken = (req, res, next) => {
    // Obtener el header de autorización
    const authHeader = req.headers['authorization'];
    // El token viene en formato "Bearer TOKEN"
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
    }

    // Verificar el token
    jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido o expirado.' });
        }
        
        // Si el token es válido, guardar la información del usuario en el request
        req.user = user;
        next();
    });
};

// Middleware para verificar si el usuario es administrador
const isAdmin = (req, res, next) => {
    // Primero verificamos que el usuario esté autenticado
    authenticateToken(req, res, () => {
        // Luego verificamos el rol
        if (req.user && req.user.rol === 'admin') {
            next(); // Usuario es admin, permitir acceso
        } else {
            res.status(403).json({ message: 'Acceso denegado. Se requieren privilegios de administrador.' });
        }
    });
};

// Middleware para verificar si el usuario es vendedor o administrador
const isVendedorOrAdmin = (req, res, next) => {
    // Primero verificamos que el usuario esté autenticado
    authenticateToken(req, res, () => {
        // Luego verificamos el rol
        if (req.user && (req.user.rol === 'admin' || req.user.rol === 'vendedor')) {
            next(); // Usuario es vendedor o admin, permitir acceso
        } else {
            res.status(403).json({ message: 'Acceso denegado. Se requieren privilegios de vendedor o administrador.' });
        }
    });
};

module.exports = { 
    authenticateToken, 
    isAdmin,
    isVendedorOrAdmin 
};
