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
// FASE 3: Variable para indicar si estamos en vista de propietario
let isOwnerView = false;
// FASE 4: Variable para mapear usuarios a colores únicos
let userColorMap = {};
// FASE 4.1: Variable para modo de visualización de colores
// 'simple' = 2 colores (ocupado/disponible)
// 'multi' = 12 colores únicos por participante
let colorMode = 'multi'; // Por defecto, modo multi-color (FASE 4)

// API Base URL
const API_BASE = '/api';

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    navigateTo('demo');

    // FASE 5: Inicializar mejoras móviles
    initMobileEnhancements();
});

// ========================================
// FASE 5: MEJORAS MÓVILES Y RESPONSIVAS
// ========================================

/**
 * Inicializa mejoras específicas para dispositivos móviles
 * - Previene zoom en double-tap en botones
 * - Mejora el comportamiento del menú móvil
 * - Agrega soporte para gestos swipe en modales
 * - Optimiza el scroll y la navegación
 */
function initMobileEnhancements() {
    // Detectar si es dispositivo móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isMobile || isTouch) {
        console.log('📱 FASE 5: Dispositivo móvil detectado - Activando mejoras táctiles');

        // Prevenir zoom en double-tap en botones y elementos interactivos
        preventDoubleTapZoom();

        // Auto-cerrar menú móvil al navegar
        autoCloseMobileMenu();

        // Mejorar scroll en modales móviles
        improveMobileModals();

        // Agregar indicador de viewport para debugging (solo en desarrollo)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            addViewportDebugger();
        }
    }
}

/**
 * Previene el zoom en double-tap en elementos interactivos
 * Mantiene la usabilidad pero evita zooms accidentales
 */
function preventDoubleTapZoom() {
    let lastTouchEnd = 0;

    document.addEventListener('touchend', function(event) {
        const now = Date.now();

        // Si es double-tap en botón o número, prevenir zoom
        if (now - lastTouchEnd <= 300) {
            const target = event.target;
            if (target.classList.contains('btn') ||
                target.classList.contains('number-cell') ||
                target.closest('.btn') ||
                target.closest('.number-cell')) {
                event.preventDefault();
            }
        }

        lastTouchEnd = now;
    }, { passive: false });
}

/**
 * Auto-cierra el menú móvil cuando se navega a otra sección
 * Mejora la UX evitando que el menú quede abierto
 */
function autoCloseMobileMenu() {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const navLinksContainer = document.getElementById('navLinks');
            if (navLinksContainer && navLinksContainer.classList.contains('active')) {
                navLinksContainer.classList.remove('active');
            }
        });
    });
}

/**
 * Mejora el comportamiento de modales en móviles
 * - Previene scroll del body cuando modal está abierto
 * - Agrega soporte para swipe-down para cerrar
 */
function improveMobileModals() {
    let touchStartY = 0;
    let touchEndY = 0;

    // Observar cuando se agregan modales al DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.classList && node.classList.contains('modal')) {
                    // Prevenir scroll del body
                    document.body.style.overflow = 'hidden';

                    // Agregar soporte para swipe-down en el contenido del modal
                    const modalContent = node.querySelector('.modal-content');
                    if (modalContent) {
                        modalContent.addEventListener('touchstart', function(e) {
                            touchStartY = e.touches[0].clientY;
                        });

                        modalContent.addEventListener('touchend', function(e) {
                            touchEndY = e.changedTouches[0].clientY;

                            // Si swipe hacia abajo > 100px, cerrar modal
                            if (touchStartY < touchEndY - 100 && window.scrollY === 0) {
                                // Simular click en botón cancelar si existe
                                const cancelBtn = modalContent.querySelector('.btn-secondary');
                                if (cancelBtn) {
                                    cancelBtn.click();
                                }
                            }
                        });
                    }
                }
            });

            mutation.removedNodes.forEach(function(node) {
                if (node.classList && node.classList.contains('modal')) {
                    // Restaurar scroll del body
                    document.body.style.overflow = '';
                }
            });
        });
    });

    observer.observe(document.body, { childList: true });
}

/**
 * Agrega un indicador visual del tamaño de viewport
 * Solo para desarrollo - ayuda a testear responsive design
 */
