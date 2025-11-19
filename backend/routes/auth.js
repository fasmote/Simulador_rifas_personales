const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { runQuery, getQuery, getAllQuery } = require('../database/database');
const { authenticateToken } = require('../middleware/auth');
const blockedEmailDomains = require('../config/blocked-emails');
const { generateToken, sendVerificationEmail, sendResetPasswordEmail } = require('../services/email');

const router = express.Router();

// ========== RATE LIMITING ==========

// Límite estricto para autenticación (5 intentos por hora)
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5,
    message: { error: 'Demasiados intentos. Por favor espera 1 hora.' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true
});

// Límite para recuperación de contraseña (3 intentos por hora)
const forgotLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3,
    message: { error: 'Demasiadas solicitudes de recuperación. Espera 1 hora.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Límite para reenvío de verificación
const resendLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 2,
    message: { error: 'Espera 5 minutos antes de solicitar otro email.' },
    standardHeaders: true,
    legacyHeaders: false
});

// ========== MIDDLEWARES DE SEGURIDAD ==========

// Honeypot - detecta bots que llenan campos ocultos
const checkHoneypot = (req, res, next) => {
    if (req.body.website || req.body.phone_confirm) {
        console.log(`🤖 Bot detectado desde IP: ${req.ip}`);
        // Responder como si funcionara para confundir al bot
        return res.json({ message: 'Operación completada' });
    }
    next();
};

// Validar que email no sea temporal
const validateEmail = (req, res, next) => {
    const email = req.body.email?.toLowerCase().trim();

    if (!email) {
        return next(); // Dejar que la validación posterior lo maneje
    }

    const domain = email.split('@')[1];

    if (domain && blockedEmailDomains.includes(domain)) {
        return res.status(400).json({
            error: 'Por favor usa un email permanente. Los emails temporales no están permitidos.'
        });
    }

    next();
};

// ========== ENDPOINTS ==========

// Registro de usuario
router.post('/register', checkHoneypot, validateEmail, authLimiter, async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validaciones básicas
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Formato de email inválido' });
        }

        // Validar username (solo alfanuméricos y guiones)
        const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                error: 'El usuario debe tener 3-30 caracteres (letras, números, guiones)'
            });
        }

        // Verificar si el usuario ya existe
        const existingUser = await getQuery(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username.toLowerCase(), email.toLowerCase()]
        );

        if (existingUser) {
            return res.status(400).json({ error: 'El usuario o email ya existe' });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario (auto-verificado para proyecto educativo)
        const result = await runQuery(
            `INSERT INTO users (username, email, password_hash, email_verified)
             VALUES (?, ?, ?, 1)`,
            [username.toLowerCase(), email.toLowerCase(), hashedPassword]
        );

        // Generar token JWT para auto-login
        const token = jwt.sign(
            { id: result.id, username: username.toLowerCase(), email: email.toLowerCase() },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Responder con token JWT (usuario ya verificado)
        res.status(201).json({
            message: 'Cuenta creada exitosamente. Ya puedes usar la aplicación.',
            user: { id: result.id, username: username.toLowerCase(), email: email.toLowerCase() },
            token
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Login
router.post('/login', checkHoneypot, authLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
        }

        // Buscar usuario por username o email
        const user = await getQuery(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username.toLowerCase(), username.toLowerCase()]
        );

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar si el email está verificado
        if (!user.email_verified) {
            return res.status(403).json({
                error: 'Email no verificado. Revisa tu bandeja de entrada o solicita un nuevo email.',
                needsVerification: true,
                email: user.email
            });
        }

        // Generar token
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login exitoso',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
            token
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Verificar email
router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ error: 'Token de verificación requerido' });
        }

        // Buscar usuario con token válido
        const user = await getQuery(
            `SELECT id, username, email, verification_expires FROM users
             WHERE verification_token = ?`,
            [token]
        );

        if (!user) {
            return res.status(400).json({ error: 'Token inválido' });
        }

        // Verificar si el token ha expirado
        if (new Date(user.verification_expires) < new Date()) {
            return res.status(400).json({ error: 'Token expirado. Solicita uno nuevo.' });
        }

        // Marcar email como verificado
        await runQuery(
            `UPDATE users
             SET email_verified = 1, verification_token = NULL, verification_expires = NULL
             WHERE id = ?`,
            [user.id]
        );

        // Generar token JWT para auto-login
        const jwtToken = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Email verificado exitosamente',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
            token: jwtToken
        });

    } catch (error) {
        console.error('Error verificando email:', error);
        res.status(500).json({ error: 'Error al verificar email' });
    }
});

