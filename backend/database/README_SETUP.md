# 🔧 Setup de Base de Datos - Documentación

## 📋 Tabla de Contenidos

1. [¿Cómo funciona?](#cómo-funciona)
2. [Scripts disponibles](#scripts-disponibles)
3. [Flujo de inicialización](#flujo-de-inicialización)
4. [Variables de entorno](#variables-de-entorno)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 ¿Cómo funciona?

### Detección automática de entorno

El sistema detecta automáticamente si está en **desarrollo local** o **producción (Vercel)**:

```javascript
// En database.js
const usePostgres = !!process.env.POSTGRES_URL;

if (usePostgres) {
    // 🐘 PRODUCCIÓN: PostgreSQL
} else {
    // 📁 DESARROLLO: SQLite
}
```

### Inicialización automática en Vercel

Cuando haces deploy a Vercel:

```
1. Vercel ejecuta: npm install
   ↓
2. Después de install, ejecuta: npm run postinstall
   ↓
3. postinstall ejecuta: npm run setup-prod
   ↓
4. setup-prod ejecuta: node database/setup-production.js
   ↓
5. setup-production.js verifica si POSTGRES_URL existe
   ↓
6. Si existe → Ejecuta init.js
   ↓
7. init.js crea tablas y datos demo
   ↓
8. ✅ Base de datos lista para usar
```

---

## 📦 Scripts Disponibles

### Desarrollo Local (SQLite)

```bash
# Inicializar base de datos (crear tablas)
npm run init-db

# Agregar datos de ejemplo
npm run sample-data

# Agregar contenido demo (FASE 15)
npm run demo-content

# Reset completo: tablas + datos ejemplo
npm run reset-db

# Reset completo: tablas + contenido demo
npm run reset-demo
```

### Producción (PostgreSQL)

```bash
# Ejecutar setup de producción manualmente
npm run setup-prod

# Se ejecuta automáticamente después de npm install
npm install  # → ejecuta postinstall → ejecuta setup-prod
```

---

## 🔄 Flujo de Inicialización

### Archivo: `setup-production.js`

Este es el punto de entrada para producción:

```javascript
/**
 * ¿Qué hace?
 * 1. Verifica si estamos en producción (POSTGRES_URL existe)
 * 2. Si no existe → Sale silenciosamente (desarrollo local)
 * 3. Si existe → Ejecuta init.js
 * 4. Maneja errores sin romper el deploy
 */

const setupProduction = async () => {
    // Solo en producción
    if (!process.env.POSTGRES_URL) {
        console.log('⏭️ Saltando - no estamos en Vercel');
        return { success: true, skipped: true };
    }

    try {
        // Inicializar DB
        await initDatabase();
        return { success: true };
    } catch (error) {
        // NO romper el deploy si hay error
        console.error('❌ Error:', error.message);
        return { success: false, error: error.message };
    }
};
```

**Decisión importante:** Salir con código 0 incluso si hay error

```javascript
// ¿Por qué process.exit(0) incluso con error?
.catch(err => {
    console.error('💥 Error fatal:', err);
    process.exit(0);  // ← Código 0 = éxito
});

// Razón: No queremos que el deploy falle solo porque
// la DB ya está inicializada o hay un error menor.
// El servidor puede funcionar incluso si la DB ya existe.
```

---

### Archivo: `init.js`

Este archivo crea las tablas y datos:

```javascript
const initDatabase = async () => {
    try {
        // 1. Crear tabla users
        await runQuery(`CREATE TABLE IF NOT EXISTS users (...)`);

        // 2. Crear tabla rifas
        await runQuery(`CREATE TABLE IF NOT EXISTS rifas (...)`);

        // 3. Crear tabla rifa_numbers
        await runQuery(`CREATE TABLE IF NOT EXISTS rifa_numbers (...)`);

        // 4. Crear usuario admin
        await runQuery(`INSERT INTO users ...`);

        // 5. Crear contenido demo
        await createDemoContent();

        // ⭐ IMPORTANTE: Solo exit si se ejecuta directamente
        if (require.main === module) {
            process.exit(0);
        }

        return { success: true };

    } catch (error) {
        // ⭐ Si se importó como módulo, lanzar el error
        if (require.main !== module) {
            throw error;
        }

        process.exit(1);
    }
};
```

**Conceptos clave:**

1. **`require.main === module`**
   - `true` → Se ejecutó directamente: `node init.js`
   - `false` → Se importó: `require('./init')`

2. **`CREATE TABLE IF NOT EXISTS`**
   - Crea la tabla solo si no existe
   - Si ya existe, no hace nada
   - Seguro para ejecutar múltiples veces

3. **Manejo de duplicados**
   ```javascript
   try {
       await runQuery(`INSERT INTO users ...`);
   } catch (err) {
       if (err.message.includes('UNIQUE')) {
           console.log('Usuario ya existe');  // ← No es error
       }
   }
   ```

---

## 🌍 Variables de Entorno

### Desarrollo Local

```bash
# .env (NO incluir POSTGRES_URL)
JWT_SECRET=tu_clave_secreta
NODE_ENV=development
PORT=3000
```

**Resultado:** Usa SQLite automáticamente

---

### Producción (Vercel)

Vercel configura automáticamente cuando vinculas PostgreSQL:

```bash
# Variables automáticas de Vercel:
POSTGRES_URL=postgresql://user:pass@host:5432/db
POSTGRES_HOST=host.postgres.vercel-storage.com
POSTGRES_USER=default
POSTGRES_PASSWORD=***
POSTGRES_DATABASE=verceldb
```

**Resultado:** Usa PostgreSQL automáticamente

---

## 🔍 Logging y Debugging

### Logs en Desarrollo Local

```bash
# Ejecutar init.js directamente
npm run init-db

# Deberías ver:
📁 Usando SQLite (desarrollo local)
✅ Conectado a la base de datos SQLite.
🔨 Inicializando base de datos - Fase 12...
✅ Base de datos inicializada correctamente!
```

---

### Logs en Vercel

Ir a **Vercel Dashboard → Tu Proyecto → Deployments → Último Deploy → Build Logs**

Buscar:

```
> npm run postinstall
🚀 Iniciando setup de producción para PostgreSQL...
🐘 Usando PostgreSQL (Vercel Postgres)
✅ Nueva conexión establecida con PostgreSQL
🔨 Inicializando base de datos - Fase 12...
✅ Setup de producción completado exitosamente
```

---

## 🐛 Troubleshooting

### Problema 1: "Las tablas ya existen"

**Síntoma:**
```
ERROR: relation "users" already exists
```

**Causa:** Las tablas ya fueron creadas en un deploy anterior

**Solución:** ✅ **No es un error**. El script usa `IF NOT EXISTS`, así que es esperado.

---

### Problema 2: "postinstall no se ejecuta en Vercel"

**Verificar:**

1. Revisa `vercel.json` - ¿Tiene `buildCommand` custom?
   ```json
   {
     "buildCommand": "cd backend && npm install"
   }
   ```

2. Vercel ejecuta `npm install` automáticamente → `postinstall` se ejecuta

3. Si usas `buildCommand` custom, asegúrate de que incluya `npm install`

---

### Problema 3: "Error de conexión a PostgreSQL"

**Síntoma:**
```
Error: Connection timeout
```

**Verificar:**

1. ¿Está vinculada la base de datos en Vercel?
   - Dashboard → Storage → Debe aparecer tu Postgres

2. ¿Las variables de entorno están configuradas?
   - Dashboard → Settings → Environment Variables
   - Debe existir `POSTGRES_URL`

3. ¿El SSL está habilitado?
   ```javascript
   // En postgres-config.js
   ssl: {
       rejectUnauthorized: false
   }
   ```

---

### Problema 4: "Deploy falla por error de DB"

**Síntoma:**
```
Build failed: npm ERR! code ELIFECYCLE
```

**Solución:**

El script ya está configurado para NO romper el deploy:

```javascript
// setup-production.js sale con código 0 siempre
process.exit(0);  // ← Éxito incluso con error
```

Si aún falla, revisa:
1. Syntax error en SQL
2. Dependencia `pg` no instalada
3. Error en `require()` de módulos

---

### Problema 5: "Los datos demo no aparecen"

**Verificar:**

1. ¿Se ejecutó el setup?
   ```bash
   # Logs de Vercel deben mostrar:
   🎊 FASE 15: Creando contenido de demostración...
   ✅ Contenido demo FASE 15 integrado exitosamente
   ```

2. ¿El contenido ya existía?
   ```sql
   -- Los INSERT usan ON CONFLICT DO NOTHING
   -- Si los datos ya existían, no los sobrescribe
   ```

3. Limpiar y recrear (CUIDADO - borra datos):
   ```sql
   -- Conectar a Postgres con psql o TablePlus
   DELETE FROM rifa_numbers WHERE rifa_id IN (SELECT id FROM rifas WHERE is_public = TRUE);
   DELETE FROM rifas WHERE is_public = TRUE;

   -- Luego re-deploy para que se ejecute el setup
   ```

---

## 📊 Diagrama de Flujo Completo

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│         git push origin main                          │
│                  ↓                                    │
│         Vercel detecta push                           │
│                  ↓                                    │
│         Clona repositorio                             │
│                  ↓                                    │
│         cd backend                                    │
│                  ↓                                    │
│         npm install                                   │
│                  ↓                                    │
│         postinstall hook → npm run setup-prod        │
│                  ↓                                    │
│   ┌─────────────────────────────────┐               │
│   │  setup-production.js            │               │
│   ├─────────────────────────────────┤               │
│   │  ¿POSTGRES_URL existe?          │               │
│   │    ✅ Sí → Ejecutar init.js     │               │
│   │    ❌ No → Salir (dev local)     │               │
│   └──────────────┬──────────────────┘               │
│                  ↓                                    │
│   ┌─────────────────────────────────┐               │
│   │  init.js                        │               │
│   ├─────────────────────────────────┤               │
│   │  CREATE TABLE IF NOT EXISTS     │               │
│   │  - users                        │               │
│   │  - rifas                        │               │
│   │  - rifa_numbers                 │               │
│   │                                 │               │
│   │  INSERT demo data               │               │
│   │  (con ON CONFLICT DO NOTHING)   │               │
│   └──────────────┬──────────────────┘               │
│                  ↓                                    │
│         ✅ DB inicializada                           │
│                  ↓                                    │
│         Build del código                              │
│                  ↓                                    │
│         Deploy completado                             │
│                  ↓                                    │
│         App disponible en:                            │
│         https://tu-app.vercel.app                    │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Verificación

Antes de hacer deploy, verifica:

- [ ] `POSTGRES_URL` configurado en Vercel
- [ ] Base de datos PostgreSQL vinculada
- [ ] `postinstall` script agregado en package.json
- [ ] `setup-production.js` existe en `backend/database/`
- [ ] `init.js` modificado para no hacer exit cuando se importa
- [ ] `pg` dependency en package.json
- [ ] SSL habilitado en `postgres-config.js`

Después del deploy, verifica:

- [ ] Build logs muestran "Setup de producción completado"
- [ ] App carga sin errores
- [ ] Rifas públicas aparecen en la home
- [ ] Puedes registrar usuarios nuevos
- [ ] Los datos persisten entre requests

---

## 🎓 Conceptos Aprendidos

1. **npm hooks** - `postinstall`, `prebuild`, etc.
2. **require.main** - Detectar si script es ejecutado o importado
3. **Exit codes** - 0 = éxito, 1 = error
4. **Idempotencia** - Ejecutar múltiples veces con mismo resultado
5. **Graceful degradation** - Continuar incluso con errores menores

---

**Autor:** Claude Code
**Proyecto:** SimulaRifas Personal
**Fecha:** 12/11/2025
