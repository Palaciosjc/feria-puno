const express = require('express');
const router = express.Router();
const { 
    getDashboardStats, 
    getAllUsers, 
    changeUserRole, 
    getActivityLogs 
} = require('../../controllers/admin/adminController');
const { isAdmin } = require('../../middleware/authMiddleware');

// Todas las rutas de este router requieren ser administrador
router.use(isAdmin);

// Rutas para el módulo central (núcleo del sistema)
router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/role', changeUserRole);
router.get('/logs', getActivityLogs);

module.exports = router;
