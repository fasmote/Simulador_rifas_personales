/**
 * Configuración de PostgreSQL para Vercel
 * Este archivo maneja la conexión a Vercel Postgres usando variables de entorno
 */

const { Pool } = require('pg');

// Crear pool de conexiones usando las variables de entorno de Vercel
// Vercel proporciona automáticamente: POSTGRES_URL, POSTGRES_HOST, etc.
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
        rejectUnauthorized: false // Requerido para Vercel Postgres
    },
    // Configuración de pool para serverless
    max: 10, // Máximo de conexiones
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

// Event listeners para debugging
pool.on('connect', () => {
    console.log('✅ Nueva conexión establecida con PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
});

/**
 * Función para ejecutar queries de modificación (INSERT, UPDATE, DELETE)
 * Compatible con la interfaz de SQLite
 * @param {string} sql - Query SQL
 * @param {Array} params - Parámetros para la query
 * @returns {Promise} - Retorna { id, changes }
 */
const runQuery = async (sql, params = []) => {
    const client = await pool.connect();
    try {
        // Convertir ? a $1, $2, etc. (sintaxis PostgreSQL)
        const pgSql = convertPlaceholders(sql);

        // Agregar RETURNING id automáticamente a INSERT si no existe
        const isInsert = /^\s*INSERT\s+INTO/i.test(pgSql);
        const hasReturning = /RETURNING/i.test(pgSql);

        let finalSql = pgSql;
        if (isInsert && !hasReturning) {
            finalSql = pgSql + ' RETURNING id';
        }

        const result = await client.query(finalSql, params);

        // Mantener compatibilidad con SQLite
        return {
            id: result.rows[0]?.id || null,
            changes: result.rowCount || 0
        };
    } catch (err) {
        console.error('❌ Error en runQuery:', err.message);
        throw err;
    } finally {
        client.release();
    }
};

/**
 * Función para obtener una sola fila (SELECT con límite 1)
 * Compatible con la interfaz de SQLite
 * @param {string} sql - Query SQL
 * @param {Array} params - Parámetros para la query
 * @returns {Promise} - Retorna una fila o undefined
 */
const getQuery = async (sql, params = []) => {
    const client = await pool.connect();
    try {
        // Convertir ? a $1, $2, etc.
        const pgSql = convertPlaceholders(sql);
        const result = await client.query(pgSql, params);

        return result.rows[0]; // Retorna la primera fila o undefined
    } catch (err) {
        console.error('❌ Error en getQuery:', err.message);
        throw err;
    } finally {
        client.release();
    }
};

/**
 * Función para obtener múltiples filas (SELECT)
 * Compatible con la interfaz de SQLite
 * @param {string} sql - Query SQL
 * @param {Array} params - Parámetros para la query
 * @returns {Promise} - Retorna array de filas
 */
const allQuery = async (sql, params = []) => {
    const client = await pool.connect();
    try {
        // Convertir ? a $1, $2, etc.
        const pgSql = convertPlaceholders(sql);
        const result = await client.query(pgSql, params);

        return result.rows; // Retorna todas las filas
    } catch (err) {
        console.error('❌ Error en allQuery:', err.message);
        throw err;
    } finally {
        client.release();
    }
};

/**
 * Convierte placeholders de SQLite (?) a PostgreSQL ($1, $2, etc.)
 * @param {string} sql - Query SQL con placeholders ?
 * @returns {string} - Query SQL con placeholders $1, $2, etc.
 */
const convertPlaceholders = (sql) => {
    let index = 0;
    return sql.replace(/\?/g, () => `$${++index}`);
};

/**
 * Función para cerrar el pool (útil para testing)
 */
const closePool = async () => {
    await pool.end();
    console.log('🔒 Pool de PostgreSQL cerrado');
};

/**
 * Health check de la conexión
 */
const testConnection = async () => {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('✅ Conexión a PostgreSQL exitosa:', result.rows[0].now);
        return true;
    } catch (err) {
        console.error('❌ Error al conectar con PostgreSQL:', err.message);
        return false;
    }
};

module.exports = {
    pool,
    runQuery,
    getQuery,
    allQuery,
    closePool,
    testConnection
};