function addViewportDebugger() {
    const debuggerElement = document.createElement('div');
    debuggerElement.id = 'viewport-debugger';
    debuggerElement.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 11px;
        z-index: 9999;
        font-family: monospace;
        pointer-events: none;
    `;
    document.body.appendChild(debuggerElement);

    function updateDebugger() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        let breakpoint = 'XL';

        if (width <= 360) breakpoint = 'XXS';
        else if (width <= 480) breakpoint = 'XS';
        else if (width <= 600) breakpoint = 'SM';
        else if (width <= 768) breakpoint = 'MD';
        else if (width <= 1024) breakpoint = 'LG';
        else if (width <= 1200) breakpoint = 'XL';

        debuggerElement.textContent = `${width}×${height} [${breakpoint}]`;
    }

    updateDebugger();
    window.addEventListener('resize', updateDebugger);
}

/**
 * Toggle del menú móvil
 * Mejora la función existente con animación y accesibilidad
 */
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        const isActive = navLinks.classList.toggle('active');

        // Cambiar ícono del botón
        const menuBtn = document.querySelector('.mobile-menu-btn');
        if (menuBtn) {
            menuBtn.textContent = isActive ? '✕' : '☰';
            menuBtn.setAttribute('aria-expanded', isActive);
        }

        // Gestionar foco para accesibilidad
        if (isActive) {
            const firstLink = navLinks.querySelector('a');
            if (firstLink) {
                setTimeout(() => firstLink.focus(), 100);
            }
        }
    }
}

// ========== FUNCIONES NUEVAS FASE 15C ==========

// FASE 3: Modal de confirmación personalizado
function showDeleteConfirmation(message, onConfirm, event) {
    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'delete-confirmation-modal';
    modal.innerHTML = `
        <div class="delete-confirmation-content">
            <h3 class="delete-confirmation-title">🗑️ Confirmar eliminación</h3>
            <p class="delete-confirmation-message">${message}</p>
            <div class="delete-confirmation-buttons">
                <button class="delete-confirmation-btn cancel" onclick="closeDeleteConfirmation()">Cancelar</button>
                <button class="delete-confirmation-btn confirm" onclick="confirmDelete()">Eliminar</button>
            </div>
        </div>
    `;
    
    // Agregar al DOM
    document.body.appendChild(modal);
    
    // FASE 3.1a: Posicionar el modal de manera inteligente
    const modalContent = modal.querySelector('.delete-confirmation-content');
    if (event && event.target) {
        const rect = event.target.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Si el click fue en la mitad superior, mostrar el modal abajo
        // Si fue en la mitad inferior, mostrar el modal arriba
        if (rect.top < viewportHeight / 2) {
            modalContent.style.top = '60%';
        } else {
            modalContent.style.top = '30%';
        }
        
        // Ajustar posición horizontal si está muy a los lados
        if (rect.left < 100) {
            modalContent.style.left = '55%';
        } else if (rect.right > viewportWidth - 100) {
            modalContent.style.left = '45%';
        }
    }
    
    // Guardar la función de confirmación
    window.pendingDeleteAction = onConfirm;
    
    // Cerrar con ESC
    document.addEventListener('keydown', handleDeleteModalKeydown);
    
    // Cerrar haciendo click fuera del modal
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeDeleteConfirmation();
        }
    });
}

function closeDeleteConfirmation() {
    const modal = document.querySelector('.delete-confirmation-modal');
    if (modal) {
        modal.remove();
    }
    window.pendingDeleteAction = null;
    document.removeEventListener('keydown', handleDeleteModalKeydown);
}

function confirmDelete() {
    if (window.pendingDeleteAction) {
        window.pendingDeleteAction();
    }
    closeDeleteConfirmation();
}

function handleDeleteModalKeydown(e) {
    if (e.key === 'Escape') {
        closeDeleteConfirmation();
    }
}

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
    showDeleteConfirmation(
        `¿Eliminar el número <strong>${number}</strong> de <strong>${userName}</strong>?`,
        () => removeNumberFromRifa(rifaId, number, userName)
    );
}

// NUEVO: Eliminar todos los números de un usuario
function removeAllUserNumbers(userName, rifaId) {
    showDeleteConfirmation(
        `¿Eliminar <strong>TODOS</strong> los números de <strong>${userName}</strong>?<br><small style="color: #666;">Esta acción no se puede deshacer.</small>`,
        () => removeAllNumbersFromUser(rifaId, userName)
    );
}

// FASE 3: Eliminar número desde la grilla principal
function removeNumberFromGrid(rifaId, number, event) {
    showDeleteConfirmation(
        `¿Eliminar el número <strong>${number.toString().padStart(2, '0')}</strong>?`,
        () => removeNumberFromRifa(rifaId, number),
        event
    );
}

// NUEVO: Función API para eliminar número específico
async function removeNumberFromRifa(rifaId, number, userName) {
    try {
        // FASE 3.1a: Guardar posición del scroll antes de recargar
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        
        const response = await fetch(`${API_BASE}/rifas/${rifaId}/numbers/${number}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification(`Número ${number} eliminado${userName ? ' de ' + userName : ''}`);
            // Recargar vista de detalles
            await viewRifa(rifaId);
            
            // FASE 3.1a: Restaurar posición del scroll después de recargar
            setTimeout(() => {
                window.scrollTo(0, scrollPosition);
            }, 100);
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
        // FASE 3.1a: Guardar posición del scroll antes de recargar
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        
        const response = await fetch(`${API_BASE}/rifas/${rifaId}/participants/${encodeURIComponent(userName)}/numbers`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification(`Todos los números de ${userName} eliminados (${data.total_deleted} números)`);
            // Recargar vista de detalles
            await viewRifa(rifaId);
            
            // FASE 3.1a: Restaurar posición del scroll después de recargar
            setTimeout(() => {
                window.scrollTo(0, scrollPosition);
            }, 100);
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

// Lanzar confetis cuando hay un ganador
function launchConfetti() {
    const colors = ['#ffd700', '#ff6b6b', '#4caf50', '#2196F3', '#ff9800', '#9c27b0'];
    const confettiCount = 80;

    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confetti.style.opacity = Math.random();

            // Formas variadas
            if (Math.random() > 0.5) {
                confetti.style.borderRadius = '50%';
            }

            document.body.appendChild(confetti);

            // Remover después de la animación
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }, i * 30);
    }
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
    // FASE 7: Limpiar polling de status cuando se cambia de página
    if (window.rifaStatusPolling) {
        clearInterval(window.rifaStatusPolling);
        window.rifaStatusPolling = null;
        console.log('🧹 [FASE 7] Polling limpiado al cambiar de página');
    }

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
    // FASE 4: Verificar si el número está ocupado (sold o cualquier color de usuario)
    if (!cell || cell.classList.contains('sold') || cell.className.includes('user-color-')) return;
    
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
            // FASE 4: Verificar que no esté ocupado (sold o cualquier color de usuario)
            if (cell && !cell.classList.contains('sold') && !cell.className.includes('user-color-')) {
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
                    const hasWinner = rifa.winner && rifa.winner.number !== undefined;

                    return `
                        <div class="rifa-card" style="background: ${isCompleted ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' : 'white'}; box-shadow: 0 5px 20px rgba(0,0,0,${isCompleted ? '0.15' : '0.1'}); ${isCompleted ? 'border: 3px solid #4caf50;' : ''}">
                            ${rifa.image_url ? `
                            <div class="rifa-card-image-container" onclick="openLightbox('${rifa.image_url}')" style="cursor: zoom-in;" title="Click para ampliar">
                                <img src="${rifa.image_url}" alt="${rifa.title}" class="rifa-card-image">
                            </div>
                            ` : ''}
                            <div class="rifa-image">${isCompleted ? '🏆' : '🎯'}</div>
                            <h3>${rifa.title}</h3>
                            <p class="rifa-description">${rifa.description}</p>

                            ${isCompleted && hasWinner ? `
                            <div class="winner-badge">
                                🏆 ¡SIMULACIÓN COMPLETADA!
                            </div>
                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 10px; margin: 15px 0; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); animation: winnerBannerPulse 1.5s ease-in-out infinite; transform-origin: center center; will-change: transform, box-shadow;">
                                <p style="font-size: 0.85rem; margin: 0 0 5px 0; opacity: 0.9;">Ganador:</p>
                                <div style="font-size: 2rem; font-weight: bold; margin: 5px 0;">${String(rifa.winner.number).padStart(2, '0')}</div>
                                <p style="font-size: 1rem; margin: 5px 0 0 0; font-weight: 500;">${rifa.winner.participant_name}</p>
                            </div>
                            ` : isCompleted ? `
                            <div class="winner-badge">
                                🏆 ¡SIMULACIÓN COMPLETADA!
                            </div>
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

                            <div style="display: flex; gap: 8px; margin-top: 15px; flex-wrap: wrap;">
                                <button class="btn btn-primary" onclick="viewRifa(${rifa.id})" style="flex: 1; font-size: 0.9rem; min-width: 70px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                                    👁️ Ver
                                </button>
                                <button class="btn btn-secondary" onclick="${isCompleted ? '' : `editRifa(${rifa.id})`}" ${isCompleted ? 'disabled' : ''} style="flex: 1; font-size: 0.9rem; min-width: 70px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); ${isCompleted ? 'opacity: 0.5; cursor: not-allowed; background: #ccc;' : ''}">
                                    ✏️ Editar
                                </button>
                                ${!isCompleted ? `
                                <button class="btn" onclick="${rifa.numbers_sold > 0 ? `quickDraw(${rifa.id}, '${rifa.title}')` : ''}" ${rifa.numbers_sold === 0 ? 'disabled' : ''} style="background: ${rifa.numbers_sold > 0 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ccc'}; color: white; flex: 1; font-size: 0.9rem; min-width: 70px; font-weight: bold; box-shadow: 0 4px 15px rgba(102, 126, 234, ${rifa.numbers_sold > 0 ? '0.4' : '0.1'}); ${rifa.numbers_sold === 0 ? 'opacity: 0.5; cursor: not-allowed;' : ''}" title="${rifa.numbers_sold === 0 ? 'No hay números vendidos' : 'Realizar sorteo'}">
                                    🎲 Sortear
                                </button>
                                ` : ''}
                                ${isCompleted ? `
                                <button class="btn" onclick="showCompletedRifaResult(${rifa.id})" style="background: #4caf50; color: white; flex: 1; font-size: 0.8rem; min-width: 85px; padding: 10px 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                                    📊 Ver Ganador
                                </button>
                                ` : ''}
                            </div>
                            <div style="display: flex; gap: 8px; margin-top: 8px;">
                                <button class="btn" onclick="deleteRifa(${rifa.id})" style="background: #ff6b6b; color: white; flex: 1; font-size: 0.9rem; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                                    🗑️ Eliminar
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
                
                <div style="margin-bottom: 20px; text-align: center;">
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
                        
                        <!-- FASE 3.2c: Título prominente en vista de participante -->
                        <div class="rifa-title-section">
                            <h3 class="rifa-title-main">
                                <span class="rifa-title-emoji">🎯</span>
                                ${rifa.title}
                            </h3>
                            <p class="rifa-description-text">${rifa.description}</p>
                        </div>

                        <!-- FASE 8: Imagen del premio -->
                        ${rifa.image_url ? `
                            <div class="prize-image-container">
                                <img src="${rifa.image_url}" alt="${rifa.title}" class="prize-image" onclick="openLightbox('${rifa.image_url}')" style="cursor: zoom-in;" title="Click para ampliar">
                            </div>
                        ` : ''}

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
        
        // FASE 3: Establecer que estamos en vista de propietario
        isOwnerView = true;
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
        
        // FASE 7: Formatear fecha programada si existe
        let scheduledDateHtml = '';
        if (rifa.scheduled_draw_date && !isCompleted) {
            const scheduledDate = new Date(rifa.scheduled_draw_date);
            const now = new Date();
            const isPast = scheduledDate <= now;

            const dateStr = scheduledDate.toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            const timeStr = scheduledDate.toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            scheduledDateHtml = `
                <div style="margin: 15px 0; padding: 12px 15px; background: ${isPast ? '#ffebee' : '#e3f2fd'}; border-left: 4px solid ${isPast ? '#f44336' : '#2196F3'}; border-radius: 8px;">
                    <p style="margin: 0; color: ${isPast ? '#c62828' : '#1565c0'}; font-weight: 600; font-size: 0.95rem;">
                        📅 Sorteo programado: ${dateStr} a las ${timeStr}
                        ${isPast ? '<br><small style="font-size: 0.85rem;">(La fecha ya pasó - se sorteará automáticamente)</small>' : ''}
                    </p>
                </div>
            `;
        } else if (!rifa.scheduled_draw_date && !isCompleted) {
            scheduledDateHtml = `
                <div style="margin: 15px 0; padding: 10px 15px; background: #f5f5f5; border-left: 4px solid #9e9e9e; border-radius: 8px;">
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">
                        ⏰ Sin fecha programada - Sorteo manual
                    </p>
                </div>
            `;
        }

        // FASE 7: Mensaje del propietario si existe
        let ownerMessageHtml = '';
        if (rifa.owner_message) {
            ownerMessageHtml = `
                <div style="margin: 15px 0; padding: 12px 15px; background: #fff3e0; border-left: 4px solid #ff9800; border-radius: 8px;">
                    <p style="margin: 0 0 5px 0; color: #e65100; font-weight: 600; font-size: 0.85rem;">
                        💬 Mensaje del organizador:
                    </p>
                    <p style="margin: 0; color: #555; font-size: 0.95rem; font-style: italic;">
                        "${rifa.owner_message}"
                    </p>
                </div>
            `;
        }

        document.getElementById('mainContainer').innerHTML = `
            <div class="page-header">
                <h1>🎯 ${rifa.title}</h1>
                <p class="subtitle">${rifa.description}</p>
                ${scheduledDateHtml}
                ${ownerMessageHtml}
                ${isCompleted ? `<p class="winner-banner">
                    🏆 ¡SIMULACIÓN COMPLETADA! Ganador: Número ${winnerNumber} (${rifa.winner.participant_name})
                </p>` : ''}
            </div>

            <div style="margin-bottom: 20px;">
                <button class="btn btn-secondary" onclick="navigateTo('perfil')">
                    ← Volver a Mis Simulaciones
                </button>
                ${!isCompleted ? `
                <button class="btn btn-primary" onclick="editRifa(${rifaId})" style="margin-left: 10px;">
                    ✏️ Editar
                </button>
                ` : ''}
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
                    
                    <!-- FASE 3.2d: Título prominente en panel de información -->
                    <div style="margin-bottom: 20px; padding: 15px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 10px; border-left: 4px solid #667eea; text-align: center;">
                        <h3 style="color: #333; margin: 0 0 8px 0; font-size: 1.2rem; font-weight: bold;">
                            🎯 ${rifa.title}
                        </h3>
                        <p style="color: #666; margin: 0; font-style: italic; font-size: 0.9rem;">
                            ${rifa.description}
                        </p>
                    </div>
                    
                    ${isCompleted ? `
                    <div class="winner-panel">
                        <h4 class="winner-panel-title">🏆 ¡GANADOR!</h4>
                        <div class="winner-panel-number">${String(winnerNumber).padStart(2, '0')}</div>
                        <p class="winner-panel-name">${rifa.winner.participant_name}</p>
                    </div>` : ''}

                    ${scheduledDateHtml}
                    ${ownerMessageHtml}

                    <!-- FASE 3.2c: Título prominente de la rifa -->
                    <div class="rifa-title-section">
                        <h3 class="rifa-title-main">
                            <span class="rifa-title-emoji">🎯</span>
                            ${rifa.title}
                        </h3>
                        <p class="rifa-description-text">${rifa.description}</p>
                    </div>

                    <!-- FASE 8: Imagen del premio -->
                    ${rifa.image_url ? `
                        <div class="prize-image-container">
                            <img src="${rifa.image_url}" alt="${rifa.title}" class="prize-image" onclick="openLightbox('${rifa.image_url}')" style="cursor: zoom-in;" title="Click para ampliar">
                        </div>
                    ` : ''}

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
                    </button>
                    <button class="btn btn-primary" style="width: 100%;" onclick="editRifa(${rifaId})">
                        ✏️ Editar Simulación
                    </button>` : `
                    <div style="text-align: center; padding: 15px; background: #e8f5e8; border-radius: 8px; margin-bottom: 10px;">
                        <p style="color: #2e7d32; font-weight: bold; margin: 0;">✓ Sorteo Completado</p>
                    </div>`}
                </div>
            </div>
        `;
        
        console.log('✅ [DEBUG] Vista cargada exitosamente');

        // FASE 1: Cargar automáticamente la lista de participantes
        setTimeout(() => loadParticipants(rifaId), 500);

        // Lanzar confetis si la rifa está completada
        if (isCompleted) {
            setTimeout(() => launchConfetti(), 300);
        }

        // FASE 7: Polling para detectar sorteo automático
        // Solo si hay fecha programada y la rifa está activa
        if (rifa.scheduled_draw_date && !isCompleted) {
            console.log('🔄 [FASE 7] Iniciando polling para detectar sorteo automático');

            // Limpiar polling anterior si existe
            if (window.rifaStatusPolling) {
                clearInterval(window.rifaStatusPolling);
            }

            // Verificar status cada 30 segundos
            window.rifaStatusPolling = setInterval(async () => {
                try {
                    const response = await fetch(`${API_BASE}/rifas/my/${rifaId}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();

                        // Si el status cambió a completed, recargar la vista
                        if (data.rifa && data.rifa.status === 'completed') {
                            console.log('🎊 [FASE 7] Sorteo detectado! Recargando vista...');
                            clearInterval(window.rifaStatusPolling);

                            // Recargar vista automáticamente
                            viewRifa(rifaId);
                        }
                    }
                } catch (error) {
                    console.error('❌ [FASE 7] Error en polling:', error);
                }
            }, 30000); // Cada 30 segundos
        }

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

            // FASE 7: Cargar fecha programada y mensaje
            const scheduledDateInput = document.getElementById('editRifaScheduledDate');
            if (rifa.scheduled_draw_date) {
                // Convertir timestamp a formato datetime-local (YYYY-MM-DDTHH:MM)
                const date = new Date(rifa.scheduled_draw_date);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                scheduledDateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
            } else {
                scheduledDateInput.value = '';
            }

            const ownerMessageInput = document.getElementById('editRifaOwnerMessage');
            ownerMessageInput.value = rifa.owner_message || '';
            document.getElementById('editRifaOwnerMessageCount').textContent = (rifa.owner_message || '').length;

            // FASE 8: Cargar imagen existente
            if (rifa.image_url) {
                document.getElementById('editRifaImageUrl').value = rifa.image_url;
                showImagePreview(rifa.image_url, true);
            } else {
                document.getElementById('editRifaImageUrl').value = '';
                removeImagePreviewEdit();
            }

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

