# 📋 CHANGELOG - SimulaRifas Personal

Registro detallado de cambios por fase del proyecto SimulaRifas.

---

## 🐘 **MIGRACIÓN: SQLite → PostgreSQL** *(12/11/2025)*

### 🎯 Objetivo
Migrar de SQLite (archivo local) a Vercel Postgres (base de datos en la nube) para permitir persistencia de datos en producción.

### ✅ Estado: **COMPLETADO**

Todos los pasos de la migración han sido completados exitosamente y están listos para merge.

### 🔧 Pasos Completados

#### **PASO 0: Preparación** *(Usuario)*
- ✅ Base de datos PostgreSQL creada en Vercel Dashboard
- ✅ Variables de entorno configuradas automáticamente por Vercel

#### **PASO 1: Instalación de Dependencias**
- ✅ Agregada dependencia `pg@^8.11.3` (driver oficial de PostgreSQL para Node.js)
- ✅ Mantiene compatibilidad con `sqlite3` para desarrollo local
- 📂 Branch: `claude/postgres-step-1-011CUthDVEktnc3x6B3SQrTb`

#### **PASO 2: Configuración de PostgreSQL**
- ✅ **Nuevo archivo:** `backend/database/postgres-config.js` (176 líneas)
  - Pool de conexiones optimizado para serverless
  - SSL habilitado para Vercel Postgres
  - Conversión automática de placeholders `?` → `$1, $2, $3...`
  - Auto-agregar `RETURNING id` a queries INSERT
  - Interfaz compatible con SQLite (runQuery, getQuery, allQuery)

- ✅ **Nuevo archivo:** `backend/.env.example`
  - Documentación de variables de entorno necesarias
  - Instrucciones para desarrollo local vs producción

- 📂 Branch: `claude/postgres-step-2-011CUthDVEktnc3x6B3SQrTb`

#### **PASO 3: Actualización de Queries SQL**

**backend/database/init.js:**
- `INTEGER PRIMARY KEY AUTOINCREMENT` → `SERIAL PRIMARY KEY`
- `DATETIME` → `TIMESTAMP`
- `INSERT OR IGNORE` → `INSERT ... ON CONFLICT DO NOTHING`
- Manejo de errores compatible con ambas bases de datos

**backend/routes/rifas.js:**
- `datetime(selected_at, 'localtime')` → `selected_at` (PostgreSQL maneja timezone automáticamente)
- `GROUP_CONCAT(number ORDER BY number)` → `STRING_AGG(number::text, ',' ORDER BY number)`

**backend/database/demo-content.js:**
- `datetime('now')` → `CURRENT_TIMESTAMP` / `NOW()`
- `datetime('now', '-X hours')` → `NOW() - INTERVAL '1 hour' * X`
- Agregado `RETURNING id` explícitamente en INSERT

**backend/database/sample-data.js:**
- Detección de errores compatible con PostgreSQL: `duplicate key` además de `UNIQUE constraint`

**backend/database/database.js:**
- ⭐ **Switch automático basado en entorno**
- Detecta `process.env.POSTGRES_URL`:
  - ✅ Presente → Usa PostgreSQL (Vercel)
  - ❌ Ausente → Usa SQLite (desarrollo local)
- Zero cambios necesarios en código de routes/controllers
- Misma interfaz API para ambas bases de datos

- 📂 Branch: `claude/postgres-step-3-011CUthDVEktnc3x6B3SQrTb`

#### **PASO 4: Script de Inicialización Automática**

- ✅ **Nuevo archivo:** `backend/database/setup-production.js` (70 líneas)
  - Detecta si estamos en producción (POSTGRES_URL existe)
  - Ejecuta inicialización de DB automáticamente
  - Maneja errores sin romper el deploy
  - Sale con código 0 para no bloquear Vercel
  - Logging detallado para debugging

- ✅ **Archivo modificado:** `backend/package.json`
  - Nuevo script: `"setup-prod"` → ejecuta setup-production.js
  - Hook `"postinstall"` → ejecuta setup-prod automáticamente
  - Se ejecuta después de npm install en Vercel

- ✅ **Archivo modificado:** `backend/database/init.js`
  - Detecta si se ejecuta directamente o se importa como módulo
  - Solo hace process.exit() cuando se ejecuta directamente
  - Permite uso como módulo desde setup-production.js

- 📂 Branch: `claude/postgres-step-4-011CUthDVEktnc3x6B3SQrTb`

### 📚 Documentación Creada

- ✅ **`docs/POSTGRES_MIGRATION_GUIDE.md`** - Guía educativa completa (600+ líneas)
  - Explicación detallada de diferencias SQLite vs PostgreSQL
  - Ejemplos de código antes/después
  - Arquitectura de la solución con diagramas
  - Troubleshooting y debugging
  - Conceptos clave explicados paso a paso

- ✅ **`docs/ARQUITECTURA_DATABASE.md`** - Arquitectura explicada (500+ líneas)
  - Patrón Adapter explicado visualmente
  - Pool de conexiones con diagramas
  - Flujo completo de queries con secuencias
  - Ejemplos de código comentados línea por línea
  - Conceptos educativos avanzados

- ✅ **`backend/database/README_SETUP.md`** - Setup documentado (400+ líneas)
  - Scripts disponibles y cuándo usarlos
  - Variables de entorno requeridas
  - Troubleshooting con 5 problemas comunes
  - Diagrama de flujo completo
  - Checklist de verificación