// Reenviar email de verificación
router.post('/resend-verification', resendLimiter, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email requerido' });
        }

        // Buscar usuario no verificado
        const user = await getQuery(
            'SELECT id, username FROM users WHERE email = ? AND email_verified = 0',
            [email.toLowerCase()]
        );

        // Mensaje genérico (no revelar si existe)
        const genericMessage = 'Si el email existe y no está verificado, recibirás un nuevo enlace.';

        if (!user) {
            return res.json({ message: genericMessage });
        }

        // Generar nuevo token
        const verificationToken = generateToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        // Actualizar token
        await runQuery(
            `UPDATE users SET verification_token = ?, verification_expires = ? WHERE id = ?`,
            [verificationToken, verificationExpires, user.id]
        );

        // Enviar email
        await sendVerificationEmail(email, verificationToken);

        res.json({ message: genericMessage });

    } catch (error) {
        console.error('Error reenviando verificación:', error);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

// Solicitar recuperación de contraseña
router.post('/forgot-password', checkHoneypot, forgotLimiter, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email requerido' });
        }

        // Buscar usuario
        const user = await getQuery(
            'SELECT id FROM users WHERE email = ?',
            [email.toLowerCase()]
        );

        if (!user) {
            return res.status(404).json({ error: 'No existe una cuenta con ese email' });
        }

        // Generar token
        const resetToken = generateToken();
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutos

        // Guardar token
        await runQuery(
            `INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)`,
            [user.id, resetToken, expiresAt]
        );

        // Para proyecto educativo: devolver el token directamente
        // En producción real, esto se enviaría por email
        res.json({
            message: 'Se ha generado un enlace para restablecer tu contraseña.',
            resetToken: resetToken,
            note: 'Proyecto educativo - En producción real este token se enviaría por email'
        });

    } catch (error) {
        console.error('Error en forgot password:', error);
        res.status(500).json({ error: 'Error al procesar solicitud' });
    }
});

// Resetear contraseña
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        console.log('🔄 Reset password request received');
        console.log('📝 Token received:', token ? token.substring(0, 10) + '...' : 'EMPTY');

        if (!token || !newPassword) {
            console.log('❌ Missing token or password');
            return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
        }

        if (newPassword.length < 6) {
            console.log('❌ Password too short');
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        // Buscar token válido
        console.log('🔍 Searching for token in database...');
        const resetRecord = await getQuery(
            `SELECT user_id, expires_at, used FROM password_resets
             WHERE token = ?`,
            [token]
        );

        console.log('📊 Token search result:', resetRecord ? JSON.stringify(resetRecord) : 'NOT FOUND');

        if (!resetRecord) {
            console.log('❌ Token not found in database');
            return res.status(400).json({ error: 'Token no encontrado en la base de datos' });
        }

        if (resetRecord.used === 1) {
            console.log('❌ Token already used');
            return res.status(400).json({ error: 'Token ya utilizado. Solicita uno nuevo.' });
        }

        // Verificar si el token ha expirado
        const expiresAt = new Date(resetRecord.expires_at);
        const now = new Date();
        console.log('⏰ Token expires_at:', expiresAt.toISOString());
        console.log('⏰ Current time:', now.toISOString());

        if (expiresAt < now) {
            console.log('❌ Token expired');
            return res.status(400).json({ error: 'Token expirado. Solicita uno nuevo.' });
        }

        console.log('✅ Token is valid, proceeding with password reset');

        // Hash nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña
        await runQuery(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [hashedPassword, resetRecord.user_id]
        );

        // Marcar token como usado
        await runQuery(
            'UPDATE password_resets SET used = 1 WHERE token = ?',
            [token]
        );

        // Invalidar todos los tokens de reset del usuario
        await runQuery(
            'UPDATE password_resets SET used = 1 WHERE user_id = ?',
            [resetRecord.user_id]
        );

        console.log('✅ Password updated successfully for user_id:', resetRecord.user_id);
        res.json({ message: 'Contraseña actualizada exitosamente' });

    } catch (error) {
        console.error('❌ Error reseteando password:', error);
        res.status(500).json({ error: 'Error al actualizar contraseña' });
    }
});

// Obtener usuario actual
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await getQuery(
            'SELECT id, username, email, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ user });

    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Logout (en el frontend se elimina el token)
router.post('/logout', (req, res) => {
    res.json({ message: 'Logout exitoso' });
});

module.exports = router;
