# 🎲 SimulaRifas - Proyecto Personal

![Estado del Proyecto](https://img.shields.io/badge/Estado-En%20Producci%C3%B3n-brightgreen)
![Versión](https://img.shields.io/badge/Versión-8.0-blue)
![Base de Datos](https://img.shields.io/badge/PostgreSQL-Vercel-blue)
![Licencia](https://img.shields.io/badge/Licencia-MIT-green)

**Simulador de Rifas Educativo** - Proyecto personal de desarrollo full-stack con Node.js

## 📋 Descripción

SimulaRifas es una aplicación web educativa que simula el funcionamiento de rifas y sorteos sin involucrar dinero real. Desarrollada como proyecto personal para perfeccionar habilidades de desarrollo full-stack, implementa una arquitectura completa con frontend interactivo y backend robusto.

### 🎯 Características Principales

- **Simulador Interactivo**: Interfaz intuitiva para seleccionar números y realizar sorteos
- **Gestión de Usuarios**: Sistema de autenticación con JWT
- **Rifas Privadas**: Creación y gestión de simulaciones con códigos de acceso
- **Rifas Públicas**: Contenido de demostración accesible sin registro
- **API RESTful**: Backend modular con arquitectura MVC
- **Responsive Design**: Optimizado para todos los dispositivos (320px - 1920px+)
- **FASE 8 COMPLETA**: **Sistema de Imágenes** - Cloudinary upload/URL dual, lightbox ampliar, privacy fix, códigos destacados, UI mejorada mobile/desktop
- **FASE 7**: **Sistema de Fechas Programadas** - Sorteo automático programado con mensaje del propietario
- **FASE 6**: **Botón Sorteo Directo** - Sortear desde "Mis Simulaciones" sin entrar a detalles
- **FASE 5**: **Layout Responsivo Mejorado** - 6 breakpoints, touch optimizado, fluid typography
- **FASE 4**: **Colores por Participante** - Cada usuario con color único distintivo (12 colores)
- **FASE 3**: **Gestión de Números** - Botones × para eliminar números individuales
- **FASE 2**: **Tooltips con Timestamps** - Información detallada de participaciones

## 🚀 Demo en Vivo

- **Aplicación**: [https://simulador-rifas-personales.vercel.app/](https://simulador-rifas-personales.vercel.app/)
- **Repositorio**: [https://github.com/fasmote/Simulador_rifas_personales](https://github.com/fasmote/Simulador_rifas_personales)
- **Estado**: ✅ En producción con PostgreSQL (Vercel Postgres)

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos con Flexbox y Grid
- **JavaScript ES6+** - Lógica interactiva
- **Fetch API** - Comunicación con el backend

### Backend
- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **JWT** - Autenticación de usuarios
- **PostgreSQL** - Base de datos en producción (Vercel Postgres)
- **SQLite** - Base de datos en desarrollo local
- **Switch Automático** - Detecta entorno y usa DB apropiada
- **Cloudinary** - Almacenamiento de imágenes en la nube (FASE 8)
- **Multer** - Upload de archivos multipart/form-data (FASE 8)
- **CORS** - Configuración de dominios cruzados

### Deploy y Herramientas
- **Vercel** - Plataforma de despliegue
- **Git/GitHub** - Control de versiones
- **VS Code** - Editor de código

## 📁 Estructura del Proyecto

```
SimulaRifas_Personal/
├── public/                  # Archivos estáticos frontend
│   ├── css/
│   │   └── styles.css      # Estilos principales + FASE 2 tooltips + FASE 3 modales
│   ├── js/
│   │   ├── app.js          # Lógica principal + FASE 2 timestamps + FASE 3 gestión
│   │   └── rifas.js        # Funciones de rifas
│   └── index.html          # Página principal
├── backend/                 # Servidor Node.js
│   ├── controllers/        # Lógica de negocio
│   ├── models/             # Modelos de datos
│   ├── routes/             # Rutas de la API + FASE 2 endpoints + FASE 3 DELETE
│   ├── services/           # Servicios de datos
│   ├── database/           # Configuración de bases de datos
│   │   ├── database.js     # Switch automático SQLite ↔ PostgreSQL
│   │   ├── postgres-config.js  # Configuración PostgreSQL (producción)
│   │   ├── init.js         # Inicialización de esquema
│   │   └── rifas.db        # SQLite database (solo local)
│   └── server.js           # Servidor principal
├── docs/                   # Documentación
│   ├── POSTGRES_MIGRATION_GUIDE.md  # Guía migración PostgreSQL
│   ├── ARQUITECTURA_DATABASE.md     # Arquitectura base de datos
│   ├── CHANGELOG.md        # Registro de cambios por fases
│   ├── ROADMAP_COMPLETO.md # Planificación de desarrollo
│   ├── PRODUCTO.md         # Documentación del producto
│   ├── PLAN_FASES.md       # Plan de fases del proyecto
│   └── DICCIONARIO_FUNCIONES.md  # Diccionario de funciones
├── .gitignore              # Archivos ignorados
├── .env.example            # Variables de entorno
└── README.md               # Este archivo
```

## 🗄️ Base de Datos

### Sistema Dual SQLite ↔ PostgreSQL

El proyecto utiliza un **sistema automático** que detecta el entorno y selecciona la base de datos apropiada:

- **🏠 Desarrollo Local**: SQLite (archivo `rifas.db`)
- **☁️ Producción (Vercel)**: PostgreSQL (Vercel Postgres)

**Sin configuración manual necesaria** - el switch es completamente automático basado en la presencia de `POSTGRES_URL`.

📖 **Documentación completa**: [Guía de Migración PostgreSQL](docs/POSTGRES_MIGRATION_GUIDE.md)

### Ventajas del Sistema

✅ **Desarrollo rápido** - SQLite sin configuración
✅ **Producción escalable** - PostgreSQL en la nube
✅ **Zero-config** - Detección automática de entorno
✅ **Mismo código** - API unificada para ambas bases de datos

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Node.js** (versión 14 o superior)
- **npm** o **yarn**
- Navegador web moderno
- *Opcional*: Cuenta de Vercel para deploy en producción

### Instalación Local

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/fasmote/Simulador_rifas_personales.git
   cd Simulador_rifas_personales
   ```

2. **Instalar dependencias del backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Inicializar base de datos**
   ```bash
   npm run init-db
   npm run demo-content
   ```

5. **Iniciar el servidor backend**
   ```bash
   npm run dev
   ```

6. **Abrir el frontend**
   - Abrir `public/index.html` en el navegador
   - O usar un servidor local como Live Server
   - URL: `http://localhost:3000`

### Scripts Disponibles

```bash
npm run dev          # Iniciar servidor en modo desarrollo
npm start            # Iniciar servidor en producción
npm run init-db      # Inicializar base de datos
npm run demo-content # Crear contenido de demostración
npm run reset-demo   # Resetear DB + contenido demo
npm test             # Ejecutar pruebas
```

## 📖 Uso de la Aplicación

### 🎮 Modo Demo (Sin Registro)
1. Visita la página principal
2. Selecciona números haciendo clic en la grilla
3. Usa "Elegir al Azar" para selección automática
4. Haz clic en "Simular Sorteo" para ver el ganador

### 👤 Modo Registrado
1. **Crear Cuenta**: Registrarte con usuario, email y contraseña
2. **Crear Simulaciones**: Título y descripción personalizados
3. **Compartir Código**: Código de 6 caracteres para participantes
4. **Gestionar**: Editar, ver estadísticas y realizar sorteos

### 🔑 Acceso por Código
1. Ve a "Acceder por Código"
2. Ingresa el código de 6 caracteres
3. Selecciona números y participa
4. El propietario puede realizar el sorteo

### 🆕 **FASE 5: Layout Responsivo Mejorado**
- **6 breakpoints optimizados**: Desktop XL, Tablet, Mobile Portrait/Landscape, Small Mobile
- **Tipografía fluida**: clamp() para escalado automático en todos los tamaños
- **Touch targets mejorados**: Mínimo 44x44px (WCAG 2.1)
- **Grid dinámico**: De 6 a 15 columnas según dispositivo y orientación
- **Mejoras táctiles**: Prevención de zoom, swipe gestures, feedback táctil
- **Modales optimizados**: Swipe-down para cerrar, scroll inteligente
- **Accesibilidad**: prefers-reduced-motion, ARIA, gestión de foco

### 🆕 **FASE 4: Colores por Participante**
- **12 colores únicos** con gradientes elegantes
- **Asignación automática** por orden de participación
- **Persistencia** durante toda la sesión de rifa
- **Toggle 2/12 colores** para preferencias visuales

### 🆕 **FASE 3: Gestión de Números**
- **Botón "X"** en números ocupados de la grilla para eliminar individual
- **Botón "Eliminar todos"** por usuario en lista de participantes
- **Modal de confirmación elegante** con gradientes y animaciones
- **Auto-actualización** de vista después de eliminaciones

### 🆕 **FASE 2: Tooltips con Timestamps**
- **Hover sobre números ocupados** para ver información detallada
- **Formato**: "Elegido por [Usuario] el [fecha] a las [hora]"
- **Diseño elegante** con animaciones y gradientes
- **Cursor indicativo** para números con información disponible

## 🎯 Funcionalidades Principales

### Para Usuarios Anónimos
- ✅ Simulador de demostración
- ✅ Visualización de rifas públicas
- ✅ Acceso por código a rifas privadas
- ✅ **NUEVO**: Tooltips informativos en hover

### Para Usuarios Registrados
- ✅ Crear simulaciones personalizadas
- ✅ Gestionar rifas (editar, eliminar)
- ✅ Códigos de acceso únicos
- ✅ Realizar sorteos automatizados
- ✅ Estadísticas de participación
- ✅ **FASE 1**: Vista administrativa de participantes
- ✅ **FASE 2**: Información de timestamps detallada
- ✅ **FASE 3**: Botones × eliminación individual y masiva
- ✅ **FASE 4**: Colores únicos por participante (12 gradientes)
- ✅ **FASE 5**: Layout responsivo mejorado (6 breakpoints, touch-optimized)

### API Backend
- ✅ Autenticación JWT
- ✅ CRUD completo de rifas
- ✅ Participación en rifas
- ✅ Sorteos automatizados
- ✅ Manejo de errores
- ✅ **FASE 2**: Endpoints con timestamps formateados
- ✅ **FASE 3**: Endpoints DELETE para gestión de números

## 🔧 API Endpoints

### Autenticación
```http
POST /api/auth/register    # Registrar usuario
POST /api/auth/login       # Iniciar sesión
POST /api/auth/logout      # Cerrar sesión
GET  /api/auth/me          # Datos del usuario actual
```

### Rifas
```http
GET    /api/rifas          # Listar rifas públicas
POST   /api/rifas          # Crear nueva rifa
GET    /api/rifas/my       # Mis rifas
GET    /api/rifas/my/:id   # Ver mi rifa específica
PUT    /api/rifas/:id      # Actualizar rifa
DELETE /api/rifas/:id      # Eliminar rifa
```

### Participación
```http
GET  /api/rifas/access/:code     # Acceder por código
POST /api/rifas/:id/participate  # Participar en rifa
POST /api/rifas/:id/draw         # Realizar sorteo
GET  /api/rifas/:id/numbers      # FASE 2: Números con timestamps
GET  /api/rifas/:id/participants # FASE 1: Lista de participantes
DELETE /api/rifas/:id/numbers/:number # FASE 3: Eliminar número individual
DELETE /api/rifas/:id/participants/:user/numbers # FASE 3: Eliminar todos los números de usuario
```

### Upload de Imágenes
```http
POST   /api/upload/image           # FASE 8: Subir imagen a Cloudinary
DELETE /api/upload/image/:publicId # FASE 8: Eliminar imagen de Cloudinary
```

## 🔒 Seguridad y Consideraciones

### Legales
- **Sin dinero real**: Aplicación educativa únicamente
- **Cumple normativas**: No constituye juego de apuestas
- **Datos ficticios**: Participantes y premios simulados

### Técnicas
- **JWT Tokens**: Autenticación segura
- **Validación**: Datos de entrada sanitizados
- **CORS**: Configuración de dominios permitidos
- **Rate Limiting**: Protección contra spam (en desarrollo)

## 🚧 Estado del Desarrollo

### ✅ Completado
- Frontend responsivo completo y optimizado
- Sistema de autenticación JWT
- CRUD de rifas y usuarios
- Simulador interactivo
- **FASE 1**: Vista administrativa de participantes
- **FASE 2**: Tooltips con timestamps informativos
- **FASE 3**: Botones × eliminación con estilos CSS permanentes
- **FASE 4**: Sistema completo de colores por participante (12 gradientes)
- **FASE 5**: Layout responsivo mejorado (6 breakpoints, touch-optimized)
- **FASE 6**: Botón sorteo directo desde Mis Simulaciones (modales animados, confetis)
- **FASE 7**: Sistema de fechas programadas (sorteo automático, mensaje del propietario)
- **FASE 8**: Sistema de imágenes de productos (URL/Upload, Cloudinary, preview)

### 🔄 En Progreso
- Testing exhaustivo en producción
- Optimizaciones de rendimiento

### 📋 Próximas Features (Ver [Roadmap](docs/ROADMAP_COMPLETO.md))
- **FASE 9**: Zona horaria del propietario
- **FASE 10**: Historial de cambios
- **FASE 11**: Rangos personalizables base
- **FASE 21**: Sistema de temas base
- **FASE 22**: Modo oscuro/claro
- **FASE 18**: Posible migración a Firebase/Firestore

## 🗺️ Roadmap de Desarrollo

El proyecto sigue un roadmap estructurado en **200 fases** organizadas en **11 bloques**:

### **BLOQUE I: FUNDACIÓN SÓLIDA** *(Fases 1-20)*
- ✅ **FASE 1**: Vista Administrativa *(COMPLETADA)*
- ✅ **FASE 2**: Timestamps Informativos *(COMPLETADA)*
- ✅ **FASE 3**: Gestión de Números *(COMPLETADA)*
- ✅ **FASE 4**: Colores por Participante *(COMPLETADA)*
- ✅ **FASE 5**: Layout Responsivo Mejorado *(COMPLETADA)*
- ✅ **FASE 6**: Botón Sorteo Directo *(COMPLETADA)*
- ✅ **FASE 7**: Sistema de Fechas Programadas *(COMPLETADA)*
- ✅ **FASE 8**: Imágenes de Productos *(COMPLETADA)*
- 📅 **FASE 9**: Zona Horaria del Propietario *(PRÓXIMA)*

### **BLOQUE II: EXPERIENCIA PREMIUM** *(Fases 21-40)*
- Temas y personalización
- PWA y funcionalidades móviles

Para ver el roadmap completo, consulta [ROADMAP_COMPLETO.md](docs/ROADMAP_COMPLETO.md)

## 📊 Registro de Cambios

Para ver todos los cambios detallados por fase, consulta [CHANGELOG.md](docs/CHANGELOG.md)

### Últimos Cambios (FASE 8 - COMPLETA)
- ✅ **FASE 8 COMPLETA**: Sistema de imágenes completo
  - Upload a Cloudinary + URL directo (dual method)
  - Lightbox para ampliar imágenes (3 formas de cerrar)
  - object-fit optimizado (cover/contain según contexto)
  - Privacy bug fix (cleanup completo de modales)
  - Códigos destacados con gradiente morado
  - Navegación reorganizada (ACCESO POR CÓDIGO prominent)
  - UI mobile optimizada (medalla ganador, cards verdes)
  - SORTEAR inteligente (disabled cuando vacío)
  - Base UI para modo sorteo manual/automático
- ✅ **FASE 7**: Sistema de fechas programadas - Sorteo automático y mensaje del propietario
- ✅ **FASE 6**: Botón sorteo directo - Sortear desde Mis Simulaciones con modales animados
- ✅ **FASE 5**: Layout responsivo mejorado - 6 breakpoints, touch-optimized
- ✅ **FASE 4**: Sistema completo de colores por participante (12 gradientes)

## 🤝 Contribución

Este es un proyecto personal de aprendizaje, pero las contribuciones son bienvenidas:

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

**Claudio** - Desarrollador Full Stack
- GitHub: [@fasmote](https://github.com/fasmote)
- Proyecto: [Simulador_rifas_personales](https://github.com/fasmote/Simulador_rifas_personales)

## 🙏 Agradecimientos

- **Comunidad open source** por las herramientas utilizadas
- **MDN Web Docs** por la documentación completa
- **Node.js Community** por el ecosistema robusto

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación en `docs/PRODUCTO.md`
2. Busca en [Issues](https://github.com/fasmote/Simulador_rifas_personales/issues)
3. Crea un nuevo issue si es necesario

## 🔗 Links Útiles

- [Documentación Técnica](docs/PRODUCTO.md)
- [Roadmap Completo](docs/ROADMAP_COMPLETO.md)
- [Registro de Cambios](docs/CHANGELOG.md)
- [Plan de Fases](docs/PLAN_FASES.md)
- [Diccionario de Funciones](docs/DICCIONARIO_FUNCIONES.md)
- [Guía Migración PostgreSQL](docs/POSTGRES_MIGRATION_GUIDE.md)
- [Arquitectura de Base de Datos](docs/ARQUITECTURA_DATABASE.md)
- [Demo en Vivo](https://simulador-rifas-personales.vercel.app/)

---

<div align="center">

**🎲 SimulaRifas - Proyecto Personal de Desarrollo Full-Stack 🎲**

[Demo](https://simulador-rifas-personales.vercel.app/) • [Documentación](docs/PRODUCTO.md) • [Reporte de Bug](https://github.com/fasmote/Simulador_rifas_personales/issues)

</div>
