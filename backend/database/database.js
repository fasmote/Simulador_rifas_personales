/**
 * Database connection handler
 * Automatically switches between PostgreSQL (Vercel) and SQLite (local development)
 */

// Detectar si estamos usando PostgreSQL (Vercel) o SQLite (local)
const usePostgres = !!process.env.POSTGRES_URL;

if (usePostgres) {
    console.log('🐘 Usando PostgreSQL (Vercel Postgres)');

    // Exportar funciones de PostgreSQL
    const pgConfig = require('./postgres-config');

    module.exports = {
        db: pgConfig.pool,
        runQuery: pgConfig.runQuery,
        getQuery: pgConfig.getQuery,
        allQuery: pgConfig.allQuery,
        testConnection: pgConfig.testConnection,
        closePool: pgConfig.closePool
    };

} else {
    console.log('📁 Usando SQLite (desarrollo local)');

    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');

    const dbPath = path.join(__dirname, 'rifas.db');

    // Crear conexión a la base de datos
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ Error conectando a SQLite:', err.message);
            return;
        }
        console.log('✅ Conectado a la base de datos SQLite.');
    });

    // Función para ejecutar queries con promesas
    const runQuery = (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    };

    // Función para obtener una fila
    const getQuery = (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    };

    // Función para obtener múltiples filas
    const allQuery = (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    };

    module.exports = {
        db,
        runQuery,
        getQuery,
        allQuery
    };
}
