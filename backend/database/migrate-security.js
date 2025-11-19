// Migración para agregar campos de seguridad
// FASE 9: Verificación de email y recuperación de contraseña

const { runQuery, getQuery } = require('./database');

// Detectar si estamos usando PostgreSQL
const usePostgres = !!process.env.POSTGRES_URL;

async function migrate() {
    console.log('🔄 Iniciando migración de seguridad...');

    try {
        // 1. Agregar campos de verificación a users
        console.log('📝 Agregando campos de verificación a tabla users...');

        // Definir tipos según la base de datos
        const intType = usePostgres ? 'INTEGER' : 'INTEGER';
        const textType = usePostgres ? 'TEXT' : 'TEXT';

        // Intentar agregar cada campo (ignorar error si ya existe)
        const fieldsToAdd = [
            { name: 'email_verified', type: `${intType} DEFAULT 0` },
            { name: 'verification_token', type: textType },
            { name: 'verification_expires', type: textType }
        ];

        for (const field of fieldsToAdd) {
            try {
                await runQuery(`ALTER TABLE users ADD COLUMN ${field.name} ${field.type}`);
                console.log(`  ✅ Campo ${field.name} agregado`);
            } catch (error) {
                // Manejar errores de columna duplicada para SQLite y PostgreSQL
                if (error.message.includes('duplicate column') ||
                    error.message.includes('already exists') ||
                    error.code === '42701') {
                    console.log(`  ⚠️ Campo ${field.name} ya existe`);
                } else {
                    throw error;
                }
            }
        }

        // 2. Crear tabla de password_resets
        console.log('📝 Creando tabla password_resets...');

        // Usar SERIAL para PostgreSQL, AUTOINCREMENT para SQLite
        const createTableSQL = usePostgres
            ? `CREATE TABLE IF NOT EXISTS password_resets (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                token TEXT NOT NULL UNIQUE,
                expires_at TEXT NOT NULL,
                used INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`
            : `CREATE TABLE IF NOT EXISTS password_resets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token TEXT NOT NULL UNIQUE,
                expires_at TEXT NOT NULL,
                used INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`;

        await runQuery(createTableSQL);
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