// ========== FASE 7: MODAL DE CONFIRMACIÓN DE ELIMINACIÓN ==========

// Variable global para almacenar el ID de la rifa a eliminar
let rifaToDelete = null;

// Mostrar modal de confirmación de eliminación
async function deleteRifa(rifaId) {
    rifaToDelete = rifaId;
    document.getElementById('confirmDeleteModal').style.display = 'flex';
}

// Cerrar modal de confirmación
function closeConfirmDeleteModal() {
    document.getElementById('confirmDeleteModal').style.display = 'none';
    rifaToDelete = null;
}

// Confirmar y ejecutar eliminación
async function confirmDeleteRifa() {
    if (!rifaToDelete) return;

    try {
        const response = await fetch(`${API_BASE}/rifas/${rifaToDelete}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (response.ok) {
            showNotification('Simulación eliminada exitosamente');
            closeConfirmDeleteModal();
            showPerfilPage(); // Recargar la página de perfil
        } else {
            const data = await response.json();
            showNotification(data.error || 'Error eliminando simulación', 'error');
            closeConfirmDeleteModal();
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
        closeConfirmDeleteModal();
    }
}

// ========== FASE 6: SORTEO DIRECTO ==========

async function quickDraw(rifaId, rifaTitle) {
    // Crear modal de confirmación
    const modalHtml = `
        <div id="quickDrawModal" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.2s ease;
        ">
            <div style="
                background: white;
                border-radius: 20px;
                padding: 40px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: slideUp 0.3s ease;
            ">
                <div style="font-size: 4rem; margin-bottom: 20px;">🎲</div>
                <h2 style="color: #333; margin-bottom: 15px;">Realizar Sorteo</h2>
                <h3 style="color: #667eea; margin-bottom: 20px;">"${rifaTitle}"</h3>
                <p style="color: #666; margin-bottom: 30px; line-height: 1.6;">
                    ¿Estás seguro de que quieres realizar el sorteo ahora?<br>
                    <strong>Esta acción no se puede deshacer.</strong>
                </p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button onclick="closeQuickDrawModal()" class="btn btn-secondary" style="flex: 1;">
                        ❌ Cancelar
                    </button>
                    <button onclick="executeQuickDraw(${rifaId}, '${rifaTitle}')" class="btn" style="flex: 1; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                        🎲 Sortear Ahora
                    </button>
                </div>
            </div>
        </div>
    `;

    // Agregar modal al DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer.firstElementChild);
}

function closeQuickDrawModal() {
    const modal = document.getElementById('quickDrawModal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.2s ease';
        setTimeout(() => modal.remove(), 200);
    }
}

async function executeQuickDraw(rifaId, rifaTitle) {
    // Cerrar modal de confirmación
    closeQuickDrawModal();

    // Mostrar modal de carga
    const loadingHtml = `
        <div id="drawLoadingModal" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        ">
            <div style="
                background: white;
                border-radius: 20px;
                padding: 40px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            ">
                <div style="font-size: 4rem; animation: spin 1s linear infinite;">🎲</div>
                <p style="color: #667eea; font-size: 1.2rem; font-weight: bold; margin-top: 20px;">
                    Realizando sorteo...
                </p>
            </div>
        </div>
    `;

    const loadingContainer = document.createElement('div');
    loadingContainer.innerHTML = loadingHtml;
    document.body.appendChild(loadingContainer.firstElementChild);

    try {
        const response = await fetch(`${API_BASE}/rifas/${rifaId}/draw`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        // Cerrar modal de carga
        const loadingModal = document.getElementById('drawLoadingModal');
        if (loadingModal) loadingModal.remove();

        if (response.ok) {
            const data = await response.json();
            showQuickDrawResult(data.winner, rifaTitle);

            // Recargar lista después de 3 segundos
            setTimeout(() => showPerfilPage(), 3000);
        } else {
            const data = await response.json();
            showNotification(data.error || 'Error realizando sorteo', 'error');
        }
    } catch (error) {
        // Cerrar modal de carga en caso de error
        const loadingModal = document.getElementById('drawLoadingModal');
        if (loadingModal) loadingModal.remove();

        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    }
}

function showQuickDrawResult(winner, rifaTitle) {
    const resultHtml = `
        <div id="quickDrawResultModal" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        ">
            <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 25px;
                padding: 50px;
                max-width: 600px;
                width: 90%;
                text-align: center;
                box-shadow: 0 25px 70px rgba(0,0,0,0.5);
                border: 3px solid gold;
                animation: winnerPulse 1s ease infinite;
            ">
                <div style="font-size: 6rem; margin-bottom: 20px; animation: bounce 1s ease infinite;">🏆</div>
                <h2 style="color: white; font-size: 2rem; margin-bottom: 15px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                    ¡GANADOR!
                </h2>
                <h3 style="color: #ffd700; font-size: 1.3rem; margin-bottom: 25px;">
                    "${rifaTitle}"
                </h3>
                <div style="
                    background: white;
                    border-radius: 15px;
                    padding: 30px;
                    margin: 20px 0;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                ">
                    <p style="color: #667eea; font-size: 1.1rem; margin-bottom: 10px;">Número ganador:</p>
                    <div style="
                        font-size: 4rem;
                        font-weight: bold;
                        color: #667eea;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        margin: 10px 0;
                    ">${String(winner.number).padStart(2, '0')}</div>
                    <p style="color: #333; font-size: 1.3rem; font-weight: bold; margin-top: 15px;">
                        ${winner.participant_name}
                    </p>
                </div>
                <p style="color: rgba(255,255,255,0.9); font-size: 0.9rem; margin-top: 20px;">
                    La lista se actualizará automáticamente...
                </p>
                <button onclick="closeQuickDrawResultModal()" class="btn" style="
                    background: white;
                    color: #667eea;
                    margin-top: 20px;
                    font-weight: bold;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                ">
                    ✅ Entendido
                </button>
            </div>
        </div>
    `;

    const resultContainer = document.createElement('div');
    resultContainer.innerHTML = resultHtml;
    document.body.appendChild(resultContainer.firstElementChild);
}

function closeQuickDrawResultModal() {
    const modal = document.getElementById('quickDrawResultModal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
            showPerfilPage(); // Recargar inmediatamente al cerrar
        }, 300);
    }
}

// Mostrar resultado de rifa completada (desde botón "Ver Ganador")
async function showCompletedRifaResult(rifaId) {
    console.log('🔍 [DEBUG] showCompletedRifaResult llamado con rifaId:', rifaId);
    try {
        const token = localStorage.getItem('authToken');
        const url = `${API_BASE}/rifas/my/${rifaId}`;
        console.log('🔍 [DEBUG] Haciendo fetch a:', url);
        console.log('🔍 [DEBUG] Token presente:', !!token);

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('🔍 [DEBUG] Response status:', response.status);
        console.log('🔍 [DEBUG] Response ok:', response.ok);

        if (!response.ok) {
            const errorText = await response.text();
            console.log('🔍 [DEBUG] Error response body:', errorText);
            throw new Error('Error al cargar la rifa');
        }

        const data = await response.json();
        console.log('🔍 [DEBUG] Data obtenida:', data);

        const rifa = data.rifa || data;
        console.log('🔍 [DEBUG] Rifa:', rifa);
        console.log('🔍 [DEBUG] Winner:', rifa.winner);

        if (!rifa.winner || !rifa.winner.number) {
            console.log('🔍 [DEBUG] Rifa no tiene ganador');
            showNotification('Esta rifa no tiene ganador aún', 'error');
            return;
        }

        console.log('🔍 [DEBUG] Mostrando modal con ganador:', rifa.winner);
        // Reutilizar el modal de resultado de sorteo
        showQuickDrawResult(rifa.winner, rifa.title);
    } catch (error) {
        console.error('❌ [DEBUG] Error al cargar información del ganador:', error);
        showNotification('No se pudo cargar la información del ganador', 'error');
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

    // FASE 8: Limpiar formulario y variables globales
    document.getElementById('createRifaForm').reset();
    document.getElementById('rifaImageUrl').value = '';
    removeImagePreview();
    currentImageUrl = null;
}

function closeEditRifaModal() {
    document.getElementById('editRifaModal').style.display = 'none';

    // FASE 8: Limpiar formulario y variables globales para prevenir precarga entre usuarios
    document.getElementById('editRifaForm').reset();
    document.getElementById('editRifaImageUrl').value = '';
    removeImagePreviewEdit();
    editImageUrl = null;

    // Limpiar dataset
    delete document.getElementById('editRifaForm').dataset.rifaId;
}

// Event listeners para formularios (configurados después de DOMContentLoaded)
document.addEventListener('DOMContentLoaded', function() {
    // FASE 7: Contador de caracteres para mensaje del propietario (crear)
    const rifaOwnerMessage = document.getElementById('rifaOwnerMessage');
    if (rifaOwnerMessage) {
        rifaOwnerMessage.addEventListener('input', function() {
            document.getElementById('rifaOwnerMessageCount').textContent = this.value.length;
        });
    }

    // FASE 7: Contador de caracteres para mensaje del propietario (editar)
    const editRifaOwnerMessage = document.getElementById('editRifaOwnerMessage');
    if (editRifaOwnerMessage) {
        editRifaOwnerMessage.addEventListener('input', function() {
            document.getElementById('editRifaOwnerMessageCount').textContent = this.value.length;
        });
    }

    // Event listener para crear simulación
    document.getElementById('createRifaForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const title = document.getElementById('rifaTitle').value;
        const description = document.getElementById('rifaDescription').value;
        const scheduled_draw_date = document.getElementById('rifaScheduledDate').value || null;
        const owner_message = document.getElementById('rifaOwnerMessage').value || null;

        if (!title.trim()) {
            showNotification('El título es requerido', 'error');
            return;
        }

        try {
            // FASE 8: Obtener URL de imagen (si existe)
            const image_url = await getFinalImageUrl(false);

            const response = await fetch(`${API_BASE}/rifas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    scheduled_draw_date,
                    owner_message,
                    image_url  // FASE 8: Incluir imagen
                })
            });

            if (response.ok) {
                const data = await response.json();
                showNotification('Simulación creada exitosamente');
                closeCreateRifaModal();
                document.getElementById('createRifaForm').reset();
                document.getElementById('rifaOwnerMessageCount').textContent = '0';
                // FASE 8: Limpiar preview de imagen
                removeImagePreview();
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
        const scheduled_draw_date = document.getElementById('editRifaScheduledDate').value || '';
        const owner_message = document.getElementById('editRifaOwnerMessage').value || '';

        if (!rifaId) {
            showNotification('Error: ID de simulación no válido', 'error');
            return;
        }

        try {
            // FASE 8: Obtener URL de imagen (si existe)
            const image_url = await getFinalImageUrl(true);

            const response = await fetch(`${API_BASE}/rifas/${rifaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    scheduled_draw_date,
                    owner_message,
                    image_url  // FASE 8: Incluir imagen
                })
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

// FASE 7: Función para quitar la fecha programada
function clearScheduledDate() {
    document.getElementById('editRifaScheduledDate').value = '';
    showNotification('Fecha programada removida. No olvides guardar los cambios.', 'success');
}

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
                    // FASE 3: Números con botones de eliminación individual
                    const numbersDisplay = participant.numbers.sort((a, b) => a - b)
                        .map(num => `
                            <span style="background: #4caf50; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; margin: 1px; position: relative; display: inline-block;">
                                ${num.toString().padStart(2, '0')}
                                <button onclick="removeUserNumber(${num}, '${participant.name}', ${rifaId})" 
                                        style="background: #ff4444; color: white; border: none; border-radius: 50%; width: 14px; height: 14px; font-size: 0.6rem; line-height: 1; position: absolute; top: -5px; right: -5px; cursor: pointer; display: none;" 
                                        class="number-delete-btn" title="Eliminar este número">
                                    ×
                                </button>
                            </span>
                        `)
                        .join(' ');
                    
                    return `
                        <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 10px; border-left: 4px solid #4caf50; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" 
                             onmouseenter="this.querySelectorAll('.number-delete-btn').forEach(btn => btn.style.display = 'block')" 
                             onmouseleave="this.querySelectorAll('.number-delete-btn').forEach(btn => btn.style.display = 'none')">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <strong style="color: #333; font-size: 1rem;">${participant.name}</strong>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="background: #e8f5e8; color: #2e7d32; padding: 4px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">
                                        ${participant.total_numbers} número${participant.total_numbers !== 1 ? 's' : ''}
                                    </span>
                                    <!-- FASE 3: Botón eliminar todos los números -->
                                    <button onclick="removeAllUserNumbers('${participant.name}', ${rifaId})" 
                                            style="background: #ff6b6b; color: white; border: none; border-radius: 6px; padding: 4px 8px; font-size: 0.7rem; cursor: pointer; opacity: 0.8;" 
                                            title="Eliminar todos los números de ${participant.name}">
                                        🗑️ Eliminar todos
                                    </button>
                                </div>
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
    currentRifa = rifa; // FASE 4.1: Guardar rifa actual para toggleColorMode()
    const isCompleted = rifa.status === 'completed';
    const winnerNumber = rifa.winner ? rifa.winner.number : null;

    // FEAT FASE 15W-PLUS: Información del creador
    const creatorName = rifa.creator_username || rifa.creator_name || 'Usuario Anónimo';
    const creatorDisplay = creatorName.charAt(0).toUpperCase() + creatorName.slice(1);

    // FASE 7: Formatear fecha programada si existe
    let scheduledDateHtml = '';
    if (rifa.scheduled_draw_date && !isCompleted) {
        const scheduledDate = new Date(rifa.scheduled_draw_date);
        const now = new Date();
        const isPast = scheduledDate <= now;

        const dateStr = scheduledDate.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const timeStr = scheduledDate.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        scheduledDateHtml = `
            <div style="margin: 15px 0; padding: 12px 15px; background: ${isPast ? '#ffebee' : '#e3f2fd'}; border-left: 4px solid ${isPast ? '#f44336' : '#2196F3'}; border-radius: 8px;">
                <p style="margin: 0; color: ${isPast ? '#c62828' : '#1565c0'}; font-weight: 600; font-size: 0.95rem;">
                    📅 Sorteo programado: ${dateStr} a las ${timeStr}
                    ${isPast ? '<br><small style="font-size: 0.85rem;">(La fecha ya pasó - se sorteará automáticamente)</small>' : ''}
                </p>
            </div>
        `;
    } else if (!rifa.scheduled_draw_date && !isCompleted) {
        scheduledDateHtml = `
            <div style="margin: 15px 0; padding: 10px 15px; background: #f5f5f5; border-left: 4px solid #9e9e9e; border-radius: 8px;">
                <p style="margin: 0; color: #666; font-size: 0.9rem;">
                    ⏰ Sin fecha programada - Sorteo manual
                </p>
            </div>
        `;
    }

    // FASE 7: Mensaje del propietario si existe
    let ownerMessageHtml = '';
    if (rifa.owner_message) {
        ownerMessageHtml = `
            <div style="margin: 15px 0; padding: 12px 15px; background: #fff3e0; border-left: 4px solid #ff9800; border-radius: 8px;">
                <p style="margin: 0 0 5px 0; color: #e65100; font-weight: 600; font-size: 0.85rem;">
                    💬 Mensaje del organizador:
                </p>
                <p style="margin: 0; color: #555; font-size: 0.95rem; font-style: italic;">
                    "${rifa.owner_message}"
                </p>
            </div>
        `;
    }

    document.getElementById('mainContainer').innerHTML = `
        <!-- FASE 3.2c: Título prominente con nuevas clases CSS -->
        <div class="rifa-title-section">
            <h1 class="rifa-title-main">
                <span class="rifa-title-emoji">🎯</span>
                ${rifa.title}
            </h1>
            <p class="rifa-description-text">Simulación privada - Acceso por código: ${accessCode}</p>

            <!-- FEAT FASE 15W-PLUS: Badge del creador visible -->
            <div style="background: linear-gradient(45deg, #667eea, #764ba2); color: white; padding: 12px 20px; border-radius: 25px; display: inline-block; margin: 15px 0; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                <span style="font-size: 1rem; font-weight: 600;">
                    👤 Creada por: <strong>${creatorDisplay}</strong>
                </span>
            </div>

            ${scheduledDateHtml}
            ${ownerMessageHtml}

            ${isCompleted ? `<p class="winner-banner">
                🏆 ¡SIMULACIÓN COMPLETADA! Ganador: Número ${winnerNumber} (${rifa.winner.participant_name})
            </p>` : ''}

            <!-- FASE 8: Imagen del premio (banner) -->
            ${rifa.image_url ? `
                <div class="prize-image-container-header" style="margin: 20px 0;">
                    <img src="${rifa.image_url}" alt="${rifa.title}" class="prize-image-header">
                </div>
            ` : ''}
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
                <!-- FASE 4.1: Toggle para modo de colores (también en vista por código) -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                    <h3 style="margin: 0;">🎯 Números de la Simulación</h3>
                    <div class="color-mode-toggle-container">
                        <span class="color-mode-label">Visualización:</span>
                        <div class="color-mode-toggle">
                            <button
                                class="color-mode-btn ${colorMode === 'simple' ? 'active' : ''}"
                                onclick="toggleColorMode('simple')"
                                title="Modo simple: 2 colores (ocupado/disponible)">
                                2 colores
                            </button>
                            <button
                                class="color-mode-btn ${colorMode === 'multi' ? 'active' : ''}"
                                onclick="toggleColorMode('multi')"
                                title="Modo multi-color: color único por participante">
                                ${Object.keys(userColorMap).length || 12} colores
                            </button>
                        </div>
                    </div>
                </div>

                <div class="controls">
                    <button class="btn btn-secondary" onclick="selectRandomNumberForCode()" ${isCompleted ? 'disabled' : ''} style="${isCompleted ? 'opacity: 0.5; cursor: not-allowed; background: #ccc;' : ''}">
                        🎯 Elegir al Azar
                    </button>
                    <button class="btn btn-primary" onclick="clearCodeSelection()" ${isCompleted ? 'disabled' : ''} style="${isCompleted ? 'opacity: 0.5; cursor: not-allowed; background: #ccc;' : ''}">
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
            <h3 class="cart-title">Información</h3>
            </div>
            
                <!-- FASE 3.2e: Título prominente en panel derecho -->
                <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 10px; padding: 15px; margin-bottom: 20px; border-left: 4px solid #667eea; text-align: center;">
                    <h3 style="color: #333; margin: 0 0 8px 0; font-size: 1.3rem; font-weight: bold;">
                    🎯 ${rifa.title}
                </h3>
                <p style="color: #666; margin: 0; font-style: italic; font-size: 0.9rem;">
                        ${rifa.description}
                    </p>
                </div>

                <!-- FASE 8: Imagen del premio en panel lateral -->
                ${rifa.image_url ? `
                    <div class="prize-image-container" style="margin-bottom: 20px;">
                        <img src="${rifa.image_url}" alt="${rifa.title}" class="prize-image" onclick="openLightbox('${rifa.image_url}')" style="cursor: zoom-in;" title="Click para ampliar">
                    </div>
                ` : ''}
            
                ${isCompleted ? `
                <div class="winner-panel">
                    <h4 class="winner-panel-title">🏆 ¡GANADOR!</h4>
                    <div class="winner-panel-number">${String(winnerNumber).padStart(2, '0')}</div>
                    <p class="winner-panel-name">${rifa.winner.participant_name}</p>
                </div>
                ` : ''}

                ${scheduledDateHtml}
                ${ownerMessageHtml}

                <div class="cart-header" style="margin-top: 20px;">
                    <span class="cart-icon">📋</span>
                    <h3 class="cart-title">${isCompleted ? 'Resultado Final' : 'Números Seleccionados'}</h3>
                    <div class="cart-count" id="cartCount">0</div>
                </div>
                
                <div class="cart-items" id="cartItems">
                    <div class="empty-cart">
                        No has seleccionado números aún
                    </div>
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

    // Lanzar confetis si la rifa está completada
    if (isCompleted) {
        setTimeout(() => launchConfetti(), 300);
    }

    // FASE 7: Polling para detectar sorteo automático
    // Solo si hay fecha programada y la rifa está activa
    if (rifa.scheduled_draw_date && !isCompleted) {
        console.log('🔄 [FASE 7] Iniciando polling para detectar sorteo automático');

        // Limpiar polling anterior si existe
        if (window.rifaStatusPolling) {
            clearInterval(window.rifaStatusPolling);
        }

        // Verificar status cada 30 segundos
        window.rifaStatusPolling = setInterval(async () => {
            try {
                const response = await fetch(`${API_BASE}/rifas/access/${accessCode}`);
                if (response.ok) {
                    const data = await response.json();

                    // Si el status cambió a completed, recargar la vista
                    if (data.rifa && data.rifa.status === 'completed') {
                        console.log('🎊 [FASE 7] Sorteo detectado! Recargando vista...');
                        clearInterval(window.rifaStatusPolling);

                        // Recargar vista automáticamente
                        viewRifaByCode(data.rifa, accessCode);
                    }
                }
            } catch (error) {
                console.error('❌ [FASE 7] Error en polling:', error);
            }
        }, 30000); // Cada 30 segundos
    }
}

// ========== FASE 4: SISTEMA DE COLORES ÚNICOS POR PARTICIPANTE ==========

/**
 * FASE 4: Asigna un color único a cada participante
 * Utiliza un sistema de 12 colores rotativos para diferenciar usuarios
 * @param {string} participantName - Nombre del participante
 * @returns {number} - Número del color (1-12) para usar en CSS
 */
function assignUserColor(participantName) {
    // Si ya tiene color asignado, devolverlo
    if (userColorMap[participantName]) {
        return userColorMap[participantName];
    }
    
    // Obtener todos los colores ya asignados
    const usedColors = Object.values(userColorMap);
    
    // Buscar el primer color disponible (1-12)
    for (let i = 1; i <= 12; i++) {
        if (!usedColors.includes(i)) {
            userColorMap[participantName] = i;
            console.log(`🎨 [FASE 4] Usuario "${participantName}" asignado color ${i}`);
            return i;
        }
    }
    
    // Si todos los colores están usados, usar rotativo
    const colorNumber = (Object.keys(userColorMap).length % 12) + 1;
    userColorMap[participantName] = colorNumber;
    console.log(`🎨 [FASE 4] Usuario "${participantName}" asignado color rotativo ${colorNumber}`);
    return colorNumber;
}

/**
 * FASE 4: Obtiene el color asignado de un participante
 * @param {string} participantName - Nombre del participante
 * @returns {number|null} - Número de color asignado o null si no tiene
 */
function getUserColor(participantName) {
    return userColorMap[participantName] || null;
}

/**
 * FASE 4: Resetea el mapa de colores de usuarios
 * Se llama al cargar una nueva rifa para empezar con colores frescos
 */
function resetUserColors() {
    const previousCount = Object.keys(userColorMap).length;
    userColorMap = {};
    if (previousCount > 0) {
        console.log(`🔄 [FASE 4] Mapa de colores reseteado (${previousCount} usuarios)`);
    }
}

// ========== FASE 4.1: TOGGLE DE MODOS DE COLOR ==========

/**
 * FASE 4.1: Cambia entre modo simple (2 colores) y modo multi-color (12 colores)
 *
 * @param {string} mode - 'simple' o 'multi'
 *
 * Funcionalidad:
 * - Modo 'simple': Todos los números ocupados usan la misma clase 'sold' (gris)
 * - Modo 'multi': Cada participante tiene un color único (user-color-1 a user-color-12)
 *
 * Educativo:
 * Esta función es un ejemplo de cómo manejar diferentes modos de visualización
 * sin recargar la página. Usa manipulación del DOM para actualizar los estilos
 * de los botones del toggle y regenera la grilla con el nuevo modo.
 *
 * Proceso:
 * 1. Actualiza la variable global colorMode
 * 2. Actualiza las clases CSS de los botones del toggle (active/inactive)
 * 3. Regenera la grilla de números con el nuevo modo de color
 */
function toggleColorMode(mode) {
    // Validar que el modo sea válido
    if (mode !== 'simple' && mode !== 'multi') {
        console.error('❌ [FASE 4.1] Modo inválido:', mode);
        return;
    }

    // Actualizar variable global
    colorMode = mode;
    console.log(`🎨 [FASE 4.1] Modo de color cambiado a: ${mode}`);

    // Actualizar clases active de los botones del toggle
    // Buscamos todos los botones del toggle en el documento
    const buttons = document.querySelectorAll('.color-mode-btn');
    buttons.forEach(btn => {
        // Obtenemos el onclick del botón para saber qué modo representa
        const btnMode = btn.getAttribute('onclick').includes("'simple'") ? 'simple' : 'multi';

        // Agregar o quitar clase 'active' según corresponda
        if (btnMode === mode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Regenerar la grilla con el nuevo modo
    // currentRifa es una variable global que contiene la rifa actual
    if (currentRifa) {
        generateRifaGrid(currentRifa);
    }
}

// ========== FASE 2: TIMESTAMPS Y TOOLTIPS ==========

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

// FASE 2 + FASE 4: Generar grid con tooltips de timestamps y colores por usuario
async function generateRifaGrid(rifa) {
    const grid = document.getElementById('numbersGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const isCompleted = rifa.status === 'completed';
    const winnerNumber = rifa.winner ? rifa.winner.number : null;
    
    // FASE 4: Resetear colores para nueva rifa
    resetUserColors();
    
    // FASE 2: Cargar números con timestamps
    await loadNumbersWithTimestamps(rifa.id);
    
    // FASE 2 + FASE 4: Crear mapas de números con tooltips y participantes
    const tooltipMap = {};
    const participantMap = {}; // FASE 4: Mapa número -> participante
    numbersWithTooltips.forEach(numData => {
        tooltipMap[numData.number] = numData.tooltip;
        participantMap[numData.number] = numData.participant_name; // FASE 4: Guardar participante
    });
    
    console.log(`🎨 [FASE 4] Procesando ${Object.keys(participantMap).length} números con participantes`);
    
    for (let i = 0; i <= 99; i++) {
        const cell = document.createElement('div');
        const isSelected = rifa.sold_numbers && rifa.sold_numbers.includes(i);
        const isWinner = winnerNumber === i;
        
        cell.textContent = i.toString().padStart(2, '0');
        cell.id = `number-${i}`;
        
        if (isWinner) {
            cell.className = 'number-cell winner';
        } else if (isSelected) {
            // FASE 4.1: Respetar modo de color seleccionado
            const participantName = participantMap[i];

            if (colorMode === 'simple') {
                // Modo simple: todos los números ocupados usan la clase 'sold' (gris)
                cell.className = 'number-cell sold';
                console.log(`🎨 [FASE 4.1] Número ${i} -> modo SIMPLE (sold)`);
            } else {
                // Modo multi: asignar color único por participante (FASE 4)
                if (participantName) {
                    const colorNumber = assignUserColor(participantName);
                    cell.className = `number-cell user-color-${colorNumber}`;
                    console.log(`🎨 [FASE 4.1] Número ${i} -> ${participantName} -> color-${colorNumber} (modo MULTI)`);
                } else {
                    // Fallback a sold si no hay participante identificado
                    cell.className = 'number-cell sold';
                    console.warn(`⚠️ [FASE 4.1] Número ${i} sin participante identificado, usando 'sold'`);
                }
            }
            
            // FASE 2: Agregar tooltip con timestamp para números ocupados
            if (tooltipMap[i]) {
                cell.title = tooltipMap[i];
                cell.setAttribute('data-tooltip', tooltipMap[i]);
                
                // Agregar event listeners para tooltip custom
                cell.addEventListener('mouseenter', showTooltip);
                cell.addEventListener('mouseleave', hideTooltip);
                
                console.log(`✅ [FASE 2] Tooltip agregado al número ${i}: ${tooltipMap[i]}`);
            }
            
            // FASE 3: Agregar botón X para eliminar número desde la grilla
            // Solo mostrar para el propietario (cuando estamos en viewRifa, no en viewRifaByCode)
            if (currentUser && rifa.user_id && currentUser.id === rifa.user_id) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'grid-number-delete';
                deleteBtn.innerHTML = '×';
                deleteBtn.title = `Eliminar número ${i.toString().padStart(2, '0')}`;
                deleteBtn.onclick = function(e) {
                    e.stopPropagation();
                    // FASE 3.1a: Pasar el evento para posicionar el modal inteligentemente
                    removeNumberFromGrid(rifa.id, i, e);
                };
                cell.appendChild(deleteBtn);
                
                console.log(`✅ [FASE 3] Botón X agregado al número ${i}`);
            }
        } else {
            cell.className = 'number-cell';
            if (!isCompleted) {
                cell.onclick = () => toggleNumberForCode(i);
            }
        }
        
        grid.appendChild(cell);
    }
    
    console.log(`🎯 [FASE 4] Grid generado con ${Object.keys(tooltipMap).length} tooltips y ${Object.keys(userColorMap).length} usuarios con colores únicos`);
    
    // FASE 4: Mostrar mapa de colores en consola para debug
    if (Object.keys(userColorMap).length > 0) {
        console.log('🎨 [FASE 4] Mapa de colores de usuarios:', userColorMap);
    }
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

// ========== FASE 1 + FASE 3: VISTA COMPLETA DE RIFA CON GESTIÓN ==========

// FASE 1: Cargar lista de participantes para vista administrativa
async function loadParticipants(rifaId) {
    try {
        console.log(`📋 [FASE 1] Cargando participantes para rifa ${rifaId}`);
        
        const response = await fetch(`${API_BASE}/rifas/${rifaId}/participants`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ [FASE 1] ${data.participants.length} participantes cargados`);
            return data; // Devolver el objeto completo con participants, total_participants, etc.
        } else {
            console.warn('⚠️ [FASE 1] Error cargando participantes');
            return { participants: [], total_participants: 0, total_numbers_sold: 0 };
        }
    } catch (error) {
        console.error('❌ [FASE 1] Error:', error);
        return { participants: [], total_participants: 0, total_numbers_sold: 0 };
    }
}

