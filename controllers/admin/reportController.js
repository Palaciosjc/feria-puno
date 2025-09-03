const pool = require('../../config/database');

/**
 * Controlador para generación de reportes del sistema
 */

// Reporte de ventas por período
const getSalesReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        // Validar fechas
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Se requieren fechas de inicio y fin para el reporte' });
        }
        
        // Obtener datos de ventas
        const [salesData] = await pool.execute(
            'SELECT DATE(fecha) as dia, SUM(total) as totalVentas, COUNT(*) as numeroPedidos ' +
            'FROM pedidos ' +
            'WHERE fecha BETWEEN ? AND ? ' +
            'GROUP BY DATE(fecha) ' +
            'ORDER BY dia',
            [startDate, endDate]
        );
        
        // Calcular totales
        const totalSales = salesData.reduce((sum, day) => sum + parseFloat(day.totalVentas), 0);
        const totalOrders = salesData.reduce((sum, day) => sum + day.numeroPedidos, 0);
        
        res.status(200).json({
            periodStart: startDate,
            periodEnd: endDate,
            dailySales: salesData,
            summary: {
                totalSales,
                totalOrders,
                averageOrderValue: totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0
            }
        });
    } catch (error) {
        console.error('Error al generar reporte de ventas:', error);
        res.status(500).json({ 
            message: 'Error al generar el reporte de ventas', 
            error: error.message 
        });
    }
};

// Reporte de productos más vendidos
const getTopProductsReport = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        // Obtener productos más vendidos
        const [topProducts] = await pool.execute(
            'SELECT p.id, p.nombre, p.categoria, ' +
            'SUM(dp.cantidad) as unidadesVendidas, ' +
            'SUM(dp.precio * dp.cantidad) as totalVentas ' +
            'FROM detalles_pedido dp ' +
            'JOIN productos p ON dp.producto_id = p.id ' +
            'GROUP BY p.id ' +
            'ORDER BY unidadesVendidas DESC ' +
            'LIMIT ?',
            [parseInt(limit)]
        );
        
        res.status(200).json({
            topProducts,
            generatedAt: new Date()
        });
    } catch (error) {
        console.error('Error al generar reporte de productos más vendidos:', error);
        res.status(500).json({ 
            message: 'Error al generar el reporte de productos más vendidos', 
            error: error.message 
        });
    }
};

// Reporte de clientes más activos
const getTopCustomersReport = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        // Obtener clientes más activos
        const [topCustomers] = await pool.execute(
            'SELECT u.id, u.nombre, u.apellido, ' +
            'COUNT(p.id) as totalPedidos, ' +
            'SUM(p.total) as totalGastado ' +
            'FROM pedidos p ' +
            'JOIN usuarios u ON p.usuario_id = u.id ' +
            'GROUP BY u.id ' +
            'ORDER BY totalGastado DESC ' +
            'LIMIT ?',
            [parseInt(limit)]
        );
        
        res.status(200).json({
            topCustomers,
            generatedAt: new Date()
        });
    } catch (error) {
        console.error('Error al generar reporte de clientes más activos:', error);
        res.status(500).json({ 
            message: 'Error al generar el reporte de clientes más activos', 
            error: error.message 
        });
    }
};

module.exports = {
    getSalesReport,
    getTopProductsReport,
    getTopCustomersReport
};