- ✅ **`docs/GUIA_MERGE_FINAL.md`** - Guía de merge y deploy
  - Instrucciones paso a paso para merge
  - Testing post-deploy
  - Troubleshooting completo
  - Plan de rollback si hay problemas

### 🎓 Diferencias Clave SQLite vs PostgreSQL

| Concepto | SQLite | PostgreSQL |
|----------|--------|------------|
| **Auto-increment PK** | `INTEGER PRIMARY KEY AUTOINCREMENT` | `SERIAL PRIMARY KEY` |
| **Fechas** | `DATETIME` | `TIMESTAMP` |
| **Insert o ignorar** | `INSERT OR IGNORE` | `INSERT ... ON CONFLICT DO NOTHING` |
| **Concatenar strings** | `GROUP_CONCAT()` | `STRING_AGG(col::text, ',')` |
| **Fecha actual** | `datetime('now')` | `NOW()` / `CURRENT_TIMESTAMP` |
| **Restar tiempo** | `datetime('now', '-72 hours')` | `NOW() - INTERVAL '1 hour' * 72` |
| **Placeholders** | `?` para todos | `$1, $2, $3...` numerados |
| **Retornar ID** | Automático (`lastID`) | Requiere `RETURNING id` |

### 💡 Ventajas de la Arquitectura

1. **Desarrollo Local Rápido**
   - SQLite no requiere servidor externo
   - Base de datos en archivo (.db)
   - Testing más rápido

2. **Producción Robusta**
   - PostgreSQL en la nube (Vercel)
   - Persistencia garantizada entre deploys
   - Múltiples conexiones simultáneas
   - Escalabilidad horizontal

3. **Zero Duplicación**
   - Mismo código de routes/controllers
   - Switch automático transparente
   - Mantención simplificada

4. **Inicialización Automática**
   - DB se inicializa automáticamente en cada deploy
   - No requiere pasos manuales
   - Idempotente (seguro ejecutar múltiples veces)

### 📊 Impacto

- **Archivos nuevos:** 6
  - postgres-config.js (176 líneas)
  - setup-production.js (70 líneas)
  - .env.example (40 líneas)
  - POSTGRES_MIGRATION_GUIDE.md (600+ líneas)
  - ARQUITECTURA_DATABASE.md (500+ líneas)
  - README_SETUP.md (400+ líneas)
  - GUIA_MERGE_FINAL.md (500+ líneas)

- **Archivos modificados:** 8
  - backend/package.json
  - backend/database/database.js
  - backend/database/init.js
  - backend/routes/rifas.js
  - backend/database/demo-content.js
  - backend/database/sample-data.js
  - CHANGELOG.md
  - README.md

- **Líneas de código:** ~440 líneas
- **Líneas de documentación:** ~2,100 líneas
- **Total:** ~2,540 líneas

### 🔄 Estrategia de Branches

Cada paso en branch separado para permitir:
- ✅ Rollback fácil si hay problemas
- ✅ Revisión independiente de cada paso
- ✅ Testing incremental
- ✅ Merge ordenado

Branches creados:
1. `claude/postgres-step-1-011CUthDVEktnc3x6B3SQrTb` - Dependencia pg
2. `claude/postgres-step-2-011CUthDVEktnc3x6B3SQrTb` - Configuración PostgreSQL
3. `claude/postgres-step-3-011CUthDVEktnc3x6B3SQrTb` - Actualización de queries SQL
4. `claude/postgres-step-4-011CUthDVEktnc3x6B3SQrTb` - Script de inicialización

### 🚀 Cómo Hacer el Merge

Ver **`docs/GUIA_MERGE_FINAL.md`** para instrucciones completas de:
- Merge secuencial o mediante PRs
- Testing post-deploy
- Troubleshooting
- Rollback si es necesario

### 🎓 Conceptos Aprendidos

1. **Connection Pooling** - Reutilización de conexiones de DB
2. **Adapter Pattern** - Interfaz unificada para múltiples implementaciones
3. **SQL Dialects** - Diferencias entre SQLite y PostgreSQL
4. **Environment Detection** - Configuración basada en entorno
5. **npm Hooks** - postinstall para automation
6. **Idempotencia** - Scripts seguros para ejecutar múltiples veces
7. **Graceful Degradation** - Continuar incluso con errores menores
8. **Serverless Constraints** - Limitaciones de funciones sin estado

---

## 🎉 **FASE 6: Botón Sorteo Directo** *(13/11/2025)*

### ✨ Nuevas Características

#### **🎲 Sorteo Directo desde Mis Simulaciones**
- ✅ **Botón "🎲 Sortear"** en tarjetas de Mis Simulaciones
  - Solo aparece si la rifa NO está completada
  - Solo aparece si hay números seleccionados (numbers_sold > 0)
  - Estilo destacado con gradiente morado
- ✅ **Modal de confirmación elegante**
  - Emoji 🎲 animado
  - Muestra título de la rifa
  - Advertencia de acción irreversible
- ✅ **Modal de carga**
  - Spinner con animación
  - Mensaje "Realizando sorteo..."
- ✅ **Modal de resultado (Ganador)**
  - Fondo con gradiente + borde dorado
  - Emoji 🏆 con animación bounce
  - Número ganador en grande con formato 00
  - Nombre del participante
  - Auto-refresh después de 3s

#### **🎨 Animaciones y Efectos**
- ✅ **5 animaciones CSS nuevas**:
  - @keyframes fadeOut
  - @keyframes slideUp
  - @keyframes spin
  - @keyframes bounce
  - @keyframes winnerPulse

