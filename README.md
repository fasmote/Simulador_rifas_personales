# 🎲 SimulaRifas - Proyecto Personal

![Estado del Proyecto](https://img.shields.io/badge/Estado-En%20Desarrollo%20Activo-brightgreen)
![Versión](https://img.shields.io/badge/Versión-2.0%20FASE%202-blue)
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
- **Responsive Design**: Adaptable a dispositivos móviles y desktop
- **FASE 2 NUEVA**: **Tooltips con Timestamps** - Información detallada de participaciones

## 🚀 Demo en Vivo

- **Frontend**: [https://talento-tech-simula-rifas.vercel.app/](https://talento-tech-simula-rifas.vercel.app/)
- **Repositorio**: [https://github.com/fasmote/Simulador_rifas_personales](https://github.com/fasmote/Simulador_rifas_personales)

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
- **SQLite** - Base de datos (migración a Firebase en progreso)
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
│   │   └── styles.css      # Estilos principales + FASE 2 tooltips
│   ├── js/
│   │   ├── app.js          # Lógica principal + FASE 2 timestamps
│   │   └── rifas.js        # Funciones de rifas
│   └── index.html          # Página principal
├── backend/                 # Servidor Node.js
│   ├── controllers/        # Lógica de negocio
│   ├── models/             # Modelos de datos
│   ├── routes/             # Rutas de la API + FASE 2 endpoints
│   ├── services/           # Servicios de datos
│   ├── database/           # Base de datos SQLite
│   └── server.js           # Servidor principal
├── docs/                   # Documentación
├── CHANGELOG.md            # Registro de cambios por fases
├── ROADMAP_COMPLETO.md     # Planificación de desarrollo
├── .gitignore              # Archivos ignorados
├── .env.example            # Variables de entorno
└── README.md               # Este archivo
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Node.js** (versión 14 o superior)
- **npm** o **yarn**
- Navegador web moderno

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

### API Backend
- ✅ Autenticación JWT
- ✅ CRUD completo de rifas
- ✅ Participación en rifas
- ✅ Sorteos automatizados
- ✅ Manejo de errores
- ✅ **FASE 2**: Endpoints con timestamps formateados

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
- Frontend responsivo completo
- Sistema de autenticación
- CRUD de rifas y usuarios
- Simulador interactivo
- **FASE 1**: Vista administrativa de participantes
- **FASE 2**: Tooltips con timestamps informativos

### 🔄 En Progreso
- **FASE 3**: Gestión avanzada de números
- API RESTful independiente
- Migración a Firebase/Firestore

### 📋 Próximas Features
- **FASE 3**: Eliminar números individuales/por usuario
- **FASE 4**: Colores por participante
- **FASE 5**: Layout responsivo mejorado
- Notificaciones push
- Analytics de rifas
- Modo oscuro

## 🗺️ Roadmap de Desarrollo

El proyecto sigue un roadmap estructurado en **200 fases** organizadas en **11 bloques**:

### **BLOQUE I: FUNDACIÓN SÓLIDA** *(Fases 1-20)*
- ✅ **FASE 1**: Vista Administrativa *(COMPLETADA)*
- ✅ **FASE 2**: Timestamps Informativos *(COMPLETADA)*
- 🔄 **FASE 3**: Gestión de Números *(En desarrollo)*

### **BLOQUE II: EXPERIENCIA PREMIUM** *(Fases 21-40)*
- Temas y personalización
- PWA y funcionalidades móviles

Para ver el roadmap completo, consulta [ROADMAP_COMPLETO.md](ROADMAP_COMPLETO.md)

## 📊 Registro de Cambios

Para ver todos los cambios detallados por fase, consulta [CHANGELOG.md](CHANGELOG.md)

### Últimos Cambios (FASE 2)
- ✅ **Backend**: Endpoint `/api/rifas/:id/numbers` con timestamps
- ✅ **Frontend**: Tooltips interactivos con información de participaciones
- ✅ **CSS**: Estilos elegantes con animaciones y efectos hover
- ✅ **UX**: Cursor indicativo para números con información disponible

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

1. Revisa la documentación en `PRODUCTO.md`
2. Busca en [Issues](https://github.com/fasmote/Simulador_rifas_personales/issues)
3. Crea un nuevo issue si es necesario

## 🔗 Links Útiles

- [Documentación Técnica](PRODUCTO.md)
- [Roadmap Completo](ROADMAP_COMPLETO.md)
- [Registro de Cambios](CHANGELOG.md)
- [Demo en Vivo](https://talento-tech-simula-rifas.vercel.app/)

---

<div align="center">

**🎲 SimulaRifas - Proyecto Personal de Desarrollo Full-Stack 🎲**

[Demo](https://talento-tech-simula-rifas.vercel.app/) • [Documentación](PRODUCTO.md) • [Reporte de Bug](https://github.com/fasmote/Simulador_rifas_personales/issues)

</div>
