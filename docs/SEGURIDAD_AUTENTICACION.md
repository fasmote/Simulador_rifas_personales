# Seguridad y Autenticación - SimulaRifa

## Guía de Implementación por Niveles

---

**Documento preparado por:** Analista de Seguridad
**Fecha:** 18/11/2025
**Versión:** 1.0

---

## Tabla de Contenidos

1. [Nivel 1: Gratuito (Implementación Actual)](#nivel-1-gratuito)
2. [Nivel 2: Startup ($0-50/mes)](#nivel-2-startup)
3. [Nivel 3: Crecimiento ($50-200/mes)](#nivel-3-crecimiento)
4. [Nivel 4: Enterprise ($200+/mes)](#nivel-4-enterprise)
5. [Comparativa de Servicios](#comparativa-de-servicios)
6. [Implementación Detallada Nivel 1](#implementación-nivel-1)

---

## Nivel 1: Gratuito

**Costo:** $0/mes
**Ideal para:** MVP, proyectos educativos, <1000 usuarios

### Componentes

| Feature | Solución | Costo |
|---------|----------|-------|
| CAPTCHA | Cloudflare Turnstile | $0 |
| Rate Limiting | express-rate-limit | $0 |
| Honeypot | Implementación propia | $0 |
| Bloqueo emails temporales | Lista manual | $0 |
| Verificación email | Resend (3K/mes) | $0 |
| Reset password | Implementación propia | $0 |

### Protección Obtenida

- ✅ Protección contra bots básicos
- ✅ Límite de intentos por IP
- ✅ Verificación de email
- ✅ Recuperación de contraseña
- ⚠️ Sin protección DDoS avanzada
- ⚠️ Sin detección de patrones de abuso
- ⚠️ Sin 2FA

### Limitaciones

- Rate limiting por IP (VPN puede evadir)
- Sin análisis de comportamiento
- Sin protección contra ataques distribuidos
- Emails pueden ir a spam sin dominio propio

---

## Nivel 2: Startup

**Costo:** $0-50/mes
**Ideal para:** 1,000-10,000 usuarios, producto validado

### Componentes

| Feature | Solución | Costo |
|---------|----------|-------|
| Auth Completo | Supabase Auth | $0-25/mes |
| CAPTCHA | hCaptcha (integrado) | $0 |
| Rate Limiting | Automático | Incluido |
| Verificación email | Automático | Incluido |
| Reset password | Automático | Incluido |
| 2FA (TOTP) | Supabase | Incluido |
| Dominio email | Resend | $20/mes |

### Protección Obtenida

- ✅ Todo lo del Nivel 1
- ✅ 2FA con apps autenticadoras
- ✅ Protección DDoS básica (Cloudflare)
- ✅ Dashboard de seguridad
- ✅ Logs de intentos fallidos
- ✅ Bloqueo de IPs desde dashboard
- ⚠️ Sin WAF completo
- ⚠️ Sin detección de bots avanzada

### Alternativas

| Servicio | Costo | Pros | Contras |
|----------|-------|------|---------|
| **Supabase Auth** | $0-25 | Todo incluido, PostgreSQL | Vendor lock-in |
| **Firebase Auth** | $0 | Escala bien, Google | Necesita reCAPTCHA aparte |
| **Clerk** | $0-25 | UI pre-construida, moderno | Menos personalizable |

---

## Nivel 3: Crecimiento

**Costo:** $50-200/mes
**Ideal para:** 10,000-100,000 usuarios, ingresos constantes

### Componentes

| Feature | Solución | Costo |
|---------|----------|-------|
| Auth + Security | Auth0 | $23-240/mes |
| Bot Detection | Auth0 Bot Detection | Incluido |
| Breached Password | Auth0 | Incluido |
| MFA Avanzado | SMS, Email, Push | Incluido |
| WAF | Cloudflare Pro | $20/mes |
| Email transaccional | SendGrid Pro | $20-90/mes |
| Monitoreo | Sentry | $26/mes |

### Protección Obtenida

- ✅ Todo lo del Nivel 2
- ✅ Detección de bots con ML
- ✅ Alerta de contraseñas filtradas
- ✅ MFA con múltiples métodos
- ✅ WAF con reglas personalizadas
- ✅ Protección DDoS avanzada
- ✅ Monitoreo de errores en tiempo real
- ✅ Análisis de patrones de login
- ⚠️ Sin SOC 24/7

### Features Adicionales

```javascript
// Auth0 - Detección de contraseñas comprometidas
// Automático: Bloquea login si password está en breach databases

// Auth0 - Anomaly Detection
// Detecta: múltiples fallos, IPs sospechosas, viajes imposibles

// Cloudflare WAF - Reglas personalizadas
// Bloquea: SQL injection, XSS, path traversal
```

---

## Nivel 4: Enterprise

**Costo:** $200+/mes
**Ideal para:** >100,000 usuarios, datos sensibles, compliance

### Componentes

| Feature | Solución | Costo |
|---------|----------|-------|
| Auth Enterprise | Auth0 Enterprise / Okta | $500+/mes |
| WAF Enterprise | Cloudflare Business | $200/mes |
| DDoS | Cloudflare Spectrum | Variable |
| SIEM | Datadog Security | $100+/mes |
| Penetration Testing | HackerOne / Bugcrowd | Variable |
| Compliance | SOC2, GDPR tools | Variable |

### Protección Obtenida

- ✅ Todo lo anterior
- ✅ SSO empresarial (SAML, OIDC)
- ✅ Adaptive MFA
- ✅ Passwordless auth
- ✅ SOC 24/7 monitoring
- ✅ Compliance certifications
- ✅ Custom security rules
- ✅ Dedicated support
- ✅ SLA garantizado

### Compliance

| Certificación | Necesario para |
|---------------|----------------|
| SOC 2 Type II | B2B enterprise |
| GDPR | Usuarios EU |
| HIPAA | Datos de salud |
| PCI DSS | Pagos con tarjeta |

---

## Comparativa de Servicios

### Auth Providers

| Servicio | Free Tier | Precio Growth | Bot Protection | 2FA | Passwordless |
|----------|-----------|---------------|----------------|-----|--------------|
| **Supabase** | 50K MAU | $25/proyecto | hCaptcha | TOTP | ❌ |
| **Firebase** | 10K MAU | $0.01/verif | reCAPTCHA | SMS, TOTP | ✅ |
| **Auth0** | 7K MAU | $23-240/mes | ✅ ML | Todos | ✅ |
| **Clerk** | 10K MAU | $25/mes | ✅ | TOTP, SMS | ✅ |
| **Okta** | 100 MAU | $2/MAU | ✅ | Todos | ✅ |

### CAPTCHA

| Servicio | Free Tier | Pros | Contras |
|----------|-----------|------|---------|
| **Cloudflare Turnstile** | Ilimitado | Invisible, privado, rápido | Nuevo, menos documentación |
| **reCAPTCHA v3** | Ilimitado | Invisible, score | Google tracking |
| **hCaptcha** | 1M/mes | Privado, paga al publisher | Puede ser molesto |
| **Arkose Labs** | Enterprise | Muy efectivo | Costoso |

### Email

| Servicio | Free Tier | Precio | Deliverability |
|----------|-----------|--------|----------------|
| **Resend** | 3K/mes | $20/10K | Muy buena |
| **SendGrid** | 100/día | $20/40K | Excelente |
| **Mailgun** | 5K/mes | $35/50K | Muy buena |
| **Amazon SES** | 62K/mes* | $0.10/1K | Buena |

*Solo desde EC2

### Rate Limiting

| Solución | Tipo | Costo | Escalabilidad |
|----------|------|-------|---------------|
| **express-rate-limit** | In-memory | $0 | Single server |
| **rate-limit-redis** | Redis | $0-15 | Multi-server |
| **Cloudflare Rate Limiting** | Edge | $0-200 | Global |
| **Kong** | API Gateway | $0-300 | Enterprise |

---

## Implementación Nivel 1

### Detalle técnico para SimulaRifa (Costo $0)

### 1. Cloudflare Turnstile

**Registro:** https://dash.cloudflare.com/ → Turnstile → Add Site

**Frontend (index.html):**
```html
<!-- En el <head> -->
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

<!-- En formulario de registro/login -->
<div class="cf-turnstile" data-sitekey="TU_SITE_KEY" data-callback="onTurnstileSuccess"></div>

<script>
let turnstileToken = null;
function onTurnstileSuccess(token) {
    turnstileToken = token;
}
</script>
```

**Backend (api/index.js):**
```javascript
// Middleware de verificación Turnstile
async function verifyTurnstile(req, res, next) {
    const token = req.body.turnstileToken;

    if (!token) {
        return res.status(400).json({ error: 'Verificación requerida' });
    }

    try {
        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                secret: process.env.TURNSTILE_SECRET_KEY,
                response: token
            })
        });

        const result = await response.json();

        if (!result.success) {
            return res.status(400).json({ error: 'Verificación fallida' });
        }

        next();
    } catch (error) {
        console.error('Error Turnstile:', error);
        return res.status(500).json({ error: 'Error de verificación' });
    }
}

// Usar en rutas
app.post('/api/register', verifyTurnstile, registerHandler);
app.post('/api/login', verifyTurnstile, loginHandler);
```

**Variables de entorno:**
```bash
TURNSTILE_SITE_KEY=0x4AAAAAAA...
TURNSTILE_SECRET_KEY=0x4AAAAAAA...
```

---

### 2. Rate Limiting

**Instalación:**
```bash
npm install express-rate-limit
```

**Implementación (api/index.js):**
```javascript
const rateLimit = require('express-rate-limit');

// Límite general para API
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requests por ventana
    message: { error: 'Demasiadas peticiones. Intenta en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Límite estricto para autenticación
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // 5 intentos por hora
    message: { error: 'Demasiados intentos. Intenta en 1 hora.' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // No cuenta logins exitosos
});

// Límite para recuperación de contraseña
const forgotLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // 3 intentos por hora
    message: { error: 'Demasiadas solicitudes de recuperación.' }
});

// Aplicar límites
app.use('/api/', apiLimiter);
app.post('/api/register', authLimiter);
app.post('/api/login', authLimiter);
app.post('/api/forgot-password', forgotLimiter);
```

---

### 3. Honeypot

**Frontend:**
```html
<!-- Campo oculto que solo bots llenan -->
<input type="text"
       name="website"
       id="website"
       style="position: absolute; left: -9999px; opacity: 0;"
       tabindex="-1"
       autocomplete="off">
```

**Backend:**
```javascript
function checkHoneypot(req, res, next) {
    if (req.body.website) {
        // Es un bot - responder como si funcionara para confundirlo
        console.log('🤖 Bot detectado:', req.ip);
        return res.json({ success: true });
    }
    next();
}

app.post('/api/register', checkHoneypot, verifyTurnstile, authLimiter, registerHandler);
```

---

### 4. Bloqueo de Emails Temporales

**Lista de dominios (config/blocked-emails.js):**
```javascript
const blockedEmailDomains = [
    '10minutemail.com',
    'tempmail.com',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email',
    'fakeinbox.com',
    'temp-mail.org',
    'yopmail.com',
    'trashmail.com',
    'maildrop.cc',
    'getairmail.com',
    'mohmal.com',
    'emailondeck.com'
    // Agregar más según sea necesario
];

module.exports = blockedEmailDomains;
```

**Validación:**
```javascript
const blockedEmailDomains = require('./config/blocked-emails');

function validateEmail(req, res, next) {
    const email = req.body.email?.toLowerCase();

    if (!email) {
        return res.status(400).json({ error: 'Email requerido' });
    }

    const domain = email.split('@')[1];

    if (blockedEmailDomains.includes(domain)) {
        return res.status(400).json({
            error: 'Por favor usa un email permanente, no temporal'
        });
    }

    next();
}

app.post('/api/register', validateEmail, checkHoneypot, verifyTurnstile, authLimiter, registerHandler);
```

---

### 5. Verificación de Email con Resend

**Registro:** https://resend.com/ (3,000 emails/mes gratis)

**Instalación:**
```bash
npm install resend
```

**Esquema de base de datos:**
```sql
-- Agregar campos a tabla users
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN verification_token VARCHAR(64);
ALTER TABLE users ADD COLUMN verification_expires TIMESTAMP;

-- Tabla para reset de password
CREATE TABLE password_resets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Implementación (services/email.js):**
```javascript
const { Resend } = require('resend');
const crypto = require('crypto');

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.APP_URL || 'https://simularifa.vercel.app';

// Generar token seguro
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Enviar email de verificación
async function sendVerificationEmail(email, token) {
    const verifyUrl = `${APP_URL}/verify?token=${token}`;

    await resend.emails.send({
        from: 'SimulaRifa <noreply@resend.dev>', // Cambiar cuando tengas dominio
        to: email,
        subject: 'Verifica tu cuenta - SimulaRifa',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #667eea;">Bienvenido a SimulaRifa</h2>
                <p>Gracias por registrarte. Por favor verifica tu email haciendo click en el botón:</p>
                <a href="${verifyUrl}"
                   style="display: inline-block;
                          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                          color: white;
                          padding: 12px 24px;
                          text-decoration: none;
                          border-radius: 8px;
                          margin: 20px 0;">
                    Verificar Email
                </a>
                <p style="color: #666; font-size: 12px;">
                    Este enlace expira en 24 horas.<br>
                    Si no creaste esta cuenta, ignora este email.
                </p>
            </div>
        `
    });
}

// Enviar email de reset password
async function sendResetPasswordEmail(email, token) {
    const resetUrl = `${APP_URL}/reset-password?token=${token}`;

    await resend.emails.send({
        from: 'SimulaRifa <noreply@resend.dev>',
        to: email,
        subject: 'Recuperar contraseña - SimulaRifa',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #667eea;">Recuperar Contraseña</h2>
                <p>Recibimos una solicitud para restablecer tu contraseña.</p>
                <a href="${resetUrl}"
                   style="display: inline-block;
                          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                          color: white;
                          padding: 12px 24px;
                          text-decoration: none;
                          border-radius: 8px;
                          margin: 20px 0;">
                    Restablecer Contraseña
                </a>
                <p style="color: #666; font-size: 12px;">
                    Este enlace expira en 30 minutos.<br>
                    Si no solicitaste esto, ignora este email. Tu contraseña no será modificada.
                </p>
            </div>
        `
    });
}

module.exports = {
    generateToken,
    sendVerificationEmail,
    sendResetPasswordEmail
};
```

**Endpoints (api/index.js):**
```javascript
const { generateToken, sendVerificationEmail, sendResetPasswordEmail } = require('./services/email');

// Modificar registro para incluir verificación
app.post('/api/register', validateEmail, checkHoneypot, verifyTurnstile, authLimiter, async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Verificar si email ya existe
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email ya registrado' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generar token de verificación
        const verificationToken = generateToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

        // Crear usuario
        const result = await pool.query(
            `INSERT INTO users (username, email, password, verification_token, verification_expires)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, username, email`,
            [username, email.toLowerCase(), hashedPassword, verificationToken, verificationExpires]
        );

        // Enviar email de verificación
        await sendVerificationEmail(email, verificationToken);

        res.json({
            message: 'Cuenta creada. Revisa tu email para verificar.',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error al crear cuenta' });
    }
});

// Endpoint verificar email
app.get('/api/verify-email', async (req, res) => {
    const { token } = req.query;

    try {
        const result = await pool.query(
            `UPDATE users
             SET email_verified = TRUE, verification_token = NULL, verification_expires = NULL
             WHERE verification_token = $1 AND verification_expires > NOW()
             RETURNING id, username, email`,
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Token inválido o expirado' });
        }

        res.json({ message: 'Email verificado exitosamente' });

    } catch (error) {
        console.error('Error verificando email:', error);
        res.status(500).json({ error: 'Error al verificar email' });
    }
});

// Endpoint solicitar reset password
app.post('/api/forgot-password', forgotLimiter, async (req, res) => {
    const { email } = req.body;

    try {
        // Buscar usuario (no revelar si existe)
        const user = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        // Mensaje genérico siempre (seguridad)
        const genericMessage = 'Si el email existe, recibirás instrucciones para recuperar tu contraseña';

        if (user.rows.length === 0) {
            return res.json({ message: genericMessage });
        }

        // Generar token
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

        // Guardar token
        await pool.query(
            `INSERT INTO password_resets (user_id, token, expires_at)
             VALUES ($1, $2, $3)`,
            [user.rows[0].id, token, expiresAt]
        );

        // Enviar email
        await sendResetPasswordEmail(email, token);

        res.json({ message: genericMessage });

    } catch (error) {
        console.error('Error en forgot password:', error);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

// Endpoint resetear password
app.post('/api/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // Buscar token válido
        const resetRecord = await pool.query(
            `SELECT user_id FROM password_resets
             WHERE token = $1 AND expires_at > NOW() AND used = FALSE`,
            [token]
        );

        if (resetRecord.rows.length === 0) {
            return res.status(400).json({ error: 'Token inválido o expirado' });
        }

        const userId = resetRecord.rows[0].user_id;

        // Hash nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña
        await pool.query(
            'UPDATE users SET password = $1 WHERE id = $2',
            [hashedPassword, userId]
        );

        // Marcar token como usado
        await pool.query(
            'UPDATE password_resets SET used = TRUE WHERE token = $1',
            [token]
        );

        res.json({ message: 'Contraseña actualizada exitosamente' });

    } catch (error) {
        console.error('Error reseteando password:', error);
        res.status(500).json({ error: 'Error al actualizar contraseña' });
    }
});

// Modificar login para verificar email
app.post('/api/login', verifyTurnstile, authLimiter, async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1 OR email = $1',
            [username.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = result.rows[0];

        // Verificar password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar si email está verificado
        if (!user.email_verified) {
            return res.status(403).json({
                error: 'Email no verificado. Revisa tu bandeja de entrada.',
                needsVerification: true
            });
        }

        // Login exitoso
        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});
```

---

### 6. Variables de Entorno Requeridas

```bash
# Turnstile (Cloudflare)
TURNSTILE_SITE_KEY=0x4AAAAAAA...
TURNSTILE_SECRET_KEY=0x4AAAAAAA...

# Resend
RESEND_API_KEY=re_...

# App
APP_URL=https://simularifa.vercel.app
```

---

## Checklist de Implementación Nivel 1

### Backend
- [ ] Instalar dependencias: `npm install express-rate-limit resend`
- [ ] Registrar en Cloudflare Turnstile
- [ ] Registrar en Resend
- [ ] Agregar variables de entorno en Vercel
- [ ] Crear tablas/campos en PostgreSQL
- [ ] Implementar middlewares de seguridad
- [ ] Implementar endpoints de verificación y reset

### Frontend
- [ ] Agregar script de Turnstile
- [ ] Agregar widget en formularios de auth
- [ ] Agregar campo honeypot oculto
- [ ] Crear páginas de verificación y reset
- [ ] Manejar errores de verificación en login
- [ ] Agregar link "Olvidé mi contraseña"

### Testing
- [ ] Probar registro con Turnstile
- [ ] Probar rate limiting (5 intentos)
- [ ] Probar honeypot con bot
- [ ] Probar email de verificación
- [ ] Probar flujo de reset password
- [ ] Probar bloqueo de emails temporales

---

## Métricas de Seguridad por Nivel

| Métrica | Nivel 1 | Nivel 2 | Nivel 3 | Nivel 4 |
|---------|---------|---------|---------|---------|
| Bots bloqueados | 80% | 95% | 99% | 99.9% |
| Tiempo implementación | 4-8h | 2-4h | 8-16h | Semanas |
| Costo mensual | $0 | $25-50 | $100-200 | $500+ |
| Mantenimiento | Alto | Bajo | Medio | Bajo |
| Escalabilidad | Limitada | Buena | Muy buena | Excelente |

---

## Cuándo Escalar

### De Nivel 1 a Nivel 2:
- Más de 1,000 usuarios activos
- Ataques de bots frecuentes
- Necesitas 2FA
- Quieres reducir mantenimiento

### De Nivel 2 a Nivel 3:
- Más de 10,000 usuarios
- Necesitas compliance (SOC2, GDPR)
- Datos sensibles
- Revenue significativo

### De Nivel 3 a Nivel 4:
- Enterprise customers
- Más de 100,000 usuarios
- Requisitos regulatorios estrictos
- SLA requerido

---

## Recursos Adicionales

### Documentación Oficial
- [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)
- [Resend](https://resend.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Auth0](https://auth0.com/docs)

### Herramientas de Testing
- [Have I Been Pwned API](https://haveibeenpwned.com/API/v3) - Verificar passwords filtrados
- [Hunter.io](https://hunter.io/) - Verificar emails
- [IPQualityScore](https://www.ipqualityscore.com/) - Detectar IPs maliciosas

### Listas de Emails Temporales
- https://github.com/disposable-email-domains/disposable-email-domains

---

**Fin del Documento**

---

*Este documento sirve como referencia para implementar seguridad en SimulaRifa y proyectos similares. Actualizar según evolucionen las amenazas y servicios disponibles.*
