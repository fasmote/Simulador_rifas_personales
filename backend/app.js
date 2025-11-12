const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const rifasRoutes = require('./routes/rifas');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rifas', rifasRoutes);

// Endpoint temporal para regenerar rifas demo (TEMPORAL - REMOVER DESPUÉS)
app.get('/api/admin/regenerate-demo', async (req, res) => {
    try {
        console.log('🔄 Regenerando rifas demo con números seleccionados...');
        const createDemoContent = require('./database/demo-content');
        await createDemoContent();
        res.json({
            success: true,
            message: 'Rifas demo regeneradas exitosamente con números al azar'
        });
    } catch (error) {
        console.error('Error regenerando demo:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Servir el frontend en la ruta raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Algo salió mal!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
    });
});

// Ruta 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 Base de datos: ${process.env.DB_PATH}`);
    console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
});

module.exports = app;
