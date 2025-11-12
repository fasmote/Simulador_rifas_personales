# 🐘 Guía Completa: Migración SQLite → PostgreSQL

**Fecha:** 12/11/2025
**Objetivo:** Migrar de SQLite (local) a Vercel Postgres (producción)
**Estrategia:** Compatibilidad dual - funciona con ambas bases de datos automáticamente

---

## 📚 Tabla de Contenidos

1. [¿Por qué migrar?](#por-qué-migrar)
2. [Diferencias clave SQLite vs PostgreSQL](#diferencias-clave)
3. [Arquitectura de la solución](#arquitectura)
4. [Pasos de la migración](#pasos-realizados)
5. [Cambios en el código - Explicados](#cambios-explicados)
6. [Cómo funciona el switch automático](#switch-automático)
7. [Testing y verificación](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 ¿Por qué migrar?

### Problema con SQLite en Vercel
```
❌ SQLite usa archivos en disco (.db)
❌ Vercel usa funciones serverless (sin estado)
❌ Cada request crea un nuevo contenedor
❌ No hay persistencia entre requests
❌ Los datos se pierden después de cada deploy
```

### Solución: PostgreSQL
```
✅ Base de datos en la nube (separada del código)
✅ Persistencia garantizada
✅ Múltiples conexiones simultáneas
✅ Mejor rendimiento en producción
✅ Escalabilidad horizontal
```

---

## 🔍 Diferencias Clave SQLite vs PostgreSQL

### 1. **Tipos de Datos - Primary Keys**

**SQLite:**
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50)
);
```

**PostgreSQL:**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50)
);
```

**¿Qué cambia?**
- `INTEGER PRIMARY KEY AUTOINCREMENT` → `SERIAL PRIMARY KEY`
- `SERIAL` es un tipo especial de PostgreSQL
- Equivale a `INTEGER` con una secuencia auto-incrementable
- PostgreSQL maneja la secuencia automáticamente

---

### 2. **Tipos de Datos - Fechas**

**SQLite:**
```sql
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

**PostgreSQL:**
```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**¿Qué cambia?**
- `DATETIME` → `TIMESTAMP`
- PostgreSQL es más estricto con tipos de datos
- `TIMESTAMP` soporta zonas horarias (timezone-aware)
- Mejor para aplicaciones internacionales

---

### 3. **INSERT con Conflictos**

**SQLite:**
```sql
INSERT OR IGNORE INTO rifas (title, description)
VALUES ('iPhone 15', 'Sorteo demo');
```

**PostgreSQL:**
```sql
INSERT INTO rifas (title, description)
VALUES ('iPhone 15', 'Sorteo demo')
ON CONFLICT DO NOTHING;
```

**¿Qué cambia?**
- `INSERT OR IGNORE` → `INSERT ... ON CONFLICT DO NOTHING`
- Sintaxis más explícita en PostgreSQL
- Más control sobre qué hacer en conflictos
- Puedes usar `ON CONFLICT DO UPDATE` para upserts

---

### 4. **Funciones de Agregación**

**SQLite:**
```sql
SELECT
    participant_name,
    GROUP_CONCAT(number ORDER BY number) as numbers_list
FROM rifa_numbers
GROUP BY participant_name;
```

**PostgreSQL:**
```sql
SELECT
    participant_name,
    STRING_AGG(number::text, ',' ORDER BY number) as numbers_list
FROM rifa_numbers
GROUP BY participant_name;
```

**¿Qué cambia?**
- `GROUP_CONCAT()` → `STRING_AGG()`
- Necesitas cast a texto: `number::text`
- Separador como segundo parámetro: `','`
- Orden dentro de la función: `ORDER BY number`

---

### 5. **Funciones de Fecha/Hora**

**SQLite:**
```sql
-- Fecha actual
datetime('now')

-- Restar horas
datetime('now', '-72 hours')

-- Convertir a local
datetime(selected_at, 'localtime')
```

**PostgreSQL:**
```sql
-- Fecha actual
NOW() o CURRENT_TIMESTAMP

-- Restar horas
NOW() - INTERVAL '72 hours'
-- o con variable:
NOW() - INTERVAL '1 hour' * 72

-- Timezone (PostgreSQL lo maneja automáticamente)
selected_at AT TIME ZONE 'America/Argentina/Buenos_Aires'
```

**¿Qué cambia?**
- Sintaxis completamente diferente para fechas
- PostgreSQL tiene mejor soporte para timezones
- `INTERVAL` es muy poderoso y flexible
- Puedes multiplicar intervalos: `INTERVAL '1 hour' * variable`

---

### 6. **RETURNING en INSERT**

**SQLite:**
```javascript
const result = await db.run('INSERT INTO users (name) VALUES (?)', ['Juan']);
console.log(result.lastID); // ID del registro insertado
```

**PostgreSQL:**
```sql
INSERT INTO users (name) VALUES ($1) RETURNING id;
```

**¿Qué cambia?**
- SQLite retorna `lastID` automáticamente
- PostgreSQL necesita `RETURNING id` explícito
- Nuestra solución: agregarlo automáticamente en `runQuery()`
- Más control: puedes retornar cualquier columna

---

### 7. **Placeholders de Parámetros**

**SQLite:**
```sql
SELECT * FROM users WHERE username = ? AND email = ?
-- Usa ? para todos los parámetros
```

**PostgreSQL:**
```sql
SELECT * FROM users WHERE username = $1 AND email = $2
-- Usa $1, $2, $3... para cada parámetro
```

**¿Qué cambia?**
- `?` → `$1, $2, $3...`
- PostgreSQL numera cada placeholder
- Ventaja: puedes reutilizar: `WHERE name = $1 OR email = $1`
- Nuestra solución: conversión automática en `convertPlaceholders()`

---

## 🏗️ Arquitectura de la Solución

### Diagrama de Flujo

```
┌─────────────────────────────────────────┐
│         backend/database/               │
│           database.js                   │
│  (Punto de entrada único)               │
└─────────────────┬───────────────────────┘
                  │
                  │ Detecta: process.env.POSTGRES_URL
                  │
         ┌────────┴────────┐
         │                 │
    ¿Existe?          ¿No existe?
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌─────────────────┐
│   PostgreSQL    │  │     SQLite      │
│  (Producción)   │  │   (Desarrollo)  │
│                 │  │                 │
│ postgres-config │  │  Código nativo  │
│      .js        │  │    sqlite3      │
└─────────────────┘  └─────────────────┘
         │                 │
         └────────┬────────┘
                  │
                  ▼
    ┌─────────────────────────┐
    │  Misma interfaz API:    │
    │  - runQuery()           │
    │  - getQuery()           │
    │  - allQuery()           │
    └─────────────────────────┘
```

### Flujo de una Query

```javascript
// 1. El código hace una query (sin saber qué DB usa)
const users = await allQuery('SELECT * FROM users WHERE id = ?', [123]);

// 2. database.js detecta la DB automáticamente
if (process.env.POSTGRES_URL) {
    // → PostgreSQL
} else {
    // → SQLite
}

// 3. Si es PostgreSQL:
//    a. Convierte ? → $1
//    b. Ejecuta en el pool de conexiones
//    c. Formatea resultado para compatibilidad

// 4. Si es SQLite:
//    a. Ejecuta directamente con ?
//    b. Retorna resultado estándar

// 5. El código recibe la respuesta (idéntica en ambos casos)
```

---

## 🔧 Pasos Realizados

### PASO 0: Preparación (Usuario)
```bash
# Crear base de datos en Vercel Dashboard
1. Ir a tu proyecto en Vercel
2. Tab "Storage"
3. Create Database → Postgres
4. Verificar que aparecen las variables de entorno
```

Variables creadas automáticamente:
```bash
POSTGRES_URL="postgresql://user:pass@host:5432/db"
POSTGRES_PRISMA_URL="..."
POSTGRES_URL_NON_POOLING="..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."
```

---

### PASO 1: Instalar Dependencia

**Archivo:** `backend/package.json`

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "sqlite3": "^5.1.6",
    "pg": "^8.11.3",        // ← NUEVO: Driver de PostgreSQL
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  }
}
```

**¿Qué es `pg`?**
- Driver oficial de Node.js para PostgreSQL
- Maneja conexiones, queries, y pooling
- Soporta promesas y async/await
- Muy usado y bien mantenido

---

### PASO 2: Configuración de PostgreSQL

**Archivo:** `backend/database/postgres-config.js`

#### Pool de Conexiones

```javascript
const { Pool } = require('pg');

// Pool = conjunto de conexiones reutilizables
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
        rejectUnauthorized: false // Vercel requiere SSL
    },
    max: 10,                    // Máximo 10 conexiones simultáneas
    idleTimeoutMillis: 30000,   // Cerrar conexiones inactivas después de 30s
    connectionTimeoutMillis: 10000 // Timeout de conexión: 10s
});
```

**¿Por qué usar Pool?**
- ✅ Reutiliza conexiones (más rápido)
- ✅ Evita abrir/cerrar en cada query
- ✅ Limita conexiones simultáneas
- ✅ Esencial para serverless (Vercel)

---

#### Función: runQuery()

```javascript
const runQuery = async (sql, params = []) => {
    const client = await pool.connect(); // Obtener conexión del pool

    try {
        // 1. Convertir placeholders: ? → $1, $2, $3...
        const pgSql = convertPlaceholders(sql);

        // 2. Detectar si es INSERT
        const isInsert = /^\s*INSERT\s+INTO/i.test(pgSql);
        const hasReturning = /RETURNING/i.test(pgSql);

        // 3. Auto-agregar RETURNING id (compatibilidad con SQLite)
        let finalSql = pgSql;
        if (isInsert && !hasReturning) {
            finalSql = pgSql + ' RETURNING id';
        }

        // 4. Ejecutar query
        const result = await client.query(finalSql, params);

        // 5. Retornar en formato compatible con SQLite
        return {
            id: result.rows[0]?.id || null,      // ID del registro insertado
            changes: result.rowCount || 0         // Cantidad de filas afectadas
        };

    } finally {
        client.release(); // IMPORTANTE: devolver conexión al pool
    }
};
```

**Conceptos clave:**

1. **Pool.connect()** - Obtiene una conexión
2. **client.query()** - Ejecuta la query
3. **client.release()** - CRÍTICO: devuelve la conexión al pool
4. **Auto RETURNING id** - Para compatibilidad con SQLite
5. **Try/finally** - Garantiza que release() se ejecute siempre

---

#### Función: convertPlaceholders()

```javascript
const convertPlaceholders = (sql) => {
    let index = 0;
    return sql.replace(/\?/g, () => `$${++index}`);
};
```

**Ejemplo de conversión:**
```javascript
// Entrada
"SELECT * FROM users WHERE name = ? AND email = ?"

