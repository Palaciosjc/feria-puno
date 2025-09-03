const express = require('express');
const router = express.Router();
const { 
    getAllProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} = require('../controllers/productController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Rutas públicas (no requieren autenticación)
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Rutas protegidas (requieren autenticación)
router.post('/', authenticateToken, createProduct);
router.put('/:id', authenticateToken, updateProduct);
router.delete('/:id', authenticateToken, deleteProduct);

module.exports = router;
