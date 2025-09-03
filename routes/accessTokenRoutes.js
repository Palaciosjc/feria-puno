const express = require('express');
const router = express.Router();
const { 
    generateAccessToken, 
    verifyAccessToken, 
    revokeAccessToken,
    getAllPermissions
} = require('../controllers/accessTokenController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/verify', verifyAccessToken);

// Rutas protegidas para administradores
router.post('/generate', authenticateToken, isAdmin, generateAccessToken);
router.post('/revoke', authenticateToken, isAdmin, revokeAccessToken);
router.get('/permissions', authenticateToken, isAdmin, getAllPermissions);

module.exports = router;
