// Funciones para gestión de modificaciones de proyectos

const STORAGE_MODIFICACIONES = 'modificaciones_proyecto';

// Obtener todas las modificaciones de un proyecto
function obtenerModificaciones(proyectoId) {
    const modificaciones = localStorage.getItem(STORAGE_MODIFICACIONES);
    const todasModificaciones = modificaciones ? JSON.parse(modificaciones) : {};
    return todasModificaciones[proyectoId] || [];
}

// Guardar una nueva modificación
function guardarModificacion(proyectoId, modificacion) {
    const modificaciones = localStorage.getItem(STORAGE_MODIFICACIONES);
    const todasModificaciones = modificaciones ? JSON.parse(modificaciones) : {};
    
    if (!todasModificaciones[proyectoId]) {
        todasModificaciones[proyectoId] = [];
    }
    
    modificacion.modificacion_id = Date.now();
    modificacion.fecha_registro = new Date().toISOString();
    
    todasModificaciones[proyectoId].push(modificacion);
    localStorage.setItem(STORAGE_MODIFICACIONES, JSON.stringify(todasModificaciones));
    
    return modificacion;
}

// Calcular totales con modificaciones
function calcularTotalesConModificaciones(proyectoId, valorInicial, fechaFinInicial) {
    const modificaciones = obtenerModificaciones(proyectoId);
    
    let valorTotal = parseFloat(valorInicial) || 0;
    let fechaFinActual = new Date(fechaFinInicial);
    let totalAdiciones = 0;
    let diasProrrogaTotal = 0;

    modificaciones.forEach(mod => {
        // Sumar adiciones
        if (mod.tipo === 'ADICION' || mod.tipo === 'ADICION_PRORROGA') {
            const valorAdicion = parseFloat(mod.valor_adicion) || 0;
            valorTotal += valorAdicion;
            totalAdiciones += valorAdicion;
        }
        
        // Sumar prórrogas
        if (mod.tipo === 'PRORROGA' || mod.tipo === 'ADICION_PRORROGA') {
            const diasProrroga = parseInt(mod.dias_prorroga) || 0;
            fechaFinActual.setDate(fechaFinActual.getDate() + diasProrroga);
            diasProrrogaTotal += diasProrroga;
        }
    });

    return {
        valorTotal,
        totalAdiciones,
        diasProrrogaTotal,
        fechaFinActual: fechaFinActual.toISOString().split('T')[0],
        numeroModificaciones: modificaciones.length
    };
}

// Validar modificación
function validarModificacion(tipo, valorAdicion, diasProrroga) {
    if (tipo === 'ADICION' || tipo === 'ADICION_PRORROGA') {
        if (!valorAdicion || parseFloat(valorAdicion) <= 0) {
            throw new Error('El valor de la adición debe ser mayor a 0');
        }
    }
    
    if (tipo === 'PRORROGA' || tipo === 'ADICION_PRORROGA') {
        if (!diasProrroga || parseInt(diasProrroga) <= 0) {
            throw new Error('Los días de prórroga deben ser mayores a 0');
        }
    }
    
    return true;
}