// FASE 1 + FASE 3: Función principal para ver detalles de rifa con gestión
async function viewRifa(rifaId) {
    console.log(`🔍 [VIEW RIFA] Iniciando vista de rifa ${rifaId}`);
    
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
    
    // Mostrar loading
    document.getElementById('mainContainer').innerHTML = `
        <div class="loading">
            <p>🔄 Cargando detalles de la simulación...</p>
        </div>
    `;
    
    try {
        // Obtener datos de la rifa
        const response = await fetch(`${API_BASE}/rifas/my/${rifaId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        if (!data.rifa) {
            throw new Error('Datos de simulación no encontrados');
        }
        
        const rifa = data.rifa;
        currentRifa = rifa; // FASE 4.1: Guardar rifa actual para toggleColorMode()
        const isCompleted = rifa.status === 'completed';
        const winnerNumber = rifa.winner ? rifa.winner.number : null;
        const progressPercent = Math.round((rifa.numbers_sold / 100) * 100);

        console.log(`✅ [VIEW RIFA] Procesando: "${rifa.title}" (Status: ${rifa.status})`);
        
        // FASE 1: Cargar participantes
        const participantsData = await loadParticipants(rifaId);
        const participants = participantsData.participants || [];
        
        // Generar HTML de participantes con botones de eliminación
        let participantsHtml = '';
        if (participants.length > 0) {
            participantsHtml = `
                <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #4caf50;">
                    <h4 style="color: #333; margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
                        👥 Lista de Participantes 
                        <span style="background: #4caf50; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem;">${participants.length}</span>
                        <button class="btn-small" onclick="loadParticipants(${rifaId}).then(p => viewRifa(${rifaId}))" 
                                style="background: #2196f3; color: white; margin-left: auto;" title="Actualizar lista">
                            🔄 Actualizar
                        </button>
                    </h4>
                    <div style="max-height: 300px; overflow-y: auto;">`;
            
            participants.forEach(participant => {
                const numbersText = participant.numbers.map(n => n.toString().padStart(2, '0')).join(', ');
                participantsHtml += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: white; border-radius: 6px; margin: 8px 0; border: 1px solid #ddd;">
                        <div>
                            <strong style="color: #333;">${participant.participant_name}</strong>
                            <div style="font-size: 0.85rem; color: #666; margin-top: 2px;">
                                📅 ${new Date(participant.first_participation).toLocaleString('es-AR')} • ${participant.total_numbers} número${participant.total_numbers > 1 ? 's' : ''}
                            </div>
                            <div style="font-size: 0.9rem; color: #4caf50; margin-top: 4px; font-family: monospace;">
                                [${numbersText}]
                            </div>
                        </div>
                        <div style="display: flex; gap: 5px; flex-direction: column;">
                            <button class="btn-small" 
                                    onclick="removeAllUserNumbers('${participant.participant_name}', ${rifaId})" 
                                    style="background: #ff6b6b; color: white; font-size: 0.75rem; padding: 4px 8px;" 
                                    title="Eliminar todos los números de ${participant.participant_name}">
                                🗑️ Todos
                            </button>
                        </div>
                    </div>`;
            });
            
            participantsHtml += `
                    </div>
                </div>`;
        } else {
            participantsHtml = `
                <div style="margin-top: 20px; padding: 20px; background: #fff3cd; border-radius: 8px; text-align: center;">
                    <p style="color: #856404; margin: 0;">👥 Aún no hay participantes en esta simulación</p>
                </div>`;
        }
        
        // Renderizar vista completa
        document.getElementById('mainContainer').innerHTML = `
            <!-- FASE 3.2c: Título prominente con nuevas clases CSS -->
            <div class="rifa-title-section">
                <h1 class="rifa-title-main">
                    <span class="rifa-title-emoji">🎯</span>
                    ${rifa.title}
                </h1>
                <p class="rifa-description-text">${rifa.description}</p>
                ${isCompleted ? `<p class="winner-banner">
                    🏆 ¡SIMULACIÓN COMPLETADA! Ganador: Número ${winnerNumber} (${rifa.winner ? rifa.winner.participant_name : 'N/A'})
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
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                        <h3 style="margin: 0;">🎯 Números de la Simulación</h3>

                        <!-- FASE 4.1: Toggle para modo de colores -->
                        <div class="color-mode-toggle-container">
                            <span class="color-mode-label">Visualización:</span>
                            <div class="color-mode-toggle">
                                <button
                                    class="color-mode-btn ${colorMode === 'simple' ? 'active' : ''}"
                                    onclick="toggleColorMode('simple')"
                                    title="Modo simple: 2 colores (ocupado/disponible)">
                                    2 colores
                                </button>
                                <button
                                    class="color-mode-btn ${colorMode === 'multi' ? 'active' : ''}"
                                    onclick="toggleColorMode('multi')"
                                    title="Modo multi-color: color único por participante">
                                    ${Object.keys(userColorMap).length || 12} colores
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="numbers-grid" id="numbersGrid">
                        <!-- Se genera con generateRifaGrid() -->
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        <h4 style="color: #333; margin-bottom: 10px;">📊 Estadísticas</h4>
                        <p style="margin: 5px 0;">• Números ocupados: ${rifa.numbers_sold}/100</p>
                        <p style="margin: 5px 0;">• Progreso: ${progressPercent}%</p>
                        <p style="margin: 5px 0;">• Código de acceso: ${rifa.access_code || 'No disponible'}</p>
                    </div>
                    
                    ${participantsHtml}
                </div>
                
                <div class="cart-section">
                    <div class="cart-header">
                        <span class="cart-icon">🎯</span>
                        <h3 class="cart-title">${isCompleted ? 'Resultado Final' : 'Información'}</h3>
                    </div>
                    
                    <!-- FASE 3.2c: Título prominente PRINCIPAL en el panel derecho -->
                    <div class="rifa-title-section">
                        <h3 class="rifa-title-main">
                            <span class="rifa-title-emoji">🎯</span>
                            ${rifa.title}
                        </h3>
                        <p class="rifa-description-text">${rifa.description}</p>
                    </div>
                    
                    ${isCompleted ? `
                    <div class="winner-panel">
                        <h4 class="winner-panel-title">🏆 ¡GANADOR!</h4>
                        <div class="winner-panel-number">${String(winnerNumber).padStart(2, '0')}</div>
                        <p class="winner-panel-name">${rifa.winner ? rifa.winner.participant_name : 'N/A'}</p>
                    </div>` : ''}
                    
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
                    </button>
                    <button class="btn btn-primary" style="width: 100%;" onclick="editRifa(${rifaId})">
                        ✏️ Editar Simulación
                    </button>` : `
                    <div style="text-align: center; padding: 15px; background: #e8f5e8; border-radius: 8px; margin-bottom: 10px;">
                        <p style="color: #2e7d32; font-weight: bold; margin: 0;">✓ Sorteo Completado</p>
                    </div>`}
                </div>
            </div>
        `;
        
        // FASE 2 + FASE 3: Generar grid con tooltips y botones X
        await generateRifaGrid(rifa);
        
        console.log('✅ [VIEW RIFA] Vista cargada exitosamente con FASE 1 + FASE 2 + FASE 3');
        
    } catch (error) {
        console.error('❌ [ERROR] Error en viewRifa:', error);
        
        document.getElementById('mainContainer').innerHTML = `
            <div style="background: white; border-radius: 15px; padding: 30px; text-align: center; margin: 20px 0;">
                <div style="font-size: 3rem; margin-bottom: 20px;">❌</div>
                <h3 style="color: #333; margin-bottom: 15px;">Error Cargando Simulación</h3>
                <p style="color: #666; margin-bottom: 20px;">${error.message}</p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button class="btn btn-primary" onclick="viewRifa(${rifaId})">🔄 Reintentar</button>
                    <button class="btn btn-secondary" onclick="navigateTo('perfil')">← Volver</button>
                </div>
            </div>
        `;

        showNotification(error.message, 'error');
    }
}

