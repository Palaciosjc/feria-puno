const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const { generateRestrictedToken } = require('../middleware/permissionsMiddleware');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Controlador para gestionar tokens de acceso restringido
 * Este controlador permitirá al administrador generar tokens con permisos específicos
 * para otros usuarios, como Ivan (A07)
 */

// Generar token de acceso restringido
const generateAccessToken = async (req, res) => {
    try {
        // Solo los administradores pueden generar tokens
        if (req.user.rol !== 'admin') {
            return res.status(403).json({ 
                message: 'Acceso denegado. Solo los administradores pueden generar tokens de acceso.' 
            });
        }

        const { userId, permissions, duration } = req.body;

        // Validar datos
        if (!userId || !permissions || !Array.isArray(permissions)) {
            return res.status(400).json({ 
                message: 'Datos inválidos. Se requiere userId y un array de permisos.' 
            });
        }

        // Verificar si el usuario existe
        const [users] = await pool.execute(
            'SELECT id, username, email, rol FROM usuarios WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                message: 'Usuario no encontrado.' 
            });
        }

        // Verificar que los permisos solicitados existan
        const [existingPermissions] = await pool.execute(
            'SELECT nombre FROM permisos WHERE nombre IN (?)',
            [permissions]
        );

        const validPermissions = existingPermissions.map(p => p.nombre);

        if (validPermissions.length !== permissions.length) {
            return res.status(400).json({ 
                message: 'Algunos permisos solicitados no son válidos.',
                validPermissions
            });
        }

        // Generar el token con los permisos especificados
        const token = await generateRestrictedToken(
            userId, 
            validPermissions,
            duration || '8h'  // Por defecto, 8 horas
        );

        // Calcular fecha de expiración
        const expiryTime = new Date();
        expiryTime.setHours(expiryTime.getHours() + parseInt(duration || '8'));

        // Guardar el token en la base de datos
        await pool.execute(
            'UPDATE usuarios SET token_acceso = ?, token_expiracion = ? WHERE id = ?',
            [token, expiryTime, userId]
        );

        // Registrar la actividad
        console.log(`[${new Date().toISOString()}] Admin ${req.user.id} generó token para usuario ${userId}`);

        res.status(200).json({
            message: 'Token de acceso generado exitosamente',
            token,
            expiresAt: expiryTime,
            permissions: validPermissions
        });
    } catch (error) {
        console.error('Error generando token de acceso:', error);
        res.status(500).json({ 
            message: 'Error al generar token de acceso', 
            error: error.message 
        });
    }
};

// Verificar un token de acceso restringido
const verifyAccessToken = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ 
                message: 'Token no proporcionado.' 
            });
        }

        // Verificar si el token está registrado en la base de datos
        const [tokenUsers] = await pool.execute(
            'SELECT id, username, email, rol, token_expiracion FROM usuarios WHERE token_acceso = ?',
            [token]
        );

        if (tokenUsers.length === 0) {
            return res.status(403).json({ 
                message: 'Token inválido o no registrado.' 
            });
        }

        const user = tokenUsers[0];

        // Verificar si el token ha expirado en la base de datos
        if (user.token_expiracion && new Date(user.token_expiracion) < new Date()) {
            return res.status(403).json({ 
                message: 'Token expirado según los registros de la base de datos.' 
            });
        }

        // Verificar el token con JWT
        jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta', (err, decoded) => {
            if (err) {
                return res.status(403).json({ 
                    message: 'Token inválido o expirado.', 
                    error: err.message 
                });
            }

            // Token válido, devolver información
            res.status(200).json({
                message: 'Token válido',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    rol: user.rol
                },
                permissions: decoded.permissions || [],
                expiresAt: user.token_expiracion
            });
        });
    } catch (error) {
        console.error('Error verificando token de acceso:', error);
        res.status(500).json({ 
            message: 'Error al verificar token de acceso', 
            error: error.message 
        });
    }
};

// Revocar un token de acceso
const revokeAccessToken = async (req, res) => {
    try {
        // Solo los administradores pueden revocar tokens
        if (req.user.rol !== 'admin') {
            return res.status(403).json({ 
                message: 'Acceso denegado. Solo los administradores pueden revocar tokens de acceso.' 
            });
        }

        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ 
                message: 'Se requiere el ID del usuario.' 
            });
        }

        // Eliminar el token del usuario
        await pool.execute(
            'UPDATE usuarios SET token_acceso = NULL, token_expiracion = NULL WHERE id = ?',
            [userId]
        );

        // Registrar la actividad
        console.log(`[${new Date().toISOString()}] Admin ${req.user.id} revocó token para usuario ${userId}`);

        res.status(200).json({
            message: 'Token de acceso revocado exitosamente'
        });
    } catch (error) {
        console.error('Error revocando token de acceso:', error);
        res.status(500).json({ 
            message: 'Error al revocar token de acceso', 
            error: error.message 
        });
    }
};

// Obtener todos los permisos disponibles
const getAllPermissions = async (req, res) => {
    try {
        // Solo administradores pueden ver todos los permisos
        if (req.user.rol !== 'admin') {
            return res.status(403).json({ 
                message: 'Acceso denegado. Solo administradores pueden ver todos los permisos.' 
            });
        }

        const [permissions] = await pool.execute('SELECT * FROM permisos');

        res.status(200).json(permissions);
    } catch (error) {
        console.error('Error obteniendo permisos:', error);
        res.status(500).json({ 
            message: 'Error al obtener permisos', 
            error: error.message 
        });
    }
};

module.exports = {
    generateAccessToken,
    verifyAccessToken,
    revokeAccessToken,
    getAllPermissions
};