// Salida
"SELECT * FROM users WHERE name = $1 AND email = $2"
```

**¿Cómo funciona?**
1. Usa regex `/\?/g` para encontrar todos los `?`
2. `++index` incrementa el contador antes de usarlo
3. Reemplaza cada `?` con `$1`, `$2`, `$3`...

---

### PASO 3: Actualizar Queries SQL

#### backend/database/init.js

**Tabla de Usuarios - ANTES (SQLite):**
```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Tabla de Usuarios - DESPUÉS (PostgreSQL):**
```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Cambios:**
- `INTEGER PRIMARY KEY AUTOINCREMENT` → `SERIAL PRIMARY KEY`
- `DATETIME` → `TIMESTAMP`

---

#### backend/routes/rifas.js

**Query de Participantes - ANTES (SQLite):**
```sql
SELECT
    participant_name,
    MIN(selected_at) as first_participation,
    COUNT(*) as total_numbers,
    GROUP_CONCAT(number ORDER BY number) as numbers_list
FROM rifa_numbers
WHERE rifa_id = ?
GROUP BY participant_name
ORDER BY first_participation ASC
```

**Query de Participantes - DESPUÉS (PostgreSQL):**
```sql
SELECT
    participant_name,
    MIN(selected_at) as first_participation,
    COUNT(*) as total_numbers,
    STRING_AGG(number::text, ',' ORDER BY number) as numbers_list