#### **💫 Mejoras Visuales**
- ✅ **Sombras agregadas** a cards y botones
- ✅ **Tono diferente** para rifas completadas (fondo gris-verdoso)
- ✅ **Medalla dorada** al número ganador en grilla
- ✅ **Panel del ganador** con efectos en sidebar
- ✅ **Responsive** con flex-wrap y min-width

### 📝 Archivos Modificados

1. **`public/js/app.js`**
   - Botón "🎲 Sortear" en layout de tarjetas
   - Funciones FASE 6 (5 nuevas):
     - quickDraw(rifaId, rifaTitle)
     - closeQuickDrawModal()
     - executeQuickDraw(rifaId, rifaTitle)
     - showQuickDrawResult(winner, rifaTitle)
     - closeQuickDrawResultModal()

2. **`public/css/styles.css`**
   - 5 animaciones nuevas (fadeOut, slideUp, spin, bounce, winnerPulse)
   - Estilos mejorados para tarjetas completadas

### 🎯 Flujo Completo

1. Usuario clickea "🎲 Sortear" en tarjeta
2. Modal de confirmación → Confirmar o Cancelar
3. Si confirma → Modal de carga (spinner)
4. API realiza sorteo → POST /api/rifas/:id/draw
5. Modal de resultado con ganador (animado)
6. Lista se actualiza automáticamente
7. Rifa cambia a estado "completed"

### 🧪 Testing

- ✅ Botón aparece solo en rifas activas con números
- ✅ Modal de confirmación funciona correctamente
- ✅ Sorteo se ejecuta sin errores
- ✅ Ganador se muestra con animaciones
- ✅ Auto-refresh actualiza la lista
- ✅ Responsive en mobile y desktop

### 📊 Impacto

- **+215 líneas** JavaScript (app.js)
- **+25 líneas** CSS (animations)
- **Mejora UX**: Ahorra 2 clicks (no entrar a detalles)
- **Feedback visual**: Modales elegantes con animaciones

---

## 🎉 **FASE 7: Sistema de Fechas Programadas** *(13/11/2025)*

### ✨ Nuevas Características

#### **📅 Sorteo Programado Automático**
- ✅ **Campos en base de datos**:
  - scheduled_draw_date (TIMESTAMP) - Fecha/hora del sorteo
  - owner_message (TEXT) - Mensaje del propietario
  - timezone (VARCHAR) - Zona horaria (default: America/Argentina/Buenos_Aires)
- ✅ **Función checkAndExecuteScheduledDraw()**
  - Verifica si fecha programada ha pasado
  - Ejecuta sorteo automáticamente
  - Protección anti-concurrencia
- ✅ **Verificación automática** en endpoints GET

#### **🎨 Modales Crear/Editar**
- ✅ **Campo datetime-local** para seleccionar fecha/hora
- ✅ **Textarea para mensaje** del propietario
  - Contador de caracteres en tiempo real
  - Máximo 100 caracteres
  - Validación en backend
- ✅ **Botón "Quitar fecha programada"** en modal editar
- ✅ **Event listeners** para contador de caracteres

#### **👁️ Visualización**
- ✅ **Badges visuales** para fecha programada:
  - Fondo azul si fecha futura
  - Fondo rojo si fecha pasada ("se sorteará automáticamente")
  - Fondo gris si sin fecha ("Sorteo manual")
- ✅ **Badge naranja** para mensaje del propietario
- ✅ **Formato de fecha**: DD/MM/YYYY a las HH:MM (es-AR)
- ✅ **Ubicación**: Después del título, antes del banner ganador
- ✅ **Responsive**: Optimizado para mobile

#### **🔒 Bloqueos y Protecciones**
- ✅ **Bloqueo de edición** en simulaciones completadas
- ✅ **Prevención de participación** después de sorteo programado
- ✅ **Deshabilitar botón Editar** en grilla para rifas completadas
- ✅ **Modal de confirmación** antes de realizar sorteo
- ✅ **Animación de banner ganador** en todas las vistas

### 📝 Archivos Modificados

1. **`backend/database/init.js`**
   - ALTER TABLE para agregar scheduled_draw_date
   - ALTER TABLE para agregar owner_message
   - ALTER TABLE para agregar timezone

2. **`backend/routes/rifas.js`**
   - Función checkAndExecuteScheduledDraw()
   - Modificar endpoints GET para verificar y ejecutar sorteo
   - Validación owner_message max 100 caracteres
   - Protección WHERE status='active' en sorteo manual

3. **`public/index.html`**
   - Campos en modal crear: datetime-local, textarea mensaje
   - Campos en modal editar: datetime-local, textarea mensaje, botón quitar fecha
   - Contadores de caracteres

4. **`public/js/app.js`**
   - Event listeners para contador de caracteres
   - Función clearScheduledDate()
   - Cargar valores actuales en modal editar
   - Visualización de fecha y mensaje en vistas
   - Badges con colores según estado

### 🎯 Features Implementadas

- ✅ **Sorteo automático** cuando fecha programada pasa
- ✅ **Mensaje personalizado** del propietario
- ✅ **Timezone** configurable (default Argentina)
- ✅ **Visualización clara** de estado con badges de colores
- ✅ **Validaciones robustas** en frontend y backend
- ✅ **Protección anti-concurrencia** en sorteos
- ✅ **Bloqueo de edición** post-sorteo
- ✅ **Responsive** mobile/desktop

### 🧪 Testing

