// Migración para agregar campos de seguridad
// FASE 9: Verificación de email y recuperación de contraseña

const { runQuery, getQuery } = require('./database');

async function migrate() {
    console.log('🔄 Iniciando migración de seguridad...');

    try {
        // 1. Agregar campos de verificación a users
        console.log('📝 Agregando campos de verificación a tabla users...');

        // Verificar si los campos ya existen
        const userInfo = await getQuery("PRAGMA table_info(users)");

        // Intentar agregar cada campo (ignorar error si ya existe)
        const fieldsToAdd = [
            { name: 'email_verified', type: 'INTEGER DEFAULT 0' },
            { name: 'verification_token', type: 'TEXT' },
            { name: 'verification_expires', type: 'TEXT' }
        ];

        for (const field of fieldsToAdd) {
            try {
                await runQuery(`ALTER TABLE users ADD COLUMN ${field.name} ${field.type}`);
                console.log(`  ✅ Campo ${field.name} agregado`);
            } catch (error) {
                if (error.message.includes('duplicate column')) {
                    console.log(`  ⚠️ Campo ${field.name} ya existe`);
                } else {
                    throw error;
                }
            }
        }

        // 2. Crear tabla de password_resets
        console.log('📝 Creando tabla password_resets...');

        await runQuery(`
            CREATE TABLE IF NOT EXISTS password_resets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token TEXT NOT NULL UNIQUE,
                expires_at TEXT NOT NULL,
                used INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        console.log('  ✅ Tabla password_resets creada');

        // 3. Crear índices para mejor rendimiento
        console.log('📝 Creando índices...');

        try {
            await runQuery('CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token)');
            await runQuery('CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token)');
            await runQuery('CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets(user_id)');
            console.log('  ✅ Índices creados');
        } catch (error) {
            console.log('  ⚠️ Algunos índices ya existían');
        }

        // 4. Marcar usuarios existentes como verificados (para no bloquearlos)
        console.log('📝 Marcando usuarios existentes como verificados...');
        await runQuery('UPDATE users SET email_verified = 1 WHERE email_verified IS NULL OR email_verified = 0');
        console.log('  ✅ Usuarios existentes marcados como verificados');

        console.log('\n✅ Migración de seguridad completada exitosamente');
        console.log('\n📋 Resumen:');
        console.log('  - Campos de verificación agregados a users');
        console.log('  - Tabla password_resets creada');
        console.log('  - Índices creados para mejor rendimiento');
        console.log('  - Usuarios existentes marcados como verificados');

    } catch (error) {
        console.error('❌ Error en migración:', error);
        throw error;
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    migrate()
        .then(() => {
            console.log('\n🎉 Migración completada');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Error fatal:', error);
            process.exit(1);
        });
}

module.exports = migrate;
