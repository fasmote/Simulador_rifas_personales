// Servicio de Email con Resend
// FASE 9: Sistema de verificación y recuperación de contraseña

const crypto = require('crypto');

// Resend se inicializa solo si hay API key
let resend = null;
const initResend = () => {
    if (process.env.RESEND_API_KEY && !resend) {
        const { Resend } = require('resend');
        resend = new Resend(process.env.RESEND_API_KEY);
    }
    return resend;
};

const APP_URL = process.env.APP_URL || 'https://simulador-rifas-personales.vercel.app';
const APP_NAME = 'SimulaRifa';

// Generar token seguro
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Enviar email de verificación
async function sendVerificationEmail(email, token) {
    const client = initResend();
    if (!client) {
        console.log('⚠️ Resend no configurado - Email de verificación no enviado');
        console.log(`📧 Token de verificación para ${email}: ${token}`);
        return { success: false, message: 'Email service not configured' };
    }

    const verifyUrl = `${APP_URL}?verify=${token}`;

    try {
        await client.emails.send({
            from: `${APP_NAME} <onboarding@resend.dev>`,
            to: email,
            subject: `Verifica tu cuenta - ${APP_NAME}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #667eea; margin: 0;">🎲 ${APP_NAME}</h1>
                    </div>

                    <h2 style="color: #333;">¡Bienvenido!</h2>
                    <p style="color: #666; line-height: 1.6;">
                        Gracias por registrarte en ${APP_NAME}. Para completar tu registro y comenzar a crear simulaciones de rifas, por favor verifica tu email haciendo clic en el siguiente botón:
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verifyUrl}"
                           style="display: inline-block;
                                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                  color: white;
                                  padding: 14px 28px;
                                  text-decoration: none;
                                  border-radius: 8px;
                                  font-weight: bold;
                                  font-size: 16px;">
                            ✓ Verificar Email
                        </a>
                    </div>

                    <p style="color: #999; font-size: 12px; margin-top: 30px;">
                        Este enlace expira en 24 horas.<br>
                        Si no creaste esta cuenta, puedes ignorar este email.
                    </p>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

                    <p style="color: #999; font-size: 11px; text-align: center;">
                        ${APP_NAME} - Simulador de Rifas Educativo<br>
                        Este es un proyecto educativo sin valor monetario real.
                    </p>
                </div>
            `
        });

        console.log(`✅ Email de verificación enviado a ${email}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Error enviando email de verificación:', error);
        return { success: false, error: error.message };
    }
}

// Enviar email de recuperación de contraseña
async function sendResetPasswordEmail(email, token) {
    const client = initResend();
    if (!client) {
        console.log('⚠️ Resend no configurado - Email de reset no enviado');
        console.log(`📧 Token de reset para ${email}: ${token}`);
        return { success: false, message: 'Email service not configured' };
    }

    const resetUrl = `${APP_URL}?reset=${token}`;

    try {
        await client.emails.send({
            from: `${APP_NAME} <onboarding@resend.dev>`,
            to: email,
            subject: `Recuperar contraseña - ${APP_NAME}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #667eea; margin: 0;">🎲 ${APP_NAME}</h1>
                    </div>

                    <h2 style="color: #333;">Recuperar Contraseña</h2>
                    <p style="color: #666; line-height: 1.6;">
                        Recibimos una solicitud para restablecer la contraseña de tu cuenta. Si no realizaste esta solicitud, puedes ignorar este email.
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}"
                           style="display: inline-block;
                                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                  color: white;
                                  padding: 14px 28px;
                                  text-decoration: none;
                                  border-radius: 8px;
                                  font-weight: bold;
                                  font-size: 16px;">
                            🔑 Restablecer Contraseña
                        </a>
                    </div>

                    <p style="color: #999; font-size: 12px; margin-top: 30px;">
                        Este enlace expira en 30 minutos.<br>
                        Si no solicitaste esto, tu contraseña no será modificada.
                    </p>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

                    <p style="color: #999; font-size: 11px; text-align: center;">
                        ${APP_NAME} - Simulador de Rifas Educativo
                    </p>
                </div>
            `
        });

        console.log(`✅ Email de reset enviado a ${email}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Error enviando email de reset:', error);
        return { success: false, error: error.message };
    }
}

// Reenviar email de verificación
async function resendVerificationEmail(email, token) {
    return sendVerificationEmail(email, token);
}

module.exports = {
    generateToken,
    sendVerificationEmail,
    sendResetPasswordEmail,
    resendVerificationEmail
};
