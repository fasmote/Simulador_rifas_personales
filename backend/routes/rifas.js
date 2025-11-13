const express = require('express');
const { runQuery, getQuery, allQuery } = require('../database/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Función para generar código de acceso
const generateAccessCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// FASE 7: Función para verificar y ejecutar sorteo programado automáticamente
const checkAndExecuteScheduledDraw = async (rifaId) => {
    try {
        // Obtener información de la rifa
        const rifa = await getQuery(
            'SELECT id, status, scheduled_draw_date, timezone FROM rifas WHERE id = ?',
            [rifaId]
        );

        if (!rifa) {
            return false; // Rifa no encontrada
        }

        // Si ya está completada, no hacer nada
        if (rifa.status === 'completed') {
            return false;
        }

        // Si no tiene fecha programada, no hacer nada
        if (!rifa.scheduled_draw_date) {
            return false;
        }

        // Convertir fecha programada a Date object
        const scheduledDate = new Date(rifa.scheduled_draw_date);
        const now = new Date();

        // Si la fecha programada ya pasó, ejecutar sorteo
        if (scheduledDate <= now) {
            console.log(`🎲 [FASE 7] Ejecutando sorteo automático para rifa ${rifaId}`);

            // Verificar nuevamente que no esté completada (anti-concurrencia)
            const rifaCheck = await getQuery(
                'SELECT status FROM rifas WHERE id = ?',
                [rifaId]
            );

            if (rifaCheck.status === 'completed') {
                console.log(`⚠️ [FASE 7] Rifa ${rifaId} ya completada, abortando sorteo`);
                return false;
            }

            // Obtener números seleccionados
            const numbers = await allQuery(
                'SELECT number FROM rifa_numbers WHERE rifa_id = ?',
                [rifaId]
            );

            if (numbers.length === 0) {
                console.log(`⚠️ [FASE 7] Rifa ${rifaId} sin participantes, no se puede sortear`);
                return false;
            }

            // Seleccionar ganador aleatorio
            const randomIndex = Math.floor(Math.random() * numbers.length);
            const winnerNumber = numbers[randomIndex].number;

            // Actualizar rifa con ganador
            await runQuery(`
                UPDATE rifas
                SET winner_number = ?, status = 'completed'
                WHERE id = ? AND status = 'active'
            `, [winnerNumber, rifaId]);

            console.log(`✅ [FASE 7] Sorteo automático completado para rifa ${rifaId}. Ganador: ${winnerNumber}`);
            return true;
        }

        return false;
    } catch (error) {
        console.error('❌ [FASE 7] Error en sorteo automático:', error);
        return false;
    }
};

// Obtener todas las rifas públicas (solo simulaciones de ejemplo)
router.get('/', async (req, res) => {
    try {
        const rifas = await allQuery(`
            SELECT 
                r.*,
                'Sistema' as creator_username,
                COUNT(rn.id) as numbers_sold
            FROM rifas r
            LEFT JOIN rifa_numbers rn ON r.id = rn.rifa_id
            WHERE r.is_public = TRUE AND r.status = 'active'
            GROUP BY r.id
            ORDER BY r.created_at DESC
        `);

        res.json({ rifas });
    } catch (error) {
        console.error('Error obteniendo rifas públicas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener rifas del usuario logueado
router.get('/my', authenticateToken, async (req, res) => {
    try {
        const rifas = await allQuery(`
            SELECT 
                r.*,
                COUNT(rn.id) as numbers_sold
            FROM rifas r
            LEFT JOIN rifa_numbers rn ON r.id = rn.rifa_id
            WHERE r.user_id = ? AND (r.is_public = FALSE OR r.is_public IS NULL)
            GROUP BY r.id
            ORDER BY r.created_at DESC
        `, [req.user.id]);

        res.json({ rifas });
    } catch (error) {
        console.error('Error obteniendo rifas del usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener una rifa específica del usuario logueado
router.get('/my/:id', authenticateToken, async (req, res) => {
    try {
        // FASE 7: Verificar y ejecutar sorteo programado si corresponde
        await checkAndExecuteScheduledDraw(req.params.id);

        const rifa = await getQuery(`
            SELECT
                r.*,
                u.username as creator_username,
                COUNT(rn.id) as numbers_sold
            FROM rifas r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN rifa_numbers rn ON r.id = rn.rifa_id
            WHERE r.id = ? AND r.user_id = ?
            GROUP BY r.id, u.username
        `, [req.params.id, req.user.id]);

        if (!rifa) {
            return res.status(404).json({ error: 'Simulación no encontrada o no tienes permisos' });
        }

        // Obtener números seleccionados
        const soldNumbers = await allQuery(
            'SELECT number, participant_name FROM rifa_numbers WHERE rifa_id = ?',
            [req.params.id]
        );

        // Si la simulación está completada, obtener información del ganador
        let winnerInfo = null;
        if (rifa.status === 'completed' && rifa.winner_number !== null) {
            const winner = await getQuery(
                'SELECT participant_name FROM rifa_numbers WHERE rifa_id = ? AND number = ?',
                [rifa.id, rifa.winner_number]
            );
            winnerInfo = {
                number: rifa.winner_number,
                participant_name: winner ? winner.participant_name : 'Desconocido'
            };
        }

        res.json({
            rifa: {
                ...rifa,
                sold_numbers: soldNumbers.map(n => n.number),
                winner: winnerInfo
            }
        });
    } catch (error) {
        console.error('Error obteniendo rifa del usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener una rifa específica por ID (solo públicas o del propietario)
router.get('/:id', async (req, res) => {
    try {
        // FASE 7: Verificar y ejecutar sorteo programado si corresponde
        await checkAndExecuteScheduledDraw(req.params.id);

        const rifa = await getQuery(`
            SELECT
                r.*,
                CASE
                    WHEN r.user_id IS NULL THEN 'Sistema'
                    ELSE u.username
                END as creator_username,
                COUNT(rn.id) as numbers_sold
            FROM rifas r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN rifa_numbers rn ON r.id = rn.rifa_id
            WHERE r.id = ? AND r.is_public = TRUE
            GROUP BY r.id, u.username
        `, [req.params.id]);

        if (!rifa) {
            return res.status(404).json({ error: 'Simulación no encontrada o no es pública' });
        }

        // Obtener números seleccionados
        const soldNumbers = await allQuery(
            'SELECT number FROM rifa_numbers WHERE rifa_id = ?',
            [req.params.id]
        );

        res.json({
            rifa: {
                ...rifa,
                sold_numbers: soldNumbers.map(n => n.number)
            }
        });
    } catch (error) {
        console.error('Error obteniendo rifa:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Acceder a una simulación por código
router.get('/access/:code', async (req, res) => {
    try {
        const code = req.params.code.toUpperCase();

        const rifa = await getQuery(`
            SELECT
                r.*,
                u.username as creator_username,
                COUNT(rn.id) as numbers_sold
            FROM rifas r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN rifa_numbers rn ON r.id = rn.rifa_id
            WHERE UPPER(r.access_code) = ?
            GROUP BY r.id, u.username
        `, [code]);

        if (!rifa) {
            return res.status(404).json({ error: 'Código de simulación no válido o expirado' });
        }

        // FASE 7: Verificar y ejecutar sorteo programado si corresponde
        await checkAndExecuteScheduledDraw(rifa.id);

        // Re-obtener la rifa por si cambió el status
        const updatedRifa = await getQuery(`
            SELECT
                r.*,
                u.username as creator_username,
                COUNT(rn.id) as numbers_sold
            FROM rifas r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN rifa_numbers rn ON r.id = rn.rifa_id
            WHERE r.id = ?
            GROUP BY r.id, u.username
        `, [rifa.id]);

        // Obtener números seleccionados
        const soldNumbers = await allQuery(
            'SELECT number, participant_name FROM rifa_numbers WHERE rifa_id = ?',
            [updatedRifa.id]
        );

        // Si la simulación está completada, obtener información del ganador
        let winnerInfo = null;
        if (updatedRifa.status === 'completed' && updatedRifa.winner_number !== null) {
            const winner = await getQuery(
                'SELECT participant_name FROM rifa_numbers WHERE rifa_id = ? AND number = ?',
                [updatedRifa.id, updatedRifa.winner_number]
            );
            winnerInfo = {
                number: updatedRifa.winner_number,
                participant_name: winner ? winner.participant_name : 'Desconocido'
            };
        }

        res.json({
            rifa: {
                ...updatedRifa,
                sold_numbers: soldNumbers.map(n => n.number),
                winner: winnerInfo
            }
        });
    } catch (error) {
        console.error('Error accediendo por código:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Crear nueva simulación (solo usuarios logueados)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description, scheduled_draw_date, owner_message, timezone } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'El título es requerido' });
        }

        // FASE 7: Validar owner_message (max 100 caracteres)
        if (owner_message && owner_message.length > 100) {
            return res.status(400).json({ error: 'El mensaje no puede superar los 100 caracteres' });
        }

        // Generar código de acceso único
        let accessCode;
        let codeExists = true;

        while (codeExists) {
            accessCode = generateAccessCode();
            const existing = await getQuery(
                'SELECT id FROM rifas WHERE access_code = ?',
                [accessCode]
            );
            codeExists = !!existing;
        }

        const result = await runQuery(`
            INSERT INTO rifas (
                user_id, title, description, access_code, is_public,
                scheduled_draw_date, owner_message, timezone
            )
            VALUES (?, ?, ?, ?, FALSE, ?, ?, ?)
        `, [
            req.user.id,
            title,
            description,
            accessCode,
            scheduled_draw_date || null,
            owner_message || null,
            timezone || 'America/Argentina/Buenos_Aires'
        ]);

        const newRifa = await getQuery(
            'SELECT * FROM rifas WHERE id = ?',
            [result.id]
        );

        res.status(201).json({
            message: 'Simulación creada exitosamente',
            rifa: newRifa,
            access_code: accessCode
        });
    } catch (error) {
        console.error('Error creando simulación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Editar simulación
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { title, description, scheduled_draw_date, owner_message, timezone } = req.body;
        const rifaId = req.params.id;

        // Verificar que la simulación pertenece al usuario
        const rifa = await getQuery(
            'SELECT * FROM rifas WHERE id = ? AND user_id = ?',
            [rifaId, req.user.id]
        );

        if (!rifa) {
            return res.status(404).json({ error: 'Simulación no encontrada o no tienes permisos' });
        }

        // FASE 7: No permitir editar simulaciones completadas
        if (rifa.status === 'completed') {
            return res.status(403).json({ error: 'No se puede editar una simulación ya completada' });
        }

        // FASE 7: Validar owner_message (max 100 caracteres)
        if (owner_message && owner_message.length > 100) {
            return res.status(400).json({ error: 'El mensaje no puede superar los 100 caracteres' });
        }

        // FASE 7: Validar scheduled_draw_date
        let drawDate = scheduled_draw_date || null;
        if (drawDate === '') {
            drawDate = null; // Si viene vacío, convertir a null para remover la fecha
        }

        await runQuery(`
            UPDATE rifas
            SET title = ?,
                description = ?,
                scheduled_draw_date = ?,
                owner_message = ?,
                timezone = ?
            WHERE id = ?
        `, [
            title,
            description,
            drawDate,
            owner_message || null,
            timezone || 'America/Argentina/Buenos_Aires',
            rifaId
        ]);

        const updatedRifa = await getQuery(
            'SELECT * FROM rifas WHERE id = ?',
            [rifaId]
        );

        res.json({
            message: 'Simulación actualizada exitosamente',
            rifa: updatedRifa
        });
    } catch (error) {
        console.error('Error actualizando simulación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Eliminar simulación
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const rifaId = req.params.id;

        // Verificar que la simulación pertenece al usuario
        const rifa = await getQuery(
            'SELECT * FROM rifas WHERE id = ? AND user_id = ?',
            [rifaId, req.user.id]
        );

        if (!rifa) {
            return res.status(404).json({ error: 'Simulación no encontrada o no tienes permisos' });
        }

        // Eliminar números asociados primero
        await runQuery('DELETE FROM rifa_numbers WHERE rifa_id = ?', [rifaId]);
        
        // Eliminar simulación
        await runQuery('DELETE FROM rifas WHERE id = ?', [rifaId]);

        res.json({ message: 'Simulación eliminada exitosamente' });
    } catch (error) {
        console.error('Error eliminando simulación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Seleccionar números en una simulación (públicas o por código)
router.post('/:id/numbers', async (req, res) => {
    try {
        const { numbers, participant_name } = req.body;
        const rifaId = req.params.id;

        if (!numbers || !Array.isArray(numbers)) {
            return res.status(400).json({ error: 'Números inválidos' });
        }

        // Verificar que la simulación existe y está activa
        const rifa = await getQuery(
            'SELECT * FROM rifas WHERE id = ? AND status = ?',
            [rifaId, 'active']
        );

        if (!rifa) {
            return res.status(404).json({ error: 'Simulación no encontrada o no está activa' });
        }

        // Verificar números disponibles
        const soldNumbers = await allQuery(
            'SELECT number FROM rifa_numbers WHERE rifa_id = ?',
            [rifaId]
        );
        
        const soldNumbersArray = soldNumbers.map(n => n.number);
        const invalidNumbers = numbers.filter(n => soldNumbersArray.includes(n));

        if (invalidNumbers.length > 0) {
            return res.status(400).json({ 
                error: `Los números ${invalidNumbers.join(', ')} ya están ocupados` 
            });
        }

        // Insertar números seleccionados
        for (const number of numbers) {
            await runQuery(`
                INSERT INTO rifa_numbers (rifa_id, number, participant_name) 
                VALUES (?, ?, ?)
            `, [rifaId, number, participant_name]);
        }

        res.json({ 
            message: 'Números seleccionados exitosamente',
            numbers 
        });
    } catch (error) {
        console.error('Error seleccionando números:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Acceder por código para participar
router.post('/access/:code/numbers', async (req, res) => {
    try {
        const { numbers, participant_name } = req.body;
        const code = req.params.code.toUpperCase();

        if (!numbers || !Array.isArray(numbers)) {
            return res.status(400).json({ error: 'Números inválidos' });
        }

        // Buscar simulación por código
        const rifa = await getQuery(
            'SELECT * FROM rifas WHERE UPPER(access_code) = ? AND status = ?',
            [code, 'active']
        );

        if (!rifa) {
            return res.status(404).json({ error: 'Código de simulación no válido o expirado' });
        }

        // Verificar números disponibles
        const soldNumbers = await allQuery(
            'SELECT number FROM rifa_numbers WHERE rifa_id = ?',
            [rifa.id]
        );
        
        const soldNumbersArray = soldNumbers.map(n => n.number);
        const invalidNumbers = numbers.filter(n => soldNumbersArray.includes(n));

        if (invalidNumbers.length > 0) {
            return res.status(400).json({ 
                error: `Los números ${invalidNumbers.join(', ')} ya están ocupados` 
            });
        }

        // Insertar números seleccionados
        for (const number of numbers) {
            await runQuery(`
                INSERT INTO rifa_numbers (rifa_id, number, participant_name) 
                VALUES (?, ?, ?)
            `, [rifa.id, number, participant_name]);
        }

        res.json({ 
            message: 'Participación confirmada exitosamente',
            numbers,
            simulation_title: rifa.title
        });
    } catch (error) {
        console.error('Error participando por código:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener números de una simulación CON TIMESTAMPS (FASE 2)
router.get('/:id/numbers', async (req, res) => {
    try {
        const numbers = await allQuery(`
            SELECT
                number,
                participant_name,
                selected_at,
                selected_at as selected_at_local
            FROM rifa_numbers
            WHERE rifa_id = ?
            ORDER BY number
        `, [req.params.id]);

        // Formatear timestamps para tooltips
        const numbersWithTooltips = numbers.map(num => ({
            ...num,
            tooltip: `Elegido por ${num.participant_name} el ${formatDateForTooltip(num.selected_at_local)}`
        }));

        res.json({ numbers: numbersWithTooltips });
    } catch (error) {
        console.error('Error obteniendo números:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// FASE 2: Función helper para formatear fechas en tooltips
// Esta función maneja tanto strings (SQLite) como objetos Date (PostgreSQL)
// Entrada: "2025-08-02 15:30:45" (string de SQLite) o Date object (PostgreSQL)
// Salida: "02/08/2025 a las 15:30" (formato argentino DD/MM/YYYY a las HH:MM)
function formatDateForTooltip(dateInput) {
    if (!dateInput) return 'fecha desconocida';

    try {
        let date;

        // Verificar si es un objeto Date (PostgreSQL) o string (SQLite)
        if (dateInput instanceof Date) {
            // PostgreSQL devuelve objetos Date directamente
            date = dateInput;
        } else if (typeof dateInput === 'string') {
            // SQLite devuelve strings: "2025-08-02 15:30:45"
            const [datePart, timePart] = dateInput.split(' ');
            const [year, month, day] = datePart.split('-');
            const [hours, minutes] = timePart.split(':');

            // Creamos objeto Date (month-1 porque Date usa meses 0-11)
            date = new Date(year, month - 1, day, hours, minutes);
        } else {
            // Si no es Date ni string, intentar convertir a Date
            date = new Date(dateInput);
        }

        // Verificar que la fecha sea válida
        if (isNaN(date.getTime())) {
            console.error('Fecha inválida:', dateInput);
            return 'fecha inválida';
        }

        // Configuración para formato argentino
        const dateOptions = {
            day: '2-digit',      // 02
            month: '2-digit',    // 08
            year: 'numeric'      // 2025
        };

        const timeOptions = {
            hour: '2-digit',     // 15
            minute: '2-digit',   // 30
            hour12: false        // Formato 24 horas
        };

        // Formateo con locale argentino
        const formattedDate = date.toLocaleDateString('es-AR', dateOptions);
        const formattedTime = date.toLocaleTimeString('es-AR', timeOptions);

        return `${formattedDate} a las ${formattedTime}`;
    } catch (error) {
        console.error('Error formateando fecha:', error, 'Input:', dateInput);
        return 'fecha inválida';
    }
}

// Realizar sorteo (solo propietario)
router.post('/:id/draw', authenticateToken, async (req, res) => {
    try {
        const rifaId = req.params.id;

        // Verificar que la simulación pertenece al usuario
        const rifa = await getQuery(
            'SELECT * FROM rifas WHERE id = ? AND user_id = ? AND status = ?',
            [rifaId, req.user.id, 'active']
        );

        if (!rifa) {
            return res.status(404).json({ error: 'Simulación no encontrada o no tienes permisos' });
        }

        // Obtener números participantes
        const participants = await allQuery(
            'SELECT number, participant_name FROM rifa_numbers WHERE rifa_id = ?',
            [rifaId]
        );

        if (participants.length === 0) {
            return res.status(400).json({ error: 'No hay participantes en esta simulación' });
        }

        // Seleccionar ganador aleatorio
        const winnerIndex = Math.floor(Math.random() * participants.length);
        const winner = participants[winnerIndex];

        // FASE 7: Actualizar simulación con ganador CON protección anti-concurrencia
        // Solo actualiza si el status sigue siendo 'active'
        const updateResult = await runQuery(
            'UPDATE rifas SET winner_number = ?, status = ? WHERE id = ? AND status = ?',
            [winner.number, 'completed', rifaId, 'active']
        );

        // Verificar si realmente se actualizó (protección contra doble sorteo)
        if (updateResult.changes === 0) {
            // Otro proceso ya completó el sorteo
            console.log(`⚠️ [FASE 7] Sorteo ya realizado por otro proceso para rifa ${rifaId}`);

            // Obtener el ganador actual
            const currentRifa = await getQuery(
                'SELECT winner_number FROM rifas WHERE id = ?',
                [rifaId]
            );

            const currentWinner = await getQuery(
                'SELECT participant_name FROM rifa_numbers WHERE rifa_id = ? AND number = ?',
                [rifaId, currentRifa.winner_number]
            );

            return res.json({
                message: 'Sorteo ya realizado',
                winner: {
                    number: currentRifa.winner_number,
                    participant_name: currentWinner ? currentWinner.participant_name : 'Desconocido'
                }
            });
        }

        res.json({
            message: 'Sorteo realizado exitosamente',
            winner: {
                number: winner.number,
                participant_name: winner.participant_name
            }
        });
    } catch (error) {
        console.error('Error en sorteo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// NUEVA RUTA FASE 15N: Participar en simulación por ID
router.post('/:id/participate', async (req, res) => {
    try {
        const { numbers, participant_name } = req.body;
        const rifaId = req.params.id;

        console.log(`📝 [PARTICIPATE] Recibida participación - Rifa ID: ${rifaId}, Participante: ${participant_name}, Números: [${numbers.join(', ')}]`);

        if (!numbers || !Array.isArray(numbers)) {
            return res.status(400).json({ error: 'Números inválidos' });
        }

        if (!participant_name || participant_name.trim() === '') {
            return res.status(400).json({ error: 'El nombre del participante es requerido' });
        }

        // Verificar que la simulación existe y está activa
        const rifa = await getQuery(
            'SELECT * FROM rifas WHERE id = ? AND status = ?',
            [rifaId, 'active']
        );

        if (!rifa) {
            return res.status(404).json({ error: 'Simulación no encontrada o no está activa' });
        }

        console.log(`✅ [PARTICIPATE] Simulación encontrada: "${rifa.title}"`);

        // Verificar números disponibles
        const soldNumbers = await allQuery(
            'SELECT number FROM rifa_numbers WHERE rifa_id = ?',
            [rifaId]
        );
        
        const soldNumbersArray = soldNumbers.map(n => n.number);
        const invalidNumbers = numbers.filter(n => soldNumbersArray.includes(n));

        if (invalidNumbers.length > 0) {
            console.log(`❌ [PARTICIPATE] Números ocupados: [${invalidNumbers.join(', ')}]`);
            return res.status(400).json({ 
                error: `Los números ${invalidNumbers.join(', ')} ya están ocupados` 
            });
        }

        // Insertar números seleccionados
        for (const number of numbers) {
            await runQuery(`
                INSERT INTO rifa_numbers (rifa_id, number, participant_name) 
                VALUES (?, ?, ?)
            `, [rifaId, number, participant_name]);
            console.log(`✅ [PARTICIPATE] Número ${number} registrado para ${participant_name}`);
        }

        // Obtener información actualizada de la simulación
        const updatedRifa = await getQuery(`
            SELECT 
                r.*,
                COUNT(rn.id) as numbers_sold
            FROM rifas r
            LEFT JOIN rifa_numbers rn ON r.id = rn.rifa_id
            WHERE r.id = ?
            GROUP BY r.id
        `, [rifaId]);

        console.log(`🎯 [PARTICIPATE] Participación exitosa - ${numbers.length} números registrados`);

        res.json({ 
            message: `¡Participación exitosa! ${numbers.length} números registrados para ${participant_name}`,
            numbers,
            participant_name,
            rifa: updatedRifa
        });
    } catch (error) {
        console.error('❌ [ERROR] Error en participación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});



// Regenerar código de acceso
router.post('/:id/regenerate-code', authenticateToken, async (req, res) => {
    try {
        const rifaId = req.params.id;

        // Verificar que la simulación pertenece al usuario
        const rifa = await getQuery(
            'SELECT * FROM rifas WHERE id = ? AND user_id = ?',
            [rifaId, req.user.id]
        );

        if (!rifa) {
            return res.status(404).json({ error: 'Simulación no encontrada o no tienes permisos' });
        }

        // Generar nuevo código de acceso único
        let accessCode;
        let codeExists = true;
        
        while (codeExists) {
            accessCode = generateAccessCode();
            const existing = await getQuery(
                'SELECT id FROM rifas WHERE access_code = ? AND id != ?',
                [accessCode, rifaId]
            );
            codeExists = !!existing;
        }

        await runQuery(
            'UPDATE rifas SET access_code = ? WHERE id = ?',
            [accessCode, rifaId]
        );

        res.json({ 
            message: 'Código regenerado exitosamente',
            access_code: accessCode
        });
    } catch (error) {
        console.error('Error regenerando código:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// FASE 1: Obtener lista de participantes (solo propietario)
router.get('/:id/participants', authenticateToken, async (req, res) => {
    try {
        const rifaId = req.params.id;

        console.log(`📋 [FASE 1] Obteniendo participantes para rifa ${rifaId}`);

        // Verificar que la simulación pertenece al usuario
        const rifa = await getQuery(
            'SELECT * FROM rifas WHERE id = ? AND user_id = ?',
            [rifaId, req.user.id]
        );

        if (!rifa) {
            return res.status(404).json({ error: 'Simulación no encontrada o no tienes permisos' });
        }

        // Obtener participantes agrupados
        const participantsRaw = await allQuery(`
            SELECT
                participant_name,
                MIN(selected_at) as first_participation,
                COUNT(*) as total_numbers,
                STRING_AGG(number::text, ',' ORDER BY number) as numbers_list
            FROM rifa_numbers
            WHERE rifa_id = ?
            GROUP BY participant_name
            ORDER BY first_participation ASC
        `, [rifaId]);

        // Formatear datos para el frontend
        const participants = participantsRaw.map(p => ({
            participant_name: p.participant_name || 'Usuario sin nombre',
            first_participation: p.first_participation,
            total_numbers: p.total_numbers,
            numbers: p.numbers_list ? p.numbers_list.split(',').map(n => parseInt(n)) : []
        }));

        console.log(`✅ [FASE 1] ${participants.length} participantes procesados para rifa ${rifaId}`);

        res.json({ 
            participants,
            total_participants: participants.length,
            total_numbers_sold: participants.reduce((sum, p) => sum + p.total_numbers, 0)
        });
    } catch (error) {
        console.error('❌ [ERROR] Error obteniendo participantes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// FASE 3: Eliminar número individual (solo propietario)
router.delete('/:id/numbers/:number', authenticateToken, async (req, res) => {
    try {
        const rifaId = req.params.id;
        const number = parseInt(req.params.number);

        console.log(`🗑️ [DELETE NUMBER] Eliminando número ${number} de rifa ${rifaId}`);

        // Verificar que la simulación pertenece al usuario
        const rifa = await getQuery(
            'SELECT * FROM rifas WHERE id = ? AND user_id = ?',
            [rifaId, req.user.id]
        );

        if (!rifa) {
            return res.status(404).json({ error: 'Simulación no encontrada o no tienes permisos' });
        }

        // Verificar que el número existe
        const existingNumber = await getQuery(
            'SELECT * FROM rifa_numbers WHERE rifa_id = ? AND number = ?',
            [rifaId, number]
        );

        if (!existingNumber) {
            return res.status(404).json({ error: 'El número especificado no está ocupado' });
        }

        // Eliminar el número
        await runQuery(
            'DELETE FROM rifa_numbers WHERE rifa_id = ? AND number = ?',
            [rifaId, number]
        );

        console.log(`✅ [DELETE NUMBER] Número ${number} eliminado exitosamente`);

        res.json({ 
            message: `Número ${number} eliminado exitosamente`,
            deleted_number: number,
            participant_name: existingNumber.participant_name
        });
    } catch (error) {
        console.error('❌ [ERROR] Error eliminando número:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// FASE 3: Eliminar todos los números de un participante (solo propietario)
router.delete('/:id/participants/:participantName/numbers', authenticateToken, async (req, res) => {
    try {
        const rifaId = req.params.id;
        const participantName = decodeURIComponent(req.params.participantName);

        console.log(`🗑️ [DELETE PARTICIPANT] Eliminando todos los números de "${participantName}" en rifa ${rifaId}`);

        // Verificar que la simulación pertenece al usuario
        const rifa = await getQuery(
            'SELECT * FROM rifas WHERE id = ? AND user_id = ?',
            [rifaId, req.user.id]
        );

        if (!rifa) {
            return res.status(404).json({ error: 'Simulación no encontrada o no tienes permisos' });
        }

        // Obtener números del participante antes de eliminar
        const participantNumbers = await allQuery(
            'SELECT number FROM rifa_numbers WHERE rifa_id = ? AND participant_name = ? ORDER BY number',
            [rifaId, participantName]
        );

        if (participantNumbers.length === 0) {
            return res.status(404).json({ error: 'El participante no tiene números asignados' });
        }

        // Eliminar todos los números del participante
        const result = await runQuery(
            'DELETE FROM rifa_numbers WHERE rifa_id = ? AND participant_name = ?',
            [rifaId, participantName]
        );

        const deletedNumbers = participantNumbers.map(n => n.number);
        console.log(`✅ [DELETE PARTICIPANT] ${deletedNumbers.length} números eliminados para "${participantName}": [${deletedNumbers.join(', ')}]`);

        res.json({ 
            message: `Todos los números de "${participantName}" han sido eliminados exitosamente`,
            participant_name: participantName,
            deleted_numbers: deletedNumbers,
            total_deleted: deletedNumbers.length
        });
    } catch (error) {
        console.error('❌ [ERROR] Error eliminando números del participante:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
