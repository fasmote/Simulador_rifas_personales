// ============================================
// RUTAS DE UPLOAD DE IMÁGENES
// ============================================
// FASE 8: Sistema de carga de imágenes para productos/premios

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary, isConfigured } = require('../config/cloudinary');

// Configurar multer para almacenamiento en memoria
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Límite de 5MB
    },
    fileFilter: (req, file, cb) => {
        // Aceptar solo imágenes
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen'), false);
        }
    }
});

// ============================================
// POST /api/upload/image - Subir imagen a Cloudinary
// ============================================
router.post('/image', upload.single('image'), async (req, res) => {
    try {
        // Verificar que Cloudinary esté configurado
        if (!isConfigured()) {
            return res.status(503).json({
                success: false,
                message: 'El servicio de carga de imágenes no está configurado. Usa la opción de URL en su lugar.'
            });
        }

        // Verificar que se haya enviado un archivo
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se envió ninguna imagen'
            });
        }

        // Convertir buffer a base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        // Subir a Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'simularifas',
            resource_type: 'auto',
            transformation: [
                { width: 800, height: 800, crop: 'limit' }, // Limitar tamaño
                { quality: 'auto:good' } // Optimización automática
            ]
        });

        // Retornar URL de la imagen
        res.json({
            success: true,
            message: 'Imagen subida exitosamente',
            imageUrl: result.secure_url,
            publicId: result.public_id
        });

    } catch (error) {
        console.error('Error subiendo imagen:', error);
        res.status(500).json({
            success: false,
            message: 'Error al subir la imagen',
            error: error.message
        });
    }
});

// ============================================
// DELETE /api/upload/image/:publicId - Eliminar imagen de Cloudinary
// ============================================
router.delete('/image/:publicId', async (req, res) => {
    try {
        // Verificar que Cloudinary esté configurado
        if (!isConfigured()) {
            return res.status(503).json({
                success: false,
                message: 'El servicio de imágenes no está configurado'
            });
        }

        const { publicId } = req.params;

        // Eliminar de Cloudinary
        await cloudinary.uploader.destroy(`simularifas/${publicId}`);

        res.json({
            success: true,
            message: 'Imagen eliminada exitosamente'
        });

    } catch (error) {
        console.error('Error eliminando imagen:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la imagen',
            error: error.message
        });
    }
});

module.exports = router;