- ✅ Crear rifa con fecha programada futura
- ✅ Crear rifa sin fecha programada
- ✅ Editar rifa y cambiar fecha
- ✅ Quitar fecha programada
- ✅ Sorteo automático al pasar fecha
- ✅ Bloqueo de edición en rifas completadas
- ✅ Badges con colores correctos
- ✅ Mensaje del propietario se muestra correctamente

### 📊 Impacto

- **+313 líneas** totales backend
- **+244 líneas** totales frontend (+119 visualización, +84 modales, +35 HTML)
- **3 campos nuevos** en base de datos
- **Automatización completa** de sorteos programados
- **UX mejorada** con feedback visual claro

---

## 🎉 **FASE 8: Imágenes de Productos - COMPLETA** *(17-18/11/2025)*

### ✨ Nuevas Características

#### **🖼️ Sistema Dual de Imágenes**
- ✅ **Dos métodos de carga**:
  - Por URL - Pegar enlace directo de imagen
  - Por Upload - Subir archivo desde dispositivo
- ✅ **Toggle elegante** entre métodos en modales crear/editar
- ✅ **Preview en tiempo real** de la imagen seleccionada
- ✅ **Validaciones robustas**:
  - Límite de 5MB por archivo
  - Formatos: JPG, PNG, GIF, WEBP
  - URLs válidas verificadas

#### **☁️ Integración Cloudinary**
- ✅ **Almacenamiento en la nube** para imágenes subidas
- ✅ **Optimización automática**:
  - Límite 800x800px
  - Calidad automática (quality: auto:good)
  - Carpeta organizada: simularifas/
- ✅ **Gestión completa**:
  - Upload endpoint: POST /api/upload/image
  - Delete endpoint: DELETE /api/upload/image/:publicId
- ✅ **Fallback inteligente**: Si Cloudinary no está configurado, permite usar URLs

#### **🎨 Interfaz de Usuario - Múltiples Contextos**
- ✅ **Modal crear rifa**:
  - Toggle URL/Upload con botones con gradientes
  - Input URL con placeholder
  - Input file con estilo personalizado
  - Preview container con imagen responsiva
  - Botón × para quitar imagen
- ✅ **Modal editar rifa**:
  - Mismas funcionalidades que crear
  - Muestra imagen actual si existe
  - Permite cambiar o quitar imagen
- ✅ **Banner Header (Imagen grande)**:
  - object-fit: cover para llenar espacio
  - height: 250px fijo
  - object-position: center para centrar contenido
  - SIN lightbox (solo visual)
- ✅ **Sidebar (Imagen lateral)**:
  - object-fit: contain para mostrar imagen completa
  - object-position: center
  - CON lightbox (click para ampliar)
  - Cursor: zoom-in para indicar interacción
- ✅ **Cards (Tarjetas de rifas)**:
  - Rectángulo pequeño en parte superior (120px)
  - object-fit: cover, object-position: center
  - CON lightbox (click para ampliar)
  - Centrado horizontal perfecto
- ✅ **Grid del propietario**:
  - Imagen visible para el dueño de la rifa
  - Mismo comportamiento que cards

#### **🔍 Lightbox Modal**
- ✅ **Implementación completa**:
  - Fondo oscuro semi-transparente (rgba(0,0,0,0.95))
  - Imagen centrada con max 90% viewport
  - Tres formas de cerrar:
    1. Botón × en esquina superior derecha
    2. Click fuera de la imagen
    3. Tecla ESC
- ✅ **Animaciones**:
  - @keyframes fadeIn para el fondo
  - @keyframes zoomIn para la imagen
  - Transiciones suaves
- ✅ **UX/UI**:
  - Bloqueo de scroll del body cuando está abierto
  - Cursor pointer en áreas clicables
  - Event listeners optimizados

#### **💾 Backend**
- ✅ **Database**: Campo `image_url TEXT` en tabla rifas
- ✅ **Cloudinary Config**: backend/config/cloudinary.js
- ✅ **Upload Routes**: backend/routes/upload.js (114 líneas)
- ✅ **Multer**: File upload middleware configurado
- ✅ **Variables de entorno**:
  - CLOUDINARY_CLOUD_NAME
  - CLOUDINARY_API_KEY
  - CLOUDINARY_API_SECRET

#### **🔒 Privacy & Security**
- ✅ **Bug crítico de privacidad RESUELTO**:
  - Problema: Imágenes de un usuario aparecían en modales de otro usuario
  - Causa: Falta de limpieza de variables globales al cerrar modales
  - Solución:
    - closeEditRifaModal(): Reset completo del form + cleanup de editImageUrl
    - closeCreateRifaModal(): Reset completo del form + cleanup de currentImageUrl
    - Eliminación de previews de imagen
    - Limpieza de dataset.rifaId
- ✅ **Prevención de data leakage** entre usuarios

#### **🎨 Mejoras Visuales y UX**

