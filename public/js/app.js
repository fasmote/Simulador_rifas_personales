// FASE 15M: JavaScript separado del HTML - TalentoTech SimulaRifas

// Variables globales
let currentUser = null;
let selectedNumbers = [];
let winnerNumber = null;
let currentRifa = null;
let isAuthMode = 'login';
let accessedByCode = false;
// FASE 2: Variable para números con timestamps y tooltips
let numbersWithTooltips = [];

// API Base URL
const API_BASE = '/api';

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    navigateTo('demo');
});

// ========== FUNCIONES NUEVAS FASE 15C ==========

// NUEVO: Toggle de contraseña mejorado
function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    
    if (input.type === 'password') {
        input.type = 'text';
        button.innerHTML = '🙈';
    } else {
        input.type = 'password';
        button.innerHTML = '👁️';
    }
}

// NUEVO: Eliminar número específico 
function removeUserNumber(number, userName, rifaId) {
    if (confirm(`¿Eliminar el número ${number} de ${userName}?`)) {
        // Implementar la llamada a la API
        removeNumberFromRifa(rifaId, number, userName);
    }
}

// NUEVO: Eliminar todos los números de un usuario
function removeAllUserNumbers(userName, rifaId) {
    if (confirm(`¿Eliminar TODOS los números de ${userName}? Esta acción no se puede deshacer.`)) {
        // Implementar la llamada a la API
        removeAllNumbersFromUser(rifaId, userName);
    }
}

// NUEVO: Función API para eliminar número específico
async function removeNumberFromRifa(rifaId, number, userName) {
    try {
        const response = await fetch(`${API_BASE}/rifas/${rifaId}/numbers/${number}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ participant_name: userName })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification(`Número ${number} eliminado de ${userName}`);
            // Recargar vista de detalles
            viewRifa(rifaId);
        } else {
            showNotification(data.error || 'Error eliminando número', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    }
}

// NUEVO: Función API para eliminar todos los números de un usuario
async function removeAllNumbersFromUser(rifaId, userName) {
    try {
        const response = await fetch(`${API_BASE}/rifas/${rifaId}/users/${encodeURIComponent(userName)}/numbers`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification(`Todos los números de ${userName} han sido eliminados`);
            // Recargar vista de detalles
            viewRifa(rifaId);
        } else {
            showNotification(data.error || 'Error eliminando números', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    }
}

// ========== FUNCIONES SISTEMA DE NOTIFICACIÓN ==========

function showNotification(message, type = 'success') {
    // Remover notificación existente si la hay
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Crear nueva notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type === 'error' ? 'error' : ''}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto-remover después de 4 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 4000);
}

// ========== AUTENTICACIÓN ==========

async function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    if (token) {
        try {
            const response = await fetch(`${API_BASE}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                currentUser = data.user;
                updateNavForLoggedUser();
            } else {
                localStorage.removeItem('authToken');
            }
        } catch (error) {
            console.error('Error verificando autenticación:', error);
            localStorage.removeItem('authToken');
        }
    }
}

function updateNavForLoggedUser() {
    const userInfo = document.getElementById('userInfo');
    const authBtn = document.getElementById('authBtn');
    const perfilLink = document.getElementById('perfilLink');
    
    if (currentUser) {
        userInfo.textContent = `Hola, ${currentUser.username}`;
        userInfo.style.display = 'block';
        authBtn.textContent = 'Cerrar Sesión';
        authBtn.onclick = logout;
        
        // Mostrar opción "Mis Simulaciones" cuando está logueado
        if (perfilLink) {
            perfilLink.style.display = 'block';
        }
    } else {
        userInfo.style.display = 'none';
        authBtn.textContent = 'Iniciar Sesión';
        authBtn.onclick = showAuthModal;
        
        // Ocultar opción "Mis Simulaciones" cuando NO está logueado
        if (perfilLink) {
            perfilLink.style.display = 'none';
        }
    }
}

function showAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
    switchAuthMode('login');
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('authForm').reset();
}

function switchAuthMode(mode = null) {
    const title = document.getElementById('authTitle');
    const emailField = document.getElementById('authEmail');
    const submitBtn = document.getElementById('authSubmit');
    const switchLink = document.getElementById('authSwitch');
    
    if (mode) {
        isAuthMode = mode;
    } else {
        isAuthMode = isAuthMode === 'login' ? 'register' : 'login';
    }
    
    if (isAuthMode === 'register') {
        title.textContent = 'Registrarse';
        emailField.style.display = 'block';
        emailField.required = true;
        submitBtn.textContent = 'Registrarse';
        switchLink.textContent = '¿Ya tienes cuenta? Inicia sesión';
    } else {
        title.textContent = 'Iniciar Sesión';
        emailField.style.display = 'none';
        emailField.required = false;
        submitBtn.textContent = 'Ingresar';
        switchLink.textContent = '¿No tienes cuenta? Regístrate';
    }
}

