const pool = require('../../config/database');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Controlador para el módulo central - Solo accesible por administradores
 */

// Dashboard administrativo con estadísticas generales
const getDashboardStats = async (req, res) => {
    try {
        // Verificar que el usuario sea administrador
        if (req.user.rol !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado. Solo administradores pueden acceder a este recurso.' });
        }

        // Obtener estadísticas generales del sistema
        const [userCount] = await pool.execute('SELECT COUNT(*) as total FROM usuarios');
        const [productCount] = await pool.execute('SELECT COUNT(*) as total FROM productos');
        const [categoryCount] = await pool.execute('SELECT COUNT(*) as total FROM categorias');
        const [orderCount] = await pool.execute('SELECT COUNT(*) as total FROM pedidos');
        
        // Estadísticas de ventas (últimos 30 días)
        const [recentSales] = await pool.execute(
            'SELECT SUM(total) as totalVentas FROM pedidos WHERE fecha > DATE_SUB(NOW(), INTERVAL 30 DAY)'
        );
        
        res.status(200).json({
            users: userCount[0].total,
            products: productCount[0].total,
            categories: categoryCount[0].total,
            orders: orderCount[0].total,
            recentSales: recentSales[0].totalVentas || 0,
            serverTime: new Date(),
            serverIp: process.env.SERVER_IP || 'localhost'
        });
    } catch (error) {
        console.error('Error en el dashboard administrativo:', error);
        res.status(500).json({ 
            message: 'Error al obtener estadísticas del sistema', 
            error: error.message 
        });
    }
};

// Gestión de usuarios (solo admin)
const getAllUsers = async (req, res) => {
    try {
        // Verificar que el usuario sea administrador
        if (req.user.rol !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado. Solo administradores pueden acceder a este recurso.' });
        }

        // Obtener todos los usuarios (excepto contraseñas)
        const [users] = await pool.execute(
            'SELECT id, username, email, nombre, apellido, telefono, rol, created_at, last_login FROM usuarios'
        );
        
        res.status(200).json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ 
            message: 'Error al obtener la lista de usuarios', 
            error: error.message 
        });
    }
};

// Cambiar rol de usuario (promocionar/degradar)
const changeUserRole = async (req, res) => {
    try {
        // Verificar que el usuario sea administrador
        if (req.user.rol !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado. Solo administradores pueden acceder a este recurso.' });
        }

        const { userId, newRole } = req.body;
        
        // Validar rol
        if (!['admin', 'vendedor', 'usuario'].includes(newRole)) {
            return res.status(400).json({ message: 'Rol inválido. Los roles permitidos son: admin, vendedor, usuario' });
        }
        
        // Actualizar rol
        await pool.execute(
            'UPDATE usuarios SET rol = ? WHERE id = ?',
            [newRole, userId]
        );
        
        res.status(200).json({ 
            message: `Rol del usuario actualizado exitosamente a ${newRole}` 
        });
    } catch (error) {
        console.error('Error al cambiar rol de usuario:', error);
        res.status(500).json({ 
            message: 'Error al actualizar el rol del usuario', 
            error: error.message 
        });
    }
};

// Obtener registros de actividad del sistema
const getActivityLogs = async (req, res) => {
    try {
        // Verificar que el usuario sea administrador
        if (req.user.rol !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado. Solo administradores pueden acceder a este recurso.' });
        }

        // En un sistema real, aquí tendríamos una tabla de logs
        // Para este ejemplo, simularemos algunos logs
        const activityLogs = [
            { timestamp: new Date(), action: 'LOGIN', user: 'admin', details: 'Inicio de sesión exitoso' },
            { timestamp: new Date(Date.now() - 3600000), action: 'CREATE_PRODUCT', user: 'vendedor1', details: 'Nuevo producto agregado: Papa nativa' },
            { timestamp: new Date(Date.now() - 7200000), action: 'UPDATE_USER', user: 'admin', details: 'Actualización de rol: user123 -> vendedor' },
            { timestamp: new Date(Date.now() - 86400000), action: 'DELETE_PRODUCT', user: 'admin', details: 'Producto eliminado: ID 15' }
        ];
        
        res.status(200).json(activityLogs);
    } catch (error) {
        console.error('Error al obtener logs de actividad:', error);
        res.status(500).json({ 
            message: 'Error al obtener registros de actividad', 
            error: error.message 
        });
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    changeUserRole,
    getActivityLogs
};
