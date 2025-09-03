const express = require('express');
const router = express.Router();
const {
    getSalesReport,
    getTopProductsReport,
    getTopCustomersReport
} = require('../../controllers/admin/reportController');
const { isAdmin } = require('../../middleware/authMiddleware');

// Todas las rutas de este router requieren ser administrador
router.use(isAdmin);

// Rutas para reportes
router.get('/sales', getSalesReport);
router.get('/top-products', getTopProductsReport);
router.get('/top-customers', getTopCustomersReport);

module.exports = router;