##### **Botón SORTEAR Mejorado**
- ✅ **Siempre visible** en rifas activas (no completadas)
- ✅ **Estado deshabilitado** cuando numbers_sold === 0:
  - Color gris (#ccc)
  - Opacity 0.5
  - Cursor: not-allowed
  - Tooltip: "No hay números vendidos"
- ✅ **Estado activo** cuando hay números vendidos:
  - Gradiente morado elegante
  - Cursor pointer
  - Ejecuta sorteo al hacer click

##### **Cards de Rifas Completadas**
- ✅ **Identificación visual clara**:
  - Fondo: linear-gradient verde (#e8f5e9 → #c8e6c9)
  - Borde: 3px solid verde (#4caf50)
  - Contrasta claramente con rifas activas (fondo blanco)

##### **Botón Eliminar (Basura)**
- ✅ **Centrado** en fila separada
- ✅ **Ancho completo** (width: 100%)
- ✅ **Mismo ancho** que otros botones de acción

##### **🏆 Medalla Ganador - Mobile Optimizado**
- ✅ **Posición ajustada** para no tapar número:
  - top: -20px (antes: -10px)
  - right: -5px (antes: -10px)
  - font-size: 1.5rem (antes: 2rem)
- ✅ **Menos invasiva** en pantallas pequeñas

##### **🔐 Navegación Reorganizada**
- ✅ **Botón "ACCESO POR CÓDIGO" destacado**:
  - Gradiente morado prominent (135deg, #667eea → #764ba2)
  - Emoji 🔑 para identificación visual
  - Ubicación principal en navbar
  - Solo visible cuando NO hay usuario logueado
- ✅ **"Iniciar Sesión" movido a hamburguesa**:
  - Ahora está en menú móvil (authLinkMobile)
  - Aparece solo cuando NO hay usuario logueado
  - Libera espacio para ACCESO POR CÓDIGO
- ✅ **Lógica condicional** en updateNavForLoggedUser():
  - Usuario logueado: Muestra nombre/logout, oculta acceso por código
  - Usuario NO logueado: Muestra acceso por código prominent, iniciar sesión en hamburguesa

##### **📋 Códigos Destacados y Fáciles de Copiar**
- ✅ **Diseño visual prominent**:
  - Background: linear-gradient morado (#667eea → #764ba2)
  - Border-radius: 10px para suavidad
  - Padding: 12px para respiración
- ✅ **Código grande y legible**:
  - Font-size: 1.3rem (antes: 1rem)
  - Font-family: monospace para claridad
  - Letter-spacing: 2px para separación
  - Font-weight: bold
  - Color: white sobre fondo morado
- ✅ **Label claro**:
  - "🔑 Código de Acceso"
  - Color: rgba(255,255,255,0.8)
  - Separado visualmente del código
- ✅ **Botón copiar integrado**:
  - Emoji 📋 para reconocimiento visual
  - Background: rgba(255,255,255,0.2) semi-transparente
  - Color: white
  - Border-radius: 5px
  - Función copyCode() mejorada con feedback
- ✅ **Ubicaciones actualizadas**:
  - Cards de rifas públicas
  - Grid de "Mis Simulaciones"
  - Vista de detalles de rifa
  - Todos con mismo diseño consistente

##### **⚙️ Modo Sorteo Manual/Automático (UI Base)**
- ✅ **Switch de selección**:
  - Radio buttons: Automático / Manual
  - Solo visible cuando hay fecha programada
  - Emojis distintivos (🤖 / ✋)
- ✅ **Descripciones dinámicas**:
  - Automático: "El sorteo se realizará automáticamente en la fecha..."
  - Manual: "Deberás realizar el sorteo manualmente después de la fecha..."
- ✅ **Integración en modales**:
  - Modal crear rifa
  - Modal editar rifa
  - Toggle visibility según campo de fecha
- ✅ **Funciones JavaScript**:
  - toggleSorteoModeVisibility()
  - toggleSorteoModeVisibilityEdit()
  - updateSorteoModeDescription()
  - updateSorteoModeDescriptionEdit()
- ⚠️ **Nota**: Backend implementation pendiente (solo UI por ahora)

### 📝 Archivos Modificados

**Backend:**

1. **`backend/database/init.js`**
   - Agregado campo `image_url TEXT` a tabla rifas
   - Migration automática para tablas existentes
   - Comentarios FASE 8 documentados

2. **`backend/config/cloudinary.js`** (NUEVO)
   - Configuración de Cloudinary
   - Función isConfigured() para verificar setup
   - Manejo de credenciales desde .env

3. **`backend/routes/upload.js`** (NUEVO - 114 líneas)
   - POST /api/upload/image - Subir imagen
   - DELETE /api/upload/image/:publicId - Eliminar imagen
   - Multer configurado (memoria, 5MB límite)
   - Validación de formatos de imagen
   - Transformaciones Cloudinary (800x800, quality auto)

4. **`backend/app.js`**
   - Importar y montar rutas de upload
   - app.use('/api/upload', uploadRoutes)

5. **`backend/routes/rifas.js`**
   - Modificar POST /api/rifas - Incluir image_url
   - Modificar PUT /api/rifas/:id - Actualizar image_url
   - Incluir image_url en respuestas GET

6. **`backend/.env.example`** / **`backend/.env`**
   - Documentar variables CLOUDINARY_*
   - Instrucciones para obtener credenciales
   - Configuradas credenciales de producción

7. **`backend/package.json`**
   - Dependencia: `"cloudinary": "^2.0.0"`
   - Dependencia: `"multer": "^1.4.5-lts.1"`

**Frontend:**

8. **`public/index.html`** (+135 líneas)
   - Sección imagen en modal crear rifa (+30 líneas)
   - Sección imagen en modal editar rifa (+30 líneas)
   - Toggle buttons URL/Upload
   - Input file y URL
   - Preview container
   - Botón quitar imagen
   - Lightbox modal HTML (+25 líneas)
   - Modo sorteo radio buttons en crear (+20 líneas)
   - Modo sorteo radio buttons en editar (+20 líneas)
   - Navegación reorganizada (codigoBtn, authLinkMobile) (+10 líneas)

9. **`public/js/app.js`** (+520 líneas totales FASE 8)
   - **Sistema de imágenes** (+267 líneas):
     - switchImageMethod(method) - Toggle crear
     - switchImageMethodEdit(method) - Toggle editar
     - handleImageUrlInput() - Preview URL
     - handleImageFileInput() - Preview archivo
     - removeImagePreview() / removeImagePreviewEdit()
     - uploadImageToCloudinary(file) - Upload
     - Event listeners para inputs de imagen
     - Integración con modales crear/editar
   - **Lightbox** (+45 líneas):
     - openLightbox(imageSrc)
     - closeLightbox()
     - Event listener ESC key
     - Bloqueo de scroll body
   - **Renderizado de imágenes** (+80 líneas):
     - Banner header (object-fit: cover, sin click)
     - Sidebar (object-fit: contain, con click)
     - Cards (rectángulo pequeño, con click)
     - Grid propietario (con imagen visible)
   - **Privacy fixes** (+25 líneas):
     - closeEditRifaModal() - Reset completo
     - closeCreateRifaModal() - Reset completo
     - Limpieza de variables globales
   - **UI/UX improvements** (+103 líneas):
     - updateNavForLoggedUser() - Navegación condicional
     - copyCode() mejorado con feedback
     - Códigos con diseño destacado
     - SORTEAR button con estados condicionales
     - Cards completadas con estilos verdes
     - Modo sorteo functions (toggle, descriptions)

10. **`public/css/styles.css`** (+285 líneas totales FASE 8)
    - **Sistema de imágenes** (+130 líneas):
      - .image-upload-container - Container principal
      - .image-method-toggle - Toggle buttons
      - .toggle-btn - Botones con gradientes
      - .image-preview-container - Preview con sombra
      - .prize-image-container - Visualización en rifas
      - .prize-image - Imagen responsiva
      - .remove-image-btn - Botón × absolute
    - **Lightbox modal** (+35 líneas):
      - #imageLightbox - Overlay oscuro
      - #lightboxImage - Imagen centrada
      - @keyframes fadeIn / zoomIn
      - Botón cerrar (X)
    - **Display de imágenes** (+40 líneas):
      - .prize-image-header (banner: cover, 250px)
      - .prize-image (sidebar: contain)
      - .rifa-card-image (cards: cover, 120px, centered)
      - object-position: center en todos
    - **UI improvements** (+80 líneas):
      - Medalla ganador mobile (top: -20px, right: -5px)
      - Cards completadas (green gradient + border)
      - Códigos destacados (purple gradient box)
      - SORTEAR disabled styles (gray, opacity)
      - Botón eliminar centrado (width: 100%)
      - Media queries mobile optimization

### 🎯 Features Implementadas

**Sistema Core:**
- ✅ **Upload a Cloudinary**: Imágenes se almacenan en la nube
- ✅ **URL directa**: Alternativa para usar imágenes existentes
- ✅ **Preview real-time**: Ver imagen antes de guardar
- ✅ **Optimización automática**: 800x800px, quality auto
- ✅ **Validación robusta**: 5MB, solo imágenes
- ✅ **Graceful fallback**: Funciona sin Cloudinary (solo URL)

**Mejoras Visuales:**
- ✅ **Lightbox completo**: Ampliar imágenes con 3 formas de cerrar
- ✅ **object-fit optimizado**: cover/contain según contexto
- ✅ **Imágenes centradas**: object-position: center
- ✅ **Códigos destacados**: Purple gradient, monospace, fácil copiar
- ✅ **Navegación mejorada**: ACCESO POR CÓDIGO prominent
- ✅ **Cards diferenciadas**: Verde para completadas
- ✅ **Medalla optimizada**: Menos invasiva en mobile

**UX/Seguridad:**
- ✅ **Privacy bug fixed**: Cleanup completo de modales
- ✅ **SORTEAR inteligente**: Disabled cuando no hay números
- ✅ **Modo sorteo UI**: Base para manual/automático
- ✅ **Responsive**: Mobile-first, adaptativo
- ✅ **Manejo de errores**: Mensajes claros al usuario

### 🧪 Testing

**Sistema de Imágenes:**
- ✅ Crear rifa con imagen por URL
- ✅ Crear rifa con imagen por upload
- ✅ Editar rifa y cambiar imagen
- ✅ Editar rifa y quitar imagen
- ✅ Preview funciona correctamente
- ✅ Fallback sin Cloudinary configurado

**Visualización:**
- ✅ Banner muestra imagen con cover (sin lightbox)
- ✅ Sidebar muestra imagen con contain (con lightbox)
- ✅ Cards muestran imagen centrada (con lightbox)
- ✅ Lightbox abre y cierra correctamente (X, click, ESC)
- ✅ Scroll bloqueado cuando lightbox activo

**Privacy & Security:**
- ✅ Modales se limpian completamente al cerrar
- ✅ No hay data leakage entre usuarios
- ✅ Variables globales reseteadas correctamente

**UI/UX:**
- ✅ Códigos destacados y fáciles de copiar (desktop/mobile)
- ✅ ACCESO POR CÓDIGO prominent en navbar
- ✅ Iniciar Sesión en hamburguesa (mobile)
- ✅ Cards completadas visualmente distintivas
- ✅ SORTEAR grayed out cuando no hay números
- ✅ Medalla no tapa número ganador (mobile)
- ✅ Responsive en todos los dispositivos

### 📊 Impacto Total FASE 8

**Código:**
- **+1,070 líneas** totales nuevas
- **+520 líneas** JavaScript (app.js)
- **+285 líneas** CSS (styles.css)
- **+114 líneas** Upload routes (backend)
- **+135 líneas** HTML (modales + lightbox + navegación)
- **+16 líneas** Backend config y database

**Archivos:**
- **2 archivos nuevos**: cloudinary.js, upload.js
- **10 archivos modificados**: init.js, app.js, rifas.js, .env, package.json, index.html, app.js, styles.css, README.md, CHANGELOG.md
- **2 dependencias**: cloudinary, multer

**Funcionalidades:**
- **6 bugs críticos resueltos** (privacy, display, UX)
- **15+ mejoras visuales** implementadas
- **4 contextos de imagen** diferentes (banner, sidebar, cards, grid)
- **3 formas de cerrar lightbox** implementadas

**Commits durante FASE 8:**
1. `fix(FASE 8): Arreglar visualización de imágenes y bug de privacidad`
2. `feat(FASE 8): Lightbox para ampliar imágenes + Fix botón SORTEAR`
3. `feat(FASE 8): Mejoras UI en cards de rifas y botón SORTEAR`
4. `feat(FASE 8): Imagen en cards + Banner con cover sin click`
5. `feat(FASE 8): UI mejoras + Base para modo sorteo manual/automático`
6. `feat(FASE 8): Mejoras UI en móvil, códigos destacados y navegación`

---

## 🎉 **FASE 5: Layout Responsivo Mejorado** *(07/11/2025)*

### ✨ Nuevas Características

#### **🎨 Sistema de Breakpoints Completo**
- ✅ **6 breakpoints** optimizados para todos los dispositivos:
  - `> 1200px` - Large Desktop
  - `≤ 1024px` - Tablet Landscape
  - `≤ 768px` - Tablet Portrait
  - `≤ 600px` - Landscape Phone
  - `≤ 480px` - Mobile Portrait
  - `≤ 360px` - Small Mobile
- ✅ **Breakpoint especial** para orientación landscape en móviles

#### **📱 Tipografía Fluida**
- ✅ **clamp()** para títulos principales (H1, H2, H3)
- ✅ Escalado automático según viewport
- ✅ Legibilidad optimizada en todos los tamaños

#### **👆 Touch Targets Mejorados**
- ✅ **Mínimo 44x44px** en todos los botones móviles
- ✅ Números del grid con tamaño táctil adecuado
- ✅ Cumple con estándares de accesibilidad WCAG 2.1

#### **🎯 Grid Responsivo Dinámico**
- ✅ Desktop (>1200px): grid auto-fit 70px
- ✅ Tablet (1024px): grid auto-fit 55px
- ✅ Tablet Portrait (768px): 10 columnas
- ✅ Landscape Phone (600px): 12 columnas
- ✅ Mobile Portrait (480px): 8 columnas
- ✅ Small Mobile (360px): 6 columnas
- ✅ Mobile Landscape: 15 columnas

#### **📦 Modales Optimizados**
- ✅ Tamaño adaptativo según pantalla
- ✅ Padding y márgenes optimizados
- ✅ Scroll vertical en modales largos
- ✅ Swipe-down para cerrar en móviles
- ✅ Prevención de scroll del body

#### **🚀 JavaScript - Mejoras Móviles**
- ✅ **Detección automática** de dispositivos táctiles
- ✅ **Prevención de zoom** en double-tap en botones
- ✅ **Auto-cierre** de menú móvil al navegar
- ✅ **Swipe gestures** para cerrar modales
- ✅ **Viewport debugger** para desarrollo local
- ✅ **Feedback táctil** mejorado con transform: scale()

#### **🎨 Navegación Móvil Mejorada**
- ✅ Menú hamburguesa con animación slideDown
- ✅ Cambio de ícono (☰ ↔ ✕) al abrir/cerrar
- ✅ Backdrop blur en menú desplegable
- ✅ Gestión de foco para accesibilidad
- ✅ Touch target de 44x44px mínimo

#### **♿ Accesibilidad**
- ✅ **Respeto por prefers-reduced-motion**
- ✅ Gestión de foco en modales
- ✅ ARIA attributes en botones
- ✅ Touch targets según WCAG 2.1
- ✅ Contraste adecuado en todos los breakpoints

#### **🌐 Meta Tags Optimizados**
- ✅ Viewport con maximum-scale=5.0 (permite zoom)
- ✅ viewport-fit=cover para notch devices
- ✅ theme-color para barra de navegador
- ✅ apple-mobile-web-app-capable
- ✅ mobile-web-app-capable

### 📝 Archivos Modificados

1. **`public/css/styles.css`**
   - Reemplazo completo del sistema responsive
   - +487 líneas de CSS responsive nuevo
   - 6 breakpoints principales
   - Media queries para orientación y touch devices
   - Animaciones optimizadas para móvil

2. **`public/js/app.js`**
   - Nueva función `initMobileEnhancements()`
   - Nueva función `preventDoubleTapZoom()`
   - Nueva función `autoCloseMobileMenu()`
   - Nueva función `improveMobileModals()`
   - Nueva función `addViewportDebugger()`
   - Función mejorada `toggleMobileMenu()` con accesibilidad

3. **`public/index.html`**
   - Viewport meta optimizado
   - Meta tags para PWA
   - Theme color configurado
   - Apple mobile web app tags

### 🎯 Mejoras de UX

- ✅ **Mejor experiencia** en tablets (orientación portrait y landscape)
- ✅ **Grid adaptativo** que aprovecha mejor el espacio disponible
- ✅ **Botones full-width** en móvil para mejor usabilidad
- ✅ **Modales más grandes** en desktop, compactos en móvil
- ✅ **Tooltips ajustados** según tamaño de pantalla
- ✅ **Tarjetas de rifa** full-width en móvil, grid en desktop
- ✅ **Carrito lateral** en desktop, stack en móvil
- ✅ **Títulos compactos** con emoji separado en móvil

### 🧪 Testing

- ✅ Probado en Chrome DevTools (todos los dispositivos)
- ✅ Responsive desde 320px hasta 1920px
- ✅ Orientación portrait y landscape
- ✅ Touch interactions funcionando correctamente
- ✅ Viewport debugger para desarrollo

### 📊 Impacto

- **+487 líneas** de CSS responsive
- **+182 líneas** de JavaScript móvil
- **6 breakpoints** principales
- **100%** compatible con dispositivos táctiles
- **Cumple WCAG 2.1** Level AA para touch targets

---

## 🎉 **FASE 4.1: Toggle de Modos de Color** *(Previo a FASE 5)*

### ✨ Nuevas Características
- ✅ Toggle para cambiar entre 2 colores (simple) y 12 colores (multi)
- ✅ Botones con diseño elegante y gradientes
- ✅ Estado persistente durante la sesión
- ✅ Responsive: se adapta a mobile y desktop
- ✅ Label "Visualización:" que se oculta en mobile pequeño

---

## 🎉 **FASE 4: Colores por Participante** *(28/08/2025)*

### ✨ Nuevas Características
- ✅ **12 colores únicos** para diferentes usuarios
- ✅ Sistema automático de asignación de colores
- ✅ Gradientes elegantes para cada participante
- ✅ Colores persistentes durante la sesión de rifa
- ✅ Reset automático al cambiar de simulación

### 📝 Archivos Modificados
1. **`public/css/styles.css`**
   - 12 clases CSS: `.user-color-1` a `.user-color-12`
   - Gradientes únicos para cada color
   - Efectos hover para colores de usuario

2. **`public/js/app.js`**
   - Nueva función `assignUserColor(username)`
   - Nueva función `getUserColor(username)`
   - Nueva función `resetUserColors()`
   - Variable global `userColorMap`

---

## 🎉 **FASE 3: Gestión de Números** *(28/08/2025)*

### ✨ Nuevas Características
- ✅ Botones "×" para eliminar números individuales
- ✅ Botón "Eliminar todos" por usuario
- ✅ Modal de confirmación personalizado
- ✅ Auto-actualización después de eliminaciones
- ✅ Posicionamiento inteligente del modal

### 🔧 Backend
1. **`backend/routes/rifas.js`**
   - Endpoint `DELETE /api/rifas/:id/numbers/:number`
   - Endpoint `DELETE /api/rifas/:id/participants/:participantName/numbers`

### 🎨 Frontend
2. **`public/css/styles.css`**
   - Estilos `.grid-number-delete`
   - Estilos `.delete-confirmation-modal`
   - Animaciones para modales

3. **`public/js/app.js`**
   - Función `showDeleteConfirmation()`
   - Función `closeDeleteConfirmation()`
   - Función `confirmDelete()`
   - Función `deleteNumberFromGrid()`
   - Función `deleteAllNumbersForUser()`

---

## 🎉 **FASE 2: Timestamps Informativos** *(02/08/2025)*

### ✨ Nuevas Características
- ✅ Tooltips informativos al hacer hover sobre números ocupados
- ✅ Formato: "Elegido por [Usuario] el [fecha] a las [hora]"
- ✅ Tooltips con gradientes y animaciones elegantes
- ✅ Cursor help para indicar información disponible

### 🔧 Backend
1. **`backend/routes/rifas.js`**
   - Endpoint `GET /api/rifas/:id/numbers` con timestamps formateados

### 🎨 Frontend
2. **`public/css/styles.css`**
   - Estilos `.custom-tooltip`
   - Animación `tooltipFadeIn`
   - Efectos hover mejorados para números ocupados

3. **`public/js/app.js`**
   - Función `loadNumbersWithTimestamps()`
   - Función `showTooltip()`
   - Función `hideTooltip()`
   - Formateo de fechas en español argentino

---

## 🎉 **FASE 1: Vista Administrativa** *(01/08/2025)*

### ✨ Nuevas Características
- ✅ Lista completa de participantes para el propietario
- ✅ Tabla Usuario → Números elegidos con timestamps
- ✅ Sección "Lista de Participantes" en vista de detalles
- ✅ Estadísticas de números por participante

### 🔧 Backend
1. **`backend/routes/rifas.js`**
   - Endpoint `GET /api/rifas/:id/participants`

### 🎨 Frontend
2. **`public/index.html`**
   - Sección de lista de participantes en detalles de rifa

3. **`public/js/app.js`**
   - Función `loadParticipants(rifaId)`
   - Renderizado de tabla de participantes
   - Botón actualizar y auto-carga

---

## 📊 **Estadísticas Acumuladas**

### Por FASE 5:
- **Líneas de código totales**: ~4,200+ líneas
- **Fases completadas**: 5/220 (2.3%)
- **Funcionalidades core**: 100%
- **Responsive design**: 100%
- **Mobile optimization**: 100%
- **Accesibilidad**: WCAG 2.1 Level AA

### Stack Tecnológico:
- **Backend**: Node.js + Express + SQLite
- **Frontend**: HTML5 + CSS3 + JavaScript ES6+
- **Responsive**: Mobile-first, 6 breakpoints
- **Accesibilidad**: WCAG 2.1, ARIA, touch-friendly

---

*Última actualización: FASE 5 - 07/11/2025*
*Proyecto: SimulaRifas Personal*
*Autor: Claudio*