// ========== FUNCIONES PARA MODAL DE NOMBRE DEL PARTICIPANTE ==========

let participantNameCallback = null;

// Función para mostrar el modal y pedir el nombre
function showParticipantNameModal() {
    return new Promise((resolve, reject) => {
        participantNameCallback = { resolve, reject };
        document.getElementById('participantNameInput').value = '';
        document.getElementById('participantNameModal').style.display = 'flex';

        // Focus en el input después de un pequeño delay para asegurar que el modal esté visible
        setTimeout(() => {
            document.getElementById('participantNameInput').focus();
        }, 100);
    });
}

// Función para cerrar el modal
function closeParticipantNameModal() {
    document.getElementById('participantNameModal').style.display = 'none';
    if (participantNameCallback) {
        participantNameCallback.reject(new Error('Cancelado por el usuario'));
        participantNameCallback = null;
    }
}

// Handler del formulario de nombre del participante
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('participantNameForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('participantNameInput').value.trim();

            if (!name) {
                showNotification('Por favor ingresa tu nombre', 'error');
                return;
            }

            document.getElementById('participantNameModal').style.display = 'none';

            if (participantNameCallback) {
                participantNameCallback.resolve(name);
                participantNameCallback = null;
            }
        });
    }
});

// ========================================
// FASE 8: GESTIÓN DE IMÁGENES
// ========================================