FROM rifa_numbers
WHERE rifa_id = ?
GROUP BY participant_name
ORDER BY first_participation ASC
```

**Cambios:**
- `GROUP_CONCAT(number ORDER BY number)` → `STRING_AGG(number::text, ',' ORDER BY number)`
- Cast a texto: `number::text`
- Separador explícito: `','`

---

#### backend/database/demo-content.js

**Insert con fecha - ANTES (SQLite):**
```sql
INSERT INTO rifas (user_id, title, created_at)
VALUES (?, ?, datetime('now'))
```

**Insert con fecha - DESPUÉS (PostgreSQL):**
```sql
INSERT INTO rifas (user_id, title, created_at)
VALUES (?, ?, CURRENT_TIMESTAMP)
RETURNING id
```

**Fecha relativa - ANTES (SQLite):**
```sql
INSERT INTO rifa_numbers (rifa_id, number, selected_at)
VALUES (?, ?, datetime('now', '-72 hours'))
```

**Fecha relativa - DESPUÉS (PostgreSQL):**
```javascript
const horasAtras = 72;
await runQuery(`
    INSERT INTO rifa_numbers (rifa_id, number, selected_at)
    VALUES (?, ?, NOW() - INTERVAL '1 hour' * ?)
`, [rifaId, numero, horasAtras]);
```

**Cambios:**
- `datetime('now')` → `CURRENT_TIMESTAMP` o `NOW()`
- `datetime('now', '-X hours')` → `NOW() - INTERVAL '1 hour' * X`
- `RETURNING id` agregado explícitamente

---

### PASO 4: Switch Automático

**Archivo:** `backend/database/database.js`

```javascript
/**
 * Este archivo detecta automáticamente qué base de datos usar
 */

