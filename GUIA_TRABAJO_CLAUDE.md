# Instrucciones para Claude Code - SimulaRifas Personal

## 📋 Proceso de Trabajo

### Metodología de Desarrollo
1. **Pequeños incrementos** - Cambios focalizados y manejables
2. **Testing inmediato** - Probar cada cambio antes de continuar
3. **Commits frecuentes** - Commits descriptivos después de cada feature
4. **Merge al finalizar** - Push a la rama claude/* y preparar para merge

### Flujo de Trabajo Típico
```
1. Leer PLAN_FASES.md para contexto
2. Entender la fase actual
3. Planificar con TodoWrite
4. Implementar paso a paso
5. Testear cada cambio
6. Commitear con mensaje descriptivo
7. Actualizar documentación
8. Push final
```

## 💬 Estilo de Comunicación

### Comentarios en el Código
- **Educativos**: Explicar el "por qué" de las decisiones técnicas
- **Claros**: Para que el usuario aprenda mientras revisa el código
- **Contextuales**: Relacionar con las fases del proyecto
- **Ejemplos**: Incluir ejemplos cuando sea relevante

### Explicaciones al Usuario
- **Concisas pero completas**: No asumir conocimiento previo
- **Paso a paso**: Desglosar procesos complejos
- **Visuales**: Usar ejemplos y estructuras claras
- **Sin emojis excesivos**: Solo cuando agreguen valor

## 🎨 Consideraciones de Diseño

### Responsive Design
- **Mobile-first**: Siempre considerar dispositivos móviles
- **Escritorio**: Asegurar buena experiencia en pantallas grandes
- **Testing**: Verificar en ambas resoluciones
- **Media queries**: Usar cuando sea necesario

### UX Moderna
- **Sin alerts/prompts nativos**: Usar modales personalizados
- **Animaciones suaves**: Transiciones elegantes
- **Feedback visual**: Usuario siempre sabe qué está pasando
- **Accesibilidad**: Considerar autofocus, teclado, etc.

## 🔧 Gestión de Ramas

### Nombres Descriptivos
- Usar nombres significativos al crear sesión
- Ejemplos: `fase-5-layout`, `fix-mobile`, `feature-notifications`
- Evitar nombres genéricos como "hola" o "test"

### Commits
```bash
# Formato preferido:
tipo: Descripción breve

- Detalle 1
- Detalle 2
- Detalle 3
```

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`

## 📝 Documentación

### Actualizar Siempre
- **PLAN_FASES.md**: Al completar cada fase
- **Comentarios en código**: Durante la implementación
- **README.md**: Si hay cambios importantes en setup
- **DICCIONARIO_FUNCIONES.md**: Al agregar funciones clave

### Formato de FASE Completada
```markdown
### **✅ FASE X: Nombre de la Fase - COMPLETADA**
- **✅ Objetivo**: Descripción clara
- **✅ Archivos modificados**: Lista de archivos
- **✅ Features implementadas**:
  - ✅ Feature 1: Descripción
  - ✅ Feature 2: Descripción
```

## 🧪 Testing

### Checklist de Testing
- [ ] Funcionalidad básica funciona
- [ ] Sin errores en consola del navegador
- [ ] Sin errores en terminal del backend
- [ ] Responsive (mobile y escritorio)
- [ ] Integración con features existentes
- [ ] Edge cases considerados

### Comandos Útiles
```bash
# Backend
cd backend
npm run dev

# Verificar logs en consola del navegador
# Probar en Chrome DevTools modo responsive
```

## 📚 Archivos Clave a Leer al Inicio

1. **PLAN_FASES.md** - Estado actual y próximas fases
2. **Este archivo** - Instrucciones de trabajo
3. **PRODUCTO.md** - Si necesitas entender el proyecto completo
4. **ROADMAP_COMPLETO.md** - Visión a largo plazo (opcional)

## 🎯 Ejemplo de Inicio de Sesión

```
Usuario: "Lee PLAN_FASES.md e INSTRUCCIONES_CLAUDE.md.
         Vamos a trabajar en la FASE X: [descripción]"

Claude:
1. Lee ambos archivos
2. Confirma entendimiento de la fase
3. Propone plan de acción con TodoWrite
4. Comienza implementación siguiendo estas instrucciones
```

## ⚠️ Restricciones Importantes

- **NO** puedo hacer push a `main` directamente
- **SOLO** puedo pushear a ramas `claude/*-[session-id]`
- **NO** puedo crear Pull Requests automáticamente (restricción gh)
- **SÍ** puedo preparar todo para que el usuario haga merge

## 🎓 Filosofía

> "Código claro y educativo. Cambios pequeños y testeados.
> Documentación actualizada. Usuario aprende en el proceso."

---

*Última actualización: Noviembre 2025*
*Usa este archivo como guía en cada sesión de Claude Code*