// Event listener para autenticación (configurado después de DOMContentLoaded)
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('authForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('authUsername').value;
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;
        
        try {
            const endpoint = isAuthMode === 'register' ? 'register' : 'login';
            const body = isAuthMode === 'register' 
                ? { username, email, password }
                : { username, password };
            
            const response = await fetch(`${API_BASE}/auth/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('authToken', data.token);
                currentUser = data.user;
                updateNavForLoggedUser();
                closeAuthModal();
                showNotification(data.message);
                
                // NUEVO: Ir directo a "Mis Simulaciones" después del login
                navigateTo('perfil');
            } else {
                showNotification(data.error, 'error');
            }
        } catch (error) {
            console.error('Error en autenticación:', error);
            showNotification('Error de conexión', 'error');
        }
    });
});

async function logout() {
    try {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
    } catch (error) {
        console.error('Error en logout:', error);
    }
    
    localStorage.removeItem('authToken');
    currentUser = null;
    updateNavForLoggedUser();
    showNotification('Sesión cerrada');
    
    // NUEVO: Ir al inicio al cerrar sesión
    navigateTo('demo');
}

// ========== NAVEGACIÓN ==========

function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

function navigateTo(page) {
    switch(page) {
        case 'rifas':
            showRifasPage();
            updateActiveNav('rifas');
            break;
        case 'codigo':
            showCodigoPage();
            updateActiveNav('codigo');
            break;
        case 'perfil':
            if (!currentUser) {
                showAuthModal();
                return;
            }
            showPerfilPage();
            updateActiveNav('perfil');
            break;
        case 'demo':
            showDemoPage();
            updateActiveNav('demo');
            break;
    }
    
    // Cerrar menú móvil
    document.getElementById('navLinks').classList.remove('active');
}

function updateActiveNav(activePage) {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    
    const pageIndex = activePage === 'demo' ? 0 : 
                     activePage === 'rifas' ? 1 : 
                     activePage === 'codigo' ? 2 : 3;
    const links = document.querySelectorAll('.nav-links a');
    if (links[pageIndex]) {
        links[pageIndex].classList.add('active');
    }
}

// ========== PÁGINAS ==========

function showDemoPage() {
    document.getElementById('mainContainer').innerHTML = `
        <header>
            <h1>🎲 Simulador de Rifas</h1>
            <p class="subtitle">Simula sorteos para eventos, fiestas y actividades grupales</p>
        </header>

        <div class="legal-notice">
            <strong>Aviso Legal:</strong> Esta es una aplicación de simulación educativa. No involucra dinero real ni constituye un juego de apuestas. Cumple con la normativa argentina sobre juegos.
        </div>

        <div class="main-content">
            <div class="numbers-section">
                <div class="controls">
                    <button class="btn btn-secondary" onclick="selectRandomNumber()">
                        🎯 Elegir al Azar
                    </button>
                    <button class="btn btn-primary" onclick="clearSelection()">
                        🗑️ Limpiar Todo
                    </button>
                    <button class="btn btn-success" onclick="drawWinner()">
                        🏆 Simular Sorteo
                    </button>
                </div>
                
                <div class="numbers-grid" id="numbersGrid">
                    <!-- Los números se generan con JavaScript -->
                </div>
            </div>

            <div class="cart-section">
                <div class="cart-header">
                    <span class="cart-icon">🎯</span>
                    <h3 class="cart-title">Números Seleccionados</h3>
                    <div class="cart-count" id="cartCount">0</div>
                </div>
                
                <div class="cart-items" id="cartItems">
                    <div class="empty-cart">
                        No has seleccionado números aún
                    </div>
                </div>
                
                <button class="btn btn-primary" style="width: 100%; margin-bottom: 15px;" onclick="drawWinner()">
                    🎊 ¡Simular Sorteo!
                </button>
                
                <div style="margin-bottom: 15px;">
                    <p style="font-size: 0.9rem; color: #666; text-align: center;">
                        💡 ¿Quieres crear tus propias simulaciones privadas?
                    </p>
                    <button class="btn btn-secondary" style="width: 100%;" onclick="showAuthModal()">
                        👤 Iniciar Sesión
                    </button>
                </div>
            </div>
        </div>
    `;
    
    selectedNumbers = [];
    winnerNumber = null;
    currentRifa = null;
    accessedByCode = false;
    generateNumbersGrid();
    updateCart();
}

// ========== SIMULADOR (MODO DEMO) ==========

function generateNumbersGrid() {
    const grid = document.getElementById('numbersGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    for (let i = 0; i <= 99; i++) {
        const cell = document.createElement('div');
        cell.className = 'number-cell';
        cell.textContent = i.toString().padStart(2, '0');
        cell.onclick = () => toggleNumber(i);
        cell.id = `number-${i}`;
        
        grid.appendChild(cell);
    }
}

function toggleNumber(number) {
    const cell = document.getElementById(`number-${number}`);
    if (!cell || cell.classList.contains('sold')) return;
    
    const index = selectedNumbers.indexOf(number);
    
    if (index > -1) {
        selectedNumbers.splice(index, 1);
        cell.classList.remove('selected');
        // Remover botón de eliminación
        const deleteBtn = cell.querySelector('.delete-number');
        if (deleteBtn) {
            deleteBtn.remove();
        }
    } else {
        selectedNumbers.push(number);
        cell.classList.add('selected');
        // Agregar botón de eliminación en modo demo
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-number';
        deleteBtn.innerHTML = '✕';
        deleteBtn.onclick = function(e) {
            e.stopPropagation();
            toggleNumber(number);
        };
        cell.appendChild(deleteBtn);
    }
    
    updateCart();
}

function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    
    if (!cartItems || !cartCount) return;
    
    cartCount.textContent = selectedNumbers.length;
    
    if (selectedNumbers.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">No has seleccionado números aún</div>';
        return;
    }
    
    const sortedNumbers = [...selectedNumbers].sort((a, b) => a - b);
    cartItems.innerHTML = sortedNumbers.map(number => `
        <div class="cart-item">
            <span class="cart-item-number">${number.toString().padStart(2, '0')}</span>
            <button class="remove-btn" onclick="toggleNumber(${number})">✕</button>
        </div>
    `).join('');
}

function selectRandomNumber() {
    const available = [];
    for (let i = 0; i <= 99; i++) {
        if (!selectedNumbers.includes(i)) {
            const cell = document.getElementById(`number-${i}`);
            if (cell && !cell.classList.contains('sold')) {
                available.push(i);
            }
        }
    }
    
    if (available.length > 0) {
        const randomIndex = Math.floor(Math.random() * available.length);
        const randomNumber = available[randomIndex];
        toggleNumber(randomNumber);
    }
}

function clearSelection() {
    selectedNumbers.forEach(number => {
        const cell = document.getElementById(`number-${number}`);
        if (cell) {
            cell.classList.remove('selected', 'winner');
            // Remover botón de eliminación
            const deleteBtn = cell.querySelector('.delete-number');
            if (deleteBtn) {
                deleteBtn.remove();
            }
        }
    });
    selectedNumbers = [];
    winnerNumber = null;
    updateCart();
    closeWinnerModal();
}

function drawWinner() {
    if (selectedNumbers.length === 0) {
        showNotification('¡Primero debes seleccionar al menos un número!', 'error');
        return;
    }

    // Limpiar ganador anterior
    if (winnerNumber !== null) {
        const oldWinnerCell = document.getElementById(`number-${winnerNumber}`);
        if (oldWinnerCell) {
            oldWinnerCell.classList.remove('winner');
        }
    }

    // Seleccionar ganador al azar
    const randomIndex = Math.floor(Math.random() * selectedNumbers.length);
    winnerNumber = selectedNumbers[randomIndex];
    
    // Mostrar animación
    const winnerCell = document.getElementById(`number-${winnerNumber}`);
    if (winnerCell) {
        winnerCell.classList.add('winner');
    }
    
    // Mostrar modal de resultado
    showWinnerModal();
}

function showWinnerModal() {
    if (winnerNumber === null) return;
    
    document.getElementById('winnerNumber').textContent = winnerNumber.toString().padStart(2, '0');
    document.getElementById('winnerText').textContent = winnerNumber.toString().padStart(2, '0');
    document.getElementById('winnerModal').style.display = 'flex';
}

function closeWinnerModal() {
    document.getElementById('winnerModal').style.display = 'none';
}

function resetGame() {
    clearSelection();
    closeWinnerModal();
}

// ========== FUNCIONES API (SIMULADOR) ==========

async function showRifasPage() {
    document.getElementById('mainContainer').innerHTML = `
        <div class="page-header">
            <h1>🎊 Simulaciones Públicas</h1>
            <p class="subtitle">Explora simulaciones de ejemplo y practica</p>
        </div>
        
        <div class="legal-notice">
            <strong>Simulaciones de Demostración:</strong> Estas son simulaciones públicas creadas para fines educativos y de demostración. No involucran dinero real.
        </div>
        
        <div class="loading">
            <p>🔄 Cargando simulaciones públicas...</p>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_BASE}/rifas`);
        const data = await response.json();
        
        if (response.ok && data.rifas && data.rifas.length > 0) {
            // Mostrar rifas públicas
            const rifasHtml = data.rifas.map(rifa => {
                const emoji = rifa.title.includes('iPhone') ? '📱' : 
                             rifa.title.includes('Cartera') ? '👜' : '✈️';
                const progressPercent = rifa.max_numbers ? Math.round((rifa.numbers_sold / rifa.max_numbers) * 100) : 0;
                
                return `
                    <div class="rifa-card">
                        <div class="rifa-image">${emoji}</div>
                        <h3>${rifa.title}</h3>
                        <p class="rifa-description">${rifa.description}</p>
                        <div class="rifa-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progressPercent}%"></div>
                            </div>
                            <p class="progress-text">${rifa.numbers_sold}/100 números seleccionados</p>
                        </div>
                        <div style="margin-top: 15px;">
                            <button class="btn btn-primary" onclick="viewPublicRifa(${rifa.id})" style="width: 100%;">
                                👀 Ver Detalles
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
            
            document.getElementById('mainContainer').innerHTML = `
                <div class="page-header">
                    <h1>🎊 Simulaciones Públicas</h1>
                    <p class="subtitle">Explora simulaciones de ejemplo y practica</p>
                </div>
                
                <div class="legal-notice">
                    <strong>Simulaciones de Demostración:</strong> Estas son simulaciones públicas creadas para fines educativos y de demostración. No involucran dinero real.
                </div>
                
                <div class="rifas-grid">
                    ${rifasHtml}
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <p style="color: rgba(255,255,255,0.8); margin-bottom: 15px;">
                        💡 ¿Quieres crear tus propias simulaciones privadas?
                    </p>
                    <button class="btn btn-success" onclick="showAuthModal()">
                        👤 Iniciar Sesión para Crear
                    </button>
                </div>
            `;
        } else {
            // No hay rifas públicas disponibles
            document.getElementById('mainContainer').innerHTML = `
                <div class="page-header">
                    <h1>🎊 Simulaciones Públicas</h1>
                    <p class="subtitle">Explora simulaciones de ejemplo y practica</p>
                </div>
                
                <div class="legal-notice">
                    <strong>Simulaciones de Demostración:</strong> Estas son simulaciones públicas creadas para fines educativos y de demostración. No involucran dinero real.
                </div>
                
                <div style="text-align: center; padding: 60px 20px; background: white; border-radius: 15px; margin: 20px 0;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">🎁</div>
                    <h3 style="color: #333; margin-bottom: 15px;">No hay simulaciones públicas disponibles</h3>
                    <p style="color: #666; margin-bottom: 30px;">Parece que aún no se han creado las simulaciones de demostración.</p>
                    
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h4 style="color: #856404; margin: 0 0 10px 0;">🔧 Para activar el contenido demo:</h4>
                        <p style="color: #856404; font-size: 0.9rem; margin: 0;">
                            Ejecuta: <code>npm run demo-content</code> en la carpeta backend
                        </p>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                        <button class="btn btn-secondary" onclick="navigateTo('demo')">
                            🎮 Probar Simulador
                        </button>
                        <button class="btn btn-success" onclick="showAuthModal()">
                            ➕ Crear Cuenta
                        </button>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error cargando rifas públicas:', error);
        document.getElementById('mainContainer').innerHTML = `
            <div class="page-header">
                <h1>🎊 Simulaciones Públicas</h1>
                <p class="subtitle">Explora simulaciones de ejemplo y practica</p>
            </div>
            
            <div class="legal-notice">
                <strong>Error de Conexión:</strong> No se pudo conectar con el servidor. Asegúrate de que el backend esté ejecutándose.
            </div>
            
            <div style="text-align: center; padding: 60px 20px; background: white; border-radius: 15px; margin: 20px 0;">
                <div style="font-size: 4rem; margin-bottom: 20px;">⚠️</div>
                <h3 style="color: #333; margin-bottom: 15px;">Error de Conexión</h3>
                <p style="color: #666; margin-bottom: 30px;">No se pudo conectar con el servidor backend.</p>
                
                <div style="background: #ffebee; border: 1px solid #ffcdd2; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h4 style="color: #c62828; margin: 0 0 10px 0;">🔧 Soluciones:</h4>
                    <p style="color: #c62828; font-size: 0.9rem; margin: 0; text-align: left;">
                        1. Asegúrate de que el backend esté corriendo: <code>npm run dev</code><br>
                        2. Verifica que esté en: <code>http://localhost:3000</code><br>
                        3. Ejecuta contenido demo: <code>npm run demo-content</code>
                    </p>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button class="btn btn-secondary" onclick="navigateTo('demo')">
                        🎮 Probar Simulador
                    </button>
                    <button class="btn btn-primary" onclick="location.reload()">
                        🔄 Reintentar
                    </button>
                </div>
            </div>
        `;
    }
}

function showCodigoPage() {
    document.getElementById('mainContainer').innerHTML = `
        <div class="page-header">
            <h1>🔑 Acceder por Código</h1>
            <p class="subtitle">Ingresa el código de una simulación privada</p>
        </div>
        
        <div style="max-width: 500px; margin: 0 auto;">
            <div style="background: white; border-radius: 15px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 20px;">🔑</div>
                <h3 style="margin-bottom: 20px; color: #333;">Código de Acceso</h3>
                <p style="color: #666; margin-bottom: 30px;">
                    Ingresa el código de 6 caracteres para acceder a la simulación
                </p>
                
                <form id="accessCodePageForm">
                    <input type="text" id="accessCodePageInput" placeholder="XXXXXX" class="form-input access-code-input" 
                           maxlength="6" pattern="[A-Za-z0-9]{6}" required style="margin-bottom: 20px;">
                    <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: 15px;">
                        🔍 Acceder a Simulación
                    </button>
                </form>
                
                <div style="background: #e3f2fd; border: 1px solid #90caf9; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: left;">
                    <h4 style="color: #1565c0; margin: 0 0 10px 0;">✨ ¿Cómo funciona?</h4>
                    <p style="color: #1565c0; font-size: 0.9rem;">
                        • Obtén el código del creador de la simulación<br>
                        • Ingrésalo aquí para participar<br>
                        • No necesitas registrarte
                    </p>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button class="btn btn-secondary" onclick="navigateTo('demo')">
                        🎮 Probar Simulador
                    </button>
                    <button class="btn btn-success" onclick="showAuthModal()">
                        ➕ Crear Cuenta
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // CORREGIDO: Agregar event listener después de crear el HTML
    setTimeout(() => {
        const form = document.getElementById('accessCodePageForm');
        if (form) {
            form.addEventListener('submit', handleAccessCodeSubmit);
        }
    }, 100);
}

async function showPerfilPage() {
    if (!currentUser) {
        showAuthModal();
        return;
    }

    document.getElementById('mainContainer').innerHTML = `
        <div class="page-header">
            <h1>👥 Mis Simulaciones</h1>
            <p class="subtitle">Gestiona tu cuenta y tus simulaciones privadas</p>
        </div>
        
        <div class="loading">
            <p>🔄 Cargando tus simulaciones...</p>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_BASE}/rifas/my`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const userRifas = data.rifas || [];
            
            let rifasHtml = '';
            if (userRifas.length > 0) {
                rifasHtml = userRifas.map(rifa => {
                    const progressPercent = Math.round((rifa.numbers_sold / 100) * 100);
                    const isCompleted = rifa.status === 'completed';
                    const winnerInfo = rifa.winner ? `Ganador: Número ${rifa.winner.number} (${rifa.winner.participant_name})` : '';
                    
                    return `
                        <div class="rifa-card">
                            <div class="rifa-image">${isCompleted ? '🏆' : '🎯'}</div>
                            <h3>${rifa.title}</h3>
                            <p class="rifa-description">${rifa.description}</p>
                            
                            ${isCompleted ? `
                            <div class="winner-badge">
                                🏆 ¡SIMULACIÓN COMPLETADA!
                            </div>
                            <p style="font-size: 0.9rem; color: #ffd700; font-weight: bold; margin: 5px 0; text-align: center;">
                                ${winnerInfo}
                            </p>
                            ` : ''}
                            
                            <div class="rifa-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                                </div>
                                <p class="progress-text">${rifa.numbers_sold}/100 números ${isCompleted ? '(Completada)' : ''}</p>
                            </div>
                            
                            <div style="margin-top: 15px;">
                                <p style="font-size: 0.9rem; color: #666; margin-bottom: 10px;">
                                    🔑 Código: <strong>${rifa.access_code || 'Generando...'}</strong>
                                    <button class="copy-code-btn" onclick="copyCode('${rifa.access_code}')" title="Copiar código" style="margin-left: 5px; padding: 3px 6px; font-size: 0.7rem;">
                                        📋
                                    </button>
                                </p>
                            </div>
                            
                            <div style="display: flex; gap: 8px; margin-top: 15px;">
                                <button class="btn btn-primary" onclick="viewRifa(${rifa.id})" style="flex: 1; font-size: 0.9rem;">
                                    👁️ Ver
                                </button>
                                ${!isCompleted ? `
                                <button class="btn btn-secondary" onclick="editRifa(${rifa.id})" style="flex: 1; font-size: 0.9rem;">
                                    ✏️ Editar
                                </button>
                                ` : `
                                <button class="btn" onclick="viewRifa(${rifa.id})" style="background: #4caf50; color: white; flex: 1; font-size: 0.9rem;">
                                    📊 Resultado
                                </button>
                                `}
                                <button class="btn" onclick="deleteRifa(${rifa.id})" style="background: #ff6b6b; color: white; flex: 0.5; font-size: 0.9rem;">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                rifasHtml = `
                    <div style="text-align: center; padding: 60px 20px; background: white; border-radius: 15px; grid-column: 1 / -1;">
                        <div style="font-size: 4rem; margin-bottom: 20px;">🎯</div>
                        <h3 style="color: #333; margin-bottom: 15px;">Aún no tienes simulaciones</h3>
                        <p style="color: #666; margin-bottom: 30px;">Crea tu primera simulación para empezar a gestionar sorteos.</p>
                        
                        <div style="background: #e3f2fd; border: 1px solid #90caf9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                            <h4 style="color: #1565c0; margin: 0 0 10px 0;">🎯 ¡Empieza ahora!</h4>
                            <p style="color: #1565c0; font-size: 0.9rem; margin: 0;">
                                Haz click en "Crear Nueva Simulación" para empezar
                            </p>
                        </div>
                        
                        <button class="btn btn-primary" onclick="navigateTo('demo')">
                            🎲 Probar Simulador Demo
                        </button>
                    </div>
                `;
            }
            
            document.getElementById('mainContainer').innerHTML = `
                <div class="page-header">
                    <h1>👥 Mis Simulaciones</h1>
                    <p class="subtitle">Gestiona tu cuenta y tus simulaciones privadas</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <button class="btn btn-success" onclick="showCreateRifaModal()">
                        ➕ Crear Nueva Simulación
                    </button>
                </div>
                
                <div class="rifas-grid">
                    ${rifasHtml}
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <button class="btn btn-secondary" onclick="logout()">
                        🚪 Cerrar Sesión
                    </button>
                </div>
            `;
        } else {
            throw new Error('Error cargando simulaciones');
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('mainContainer').innerHTML = `
            <div class="page-header">
                <h1>👥 Mis Simulaciones</h1>
                <p class="subtitle">Gestiona tu cuenta y tus simulaciones privadas</p>
            </div>
            
            <div style="text-align: center; padding: 60px 20px; background: white; border-radius: 15px;">
                <div style="font-size: 4rem; margin-bottom: 20px;">⚠️</div>
                <h3 style="color: #333; margin-bottom: 15px;">Error de Conexión</h3>
                <p style="color: #666; margin-bottom: 30px;">No se pudieron cargar tus simulaciones. Verifica que el backend esté ejecutándose.</p>
                
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="showPerfilPage()">
                        🔄 Reintentar
                    </button>
                    <button class="btn btn-secondary" onclick="navigateTo('demo')">
                        🎲 Probar Demo
                    </button>
                </div>
            </div>
        `;
    }
}

// ========== FUNCIÓN PARTICIPACIÓN - CAMBIO 2 FASE 15K ==========

// CAMBIO 2: Modificar la función de participación para usar el nombre del usuario logueado
async function participateInRifa(rifaId, selectedNumbers) {
    if (selectedNumbers.length === 0) {
        showNotification('¡Primero debes seleccionar al menos un número!', 'error');
        return;
    }
    
    // NUEVO FASE 15K: Usar el nombre del usuario logueado si está disponible
    let participantName = 'Participante Anónimo';
    
    if (currentUser && currentUser.username) {
        participantName = currentUser.username;
        console.log(`🔄 [FASE 15K] Usando nombre del usuario logueado: ${participantName}`);
    } else {
        // Si no está logueado, pedir nombre
        participantName = prompt('¿Cuál es tu nombre?');
        if (!participantName || participantName.trim() === '') {
            showNotification('El nombre es requerido para participar', 'error');
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
            
            // FIX FASE 15P: Actualizar solo la grilla sin reseteo visual completo
            if (data.rifa && data.rifa.sold_numbers) {
                generateRifaGrid(data.rifa); // Regenerar grilla con números ocupados actualizados
            }
            
            // Resetear selección DESPUÉS de actualizar la grilla
            selectedNumbers = [];
            updateCart();
        } else {
            showNotification(data.error || 'Error al participar', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    }
}

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

// ========== FUNCIÓN VIEWRIFA CORREGIDA - FASE 14 ==========

async function viewRifa(rifaId) {
    console.log(`🔍 [DEBUG] Iniciando viewRifa con ID: ${rifaId}`);
    
    // Validar ID
    if (!rifaId || rifaId === 'undefined' || rifaId === 'null') {
        console.error('❌ [ERROR] ID de rifa inválido:', rifaId);
        showNotification('Error: ID de simulación inválido', 'error');
        return;
    }
    
    // Validar autenticación
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.error('❌ [ERROR] No hay token de autenticación');
        showNotification('Debes iniciar sesión para ver esta simulación', 'error');
        showAuthModal();
        return;
    }
    
    console.log(`✅ [DEBUG] Token encontrado: ${token.substring(0, 20)}...`);
    
    // Mostrar loading
    document.getElementById('mainContainer').innerHTML = `
        <div class="loading">
            <p>🔄 Cargando detalles de la simulación...</p>
        </div>
    `;
    
    try {
        console.log(`📡 [DEBUG] Haciendo petición a: /api/rifas/my/${rifaId}`);
        
        const response = await fetch(`${API_BASE}/rifas/my/${rifaId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`📡 [DEBUG] Respuesta recibida. Status: ${response.status}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ [ERROR] Respuesta no OK: ${response.status} - ${errorText}`);
            
            let errorMessage = 'Error cargando simulación';
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                errorMessage = `Error ${response.status}: ${errorText}`;
            }
            
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('✅ [DEBUG] Datos recibidos:', data);
        
        if (!data.rifa) {
            throw new Error('Datos de simulación no encontrados en respuesta');
        }
        
        const rifa = data.rifa;
        const isCompleted = rifa.status === 'completed';
        const winnerNumber = rifa.winner ? rifa.winner.number : null;
        
        console.log(`✅ [DEBUG] Procesando rifa: "${rifa.title}" (Status: ${rifa.status})`);
        
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
        
        const progressPercent = Math.round((rifa.numbers_sold / 100) * 100);
        
        console.log(`✅ [DEBUG] Generando HTML para la vista...`);
        
        document.getElementById('mainContainer').innerHTML = `
            <div class="page-header">
                <h1>🎯 ${rifa.title}</h1>
                <p class="subtitle">${rifa.description}</p>
                ${isCompleted ? `<p style="background: #4caf50; color: white; padding: 10px; border-radius: 8px; text-align: center; margin-top: 10px;">
                    🏆 ¡SIMULACIÓN COMPLETADA! Ganador: Número ${winnerNumber} (${rifa.winner.participant_name})
                </p>` : ''}
            </div>
            
            <div style="margin-bottom: 20px;">
                <button class="btn btn-secondary" onclick="navigateTo('perfil')">
                    ← Volver a Mis Simulaciones
                </button>
                <button class="btn btn-primary" onclick="editRifa(${rifaId})" style="margin-left: 10px;">
                    ✏️ Editar
                </button>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 350px; gap: 30px;" class="rifa-details-grid">
                <div class="numbers-section">
                    <h3 style="margin-bottom: 15px;">🎯 Números de la Simulación</h3>
                    <div class="numbers-grid">
                        ${numbersGridHtml}
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        <h4 style="color: #333; margin-bottom: 10px;">📊 Estadísticas</h4>
                        <p style="margin: 5px 0;">• Números ocupados: ${rifa.numbers_sold}/100</p>
                        <p style="margin: 5px 0;">• Progreso: ${progressPercent}%</p>
                        <p style="margin: 5px 0;">• Código de acceso: ${rifa.access_code || 'No disponible'}</p>
                    </div>
                    
                    <!-- FASE 1: Lista de Participantes -->
                    <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 8px; border-left: 4px solid #4caf50;">
                        <h4 style="color: #333; margin-bottom: 15px; display: flex; align-items: center;">
                            <span style="margin-right: 8px;">👥</span> Lista de Participantes
                            <button class="btn" onclick="loadParticipants(${rifaId})" style="background: #4caf50; color: white; padding: 5px 10px; font-size: 0.8rem; margin-left: 10px;">🔄 Actualizar</button>
                        </h4>
                        <div id="participantsList" style="max-height: 300px; overflow-y: auto;">
                            <p style="color: #666; text-align: center; font-style: italic;">Cargando participantes...</p>
                        </div>
                    </div>
                </div>
                
                <div class="cart-section">
                    <div class="cart-header">
                        <span class="cart-icon">🎯</span>
                        <h3 class="cart-title">${isCompleted ? 'Resultado Final' : 'Información'}</h3>
                    </div>
                    
                    ${isCompleted ? `
                    <div style="margin-bottom: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; text-align: center; border: 2px solid #ffd700;">
                        <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 1.1rem;">🏆 ¡GANADOR!</h4>
                        <div style="font-size: 2.5rem; font-weight: bold; color: #ffd700; margin: 10px 0;">${winnerNumber}</div>
                        <p style="color: #856404; margin: 0; font-weight: bold; font-size: 1.1rem;">${rifa.winner.participant_name}</p>
                    </div>` : ''}
                    
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #333; margin-bottom: 10px;">📝 Descripción</h4>
                        <p style="color: #666; line-height: 1.5;">${rifa.description}</p>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #333; margin-bottom: 10px;">📈 Progreso</h4>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <p class="progress-text">${rifa.numbers_sold}/100 números</p>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #333; margin-bottom: 10px;">🔑 Código de Acceso</h4>
                        <div class="access-code-display" style="display: flex; align-items: center; justify-content: space-between;">
                            <span id="displayCode">${rifa.access_code || 'GENERANDO...'}</span>
                            <button class="copy-code-btn" onclick="copyCode('${rifa.access_code}')" title="Copiar código">
                                📋
                            </button>
                        </div>
                        <p style="font-size: 0.8rem; color: #666; text-align: center;">Comparte este código para que otros participen</p>
                    </div>
                    
                    ${!isCompleted ? `
                    <button class="btn btn-success" style="width: 100%; margin-bottom: 10px;" onclick="drawRifaWinner(${rifaId})">
                        🏆 Realizar Sorteo
                    </button>` : `
                    <div style="text-align: center; padding: 15px; background: #e8f5e8; border-radius: 8px; margin-bottom: 10px;">
                        <p style="color: #2e7d32; font-weight: bold; margin: 0;">✓ Sorteo Completado</p>
                    </div>`}
                    
                    <button class="btn btn-primary" style="width: 100%;" onclick="editRifa(${rifaId})">
                        ✏️ Editar Simulación
                    </button>
                </div>
            </div>
        `;
        
        console.log('✅ [DEBUG] Vista cargada exitosamente');
        
        // FASE 1: Cargar automáticamente la lista de participantes
        setTimeout(() => loadParticipants(rifaId), 500);
        
    } catch (error) {
        console.error('❌ [ERROR] Error en viewRifa:', error);
        
        // Mostrar error detallado
        document.getElementById('mainContainer').innerHTML = `
            <div class="page-header">
                <h1>⚠️ Error Cargando Simulación</h1>
                <p class="subtitle">No se pudo cargar la simulación ID: ${rifaId}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <button class="btn btn-secondary" onclick="navigateTo('perfil')">
                    ← Volver a Mis Simulaciones
                </button>
            </div>
            
            <div style="background: white; border-radius: 15px; padding: 30px; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 20px;">❌</div>
                <h3 style="color: #333; margin-bottom: 15px;">Error de Conexión</h3>
                <p style="color: #666; margin-bottom: 20px;">
                    ${error.message}
                </p>
                
                <div style="background: #ffebee; border: 1px solid #ffcdd2; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: left;">
                    <h4 style="color: #c62828; margin: 0 0 10px 0;">🔧 Información de Debug:</h4>
                    <p style="color: #c62828; font-size: 0.9rem; margin: 0;">
                        • ID de simulación: ${rifaId}<br>
                        • Token disponible: ${token ? 'Sí' : 'No'}<br>
                        • API Base: ${API_BASE}<br>
                        • Error: ${error.message}
                    </p>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="viewRifa(${rifaId})">
                        🔄 Reintentar
                    </button>
                    <button class="btn btn-secondary" onclick="navigateTo('perfil')">
                        ← Volver
                    </button>
                </div>
            </div>
        `;
        
        // También mostrar notificación
        showNotification(error.message, 'error');
    }
}

async function editRifa(rifaId) {
    try {
        // Cargar datos de la rifa
        const response = await fetch(`${API_BASE}/rifas/my/${rifaId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const rifa = data.rifa;
            
            // Cargar datos en el modal de edición
            document.getElementById('editRifaTitle').value = rifa.title;
            document.getElementById('editRifaDescription').value = rifa.description;
            
            // Mostrar modal
            document.getElementById('editRifaModal').style.display = 'flex';
            
            // Guardar ID para el submit
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
            showPerfilPage(); // Recargar la página de perfil
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
            // Recargar vista para mostrar el ganador
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

function showCreateRifaModal() {
    document.getElementById('createRifaModal').style.display = 'flex';
}

function closeCreateRifaModal() {
    document.getElementById('createRifaModal').style.display = 'none';
}

function closeEditRifaModal() {
    document.getElementById('editRifaModal').style.display = 'none';
}

// Event listeners para formularios (configurados después de DOMContentLoaded)
document.addEventListener('DOMContentLoaded', function() {
    // Event listener para crear simulación
    document.getElementById('createRifaForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const title = document.getElementById('rifaTitle').value;
        const description = document.getElementById('rifaDescription').value;
        
        if (!title.trim()) {
            showNotification('El título es requerido', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE}/rifas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ title, description })
            });
            
            if (response.ok) {
                const data = await response.json();
                showNotification('Simulación creada exitosamente');
                closeCreateRifaModal();
                document.getElementById('createRifaForm').reset();
                // Recargar la página de perfil para mostrar la nueva simulación
                showPerfilPage();
            } else {
                const data = await response.json();
                showNotification(data.error || 'Error creando simulación', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error de conexión', 'error');
        }
    });

    // Event listener para editar simulación
    document.getElementById('editRifaForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const rifaId = this.dataset.rifaId;
        const title = document.getElementById('editRifaTitle').value;
        const description = document.getElementById('editRifaDescription').value;
        
        if (!rifaId) {
            showNotification('Error: ID de simulación no válido', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE}/rifas/${rifaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ title, description })
            });
            
            if (response.ok) {
                showNotification('Simulación actualizada exitosamente');
                closeEditRifaModal();
                // Recargar la vista actual
                viewRifa(rifaId);
            } else {
                const data = await response.json();
                showNotification(data.error || 'Error actualizando simulación', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error de conexión', 'error');
        }
    });
});

// FASE 1: Cargar lista de participantes (Vista Administrativa)
async function loadParticipants(rifaId) {
    const participantsList = document.getElementById('participantsList');
    if (!participantsList) return;
    
    participantsList.innerHTML = '<p style="color: #666; text-align: center; font-style: italic;">Cargando participantes...</p>';
    
    try {
        const response = await fetch(`${API_BASE}/rifas/${rifaId}/participants`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.participants && data.participants.length > 0) {
                const participantsHtml = data.participants.map(participant => {
                    const numbersDisplay = participant.numbers.sort((a, b) => a - b)
                        .map(num => `<span style="background: #4caf50; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; margin: 1px;">${num.toString().padStart(2, '0')}</span>`)
                        .join(' ');
                    
                    return `
                        <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 10px; border-left: 4px solid #4caf50; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 8px;">
                                <strong style="color: #333; font-size: 1rem;">${participant.name}</strong>
                                <span style="background: #e8f5e8; color: #2e7d32; padding: 4px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">
                                    ${participant.total_numbers} número${participant.total_numbers !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div style="margin-top: 8px;">
                                ${numbersDisplay}
                            </div>
                            <div style="font-size: 0.75rem; color: #888; margin-top: 8px;">
                                Primera participación: ${new Date(participant.first_participation).toLocaleString('es-AR')}
                            </div>
                        </div>
                    `;
                }).join('');
                
                participantsList.innerHTML = `
                    <div style="margin-bottom: 15px; text-align: center; font-size: 0.9rem; color: #666;">
                        Total: <strong>${data.total_participants} participante${data.total_participants !== 1 ? 's' : ''}</strong> | 
                        <strong>${data.total_numbers_sold} número${data.total_numbers_sold !== 1 ? 's' : ''}</strong> seleccionado${data.total_numbers_sold !== 1 ? 's' : ''}
                    </div>
                    ${participantsHtml}
                `;
            } else {
                participantsList.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #666;">
                        <div style="font-size: 2rem; margin-bottom: 10px;">👥</div>
                        <p style="margin: 0; font-style: italic;">Aún no hay participantes en esta simulación</p>
                    </div>
                `;
            }
        } else {
            const error = await response.json();
            participantsList.innerHTML = `
                <div style="text-align: center; padding: 15px; background: #ffebee; border-radius: 8px; color: #c62828;">
                    ❌ Error: ${error.error || 'No se pudieron cargar los participantes'}
                </div>
            `;
        }
    } catch (error) {
        console.error('Error cargando participantes:', error);
        participantsList.innerHTML = `
            <div style="text-align: center; padding: 15px; background: #ffebee; border-radius: 8px; color: #c62828;">
                ❌ Error de conexión
            </div>
        `;
    }
}

// NUEVA FUNCIÓN: Copiar código al portapapeles
async function copyCode(code) {
    if (!code || code === 'GENERANDO...') {
        showNotification('No hay código disponible para copiar', 'error');
        return;
    }
    
    try {
        if (navigator.clipboard && window.isSecureContext) {
            // Usar Clipboard API (moderno)
            await navigator.clipboard.writeText(code);
            showNotification(`Código ${code} copiado al portapapeles`);
        } else {
            // Fallback para navegadores más antiguos
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

async function handleAccessCodeSubmit(e) {
    e.preventDefault();
    
    const code = document.getElementById('accessCodePageInput').value.trim().toUpperCase();
    
    if (!code || code.length !== 6) {
        showNotification('Por favor ingresa un código válido de 6 caracteres', 'error');
        return;
    }
    
    // Mostrar loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '🔄 Buscando...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE}/rifas/access/${code}`);
        const data = await response.json();
        
        if (response.ok && data.rifa) {
            showNotification('✅ ¡Simulación encontrada!');
            // Mostrar simulación encontrada
            viewRifaByCode(data.rifa, code);
        } else {
            showNotification(data.error || `Código "${code}" no encontrado`, 'error');
            // Restaurar botón
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión con el servidor', 'error');
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ========== FUNCIÓN ACCESO POR CÓDIGO ==========

async function viewRifaByCode(rifa, accessCode) {
    const isCompleted = rifa.status === 'completed';
    const winnerNumber = rifa.winner ? rifa.winner.number : null;
    
    // FEAT FASE 15W-PLUS: Información del creador
    const creatorName = rifa.creator_username || rifa.creator_name || 'Usuario Anónimo';
    const creatorDisplay = creatorName.charAt(0).toUpperCase() + creatorName.slice(1);
    
    document.getElementById('mainContainer').innerHTML = `
        <div class="page-header">
            <h1>🎯 ${rifa.title}</h1>
            <p class="subtitle">Simulación privada - Acceso por código: ${accessCode}</p>
            
            <!-- FEAT FASE 15W-PLUS: Badge del creador visible -->
            <div style="background: linear-gradient(45deg, #667eea, #764ba2); color: white; padding: 12px 20px; border-radius: 25px; display: inline-block; margin: 15px 0; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                <span style="font-size: 1rem; font-weight: 600;">
                    👤 Creada por: <strong>${creatorDisplay}</strong>
                </span>
            </div>
            
            ${isCompleted ? `<p style="background: #4caf50; color: white; padding: 10px; border-radius: 8px; text-align: center; margin-top: 10px;">
                🏆 ¡SIMULACIÓN COMPLETADA! Ganador: Número ${winnerNumber} (${rifa.winner.participant_name})
            </p>` : ''}
        </div>
        
        <div style="margin-bottom: 20px;">
            <button class="btn btn-secondary" onclick="navigateTo('codigo')">
                ← Volver al Acceso por Código
            </button>
        </div>
        
        <div class="legal-notice">
            <strong>Participación por Código:</strong> Puedes seleccionar números y participar en esta simulación privada.
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 350px; gap: 30px;" class="rifa-details-grid">
            <div class="numbers-section">
                <div class="controls">
                    <button class="btn btn-secondary" onclick="selectRandomNumberForCode()">
                        🎯 Elegir al Azar
                    </button>
                    <button class="btn btn-primary" onclick="clearCodeSelection()">
                        🗑️ Limpiar Todo
                    </button>
                    ${!isCompleted ? `
                    <button class="btn btn-participate" onclick="participateInRifa(${rifa.id}, selectedNumbers)">
                        🎊 Participar
                    </button>
                    ` : ''}
                </div>
                
                <div class="numbers-grid" id="numbersGrid">
                    <!-- Los números se generan con JavaScript -->
                </div>
            </div>
            
            <div class="cart-section">
                <div class="cart-header">
                    <span class="cart-icon">🎯</span>
                    <h3 class="cart-title">${isCompleted ? 'Resultado Final' : 'Números Seleccionados'}</h3>
                    <div class="cart-count" id="cartCount">0</div>
                </div>
                
                ${isCompleted ? `
                <div style="margin-bottom: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; text-align: center; border: 2px solid #ffd700;">
                    <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 1.1rem;">🏆 ¡GANADOR!</h4>
                    <div style="font-size: 2.5rem; font-weight: bold; color: #ffd700; margin: 10px 0;">${winnerNumber}</div>
                    <p style="color: #856404; margin: 0; font-weight: bold; font-size: 1.1rem;">${rifa.winner.participant_name}</p>
                </div>
                ` : ''}
                
                <div class="cart-items" id="cartItems">
                    <div class="empty-cart">
                        No has seleccionado números aún
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="color: #333; margin-bottom: 10px;">📝 Descripción</h4>
                    <p style="color: #666; line-height: 1.5;">${rifa.description}</p>
                </div>
                
                <!-- FEAT FASE 15W-PLUS: Información del creador en sidebar -->
                <div style="margin-bottom: 20px; padding: 15px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 10px; border-left: 4px solid #667eea;">
                    <h4 style="color: #333; margin-bottom: 10px; display: flex; align-items: center;">
                        <span style="margin-right: 8px;">👤</span> Creador de la Simulación
                    </h4>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="background: #667eea; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem;">
                            ${creatorDisplay.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p style="color: #333; font-weight: 600; margin: 0; font-size: 1.1rem;">${creatorDisplay}</p>
                            <p style="color: #666; font-size: 0.9rem; margin: 0;">Organizador de la rifa</p>
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="color: #333; margin-bottom: 10px;">📊 Progreso</h4>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.round((rifa.numbers_sold / 100) * 100)}%"></div>
                    </div>
                    <p class="progress-text">${rifa.numbers_sold}/100 números</p>
                </div>
                
                ${!isCompleted && currentUser ? `
                <div style="background: #e3f2fd; border: 1px solid #90caf9; border-radius: 8px; padding: 15px; margin: 15px 0; text-align: center;">
                    <h4 style="color: #1565c0; margin: 0 0 10px 0;">✅ Usuario Logueado</h4>
                    <p style="color: #1565c0; font-size: 0.9rem; margin: 0;">
                        Participarás como: <strong>${currentUser.username}</strong>
                    </p>
                </div>
                ` : ''}
                
                ${!isCompleted ? `
                <button class="btn btn-participate" style="width: 100%; margin-bottom: 10px;" onclick="participateInRifa(${rifa.id}, selectedNumbers)">
                    🎊 ¡Participar en Simulación!
                </button>
                ` : `
                <div style="text-align: center; padding: 15px; background: #e8f5e8; border-radius: 8px; margin-bottom: 10px;">
                    <p style="color: #2e7d32; font-weight: bold; margin: 0;">✓ Simulación Completada</p>
                </div>
                `}
                
                <button class="btn btn-secondary" style="width: 100%;" onclick="navigateTo('demo')">
                    🎮 Ir al Simulador Demo
                </button>
            </div>
        </div>
    `;
    
    // Generar grid interactivo
    generateRifaGrid(rifa);
    
    // Resetear selección
    selectedNumbers = [];
    updateCart();
}

// FASE 2: Función para obtener números con timestamps desde la API
// Esta función consulta el endpoint /api/rifas/:id/numbers para obtener
// información detallada de cada número ocupado incluyendo timestamps
// Parámetro: rifaId - ID de la rifa de la cual obtener los números
// Retorna: Array de objetos con {number, participant_name, tooltip}
async function loadNumbersWithTimestamps(rifaId) {
    try {
        const response = await fetch(`${API_BASE}/rifas/${rifaId}/numbers`);
        if (response.ok) {
            const data = await response.json();
            // Guardamos en variable global para uso posterior
            numbersWithTooltips = data.numbers || [];
            console.log('✅ [FASE 2] Números con timestamps cargados:', numbersWithTooltips.length);
            return numbersWithTooltips;
        } else {
            console.warn('⚠️ [FASE 2] Error cargando timestamps de números');
            numbersWithTooltips = [];
            return [];
        }
    } catch (error) {
        console.error('❌ [FASE 2] Error obteniendo timestamps:', error);
        numbersWithTooltips = [];
        return [];
    }
}

// FASE 2: Generar grid con tooltips de timestamps
async function generateRifaGrid(rifa) {
    const grid = document.getElementById('numbersGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const isCompleted = rifa.status === 'completed';
    const winnerNumber = rifa.winner ? rifa.winner.number : null;
    
    // FASE 2: Cargar números con timestamps
    await loadNumbersWithTimestamps(rifa.id);
    
    // Crear mapa de números con sus tooltips
    const tooltipMap = {};
    numbersWithTooltips.forEach(numData => {
        tooltipMap[numData.number] = numData.tooltip;
    });
    
    for (let i = 0; i <= 99; i++) {
        const cell = document.createElement('div');
        const isSelected = rifa.sold_numbers && rifa.sold_numbers.includes(i);
        const isWinner = winnerNumber === i;
        
        cell.textContent = i.toString().padStart(2, '0');
        cell.id = `number-${i}`;
        
        if (isWinner) {
            cell.className = 'number-cell winner';
        } else if (isSelected) {
            cell.className = 'number-cell sold';
            
            // FASE 2: Agregar tooltip con timestamp para números ocupados
            if (tooltipMap[i]) {
                cell.title = tooltipMap[i];
                cell.setAttribute('data-tooltip', tooltipMap[i]);
                
                // Agregar event listeners para tooltip custom
                cell.addEventListener('mouseenter', showTooltip);
                cell.addEventListener('mouseleave', hideTooltip);
                
                console.log(`✅ [FASE 2] Tooltip agregado al número ${i}: ${tooltipMap[i]}`);
            }
        } else {
            cell.className = 'number-cell';
            if (!isCompleted) {
                cell.onclick = () => toggleNumberForCode(i);
            }
        }
        
        grid.appendChild(cell);
    }
    
    console.log('🎯 [FASE 2] Grid generado con', Object.keys(tooltipMap).length, 'tooltips');
}

// FASE 2: Funciones para mostrar/ocultar tooltips personalizados
// Estas funciones manejan la visualización de tooltips informativos
// cuando el usuario hace hover sobre números ocupados en la grilla

/**
 * Muestra un tooltip personalizado con información del número
 * @param {Event} event - Evento mouseenter del elemento
 * Funcionalidad:
 * 1. Extrae el texto del tooltip del atributo data-tooltip
 * 2. Crea un elemento div con clase custom-tooltip
 * 3. Posiciona el tooltip centrado arriba del número
 * 4. Lo agrega al DOM con animación CSS
 */
function showTooltip(event) {
    const tooltip = event.target.getAttribute('data-tooltip');
    if (!tooltip) return;
    
    // Crear elemento tooltip
    const tooltipElement = document.createElement('div');
    tooltipElement.className = 'custom-tooltip';
    tooltipElement.textContent = tooltip;
    tooltipElement.id = 'activeTooltip';
    
    // Posicionar tooltip centrado arriba del número
    const rect = event.target.getBoundingClientRect();
    tooltipElement.style.left = rect.left + (rect.width / 2) + 'px';
    tooltipElement.style.top = (rect.top - 40) + 'px';
    
    document.body.appendChild(tooltipElement);
}

/**
 * Oculta el tooltip activo si existe
 * Se ejecuta en evento mouseleave
 * Funcionalidad:
 * 1. Busca el tooltip activo por ID
 * 2. Lo remueve del DOM si existe
 * 3. Permite que la animación CSS se ejecute naturalmente
 */
function hideTooltip() {
    const tooltip = document.getElementById('activeTooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

function toggleNumberForCode(number) {
    const cell = document.getElementById(`number-${number}`);
    if (!cell || cell.classList.contains('sold')) return;
    
    const index = selectedNumbers.indexOf(number);
    
    if (index > -1) {
        selectedNumbers.splice(index, 1);
        cell.classList.remove('selected');
        const deleteBtn = cell.querySelector('.delete-number');
        if (deleteBtn) {
            deleteBtn.remove();
        }
    } else {
        selectedNumbers.push(number);
        cell.classList.add('selected');
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-number';
        deleteBtn.innerHTML = '✕';
        deleteBtn.onclick = function(e) {
            e.stopPropagation();
            toggleNumberForCode(number);
        };
        cell.appendChild(deleteBtn);
    }
    
    updateCart();
}

function selectRandomNumberForCode() {
    const available = [];
    for (let i = 0; i <= 99; i++) {
        if (!selectedNumbers.includes(i)) {
            const cell = document.getElementById(`number-${i}`);
            if (cell && !cell.classList.contains('sold')) {
                available.push(i);
            }
        }
    }
    
    if (available.length > 0) {
        const randomIndex = Math.floor(Math.random() * available.length);
        const randomNumber = available[randomIndex];
        toggleNumberForCode(randomNumber);
    }
}

function clearCodeSelection() {
    selectedNumbers.forEach(number => {
        const cell = document.getElementById(`number-${number}`);
        if (cell) {
            cell.classList.remove('selected');
            const deleteBtn = cell.querySelector('.delete-number');
            if (deleteBtn) {
                deleteBtn.remove();
            }
        }
    });
    selectedNumbers = [];
    updateCart();
}