// Detectar si existe POSTGRES_URL en variables de entorno
const usePostgres = !!process.env.POSTGRES_URL;

if (usePostgres) {
    // 🐘 PRODUCCIÓN: Usar PostgreSQL
    console.log('🐘 Usando PostgreSQL (Vercel Postgres)');

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
    // 📁 DESARROLLO LOCAL: Usar SQLite
    console.log('📁 Usando SQLite (desarrollo local)');

    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');

    const dbPath = path.join(__dirname, 'rifas.db');

    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ Error conectando a SQLite:', err.message);
            return;
        }
        console.log('✅ Conectado a la base de datos SQLite.');
    });

    // Funciones para SQLite (código original)
    const runQuery = (sql, params = []) => { /* ... */ };
    const getQuery = (sql, params = []) => { /* ... */ };
    const allQuery = (sql, params = []) => { /* ... */ };

    module.exports = {
        db,
        runQuery,
        getQuery,
        allQuery
    };
}
```

**¿Cómo funciona?**

1. **Detección automática:**
   ```javascript
   const usePostgres = !!process.env.POSTGRES_URL;
   ```
   - En Vercel: `POSTGRES_URL` existe → PostgreSQL
   - En local: `POSTGRES_URL` no existe → SQLite

2. **Misma interfaz:**
   - Ambas ramas exportan las mismas funciones
   - El código que usa `runQuery()` funciona sin cambios
   - Zero modificaciones en routes/controllers

3. **Ventajas:**
   - ✅ Desarrollo local con SQLite (más rápido)
   - ✅ Producción con PostgreSQL (persistente)
   - ✅ Sin duplicar código de rutas
   - ✅ Fácil testing

---

## 🧪 Testing y Verificación

### Testing Local (SQLite)

```bash
# 1. Asegúrate de NO tener POSTGRES_URL en .env local
cd backend
cat .env  # Verificar que no existe POSTGRES_URL

# 2. Inicializar base de datos
node database/init.js

# 3. Deberías ver:
# 📁 Usando SQLite (desarrollo local)
# ✅ Conectado a la base de datos SQLite.
# 🔨 Inicializando base de datos - Fase 12...

# 4. Levantar servidor
npm start

# 5. Verificar en logs:
# 📁 Usando SQLite (desarrollo local)
```

---

### Testing en Vercel (PostgreSQL)

```bash
# 1. Variables de entorno ya configuradas en Vercel
# 2. Deploy tu código
vercel --prod

# 3. Verificar logs en Vercel Dashboard:
# 🐘 Usando PostgreSQL (Vercel Postgres)
# ✅ Nueva conexión establecida con PostgreSQL

# 4. Probar endpoints:
curl https://tu-app.vercel.app/api/rifas

# 5. Verificar que los datos persisten entre requests
```

---

### Verificar Conexión a PostgreSQL

```javascript
// Agregar en backend/app.js después de inicializar
const { testConnection } = require('./database/database');