// Variable global para la URL final de la imagen
let currentImageUrl = null;
let editImageUrl = null;

/**
 * Cambiar método de entrada de imagen (URL o Upload) - Crear
 */
function switchImageMethod(method) {
    const urlBtn = document.getElementById('urlMethodBtn');
    const uploadBtn = document.getElementById('uploadMethodBtn');
    const urlContainer = document.getElementById('urlInputContainer');
    const uploadContainer = document.getElementById('uploadInputContainer');

    if (method === 'url') {
        urlBtn.classList.add('active');
        uploadBtn.classList.remove('active');
        urlContainer.style.display = 'block';
        uploadContainer.style.display = 'none';

        // Limpiar input de archivo
        document.getElementById('rifaImageFile').value = '';
    } else {
        uploadBtn.classList.add('active');
        urlBtn.classList.remove('active');
        uploadContainer.style.display = 'block';
        urlContainer.style.display = 'none';

        // Limpiar input de URL
        document.getElementById('rifaImageUrl').value = '';
    }
}

/**
 * Cambiar método de entrada de imagen (URL o Upload) - Editar
 */
function switchImageMethodEdit(method) {
    const urlBtn = document.getElementById('editUrlMethodBtn');
    const uploadBtn = document.getElementById('editUploadMethodBtn');
    const urlContainer = document.getElementById('editUrlInputContainer');
    const uploadContainer = document.getElementById('editUploadInputContainer');

    if (method === 'url') {
        urlBtn.classList.add('active');
        uploadBtn.classList.remove('active');
        urlContainer.style.display = 'block';
        uploadContainer.style.display = 'none';

        // Limpiar input de archivo
        document.getElementById('editRifaImageFile').value = '';
    } else {
        uploadBtn.classList.add('active');
        urlBtn.classList.remove('active');
        uploadContainer.style.display = 'block';
        urlContainer.style.display = 'none';

        // Limpiar input de URL
        document.getElementById('editRifaImageUrl').value = '';
    }
}

