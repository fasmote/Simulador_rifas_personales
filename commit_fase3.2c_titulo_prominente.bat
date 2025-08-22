@echo off
echo ===============================================
echo  FASE 3.2c - TITULO PROMINENTE MEJORADO
echo ===============================================
echo.
echo Agregando archivos modificados...
git add public/css/styles.css
git add public/js/app.js
git add FASE_3.2c_TITULO_PROMINENTE.md
git add CHANGELOG.md

echo.
echo Realizando commit...
git commit -m "feat: FASE 3.2c - Implementar titulo prominente con estilos CSS destacados

- Agregar estilos CSS prominentes (.rifa-title-section, .rifa-title-main)
- Seccion de titulo con fondo degradado, borde azul y sombra elegante
- Emoji animado con efecto pulse sutil en titulo
- Actualizar viewRifa() y viewRifaByCode() con nuevos estilos
- Consistencia visual entre vista propietario y participante
- Titulo ahora es visualmente imposible de ignorar
- 72 lineas de CSS agregadas para diseno profesional
- Responsive design optimizado para todos los dispositivos

Archivos modificados:
- public/css/styles.css (nuevos estilos prominentes)
- public/js/app.js (vistas actualizadas)
- FASE_3.2c_TITULO_PROMINENTE.md (documentacion)
- CHANGELOG.md (registro de cambios)"

echo.
echo ===============================================
echo  COMMIT REALIZADO EXITOSAMENTE
echo ===============================================
echo.
echo El titulo de la rifa ahora es PROMINENTE y VISIBLE:
echo - Fondo degradado elegante
echo - Borde azul destacado  
echo - Sombra profesional
echo - Emoji animado
echo - Tipografia bold 1.3rem
echo - Consistente en ambas vistas
echo.
echo Proxima fase disponible: FASE 3.3 - Colores por participante
pause
