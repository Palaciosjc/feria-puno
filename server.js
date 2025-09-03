const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/admin/adminRoutes');
const reportRoutes = require('./routes/admin/reportRoutes');
const accessTokenRoutes = require('./routes/accessTokenRoutes');

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Middleware para CORS (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        return res.status(200).json({});
    }
    next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Rutas del módulo central (acceso solo administradores)
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);

// Rutas para tokens de acceso restringido
app.use('/api/access', accessTokenRoutes);

// Ruta raíz
app.get('/', (req, res) => {
    res.json({ 
        message: 'API de Feria Puno - ¡Bienvenido!',
        version: '1.0.0',
        serverInfo: {
            ip: process.env.SERVER_IP || 'localhost',
            time: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        }
    });
});

// Manejador de rutas no encontradas
app.use((req, res, next) => {
    const error = new Error('No encontrado');
    error.status = 404;
    next(error);
});

// Manejador de errores
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

// Puerto
const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});
