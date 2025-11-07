// ========== RIFAS.JS - FUNCIONES ESPECÍFICAS DE RIFAS ==========
// Funciones para gestión de rifas, participación y visualización

// ========== FUNCIONES RIFAS PÚBLICAS - FASE 15C ==========

async function viewPublicRifa(rifaId) {
    document.getElementById('mainContainer').innerHTML = `
        <div class="loading">
            <p>🔄 Cargando detalles de la simulación...</p>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_BASE}/rifas/${rifaId}`);
        const data = await response.json();
        
        if (response.ok && data.rifa) {
            const rifa = data.rifa;
            const isCompleted = rifa.status === 'completed';
            const winnerNumber = rifa.winner ? rifa.winner.number : null;
            const emoji = rifa.title.includes('iPhone') ? '📱' : 
                         rifa.title.includes('Cartera') ? '👜' : '✈️';
            const progressPercent = rifa.max_numbers ? Math.round((rifa.numbers_sold / rifa.max_numbers) * 100) : 0;
            
            // Generar grid de números
            let numbersGridHtml = '';
            for (let i = 0; i <= 99; i++) {
                const isSelected = rifa.sold_numbers && rifa.sold_numbers.includes(i);
                const isWinner = winnerNumber === i;
                let cellClass = 'number-cell';
                
                if (isWinner) {
                    cellClass = 'number-cell winner';
                } else if (isSelected) {
                    cellClass = 'number-cell sold';
                }
                
                numbersGridHtml += `<div class="${cellClass}">${i.toString().padStart(2, '0')}</div>`;
            }
            
            document.getElementById('mainContainer').innerHTML = `
                <div class="page-header">
                    <h1>${emoji} ${rifa.title}</h1>
                    <p class="subtitle">Simulación pública de demostración</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <button class="btn btn-secondary" onclick="navigateTo('rifas')">
                        ← Volver a Simulaciones Públicas
                    </button>
                </div>
                
                <div class="legal-notice">
                    <strong>Vista de Solo Lectura:</strong> Esta es una simulación pública de demostración. Los números mostrados en rojo ya están ocupados por otros participantes.
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 350px; gap: 30px; margin-bottom: 30px;" class="rifa-details-grid">
                    <div class="numbers-section">
                        <h3 style="margin-bottom: 15px; color: #333;">🎯 Números de la Simulación</h3>
                        <p style="color: #666; margin-bottom: 20px;">Los números en rojo ya están seleccionados</p>
                        
                        <div class="numbers-grid">
                            ${numbersGridHtml}
                        </div>
                        
                        <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                            <h4 style="color: #333; margin-bottom: 10px;">📊 Estadísticas</h4>
                            <p style="margin: 5px 0; color: #666;">• Números ocupados: ${rifa.numbers_sold}/100</p>
                            <p style="margin: 5px 0; color: #666;">• Progreso: ${progressPercent}%</p>
                            <p style="margin: 5px 0; color: #666;">• Estado: ${rifa.status === 'active' ? 'Activa' : 'Finalizada'}</p>
                        </div>
                    </div>
                    
                    <div class="cart-section">
                        <div class="cart-header">
                            <span class="cart-icon">${emoji}</span>
                            <h3 class="cart-title">Información</h3>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <h4 style="color: #333; margin-bottom: 10px;">📝 Descripción</h4>
                            <p style="color: #666; line-height: 1.5; font-size: 0.9rem;">${rifa.description}</p>
                        </div>
                        
                        <div class="rifa-progress" style="margin-bottom: 20px;">
                            <h4 style="color: #333; margin-bottom: 10px;">📈 Progreso</h4>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progressPercent}%"></div>
                            </div>
                            <p class="progress-text">${rifa.numbers_sold}/100 números seleccionados</p>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <h4 style="color: #333; margin-bottom: 10px;">ℹ️ Detalles</h4>
                            <p style="color: #666; font-size: 0.9rem; margin: 5px 0;">• Creador: ${rifa.creator_username || 'Sistema'}</p>
                            <p style="color: #666; font-size: 0.9rem; margin: 5px 0;">• Tipo: Simulación pública</p>
                            <p style="color: #666; font-size: 0.9rem; margin: 5px 0;">• Fines: Educativos/Demo</p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px;">
                            <p style="font-size: 0.9rem; color: #666; margin-bottom: 15px;">
                                💡 ¿Te gusta esta simulación?
                            </p>
                            <button class="btn btn-success" style="width: 100%; margin-bottom: 10px;" onclick="showAuthModal()">
                                🚀 Crear Mi Propia Simulación
                            </button>
                            <button class="btn btn-secondary" style="width: 100%;" onclick="navigateTo('demo')">
                                🎮 Probar Simulador
                            </button>
                        </div>
                    </div>
                </div>
                
                <div style="background: #e3f2fd; border: 1px solid #90caf9; border-radius: 8px; padding: 20px; text-align: center;">
                    <h4 style="color: #1565c0; margin: 0 0 10px 0;">🎓 Simulación Educativa</h4>
                    <p style="color: #1565c0; font-size: 0.9rem; margin: 0;">
                        Esta es una simulación de demostración sin valor monetario. Los participantes y números son ficticios con fines educativos.
                    </p>
                </div>
            `;
        } else {
            document.getElementById('mainContainer').innerHTML = `
                <div class="page-header">
                    <h1>❌ Simulación No Encontrada</h1>
                    <p class="subtitle">La simulación solicitada no existe o no está disponible</p>
                </div>
                
                <div style="text-align: center; padding: 40px; background: white; border-radius: 15px;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">🔍</div>
                    <h3 style="color: #333; margin-bottom: 15px;">Simulación no encontrada</h3>
                    <p style="color: #666; margin-bottom: 25px;">La simulación que buscas no existe o no está disponible públicamente.</p>
                    
                    <button class="btn btn-primary" onclick="navigateTo('rifas')">
                        ← Volver a Simulaciones Públicas
                    </button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error cargando detalles de rifa:', error);
        document.getElementById('mainContainer').innerHTML = `
            <div class="page-header">
                <h1>⚠️ Error de Conexión</h1>
                <p class="subtitle">No se pudo cargar la simulación</p>
            </div>
            
            <div style="text-align: center; padding: 40px; background: white; border-radius: 15px;">
                <div style="font-size: 3rem; margin-bottom: 15px;">🌐</div>
                <h3 style="color: #333; margin-bottom: 15px;">Error de conexión</h3>
                <p style="color: #666; margin-bottom: 25px;">No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.</p>
                
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button class="btn btn-secondary" onclick="navigateTo('rifas')">
                        ← Volver
                    </button>
                    <button class="btn btn-primary" onclick="location.reload()">
                        🔄 Reintentar
                    </button>
                </div>
            </div>
        `;
    }
}

// ========== GESTIÓN DE RIFAS ==========

async function editRifa(rifaId) {
    try {
        const response = await fetch(`${API_BASE}/rifas/my/${rifaId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const rifa = data.rifa;
            
            document.getElementById('editRifaTitle').value = rifa.title;
            document.getElementById('editRifaDescription').value = rifa.description;
            document.getElementById('editRifaModal').style.display = 'flex';
            document.getElementById('editRifaForm').dataset.rifaId = rifaId;
        } else {
            showNotification('Error cargando datos de la simulación', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    }
}

async function deleteRifa(rifaId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta simulación? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/rifas/${rifaId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            showNotification('Simulación eliminada exitosamente');
            showPerfilPage();
        } else {
            const data = await response.json();
            showNotification(data.error || 'Error eliminando simulación', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    }
}

async function drawRifaWinner(rifaId) {
    try {
        const response = await fetch(`${API_BASE}/rifas/${rifaId}/draw`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            showNotification(`¡Ganador: Número ${data.winner.number}! Participante: ${data.winner.participant_name}`);
            viewRifa(rifaId);
        } else {
            const data = await response.json();
            showNotification(data.error || 'Error realizando sorteo', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    }
}

// ========== FUNCIÓN PARTICIPACIÓN ==========

async function participateInRifa(rifaId, selectedNumbers) {
    if (selectedNumbers.length === 0) {
        showNotification('¡Primero debes seleccionar al menos un número!', 'error');
        return;
    }
    
    let participantName = 'Participante Anónimo';

    if (currentUser && currentUser.username) {
        participantName = currentUser.username;
        console.log(`🔄 [FASE 15K] Usando nombre del usuario logueado: ${participantName}`);
    } else {
        // Si no está logueado, pedir nombre con modal personalizado
        try {
            participantName = await showParticipantNameModal();
        } catch (error) {
            showNotification('Debes ingresar tu nombre para participar', 'error');
            return;
        }
    }

    try {
        const response = await fetch(`${API_BASE}/rifas/${rifaId}/participate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': currentUser ? `Bearer ${localStorage.getItem('authToken')}` : ''
            },
            body: JSON.stringify({
                numbers: selectedNumbers,
                participant_name: participantName
            })
        });

        const data = await response.json();

        if (response.ok) {
            showNotification(`¡Participación exitosa! Números registrados para ${participantName}`);
            
            // FIX FASE 15W: Recargar datos frescos del servidor
            console.log('🔄 [FASE 15W] Recargando datos frescos después de participar...');
            await reloadRifaByCode(data.rifa.access_code);
        } else {
            showNotification(data.error || 'Error al participar', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    }
}

// ========== FUNCIÓN AUXILIAR PARA RECARGAR DATOS FRESCOS ==========

// FIX FASE 15W: Nueva función para recargar datos actualizados del servidor
async function reloadRifaByCode(accessCode) {
    try {
        console.log(`🔄 [FASE 15W] Haciendo petición fresca para código: ${accessCode}`);
        
        const response = await fetch(`${API_BASE}/rifas/access/${accessCode}`);
        const data = await response.json();
        
        if (response.ok && data.rifa) {
            console.log('✅ [FASE 15W] Datos frescos recibidos:', data.rifa);
            viewRifaByCode(data.rifa, accessCode);
        } else {
            console.error('❌ [FASE 15W] Error recargando datos:', data.error);
            showNotification('Error recargando datos actualizados', 'error');
        }
    } catch (error) {
        console.error('❌ [FASE 15W] Error de conexión al recargar:', error);
        showNotification('Error de conexión al actualizar', 'error');
    }
}

// ========== FUNCIONES DE UTILIDAD ==========

async function copyCode(code) {
    if (!code || code === 'GENERANDO...') {
        showNotification('No hay código disponible para copiar', 'error');
        return;
    }
    
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(code);
            showNotification(`Código ${code} copiado al portapapeles`);
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = code;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                showNotification(`Código ${code} copiado al portapapeles`);
            } catch (err) {
                showNotification('Error al copiar código', 'error');
            }
            
            document.body.removeChild(textArea);
        }
    } catch (err) {
        console.error('Error copiando código:', err);
        showNotification('Error al copiar código', 'error');
    }
}
