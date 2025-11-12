const { runQuery, getQuery, allQuery } = require('./database');

const createDemoContent = async () => {
    try {
        console.log('🎊 FASE 15: Creando contenido de demostración...');

        // Función para generar código de acceso
        const generateAccessCode = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < 6; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        };

        // Verificar si ya existen rifas públicas
        const existingPublicRifas = await allQuery('SELECT COUNT(*) as count FROM rifas WHERE is_public = TRUE');
        if (existingPublicRifas[0].count > 0) {
            console.log('🎮 Rifas públicas ya existen. Limpiando primero...');
            await runQuery('DELETE FROM rifa_numbers WHERE rifa_id IN (SELECT id FROM rifas WHERE is_public = TRUE)');
            await runQuery('DELETE FROM rifas WHERE is_public = TRUE');
        }

        // Crear o obtener usuario del sistema para rifas públicas
        let systemUserId;
        try {
            // Intentar obtener usuario admin existente
            const adminUser = await getQuery('SELECT id FROM users WHERE username = ?', ['admin']);
            if (adminUser) {
                systemUserId = adminUser.id;
                console.log('👤 Usando usuario admin existente (ID: ' + systemUserId + ')');
            } else {
                // Crear usuario del sistema para rifas públicas
                const bcrypt = require('bcryptjs');
                const hashedPassword = await bcrypt.hash('admin123', 10);
                const newUser = await runQuery(`
                    INSERT INTO users (username, email, password_hash, created_at)
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                `, ['admin', 'admin@sistema.demo', hashedPassword]);
                systemUserId = newUser.id;
                console.log('👤 Usuario del sistema creado (ID: ' + systemUserId + ')');
            }
        } catch (error) {
            console.error('❌ Error gestionando usuario del sistema:', error.message);
            return;
        }
        
        // RIFAS PÚBLICAS DE DEMOSTRACIÓN - FASE 15
        const rifasDemo = [
            {
                title: 'iPhone 15 Pro',
                description: 'Sorteo corporativo educativo. El más moderno smartphone de Apple con cámara profesional, pantalla Super Retina XDR y chip A17 Pro. Esta es una simulación educativa sin valor monetario.',
                emoji: '📱',
                participantes: [
                    'Ana Martínez', 'Carlos Silva', 'María Rodriguez', 'Juan Pérez', 
                    'Sofia López', 'Diego García', 'Laura Fernández', 'Miguel Torres',
                    'Valentina Cruz', 'Sebastián Ruiz', 'Camila Vargas', 'Andrés Morales'
                ]
            },
            {
                title: 'Cartera de Mujer Premium',
                description: 'Elegante cartera de cuero afgano auténtico, hecha a mano por artesanos especializados. Incluye múltiples compartimentos y acabados de lujo. Simulación educativa para fines de demostración.',
                emoji: '👜',
                participantes: [
                    'Isabella Santos', 'Gabriela Herrera', 'Natalia Jiménez', 'Adriana Castro',
                    'Lucía Mendoza', 'Daniela Ortiz', 'Alejandra Vega', 'Carolina Reyes',
                    'Antonella Flores', 'Valentina Rojas'
                ]
            },
            {
                title: 'Viaje a Europa',
                description: 'Promoción especial educativa: Viaje todo incluido para 2 personas por 15 días visitando París, Roma, Madrid y Barcelona. Incluye vuelos, hoteles 4 estrellas y tours guiados. Esta es una simulación para fines educativos.',
                emoji: '✈️',
                participantes: [
                    'Roberto Delgado', 'Fernanda Aguilar', 'Ricardo Salinas', 'Mónica Paredes',
                    'Eduardo Ramírez', 'Paola Cortés', 'Alberto Guerrero', 'Sandra Molina',
                    'Javier Espinoza', 'Rocío Cabrera', 'Mauricio Luna', 'Beatriz Navarro',
                    'Gabriel Soto', 'Elena Ramos', 'Fernando Medina', 'Cristina Peña'
                ]
            }
        ];

        // Crear las rifas de demostración
        for (let i = 0; i < rifasDemo.length; i++) {
            const rifa = rifasDemo[i];
            
            // Generar código de acceso único
            let accessCode;
            let codeExists = true;
            while (codeExists) {
                accessCode = generateAccessCode();
                const existing = await getQuery('SELECT id FROM rifas WHERE access_code = ?', [accessCode]);
                codeExists = !!existing;
            }

            // Crear la rifa pública
            const result = await runQuery(`
                INSERT INTO rifas (
                    user_id, title, description, access_code,
                    is_public, status, max_numbers, created_at
                ) VALUES (?, ?, ?, ?, TRUE, 'active', 100, CURRENT_TIMESTAMP)
                RETURNING id
            `, [systemUserId, rifa.title, rifa.description, accessCode]);

            const rifaId = result.id;
            console.log(`🎁 Rifa "${rifa.title}" creada (ID: ${rifaId}, Código: ${accessCode})`);

            // Agregar participantes realistas
            const participantes = rifa.participantes;
            const numerosAsignados = new Set();
            
            for (let j = 0; j < participantes.length; j++) {
                const participante = participantes[j];
                
                // Asignar entre 1-3 números por participante
                const cantidadNumeros = Math.floor(Math.random() * 3) + 1;
                
                for (let k = 0; k < cantidadNumeros; k++) {
                    let numero;
                    let intentos = 0;
                    
                    // Buscar un número disponible
                    do {
                        numero = Math.floor(Math.random() * 100);
                        intentos++;
                    } while (numerosAsignados.has(numero) && intentos < 50);
                    
                    if (!numerosAsignados.has(numero)) {
                        numerosAsignados.add(numero);

                        const horasAtras = Math.floor(Math.random() * 72) + 1;
                        await runQuery(`
                            INSERT INTO rifa_numbers (rifa_id, number, participant_name, selected_at)
                            VALUES (?, ?, ?, NOW() - INTERVAL '1 hour' * ?)
                        `, [rifaId, numero, participante, horasAtras]);
                    }
                }
            }
            
            console.log(`👥 ${numerosAsignados.size} números asignados a ${participantes.length} participantes`);
        }

        // Mostrar resumen
        console.log('\n✅ FASE 15 COMPLETADA - Demo Content creado exitosamente!');
        console.log('\n🎊 RIFAS PÚBLICAS DISPONIBLES:');
        
        const rifasCreadas = await allQuery(`
            SELECT 
                r.title,
                r.access_code,
                COUNT(rn.id) as participantes
            FROM rifas r
            LEFT JOIN rifa_numbers rn ON r.id = rn.rifa_id
            WHERE r.is_public = TRUE
            GROUP BY r.id
            ORDER BY r.created_at
        `);

        rifasCreadas.forEach((rifa, index) => {
            const emoji = rifasDemo[index]?.emoji || '🎁';
            console.log(`   ${emoji} ${rifa.title}`);
            console.log(`      Código: ${rifa.access_code}`);
            console.log(`      Participantes: ${rifa.participantes}`);
            console.log('');
        });

        console.log('🎯 CARACTERÍSTICAS DE LAS RIFAS DEMO:');
        console.log('   ✅ Públicas (visibles sin login)');
        console.log('   ✅ Sin precios (cumple normativa argentina)');
        console.log('   ✅ Participantes realistas');
        console.log('   ✅ Códigos de acceso funcionales');
        console.log('   ✅ Datos educativos/demostrativos');
        console.log('');
        console.log('📱 Los usuarios pueden:');
        console.log('   👀 Ver rifas en "Simulaciones Públicas"');
        console.log('   🎯 Participar sin registrarse');
        console.log('   🔍 Explorar la funcionalidad completa');

    } catch (error) {
        console.error('❌ Error creando contenido de demostración:', error);
        throw error;
    }
};

// Ejecutar si se llama directamente
if (require.main === module) {
    createDemoContent().then(() => {
        console.log('\n🚀 Demo content listo para FASE 15!');
        process.exit(0);
    }).catch(error => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
}

module.exports = createDemoContent;