const jwt = require('jsonwebtoken');
const pool = require('../config/database');
require('dotenv').config();

/**
 * Middleware para controlar el acceso basado en permisos específicos
 * Este middleware complementa al authMiddleware.js existente,
 * añadiendo control de acceso más granular
 */

// Verificar permisos específicos para el usuario
const checkPermissions = (requiredPermissions) => {
    return async (req, res, next) => {
        try {
            // El middleware authenticateToken ya debería haber validado el token
            // y colocado la información del usuario en req.user
            if (!req.user || !req.user.id) {
                return res.status(401).json({ 
                    message: 'Acceso denegado. Usuario no autenticado.'
                });
            }
            
            // Obtener los permisos del usuario de la base de datos
            const [userPermissions] = await pool.execute(
                'SELECT p.nombre FROM permisos p ' +
                'JOIN usuario_permisos up ON p.id = up.permiso_id ' +
                'WHERE up.usuario_id = ?',
                [req.user.id]
            );
            
            // Convertir a array de nombres de permisos
            const permissions = userPermissions.map(p => p.nombre);
            
            // Verificar si tiene alguno de los permisos requeridos
            const hasPermission = requiredPermissions.some(
                permission => permissions.includes(permission)
            );
            
            if (!hasPermission && req.user.rol !== 'admin') {
                return res.status(403).json({
                    message: 'Acceso denegado. No tienes permisos suficientes para esta acción.'
                });
            }
            
            // Si es administrador o tiene los permisos necesarios, continuar
            next();
        } catch (error) {
            console.error('Error al verificar permisos:', error);
            res.status(500).json({
                message: 'Error en la verificación de permisos',
                error: error.message
            });
        }
    };
};

// Función para generar tokens con permisos específicos
const generateRestrictedToken = async (userId, permissions, duration = '2h') => {
    try {
        // Obtener información del usuario
        const [users] = await pool.execute(
            'SELECT id, username, email, rol FROM usuarios WHERE id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            throw new Error('Usuario no encontrado');
        }
        
        const user = users[0];
        
        // Generar token con permisos específicos
        return jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                email: user.email,
                rol: user.rol,
                permissions: permissions 
            },
            process.env.JWT_SECRET || 'tu_clave_secreta',
            { expiresIn: duration }
        );
    } catch (error) {
        console.error('Error generando token restringido:', error);
        throw error;
    }
};

// Verificar si un token tiene un permiso específico
const hasPermission = (permission) => {
    return (req, res, next) => {
        // Comprobar si el usuario tiene el permiso en su token
        if (
            req.user && 
            (req.user.rol === 'admin' || 
             (req.user.permissions && req.user.permissions.includes(permission))
            )
        ) {
            next();
        } else {
            res.status(403).json({
                message: `Acceso denegado. Se requiere el permiso: ${permission}`
            });
        }
    };
};

module.exports = {
    checkPermissions,
    generateRestrictedToken,
    hasPermission
};
