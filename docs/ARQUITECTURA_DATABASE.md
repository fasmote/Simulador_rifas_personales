# 🏗️ Arquitectura de Base de Datos - SimulaRifas

**Documento educativo:** Explica cómo funciona la capa de acceso a datos

---

## 📚 Índice

1. [Vista General](#vista-general)
2. [Patrón Adapter](#patrón-adapter)
3. [Pool de Conexiones](#pool-de-conexiones)
4. [Flujo de una Query](#flujo-de-una-query)
5. [Ejemplos de Código](#ejemplos-de-código)

---

## 🎯 Vista General

### Problema Original

```
┌─────────────────────────────────────┐
│     ANTES (Solo SQLite)             │
├─────────────────────────────────────┤
│                                     │
│  routes/rifas.js                    │
│      ↓                              │
│  database.js (SQLite)               │
│      ↓                              │
│  rifas.db (archivo)                 │
│                                     │
│  ❌ Problema en Vercel:             │
│     - Archivo .db se pierde         │
│     - Sin persistencia              │
│     - Datos se borran en cada deploy│
└─────────────────────────────────────┘
```

### Solución Implementada

```
┌──────────────────────────────────────────────────────────┐
│     DESPUÉS (SQLite + PostgreSQL)                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  routes/rifas.js, routes/auth.js                         │
│      ↓                                                   │
│  database/database.js (SWITCH AUTOMÁTICO)                │
│      ↓                                                   │
│  ┌──────────────────┬──────────────────┐               │
│  │                  │                  │               │
│  ▼                  ▼                  ▼               │
│  LOCAL:          PRODUCCIÓN:                           │
│  SQLite           PostgreSQL                            │
│  (rifas.db)       (Vercel Cloud)                        │
│                                                          │
│  ✅ Ventajas:                                            │
│     - Desarrollo rápido local                           │
│     - Producción persistente                            │
│     - Mismo código para ambos                           │
└──────────────────────────────────────────────────────────┘
```

---

## 🔌 Patrón Adapter (Interfaz Unificada)

### ¿Qué es un Adapter?

Un **adapter** es un patrón de diseño que permite que dos interfaces incompatibles trabajen juntas. En nuestro caso:

- **SQLite** y **PostgreSQL** tienen APIs diferentes
- Necesitamos una interfaz común para ambos
- El adapter traduce las llamadas a cada base de datos

### Implementación Visual

```
┌────────────────────────────────────────────────────────────┐
│                  INTERFAZ COMÚN                            │
│  (Lo que ve el código de las rutas)                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  runQuery(sql, params)    ← Insertar, actualizar, eliminar│
│  getQuery(sql, params)    ← Obtener UNA fila              │
│  allQuery(sql, params)    ← Obtener TODAS las filas       │
│                                                            │
└──────────────┬─────────────────────────┬───────────────────┘
               │                         │
               ▼                         ▼
     ┌──────────────────┐      ┌──────────────────┐
     │ SQLite Adapter   │      │ PostgreSQL       │
     │                  │      │ Adapter          │
     ├──────────────────┤      ├──────────────────┤
     │ db.run()         │      │ pool.connect()   │
     │ db.get()         │      │ client.query()   │
     │ db.all()         │      │ client.release() │
     │                  │      │                  │
     │ Callback-based   │      │ Promise-based    │
     │ ? placeholders   │      │ $1,$2,$3...      │
     │ Sync API         │      │ Async API        │
     └──────────────────┘      └──────────────────┘
```

### Código del Adapter

**backend/database/database.js:**

```javascript
// Detectar qué base de datos usar
const usePostgres = !!process.env.POSTGRES_URL;

if (usePostgres) {
    // ADAPTER PARA POSTGRESQL
    const pgConfig = require('./postgres-config');

    module.exports = {
        db: pgConfig.pool,
        runQuery: pgConfig.runQuery,    // ← Mismo nombre
        getQuery: pgConfig.getQuery,    // ← Mismo nombre
        allQuery: pgConfig.allQuery     // ← Mismo nombre
    };

} else {
    // ADAPTER PARA SQLITE
    const sqlite3 = require('sqlite3').verbose();

    module.exports = {
        db: /* ... */,
        runQuery: /* ... */,    // ← Mismo nombre
        getQuery: /* ... */,    // ← Mismo nombre
        allQuery: /* ... */     // ← Mismo nombre
    };
}
```

### Ventaja del Patrón

```javascript
// Este código funciona IDÉNTICO en ambos entornos:

const { runQuery, getQuery, allQuery } = require('./database/database');

// Insertar usuario
const result = await runQuery(
    'INSERT INTO users (username, email) VALUES (?, ?)',
    ['juan', 'juan@email.com']
);

// Buscar usuario
const user = await getQuery(
    'SELECT * FROM users WHERE id = ?',
    [result.id]
);

// Listar todos
const users = await allQuery('SELECT * FROM users');

// ✅ Funciona tanto con SQLite como con PostgreSQL
// ✅ Sin cambiar una sola línea de código
```

---

## 💧 Pool de Conexiones

### ¿Qué es un Connection Pool?

Un **pool** es un conjunto de conexiones a la base de datos que se reutilizan.

### Sin Pool (Ineficiente)

```
Request 1:  Abrir conexión → Query → Cerrar conexión
            ⏱️ 100ms total

Request 2:  Abrir conexión → Query → Cerrar conexión
            ⏱️ 100ms total

Request 3:  Abrir conexión → Query → Cerrar conexión
            ⏱️ 100ms total

❌ Problema: Abrir/cerrar es lento
❌ 50ms solo en handshake
```

### Con Pool (Eficiente)

```
Inicialización:
┌────────────────────────────────┐
│        CONNECTION POOL         │
│  ┌────┐ ┌────┐ ┌────┐         │
│  │ C1 │ │ C2 │ │ C3 │  ...    │
│  └────┘ └────┘ └────┘         │
└────────────────────────────────┘
    ↑       ↑       ↑
    │       │       │
    │       │       └──── Conexión disponible
    │       └──────────── Conexión en uso
    └──────────────────── Conexión disponible

Request 1:  Tomar C1 → Query → Devolver C1
            ⏱️ 5ms total

Request 2:  Tomar C2 → Query → Devolver C2
            ⏱️ 5ms total

Request 3:  Tomar C1 → Query → Devolver C1
            ⏱️ 5ms total (reutiliza C1)

✅ Ventaja: 20x más rápido
✅ Sin handshakes repetidos
```

### Configuración del Pool

```javascript
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,

    // Configuración de tamaño
    max: 10,                    // ← Máximo 10 conexiones simultáneas
    min: 2,                     // ← Mínimo 2 siempre abiertas

    // Timeouts
    idleTimeoutMillis: 30000,   // ← Cerrar después de 30s inactiva
    connectionTimeoutMillis: 10000, // ← Timeout para obtener conexión

    // SSL (requerido por Vercel)
    ssl: {
        rejectUnauthorized: false
    }
});
```

### Ciclo de Vida de una Conexión

```
┌─────────────────────────────────────────────────────────────┐
│  PASO 1: OBTENER CONEXIÓN                                   │
│  const client = await pool.connect();                       │
│                                                             │
│  Pool busca una conexión disponible:                        │
│  ┌────┐ ┌────┐ ┌────┐                                      │
│  │ C1 │ │ C2 │ │ C3 │                                      │
│  │ 🔓 │ │ 🔒 │ │ 🔓 │                                      │
│  └────┘ └────┘ └────┘                                      │
│    ↑             ↑                                          │
│    │             └── En uso                                 │
│    └── Disponible, se asigna a tu request                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PASO 2: EJECUTAR QUERY                                     │
│  const result = await client.query(sql, params);            │
│                                                             │
│  La query se ejecuta en C1:                                 │
│  SELECT * FROM users WHERE id = $1                          │
│                                                             │
│  C1 está bloqueada para otros requests                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PASO 3: LIBERAR CONEXIÓN                                   │
│  client.release();                                          │
│                                                             │
│  C1 vuelve al pool:                                         │
│  ┌────┐ ┌────┐ ┌────┐                                      │
│  │ C1 │ │ C2 │ │ C3 │                                      │
│  │ 🔓 │ │ 🔒 │ │ 🔓 │  ← C1 disponible de nuevo            │
│  └────┘ └────┘ └────┘                                      │
│                                                             │
│  ⚠️ IMPORTANTE: SIEMPRE liberar con release()               │
│     Sino el pool se agota y bloquea la app                  │
└─────────────────────────────────────────────────────────────┘
```

### Patrón Try/Finally (CRÍTICO)

```javascript
const runQuery = async (sql, params = []) => {
    // Obtener conexión del pool
    const client = await pool.connect();

    try {
        // Ejecutar query (puede fallar)
        const result = await client.query(sql, params);
        return result;

    } catch (err) {
        // Si hay error, lanzarlo
        throw err;

    } finally {
        // ⭐ SIEMPRE ejecuta, incluso si hubo error
        // ⭐ GARANTIZA que la conexión se devuelva al pool
        client.release();
    }
};
```

**¿Por qué `finally`?**

```javascript
// ❌ SIN FINALLY (Peligroso)
const client = await pool.connect();
const result = await client.query(sql, params);  // ← Si falla aquí...
client.release();  // ← ... esto NUNCA se ejecuta

// Resultado: Conexión perdida en el pool
// Después de 10 errores: Pool agotado, app bloqueada


// ✅ CON FINALLY (Seguro)
try {
    const result = await client.query(sql, params);  // ← Si falla aquí...
} finally {
    client.release();  // ← ... esto SÍ se ejecuta
}

// Resultado: Conexión siempre vuelve al pool
// App nunca se bloquea
```

---

## 🔄 Flujo de una Query Completo

### Ejemplo: Crear un usuario

```javascript
// En routes/auth.js
const { runQuery } = require('../database/database');

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Llamada a runQuery
    const result = await runQuery(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, hashedPassword]
    );

    res.json({ id: result.id });
});
```

### Flujo Detallado - Desarrollo Local (SQLite)

```
1. runQuery() llamado en route
   ↓
2. database.js detecta: NO hay POSTGRES_URL
   ↓
3. Usa implementación SQLite
   ↓
4. Llama a db.run() con placeholders ?
   ↓
5. SQLite ejecuta query directamente
   ↓
6. Retorna { lastID: 42, changes: 1 }
   ↓
7. Envuelve en { id: 42, changes: 1 }
   ↓
8. Retorna a la route
```

### Flujo Detallado - Producción (PostgreSQL)

```
1. runQuery() llamado en route
   ↓
2. database.js detecta: EXISTE POSTGRES_URL
   ↓
3. Usa implementación PostgreSQL (postgres-config.js)
   ↓
4. pool.connect() - Obtener conexión del pool
   ↓
5. convertPlaceholders() - Convertir ? a $1, $2, $3
   ↓
6. Detectar INSERT → Agregar RETURNING id
   ↓
7. client.query() - Ejecutar en PostgreSQL
   ↓
8. PostgreSQL retorna { rows: [{id: 42}], rowCount: 1 }
   ↓
9. Formatear a { id: 42, changes: 1 } (compatible con SQLite)
   ↓
10. client.release() - Devolver conexión al pool
    ↓
11. Retorna a la route
```

### Diagrama de Secuencia

```
Route          database.js      postgres-config.js    Pool        PostgreSQL
  │                │                   │               │               │
  │─ runQuery() ──>│                   │               │               │
  │                │                   │               │               │
  │                │─ Detecta env ────>│               │               │
  │                │                   │               │               │
  │                │                   │─ connect() ──>│               │
  │                │                   │               │               │
  │                │                   │<─ client C1 ──│               │
  │                │                   │               │               │
  │                │                   │─ query(sql) ─────────────────>│
  │                │                   │               │               │
  │                │                   │<─────────────────── result ───│
  │                │                   │               │               │
  │                │                   │─ release() ──>│               │
  │                │                   │               │               │
  │<────────────────────── result ─────│               │               │
  │                │                   │               │               │
```

---

## 💻 Ejemplos de Código Comentados

### Ejemplo 1: Conversión de Placeholders

```javascript
/**
 * Convierte placeholders de SQLite (?) a PostgreSQL ($1, $2, $3...)
 *
 * Entrada:  "SELECT * FROM users WHERE name = ? AND email = ?"
 * Salida:   "SELECT * FROM users WHERE name = $1 AND email = $2"
 */
const convertPlaceholders = (sql) => {
    let index = 0;  // Contador para $1, $2, $3...

    // regex /\?/g:
    //   \?  - Busca el caracter ? (escapado)
    //   g   - Global (todos los ?, no solo el primero)

    return sql.replace(/\?/g, () => {
        index++;              // Incrementa: 1, 2, 3...
        return `$${index}`;   // Retorna: $1, $2, $3...
    });
};

// Ejemplo de uso:
const sql = "SELECT * FROM users WHERE name = ? AND email = ?";
const pgSql = convertPlaceholders(sql);

console.log(pgSql);
// Output: "SELECT * FROM users WHERE name = $1 AND email = $2"
```

**¿Por qué necesitamos esto?**

- SQLite usa `?` para todos los parámetros (posicional)
- PostgreSQL usa `$1, $2, $3...` (numerados)
- Ventaja de PostgreSQL: puedes reutilizar parámetros

```sql
-- SQLite: tienes que repetir el valor
SELECT * FROM users WHERE name = ? OR email = ?
-- Parámetros: ['juan', 'juan']  ← Repetido

-- PostgreSQL: puedes reutilizar
SELECT * FROM users WHERE name = $1 OR email = $1
-- Parámetros: ['juan']  ← Solo una vez
```

---

### Ejemplo 2: Auto-agregar RETURNING id

```javascript
/**
 * PostgreSQL no retorna el ID automáticamente como SQLite.
 * Necesitamos agregar RETURNING id manualmente.
 */
const runQuery = async (sql, params = []) => {
    const client = await pool.connect();

    try {
        // Paso 1: Convertir placeholders
        const pgSql = convertPlaceholders(sql);

        // Paso 2: Detectar si es INSERT
        const isInsert = /^\s*INSERT\s+INTO/i.test(pgSql);
        //                  ^\s*     - Empieza con espacios opcionales
        //                  INSERT   - Palabra clave INSERT
        //                  \s+      - Al menos un espacio
        //                  INTO     - Palabra clave INTO
        //                  /i       - Case insensitive

        // Paso 3: Verificar si ya tiene RETURNING
        const hasReturning = /RETURNING/i.test(pgSql);

        // Paso 4: Si es INSERT sin RETURNING, agregarlo
        let finalSql = pgSql;
        if (isInsert && !hasReturning) {
            finalSql = pgSql + ' RETURNING id';
        }

        // Paso 5: Ejecutar
        const result = await client.query(finalSql, params);

        // Paso 6: Formatear resultado (compatible con SQLite)
        return {
            id: result.rows[0]?.id || null,     // ID del registro insertado
            changes: result.rowCount || 0        // Cantidad de filas afectadas
        };

    } finally {
        client.release();  // Siempre liberar
    }
};
```

**Ejemplo visual:**

```javascript
// Input (código en route):
await runQuery(
    'INSERT INTO users (username, email) VALUES (?, ?)',
    ['juan', 'juan@email.com']
);

// Transformaciones internas:
// 1. convertPlaceholders():
//    'INSERT INTO users (username, email) VALUES ($1, $2)'
//
// 2. Auto RETURNING:
//    'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING id'
//
// 3. Ejecutar en PostgreSQL:
//    result = { rows: [{id: 42}], rowCount: 1 }
//
// 4. Formatear salida:
//    { id: 42, changes: 1 }  ← Compatible con SQLite
```

---

### Ejemplo 3: Manejo de Errores

```javascript
/**
 * Ejemplo de error handling correcto con pool
 */
const getUserById = async (userId) => {
    // Obtener conexión
    const client = await pool.connect();

    try {
        // Intentar ejecutar query
        const result = await client.query(
            'SELECT * FROM users WHERE id = $1',
            [userId]
        );

        return result.rows[0];

    } catch (err) {
        // Capturar y manejar errores específicos

        if (err.code === '23505') {
            // Código de PostgreSQL: Unique violation
            throw new Error('El usuario ya existe');

        } else if (err.code === '23503') {
            // Código de PostgreSQL: Foreign key violation
            throw new Error('Referencia inválida');

        } else {
            // Error genérico
            console.error('Error en query:', err);
            throw err;
        }

    } finally {
        // SIEMPRE ejecuta, incluso si catch() lanzó error
        client.release();
        console.log('Conexión devuelta al pool');
    }
};
```

**Códigos de error comunes de PostgreSQL:**

| Código | Significado | SQLite Equivalente |
|--------|-------------|-------------------|
| `23505` | Unique violation | `UNIQUE constraint failed` |
| `23503` | Foreign key violation | `FOREIGN KEY constraint failed` |
| `42P01` | Table not found | `no such table` |
| `42703` | Column not found | `no such column` |
| `08006` | Connection failure | N/A |

---

## 🎓 Conceptos Clave - Resumen

### 1. Adapter Pattern
- Interfaz común para múltiples implementaciones
- Permite cambiar la DB sin cambiar el código

### 2. Connection Pooling
- Reutilización de conexiones
- 20x más rápido que abrir/cerrar cada vez
- Esencial para aplicaciones con múltiples requests

### 3. Try/Finally
- Garantiza liberación de recursos
- Previene memory leaks
- Patrón fundamental en manejo de conexiones

### 4. Environment Detection
- `process.env` para configuración
- Diferentes comportamientos según entorno
- Dev vs Producción sin cambios de código

### 5. SQL Dialect Translation
- Cada DB tiene su sintaxis
- Conversión automática de placeholders
- Abstracción de diferencias

---

## 📚 Recursos de Aprendizaje

### Tutoriales Recomendados

1. **Node.js Database Patterns**
   - Connection pooling
   - Transaction management
   - Error handling

2. **PostgreSQL para Principiantes**
   - Tipos de datos
   - Índices y performance
   - Funciones de fecha/hora

3. **Design Patterns**
   - Adapter Pattern
   - Repository Pattern
   - Factory Pattern

### Libros

- "Node.js Design Patterns" - Mario Casciaro
- "PostgreSQL: Up and Running" - Regina Obe
- "Refactoring Databases" - Scott Ambler

---

**Autor:** Claude Code
**Proyecto:** SimulaRifas Personal
**Fecha:** 12/11/2025
**Versión:** 1.0