/**
 * Mostrar preview de imagen desde URL
 */
function showImagePreview(imageUrl, isEdit = false) {
    const previewId = isEdit ? 'editImagePreview' : 'imagePreview';
    const imgId = isEdit ? 'editPreviewImage' : 'previewImage';

    const preview = document.getElementById(previewId);
    const img = document.getElementById(imgId);

    img.src = imageUrl;
    preview.style.display = 'block';

    if (isEdit) {
        editImageUrl = imageUrl;
    } else {
        currentImageUrl = imageUrl;
    }
}

/**
 * Remover preview de imagen - Crear
 */
function removeImagePreview() {
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('previewImage').src = '';
    document.getElementById('rifaImageUrl').value = '';
    document.getElementById('rifaImageFile').value = '';
    currentImageUrl = null;
}

/**
 * Remover preview de imagen - Editar
 */
function removeImagePreviewEdit() {
    document.getElementById('editImagePreview').style.display = 'none';
    document.getElementById('editPreviewImage').src = '';
    document.getElementById('editRifaImageUrl').value = '';
    document.getElementById('editRifaImageFile').value = '';
    editImageUrl = null;
}

/**
 * Subir imagen a Cloudinary
 */
async function uploadImageToCloudinary(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(`${API_BASE}/upload/image`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            return data.imageUrl;
        } else {
            throw new Error(data.message || 'Error al subir la imagen');
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

/**
 * Obtener URL final de la imagen (desde URL o archivo)
 */
async function getFinalImageUrl(isEdit = false) {
    const urlInput = isEdit ?
        document.getElementById('editRifaImageUrl').value.trim() :
        document.getElementById('rifaImageUrl').value.trim();
    const fileInput = isEdit ?
        document.getElementById('editRifaImageFile') :
        document.getElementById('rifaImageFile');

    // Si hay URL, usarla
    if (urlInput) {
        return urlInput;
    }

    // Si hay archivo, subirlo
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];

        // Validar tamaño (5MB máximo)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('La imagen no puede superar los 5MB', 'error');
            return null;
        }

        try {
            showNotification('Subiendo imagen...', 'info');
            const imageUrl = await uploadImageToCloudinary(file);
            showNotification('Imagen subida exitosamente', 'success');
            return imageUrl;
        } catch (error) {
            showNotification(error.message, 'error');
            return null;
        }
    }

    // No hay imagen
    return null;
}

