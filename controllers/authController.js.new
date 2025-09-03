const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
require('dotenv').config();

// Función para generar token JWT con tiempo de expiración basado en rol
const generateToken = (user) => {
    const payload = { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        rol: user.rol 
    };
    
    // Determinar tiempo de expiración según rol
    let expiresIn = process.env.JWT_USER_EXPIRY || '2h'; // Por defecto 2 horas para usuarios normales
    
    if (user.rol === 'admin') {
        expiresIn = process.env.JWT_ADMIN_EXPIRY || '24h'; // 24 horas para administradores
    }
    
    return jwt.sign(
        payload,
        process.env.JWT_SECRET || 'tu_clave_secreta',
        { expiresIn }
    );
};

// Controlador para el registro de usuarios
const register = async (req, res) => {
    try {
        const { username, email, password, nombre, apellido, telefono } = req.body;

        // Verificar si el usuario ya existe
        const [existingUsers] = await pool.execute(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
        }

        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear nuevo usuario (por defecto con rol 'usuario')
        const rol = 'usuario';
        
        // Crear nuevo usuario
        const [result] = await pool.execute(
            'INSERT INTO usuarios (username, email, password, nombre, apellido, telefono, rol) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [username, email, hashedPassword, nombre, apellido, telefono, rol]
        );

        // Crear objeto de usuario para generar token
        const user = {
            id: result.insertId,
            username,
            email,
            rol
        };

        // Generar token JWT
        const token = generateToken(user);

        // Registrar actividad
        await registerActivity(user.id, 'REGISTER', 'Nuevo registro de usuario');

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                nombre,
                apellido,
                telefono,
                rol: user.rol
            }
        });
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Controlador para el inicio de sesión
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar el usuario por email
        const [users] = await pool.execute(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }

        const user = users[0];

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }

        // Generar token JWT con expiración según rol
        const token = generateToken(user);
        
        // Actualizar último login
        await pool.execute(
            'UPDATE usuarios SET last_login = NOW() WHERE id = ?',
            [user.id]
        );
        
        // Registrar actividad
        await registerActivity(user.id, 'LOGIN', 'Inicio de sesión exitoso');

        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                nombre: user.nombre,
                apellido: user.apellido,
                telefono: user.telefono,
                rol: user.rol
            }
        });
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Controlador para obtener el perfil del usuario
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Obtener los datos del usuario desde la base de datos
        const [users] = await pool.execute(
            'SELECT id, username, email, nombre, apellido, telefono, rol, created_at, last_login FROM usuarios WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.status(200).json({
            user: users[0]
        });
    } catch (error) {
        console.error('Error al obtener el perfil:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Función auxiliar para registrar actividad del usuario
const registerActivity = async (userId, action, details) => {
    try {
        // En un sistema real, aquí registraríamos en una tabla de logs
        // Para este ejemplo, solo imprimimos en consola
        console.log(`[${new Date().toISOString()}] Usuario ID ${userId}: ${action} - ${details}`);
        
        // Simulamos que guardamos en la base de datos
        // await pool.execute(
        //     'INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)',
        //     [userId, action, details]
        // );
    } catch (error) {
        console.error('Error al registrar actividad:', error);
    }
};

module.exports = { register, login, getProfile };
