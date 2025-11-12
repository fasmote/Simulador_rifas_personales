const { runQuery } = require('./database');
const bcrypt = require('bcryptjs');

const addSampleData = async () => {
    try {
        console.log('🎯 Agregando datos de ejemplo adicionales...');

        // Usuarios de ejemplo adicionales
        const usuarios = [
            { username: 'juan_perez', email: 'juan@ejemplo.com', password: 'password123' },
            { username: 'maria_garcia', email: 'maria@ejemplo.com', password: 'password123' },
            { username: 'carlos_lopez', email: 'carlos@ejemplo.com', password: 'password123' }
        ];

        for (const usuario of usuarios) {
            try {
                const hashedPassword = await bcrypt.hash(usuario.password, 10);
                await runQuery(`
                    INSERT INTO users (username, email, password_hash) 
                    VALUES (?, ?, ?)
                `, [usuario.username, usuario.email, hashedPassword]);
                console.log(`👤 Usuario ${usuario.username} creado`);
            } catch (err) {
                if (err.message.includes('UNIQUE') || err.message.includes('duplicate key')) {
                    console.log(`👤 Usuario ${usuario.username} ya existe`);
                } else {
                    console.log(`❌ Error creando usuario ${usuario.username}:`, err.message);
                }
            }
        }

        // Rifas de ejemplo adicionales
        const rifasEjemplo = [
            {
                title: 'Laptop Gaming',
                description: 'Laptop para gaming de alta gama - RTX 4070',
                price: 75.00,
                user_id: 2
            },
            {
                title: 'Set de Electrodomésticos',
                description: 'Microondas, licuadora y cafetera',
                price: 30.00,
                user_id: 3
            },
            {
                title: 'Bicicleta de Montaña',
                description: 'Bicicleta profesional para montaña',
                price: 40.00,
                user_id: 4
            },
            {
                title: 'Smart TV 55 pulgadas',
                description: 'Televisor 4K con Android TV',
                price: 60.00,
                user_id: 2
            }
        ];

        for (const rifa of rifasEjemplo) {
            try {
                const result = await runQuery(`
                    INSERT INTO rifas (user_id, title, description, price_per_number, status) 
                    VALUES (?, ?, ?, ?, 'active')
                `, [rifa.user_id, rifa.title, rifa.description, rifa.price]);
                
                console.log(`🎁 Rifa "${rifa.title}" creada con ID ${result.id}`);
                
                // Agregar algunos números vendidos aleatoriamente
                const numerosSoldados = Math.floor(Math.random() * 20) + 5; // Entre 5 y 25 números
                for (let i = 0; i < numerosSoldados; i++) {
                    const numeroAleatorio = Math.floor(Math.random() * 100);
                    try {
                        await runQuery(`
                            INSERT INTO rifa_numbers (rifa_id, number, participant_name) 
                            VALUES (?, ?, ?)
                        `, [result.id, numeroAleatorio, `Participante ${i + 1}`]);
                    } catch (err) {
                        // Ignorar si el número ya existe
                    }
                }
                
            } catch (err) {
                console.log(`❌ Error creando rifa "${rifa.title}":`, err.message);
            }
        }

        console.log('✅ Datos de ejemplo agregados exitosamente!');
        console.log('\n📋 Usuarios disponibles:');
        console.log('  - admin / admin@talentotech.com (password: 123456)');
        console.log('  - juan_perez / juan@ejemplo.com (password: password123)');
        console.log('  - maria_garcia / maria@ejemplo.com (password: password123)');
        console.log('  - carlos_lopez / carlos@ejemplo.com (password: password123)');

    } catch (error) {
        console.error('❌ Error agregando datos de ejemplo:', error);
    }
    
    process.exit(0);
};

// Ejecutar si se llama directamente
if (require.main === module) {
    addSampleData();
}

module.exports = addSampleData;
