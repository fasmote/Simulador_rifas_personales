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
