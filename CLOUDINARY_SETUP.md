# 📷 Guía de Configuración de Cloudinary para SimulaRifas

## 🎯 Objetivo
Configurar Cloudinary para que puedas subir y almacenar imágenes de productos en tus rifas.

---

## 📝 Paso 1: Obtener Credenciales de Cloudinary

### 1.1 Accede a tu Dashboard
Ve a: https://cloudinary.com/console

### 1.2 Copia tus credenciales
En la página principal del dashboard verás:

```
Cloud Name: xxxxxxxxxxxxx
API Key: xxxxxxxxxxxxx
API Secret: xxxxxxxxxxxxx  (click en "Show" para verlo)
```

**⚠️ IMPORTANTE**: Guarda estas 3 credenciales, las necesitarás en el siguiente paso.

---

## 🔧 Paso 2: Configurar Variables de Entorno

### 2.1 Edita el archivo `.env`

Abre el archivo: `backend/.env`

### 2.2 Agrega/actualiza estas líneas:

```bash
# ============================================
# CONFIGURACIÓN DE CLOUDINARY (Para upload de imágenes)
# ============================================
CLOUDINARY_CLOUD_NAME=tu_cloud_name_aqui
CLOUDINARY_API_KEY=tu_api_key_aqui
CLOUDINARY_API_SECRET=tu_api_secret_aqui
```

### 2.3 Reemplaza con tus credenciales reales

Ejemplo:
```bash
CLOUDINARY_CLOUD_NAME=dmxyz123
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

---

## 🚀 Paso 3: Reiniciar el Servidor

### 3.1 Detén el servidor
Si tu servidor está corriendo, presiona `Ctrl + C` en la terminal

### 3.2 Inicia el servidor nuevamente
```bash
cd backend
npm run dev
```

### 3.3 Verifica que Cloudinary está configurado
Deberías ver en la consola un mensaje como:
```
✅ Cloudinary configurado correctamente
```

---

## ✅ Paso 4: Probar el Sistema

### 4.1 Crea una nueva rifa
1. Ve a "Mis Simulaciones"
2. Click en "Nueva Simulación"

### 4.2 Agrega una imagen
Tienes **dos opciones**:

#### Opción A: Por URL
1. Click en "🔗 Por URL"
2. Pega la URL de una imagen (ejemplo: https://ejemplo.com/imagen.jpg)
3. Verás un preview inmediato

#### Opción B: Por Upload
1. Click en "📤 Subir Archivo"
2. Selecciona una imagen de tu computadora (máx 5MB)
3. La imagen se subirá a Cloudinary automáticamente
4. Verás un preview

### 4.3 Guarda la rifa
Click en "Crear Simulación"

### 4.4 Verifica que la imagen se muestra
- La imagen debe aparecer en:
  - ✅ La vista de detalles de la rifa
  - ✅ El panel lateral
  - ✅ La grilla de números

---

## 🐛 Solución de Problemas

### ❌ Error: "El servicio de carga de imágenes no está configurado"
**Solución**: Verifica que las 3 variables estén en `.env` y que reiniciaste el servidor.

### ❌ La imagen no se sube
**Posibles causas**:
1. **Archivo muy grande**: Máximo 5MB
2. **Formato inválido**: Solo JPG, PNG, GIF, WEBP
3. **Credenciales incorrectas**: Verifica que copiaste bien las credenciales

### ❌ La imagen no se muestra en la grilla
**Solución**: Este bug ya fue arreglado. Asegúrate de tener la última versión del código.

---

## 📚 Notas Adicionales

### Carpeta de Cloudinary
- Las imágenes se guardan en: `simularifas/`
- Se optimizan automáticamente a 800x800px

### Formatos Soportados
- ✅ JPG / JPEG
- ✅ PNG
- ✅ GIF
- ✅ WEBP

### Límites
- **Tamaño máximo**: 5MB por imagen
- **Optimización**: Automática a 800x800px
- **Calidad**: Auto (quality: auto:good)

---

## 🎉 ¡Listo!

Ahora puedes agregar imágenes hermosas a tus rifas y mejorar la experiencia de tus participantes.

**¿Problemas?** Revisa la consola del navegador (F12) y los logs del servidor para más detalles.
