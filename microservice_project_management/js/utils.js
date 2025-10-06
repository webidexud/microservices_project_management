// Funciones utilitarias

// Formatear moneda colombiana
function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(valor);
}

// Formatear fecha
function formatearFecha(fecha) {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Obtener proyectos del localStorage
function obtenerProyectos() {
    const proyectos = localStorage.getItem(CONFIG.STORAGE_KEY);
    return proyectos ? JSON.parse(proyectos) : [];
}

// Guardar proyectos en localStorage
function guardarProyectos(proyectos) {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(proyectos));
}

// Obtener un proyecto por ID
function obtenerProyectoPorId(id) {
    const proyectos = obtenerProyectos();
    return proyectos.find(p => p.proyecto_id == id);
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.textContent = mensaje;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${tipo === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 2000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}