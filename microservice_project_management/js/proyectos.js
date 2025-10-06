// Lógica de gestión de proyectos

// Generar siguiente ID
function generarSiguienteId() {
    const proyectos = obtenerProyectos();
    if (proyectos.length === 0) return 1;
    return Math.max(...proyectos.map(p => p.proyecto_id)) + 1;
}

// Crear proyecto
function crearProyecto(datos) {
    const proyectos = obtenerProyectos();
    
    const nuevoProyecto = {
        ...datos,
        proyecto_id: generarSiguienteId(),
        es_activo: true,
        fecha_creacion: new Date().toISOString(),
        usuario_creacion_id: 1 // Usuario demo
    };
    
    proyectos.push(nuevoProyecto);
    guardarProyectos(proyectos);
    
    return nuevoProyecto;
}

// Validar fechas
function validarFechas(fechaInicio, fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    if (inicio > fin) {
        throw new Error('La fecha de inicio no puede ser mayor que la fecha de finalización');
    }
    
    return true;
}

// Validar valores monetarios
function validarValores(valorProyecto, aporteEntidad, aporteUniversidad) {
    if (valorProyecto <= 0) {
        throw new Error('El valor del proyecto debe ser mayor a 0');
    }
    
    if (aporteEntidad < 0 || aporteUniversidad < 0) {
        throw new Error('Los aportes no pueden ser negativos');
    }
    
    if ((aporteEntidad + aporteUniversidad) > valorProyecto) {
        throw new Error('La suma de aportes no puede exceder el valor total del proyecto');
    }
    
    return true;
}