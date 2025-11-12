/**
 * Script de inicialización para producción (Vercel Postgres)
 *
 * Este script:
 * 1. Solo se ejecuta si POSTGRES_URL está definido (producción)
 * 2. Crea las tablas si no existen
 * 3. Crea contenido demo para la aplicación
 * 4. Maneja errores de forma segura
 *
 * Se ejecuta automáticamente después del build en Vercel
 */

const setupProduction = async () => {
    // Solo ejecutar si estamos en producción con PostgreSQL
    if (!process.env.POSTGRES_URL) {
        console.log('⏭️  Saltando setup de producción - no estamos en Vercel (POSTGRES_URL no definido)');
        return { success: true, skipped: true };
    }

    console.log('🚀 Iniciando setup de producción para PostgreSQL...');
    console.log('📍 Entorno:', process.env.NODE_ENV || 'production');

    try {
        // Importar módulos de inicialización
        const initDatabase = require('./init');

        console.log('🔨 Ejecutando inicialización de base de datos...');
        await initDatabase();

        console.log('✅ Setup de producción completado exitosamente');
        return { success: true, message: 'Base de datos inicializada correctamente' };

    } catch (error) {
        console.error('❌ Error en setup de producción:', error.message);
        console.error('Stack trace:', error.stack);

        // No lanzar error para no romper el deploy de Vercel
        // Solo registrar el error
        return {
            success: false,
            error: error.message,
            note: 'El deploy continuará, pero la DB puede no estar inicializada'
        };
    }
};

// Ejecutar si se llama directamente
if (require.main === module) {
    setupProduction()
        .then(result => {
            if (result.skipped) {
                console.log('ℹ️  Setup saltado');
                process.exit(0);
            } else if (result.success) {
                console.log('✅ Setup exitoso');
                process.exit(0);
            } else {
                console.error('⚠️  Setup con errores:', result.error);
                // Salir con código 0 para no romper el deploy
                process.exit(0);
            }
        })
        .catch(err => {
            console.error('💥 Error fatal en setup:', err);
            // Salir con código 0 para no romper el deploy
            process.exit(0);
        });
}

module.exports = setupProduction;