// Event listeners para preview en tiempo real
document.addEventListener('DOMContentLoaded', function() {
    // Preview de URL - Crear
    const urlInput = document.getElementById('rifaImageUrl');
    if (urlInput) {
        urlInput.addEventListener('blur', function() {
            const url = this.value.trim();
            if (url) {
                showImagePreview(url, false);
            }
        });
    }

    // Preview de archivo - Crear
    const fileInput = document.getElementById('rifaImageFile');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    showImagePreview(e.target.result, false);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Preview de URL - Editar
    const editUrlInput = document.getElementById('editRifaImageUrl');
    if (editUrlInput) {
        editUrlInput.addEventListener('blur', function() {
            const url = this.value.trim();
            if (url) {
                showImagePreview(url, true);
            }
        });
    }

    // Preview de archivo - Editar
    const editFileInput = document.getElementById('editRifaImageFile');
    if (editFileInput) {
        editFileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    showImagePreview(e.target.result, true);
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

// ========== FASE 8: LIGHTBOX PARA AMPLIAR IMÁGENES ==========

/**
 * Abrir modal lightbox para ampliar imagen
 * @param {string} imageSrc - URL de la imagen a ampliar
 */
function openLightbox(imageSrc) {
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImage = document.getElementById('lightboxImage');

    if (lightbox && lightboxImage) {
        lightboxImage.src = imageSrc;
        lightbox.style.display = 'flex';

        // Prevenir scroll del body cuando el lightbox está abierto
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Cerrar modal lightbox
 */
function closeLightbox() {
    const lightbox = document.getElementById('imageLightbox');

    if (lightbox) {
        lightbox.style.display = 'none';

        // Restaurar scroll del body
        document.body.style.overflow = 'auto';
    }
}

// Cerrar lightbox con tecla ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeLightbox();
    }
});

// ========== FASE 8: MODO DE SORTEO MANUAL/AUTOMÁTICO ==========

/**
 * Mostrar/ocultar contenedor de modo de sorteo en modal crear
 */
function toggleSorteoModeVisibility() {
    const dateInput = document.getElementById('rifaScheduledDate');
    const modeContainer = document.getElementById('sorteoModeContainer');

    if (dateInput && modeContainer) {
        if (dateInput.value) {
            modeContainer.style.display = 'block';
        } else {
            modeContainer.style.display = 'none';
        }
    }
}

/**
 * Mostrar/ocultar contenedor de modo de sorteo en modal editar
 */
function toggleSorteoModeVisibilityEdit() {
    const dateInput = document.getElementById('editRifaScheduledDate');
    const modeContainer = document.getElementById('editSorteoModeContainer');

    if (dateInput && modeContainer) {
        if (dateInput.value) {
            modeContainer.style.display = 'block';
        } else {
            modeContainer.style.display = 'none';
        }
    }
}

/**
 * Actualizar descripción del modo de sorteo - Crear
 */
function updateSorteoModeDescription() {
    const selectedMode = document.querySelector('input[name="sorteoMode"]:checked');
    const description = document.getElementById('sorteoModeDescription');

    if (selectedMode && description) {
        if (selectedMode.value === 'automatico') {
            description.textContent = 'El sorteo se realizará automáticamente en la fecha programada.';
        } else {
            description.textContent = 'Deberás realizar el sorteo manualmente. Los participantes no podrán elegir números después de la fecha.';
        }
    }
}

/**
 * Actualizar descripción del modo de sorteo - Editar
 */
function updateSorteoModeDescriptionEdit() {
    const selectedMode = document.querySelector('input[name="editSorteoMode"]:checked');
    const description = document.getElementById('editSorteoModeDescription');

    if (selectedMode && description) {
        if (selectedMode.value === 'automatico') {
            description.textContent = 'El sorteo se realizará automáticamente en la fecha programada.';
        } else {
            description.textContent = 'Deberás realizar el sorteo manualmente. Los participantes no podrán elegir números después de la fecha.';
        }
    }
}