// Solo si estamos usando PostgreSQL
if (process.env.POSTGRES_URL) {
    testConnection().then(success => {
        if (success) {
            console.log('✅ PostgreSQL connection test passed');
        } else {
            console.error('❌ PostgreSQL connection test failed');
        }
    });
}
```

---

## 🔧 Troubleshooting

### Error: "permission denied for schema public"

**Problema:**
```
ERROR: permission denied for schema public
```

**Solución:**
```sql
-- Conectar a la DB como administrador
GRANT ALL ON SCHEMA public TO tu_usuario;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tu_usuario;
```

---

### Error: "SSL connection required"

**Problema:**
```
ERROR: no pg_hba.conf entry for host
```

**Solución:** Ya está configurado en `postgres-config.js`
```javascript
ssl: {
    rejectUnauthorized: false
}
```

---

### Error: "Connection pool exhausted"

**Problema:**
```
ERROR: remaining connection slots are reserved
```

**Solución:** Reducir max connections
```javascript
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    max: 5,  // Reducir de 10 a 5
    // ...
});
```

---

### Error: "Syntax error near ?"

**Problema:**
```
ERROR: syntax error at or near "$"
```

**Causa:** No se están convirtiendo los placeholders

**Solución:** Verificar que usas las funciones de `database.js`:
```javascript
// ✅ CORRECTO
const { runQuery } = require('./database/database');
await runQuery('SELECT * FROM users WHERE id = ?', [123]);

// ❌ INCORRECTO
const { pool } = require('./database/postgres-config');
await pool.query('SELECT * FROM users WHERE id = ?', [123]);
```

---

### Debugging: Ver queries ejecutadas

```javascript
// En postgres-config.js, agregar logging
const runQuery = async (sql, params = []) => {
    const client = await pool.connect();
    try {
        const pgSql = convertPlaceholders(sql);

        // 🔍 LOG PARA DEBUGGING
        console.log('🔍 SQL:', pgSql);
        console.log('📝 Params:', params);

        const result = await client.query(pgSql, params);

        // 🔍 LOG RESULTADO
        console.log('✅ Rows affected:', result.rowCount);

        return { id: result.rows[0]?.id || null, changes: result.rowCount || 0 };
    } finally {
        client.release();
    }
};
```

---

## 📊 Resumen de Cambios

### Archivos Creados
```
backend/
├── database/
│   ├── postgres-config.js        ← NUEVO (176 líneas)
│   └── .env.example              ← NUEVO (documentación)
└── package.json                  ← MODIFICADO (+ pg dependency)
```

### Archivos Modificados
```
backend/
├── database/
│   ├── database.js               ← REFACTOR completo (switch automático)
│   ├── init.js                   ← Queries SQL actualizadas
│   ├── demo-content.js           ← Queries SQL actualizadas
│   └── sample-data.js            ← Error handling mejorado
└── routes/
    └── rifas.js                  ← Queries SQL actualizadas
```

### Líneas de Código
- **Nuevas:** ~200 líneas (postgres-config.js + .env.example)
- **Modificadas:** ~150 líneas (queries SQL actualizadas)
- **Refactorizadas:** ~90 líneas (database.js switch)
- **Total:** ~440 líneas

---

## ✅ Checklist de Migración

- [x] PASO 0: Crear base de datos en Vercel
- [x] PASO 1: Instalar dependencia `pg`
- [x] PASO 2: Crear `postgres-config.js`
- [x] PASO 3: Actualizar queries SQL
- [x] PASO 4: Implementar switch automático
- [ ] PASO 5: Testing en producción
- [ ] PASO 6: Monitoreo de performance
- [ ] PASO 7: Backup strategy

---

## 🎓 Conceptos Aprendidos

1. **Connection Pooling** - Reutilización de conexiones de DB
2. **Serverless Constraints** - Limitaciones de funciones sin estado
3. **SQL Dialects** - Diferencias entre SQLite y PostgreSQL
4. **Environment-based Configuration** - Configuración según entorno
5. **Adapter Pattern** - Interfaz unificada para múltiples implementaciones
6. **Prepared Statements** - Seguridad contra SQL injection
7. **Transaction Management** - Pool connections y release
8. **Type Casting** - Conversiones de tipos en PostgreSQL

---

## 📚 Recursos Adicionales

- [PostgreSQL Official Docs](https://www.postgresql.org/docs/)
- [node-postgres (pg) Documentation](https://node-postgres.com/)
- [Vercel Postgres Guide](https://vercel.com/docs/storage/vercel-postgres)
- [SQLite vs PostgreSQL Comparison](https://www.sqlite.org/whentouse.html)

---

**Autor:** Claude Code
**Proyecto:** SimulaRifas Personal
**Última actualización:** 12/11/2025
