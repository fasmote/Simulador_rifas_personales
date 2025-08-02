# 🎲 Simula RIFA Personal - TalentoTech

![Estado del Proyecto](https://img.shields.io/badge/Estado-En%20Desarrollo%20Activo-brightgreen)
![Versión](https://img.shields.io/badge/Versión-1.1.0--FASE1-blue)
![Licencia](https://img.shields.io/badge/Licencia-MIT-green)
![Roadmap](https://img.shields.io/badge/Roadmap-FASE%201%20COMPLETADA-success)

**Simulador de Rifas Educativo** - Proyecto Final Integrador del curso Node.js de TalentoTech

## 📋 Descripción

Simula RIFA Personal es una aplicación web educativa que simula el funcionamiento de rifas y sorteos sin involucrar dinero real. Desarrollada como proyecto final para el curso de Node.js de TalentoTech, implementa una arquitectura completa con frontend interactivo y backend robusto.

**🚀 NUEVO**: Implementación de roadmap por fases con mejoras incrementales.

### 🎯 Características Principales

- **Simulador Interactivo**: Interfaz intuitiva para seleccionar números y realizar sorteos
- **Gestión de Usuarios**: Sistema de autenticación con JWT
- **Rifas Privadas**: Creación y gestión de simulaciones con códigos de acceso
- **Rifas Públicas**: Contenido de demostración accesible sin registro
- **🆕 Vista Administrativa (FASE 1)**: Lista completa de participantes para el propietario
- **API RESTful**: Backend modular con arquitectura MVC
- **Responsive Design**: Adaptable a dispositivos móviles y desktop

## 🆕 **FASES DE DESARROLLO**

### ✅ **FASE 1: Vista Administrativa** (COMPLETADA)
- **Objetivo**: El propietario puede ver quién eligió qué números
- **Funcionalidades implementadas**:
  - Lista completa de participantes en "Mis Simulaciones"
  - Visualización: Usuario → Números elegidos
  - Timestamps de primera participación
  - Estadísticas: total participantes y números vendidos
  - Botón "Actualizar" para refrescar datos
  - Auto-carga automática al ver detalles de rifa

### 📅 **FASE 2: Timestamps Informativos** (PRÓXIMA)
- **Objetivo**: Mostrar cuándo se eligió cada número
- **Funcionalidades planificadas**:
  - Hover sobre números para ver timestamp
  - Tooltip: "Elegido por [Usuario] el [fecha] a las [hora]"

### 📅 **FASE 3: Gestión de Números** (PLANIFICADA)
- **Objetivo**: Eliminar números individuales o por usuario
- **Funcionalidades planificadas**:
  - Botón eliminar número individual
  - Botón eliminar todos los números de un usuario
  - Confirmación antes de eliminar

**🗺️ Roadmap Completo**: Ver [ROADMAP_COMPLETO.md](ROADMAP_COMPLETO.md) para todas las 220 fases planificadas.

## 🎯 Funcionalidades por Sección

### Para Usuarios Anónimos
- ✅ Simulador de demostración
- ✅ Visualización de rifas públicas
- ✅ Acceso por código a rifas privadas

### Para Usuarios Registrados
- ✅ Crear simulaciones personalizadas
- ✅ Gestionar rifas (editar, eliminar)
- ✅ Códigos de acceso únicos
- ✅ Realizar sorteos automatizados
- ✅ **NUEVO**: Vista administrativa de participantes
- ✅ Estadísticas de participación

### API Backend
- ✅ Autenticación JWT
- ✅ CRUD completo de rifas
- ✅ Participación en rifas
- ✅ Sorteos automatizados
- ✅ **NUEVO**: Endpoint `/api/rifas/:id/participants` para lista de participantes
- ✅ Manejo de errores

## 🚀 Demo en Vivo

- **Frontend**: [https://talento-tech-simula-rifas.vercel.app/](https://talento-tech-simula-rifas.vercel.app/)
- **Repositorio**: [https://github.com/fasmote/TalentoTech-SimulaRifas](https://github.com/fasmote/TalentoTech-SimulaRifas)

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
- **JSON** - Almacenamiento de datos (migración a Firebase en progreso)
- **CORS** - Configuración de dominios cruzados

### Deploy y Herramientas
- **Vercel** - Plataforma de despliegue
- **Git/GitHub** - Control de versiones
- **VS Code** - Editor de código

## 📁 Estructura del Proyecto

```
TT_rifas_LIMPIA_LIMPIA/
├── public/                  # Archivos estáticos
│   ├── css/
│   │   └── styles.css      # Estilos principales
│   ├── js/
│   │   ├── app.js          # Lógica principal
│   │   └── rifas.js        # Funciones de rifas
│   └── index.html          # Página principal
├── backend/                 # Servidor Node.js (en desarrollo)
│   ├── controllers/        # Lógica de negocio
│   ├── models/             # Modelos de datos
│   ├── routes/             # Rutas de la API
│   ├── services/           # Servicios de datos
│   └── server.js           # Servidor principal
├── docs/                   # Documentación
├── .gitignore              # Archivos ignorados
├── .env.example            # Variables de entorno
├── README.md               # Este archivo
└── PRODUCTO.md             # Requerimientos detallados
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Node.js** (versión 14 o superior)
- **npm** o **yarn**
- Navegador web moderno

### Instalación Local

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/fasmote/TalentoTech-SimulaRifas.git
   cd TalentoTech-SimulaRifas
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

4. **Iniciar el servidor backend**
   ```bash
   npm run dev
   ```

5. **Abrir el frontend**
   - Abrir `public/index.html` en el navegador
   - O usar un servidor local como Live Server

### Scripts Disponibles

```bash
npm run dev          # Iniciar servidor en modo desarrollo
npm start            # Iniciar servidor en producción
npm run demo-content # Crear contenido de demostración
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
5. **🆕 Vista Administrativa**: Ver lista completa de participantes con números elegidos

### 🆕 **NUEVO - Vista Administrativa (FASE 1)**
1. **Inicia sesión** y ve a "Mis Simulaciones"
2. **Haz clic** en "Ver Detalles" de cualquier simulación
3. **Observa** la sección "👥 Lista de Participantes" (lado izquierdo)
4. **Visualiza**:
   - Nombre de cada participante
   - Números elegidos por participante
   - Total de números por participante
   - Fecha de primera participación
   - Estadísticas globales
5. **Botón 🔄 Actualizar** para refrescar datos en tiempo real

### 🔑 Acceso por Código
1. Ve a "Acceder por Código"
2. Ingresa el código de 6 caracteres
3. Selecciona números y participa
4. El propietario puede realizar el sorteo

## 🎯 Funcionalidades Principales

### Para Usuarios Anónimos
- ✅ Simulador de demostración
- ✅ Visualización de rifas públicas
- ✅ Acceso por código a rifas privadas

### Para Usuarios Registrados
- ✅ Crear simulaciones personalizadas
- ✅ Gestionar rifas (editar, eliminar)
- ✅ Códigos de acceso únicos
- ✅ Realizar sorteos automatizados
- ✅ Estadísticas de participación

### API Backend
- ✅ Autenticación JWT
- ✅ CRUD completo de rifas
- ✅ Participación en rifas
- ✅ Sorteos automatizados
- ✅ Manejo de errores

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
GET  /api/rifas/:id/participants # 🆕 NUEVO: Lista de participantes (solo propietario)
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
- Deploy en Vercel
- **🆕 FASE 1**: Vista administrativa de participantes

### 🔄 En Progreso
- **FASE 2**: Timestamps informativos (hover en números)
- **FASE 3**: Gestión de números (eliminar individual/por usuario)
- **Migración**: Firebase/Firestore (planificada)

### 📋 Próximas Features
- **FASE 4**: Colores por participante
- **FASE 5**: Layout responsivo mejorado
- **FASE 6**: Botón sorteo directo
- Notificaciones push
- Analytics de rifas
- Exportación de resultados
- Modo oscuro
- Internacionalización

**🗺️ Ver roadmap completo**: [ROADMAP_COMPLETO.md](ROADMAP_COMPLETO.md) - 220 fases planificadas

## 🤝 Contribución

Este proyecto es parte de un curso educativo, pero las contribuciones son bienvenidas:

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

**Claudio** - Estudiante TalentoTech Node.js
- GitHub: [@fasmote](https://github.com/fasmote)
- Proyecto: [TalentoTech-SimulaRifas](https://github.com/fasmote/TalentoTech-SimulaRifas)

## 🙏 Agradecimientos

- **TalentoTech** por la excelente formación en Node.js
- **Profesores y compañeros** por el apoyo constante
- **Comunidad open source** por las herramientas utilizadas

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación en `PRODUCTO.md`
2. Busca en [Issues](https://github.com/fasmote/TalentoTech-SimulaRifas/issues)
3. Crea un nuevo issue si es necesario

---

<div align="center">

**🎲 SimulaRifas - Aprendiendo Node.js con TalentoTech 🎲**

[Demo](https://talento-tech-simula-rifas.vercel.app/) • [Documentación](PRODUCTO.md) • [Reporte de Bug](https://github.com/fasmote/TalentoTech-SimulaRifas/issues)

</div>
