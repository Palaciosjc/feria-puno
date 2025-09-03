const pool = require('../config/database');

// Obtener todos los productos
const getAllProducts = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM productos');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Obtener un producto por su ID
const getProductById = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM productos WHERE id = ?',
            [req.params.id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Crear un nuevo producto
const createProduct = async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, categoria, imagen } = req.body;
        
        // Validar datos
        if (!nombre || !precio || !categoria) {
            return res.status(400).json({ message: 'Por favor proporcione al menos nombre, precio y categoría' });
        }
        
        const [result] = await pool.execute(
            'INSERT INTO productos (nombre, descripcion, precio, stock, categoria, imagen) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, descripcion, precio, stock, categoria, imagen]
        );
        
        res.status(201).json({
            id: result.insertId,
            nombre,
            descripcion,
            precio,
            stock,
            categoria,
            imagen,
            message: 'Producto creado exitosamente'
        });
    } catch (error) {
        console.error('Error al crear el producto:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Actualizar un producto
const updateProduct = async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, categoria, imagen } = req.body;
        const productId = req.params.id;
        
        // Verificar si el producto existe
        const [existingProduct] = await pool.execute(
            'SELECT * FROM productos WHERE id = ?',
            [productId]
        );
        
        if (existingProduct.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        
        // Actualizar producto
        await pool.execute(
            'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ?, imagen = ? WHERE id = ?',
            [nombre, descripcion, precio, stock, categoria, imagen, productId]
        );
        
        res.status(200).json({
            id: parseInt(productId),
            nombre,
            descripcion,
            precio,
            stock,
            categoria,
            imagen,
            message: 'Producto actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Eliminar un producto
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        
        // Verificar si el producto existe
        const [existingProduct] = await pool.execute(
            'SELECT * FROM productos WHERE id = ?',
            [productId]
        );
        
        if (existingProduct.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        
        // Eliminar producto
        await pool.execute('DELETE FROM productos WHERE id = ?', [productId]);
        
        res.status(200).json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
