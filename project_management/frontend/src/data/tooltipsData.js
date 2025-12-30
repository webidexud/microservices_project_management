// ============================================================================
// TEXTOS DE AYUDA PARA TOOLTIPS
// Ubicación: frontend/src/data/tooltipsData.js
// ============================================================================

export const projectTooltips = {
  
  // ========== INFORMACIÓN GENERAL ==========
  anio_proyecto: {
    title: "Año del Proyecto",
    description: "Año en que se inicia o registra el proyecto en el sistema. Este año se utiliza para organizar, buscar y clasificar los proyectos. Debe estar dentro del rango permitido por la institución.",
    example: "2024, 2025"
  },

  numero_proyecto_externo: {
    title: "Número Proyecto Externo",
    description: "Número o código asignado por la entidad contratante o externa al proyecto. Este campo es opcional y sirve para vincular el proyecto con sistemas externos como convocatorias, BPIN, o códigos de la entidad.",
    example: "CONV-2024-001, BPIN-2024-0123, SGR-456"
  },

  nombre_proyecto: {
    title: "Nombre del Proyecto",
    description: "Nombre completo y descriptivo del proyecto. Debe ser claro, conciso y permitir identificar fácilmente el alcance y propósito del proyecto. Este nombre aparecerá en reportes, listados y documentos oficiales.",
    example: "Fortalecimiento de la infraestructura tecnológica para investigación en inteligencia artificial"
  },

  objeto_proyecto: {
    title: "Objeto del Proyecto",
    description: "Descripción detallada del objetivo, alcance y propósito del proyecto. Explique qué se va a hacer, cómo se va a lograr y cuál es el beneficio esperado. Este campo es fundamental para documentar el proyecto.",
    example: "Implementar una plataforma de análisis de datos utilizando inteligencia artificial para mejorar la toma de decisiones en investigación científica, mediante la adquisición de servidores GPU y capacitación del personal investigador."
  },

  entidad_id: {
    title: "Entidad",
    description: "Entidad o institución externa con la que se ejecuta el proyecto. Puede ser una empresa privada, entidad pública, organismo internacional o cualquier otra organización que participe como contraparte en el proyecto.",
    example: "Ministerio de Ciencia y Tecnología, Colciencias, Empresa XYZ S.A."
  },

  dependencia_ejecutora_id: {
    title: "Dependencia Ejecutora",
    description: "Dependencia o facultad de la universidad que será responsable de ejecutar y administrar el proyecto. Esta dependencia debe tener la capacidad técnica y administrativa para llevar a cabo las actividades del proyecto.",
    example: "Facultad de Ingeniería, Instituto de Investigación, Vicerrectoría de Investigación"
  },

  estado_proyecto_id: {
    title: "Estado del Proyecto",
    description: "Estado actual en el que se encuentra el proyecto dentro de su ciclo de vida. Este estado permite hacer seguimiento al avance y cumplimiento de las etapas del proyecto.",
    example: "En ejecución, Por iniciar, Finalizado, Suspendido"
  },

  // ========== INFORMACIÓN ADMINISTRATIVA ==========
  tipo_proyecto_id: {
    title: "Tipo de Proyecto",
    description: "Clasificación del proyecto según su naturaleza y alcance. Esta clasificación ayuda a organizar, reportar y analizar los proyectos según categorías institucionales establecidas.",
    example: "Investigación, Extensión, Consultoría, Prestación de servicios"
  },

  tipo_financiacion_id: {
    title: "Tipo de Financiación",
    description: "Fuente o mecanismo de financiación del proyecto. Indica de dónde provienen los recursos económicos y cómo están distribuidos entre las partes.",
    example: "Convocatoria externa, Recursos propios, Cofinanciación, Regalías"
  },

  modalidad_ejecucion_id: {
    title: "Modalidad de Ejecución",
    description: "Forma en que se ejecutará el proyecto desde el punto de vista administrativo y contractual. Define las responsabilidades y el esquema de trabajo entre las partes.",
    example: "Administración delegada, Ejecución directa, Convenio interadministrativo"
  },

  codigo_contable: {
    title: "Código Contable",
    description: "Código o número de cuenta utilizado en el sistema contable de la universidad para registrar y hacer seguimiento financiero del proyecto. Este código permite la trazabilidad contable y presupuestal.",
    example: "3-1-2-01-001, CC-2024-456"
  },

  // ========== INFORMACIÓN FINANCIERA ==========
  valor_proyecto: {
    title: "Valor Total del Proyecto",
    description: "Valor total en pesos colombianos del proyecto. Este monto incluye todos los aportes (universidad, entidad y otros). Ingrese solo números, el sistema agregará los separadores de miles automáticamente.",
    example: "50000000 (Cincuenta millones de pesos)"
  },

  porcentaje_beneficio: {
    title: "Porcentaje de Beneficio Institucional",
    description: "Porcentaje del valor total del proyecto que corresponde al beneficio o utilidad institucional. Este porcentaje está establecido por las políticas de la universidad y generalmente es del 12%. El sistema calcula automáticamente el valor en pesos.",
    example: "12 (equivale al 12% del valor total)"
  },

  valor_beneficio: {
    title: "Valor del Beneficio Institucional",
    description: "Valor en pesos del beneficio institucional, calculado automáticamente como el porcentaje de beneficio multiplicado por el valor total del proyecto. Este campo es de solo lectura.",
    example: "6000000 (12% de 50 millones)"
  },

  aporte_universidad: {
    title: "Aporte de la Universidad",
    description: "Monto en pesos que la universidad aporta al proyecto. Puede incluir recursos económicos directos, recursos en especie (equipos, infraestructura), personal o contrapartida. Ingrese solo números.",
    example: "20000000 (Veinte millones de pesos)"
  },

  aporte_entidad: {
    title: "Aporte de la Entidad",
    description: "Monto en pesos que aporta la entidad externa al proyecto. Este valor se calcula automáticamente restando el aporte de la universidad al valor total del proyecto. Es un campo de solo lectura.",
    example: "30000000 (diferencia entre valor total y aporte universidad)"
  },

  // ========== FECHAS Y TEMPORALIDAD ==========
  fecha_suscripcion: {
    title: "Fecha de Suscripción",
    description: "Fecha en que se firmó o suscribió el contrato, convenio o acuerdo del proyecto. Esta fecha marca el inicio formal del compromiso entre las partes.",
    example: "15/01/2024"
  },

  fecha_inicio: {
    title: "Fecha de Inicio",
    description: "Fecha en que inicia la ejecución de las actividades del proyecto. A partir de esta fecha se cuenta el plazo de ejecución. Debe ser igual o posterior a la fecha de suscripción.",
    example: "01/02/2024"
  },

  fecha_finalizacion: {
    title: "Fecha de Finalización",
    description: "Fecha en que termina el plazo de ejecución del proyecto. Debe ser posterior a la fecha de inicio. El sistema calcula automáticamente la duración en años, meses y días.",
    example: "31/12/2024 (11 meses de duración)"
  },

  // ========== ACTA DE CONSEJO ==========
  session_type: {
    title: "Tipo de Sesión del Consejo",
    description: "Tipo de sesión del consejo directivo o comité que aprobó el proyecto. Las sesiones ordinarias son las programadas regularmente, mientras que las extraordinarias se convocan para asuntos urgentes o específicos.",
    example: "Ordinaria, Extraordinaria"
  },

  minutes_date: {
    title: "Fecha del Acta",
    description: "Fecha en que se realizó la sesión del consejo o comité que aprobó el proyecto. Esta fecha debe corresponder al acta donde consta la aprobación formal del proyecto.",
    example: "10/12/2023"
  },

  minutes_number: {
    title: "Número del Acta",
    description: "Número consecutivo del acta de la sesión del consejo o comité que aprobó el proyecto. Este número permite identificar y consultar el documento oficial de aprobación.",
    example: "Acta No. 015-2023, 015/2023"
  },

  // ========== CORREOS Y CONTACTO ==========
  correo_principal: {
    title: "Correo Electrónico Principal",
    description: "Correo electrónico principal del responsable o director del proyecto. A este correo llegarán las notificaciones importantes del sistema y comunicaciones oficiales relacionadas con el proyecto.",
    example: "director.proyecto@udistrital.edu.co"
  },

  correos_secundarios: {
    title: "Correos Electrónicos Secundarios",
    description: "Correos electrónicos adicionales de personas que deben recibir notificaciones sobre el proyecto. Puede agregar múltiples correos de coinvestigadores, colaboradores o administrativos que participan en el proyecto.",
    example: "coinvestigador@udistrital.edu.co, asistente@udistrital.edu.co"
  },

  funcionario_ordenador_id: {
    title: "Funcionario Ordenador del Gasto",
    description: "Funcionario de la universidad que tiene la facultad legal para ordenar y autorizar los gastos del proyecto. Esta persona es responsable de aprobar las transacciones financieras y verificar el cumplimiento presupuestal.",
    example: "Vicerrector de Investigación, Decano de Facultad"
  },

  // ========== COMPLEMENTARIA ==========
  cantidad_beneficiarios: {
    title: "Cantidad de Beneficiarios",
    description: "Número estimado de personas que se beneficiarán directa o indirectamente del proyecto. Incluya estudiantes, docentes, investigadores, comunidad externa o cualquier grupo poblacional impactado.",
    example: "150 (estudiantes de pregrado), 500 (habitantes de la comunidad)"
  },

  acto_administrativo: {
    title: "Acto Administrativo",
    description: "Número de la resolución, acuerdo u otro acto administrativo mediante el cual se formalizó o legalizó el proyecto. Este documento tiene valor legal y permite la ejecución oficial del proyecto.",
    example: "Resolución 123 de 2024, Acuerdo 045-2024"
  },

  enlace_secop: {
    title: "Enlace SECOP",
    description: "URL del proceso publicado en el Sistema Electrónico de Contratación Pública (SECOP). Si el proyecto está asociado a un proceso de contratación pública, ingrese aquí el enlace completo para consulta y transparencia.",
    example: "https://www.colombiacompra.gov.co/proceso/CF-001-2024"
  },

  observaciones: {
    title: "Observaciones Generales",
    description: "Campo de texto libre para registrar información adicional, aclaraciones, notas importantes o cualquier detalle relevante que no esté contemplado en los demás campos del formulario.",
    example: "El proyecto requiere importación de equipos especializados. Coordinación con oficina de comercio exterior."
  },

  // ========== CÓDIGOS RUP ==========
  codigos_rup: {
    title: "Códigos RUP (Clasificador de Bienes y Servicios)",
    description: "Códigos del Registro Único de Proponentes que clasifican los bienes y/o servicios que serán adquiridos o prestados en el proyecto. Seleccione uno o varios códigos según las actividades del proyecto. Puede marcar un código como principal.",
    example: "80101500 - Servicios de investigación, 81111500 - Servicios de consultoría en ingeniería"
  },

  observaciones_rup: {
    title: "Observaciones sobre Códigos RUP",
    description: "Información adicional sobre la selección de códigos RUP, justificación de los códigos elegidos o aclaraciones sobre cómo se aplicarán en el proyecto.",
    example: "Se seleccionaron 3 códigos porque el proyecto combina investigación, desarrollo de software y capacitación."
  }
}

// ========== TOOLTIPS PARA MODIFICACIONES ==========
export const modificationTooltips = {
  modification_type: {
    title: "Tipo de Modificación",
    description: "Seleccione el tipo de modificación que desea aplicar al proyecto. Cada tipo tiene requisitos y campos específicos que deben diligenciarse según la naturaleza del cambio.",
    example: "Adición (incremento de valor), Prórroga (extensión de plazo), Suspensión"
  },

  justification: {
    title: "Justificación de la Modificación",
    description: "Explique de manera clara y detallada las razones que motivan la modificación del proyecto. Incluya causas, circunstancias y beneficios esperados. Esta justificación debe ser sólida y fundamentada.",
    example: "Se requiere adición presupuestal debido a la necesidad de adquirir equipos adicionales no contemplados inicialmente, que son indispensables para cumplir los objetivos del proyecto según nueva normativa vigente."
  },

  addition_value: {
    title: "Valor de la Adición",
    description: "Monto en pesos colombianos que se adicionará al valor original del proyecto. Este valor incrementa el presupuesto total disponible para la ejecución del proyecto.",
    example: "15000000 (Quince millones de pesos)"
  },

  cdp: {
    title: "Certificado de Disponibilidad Presupuestal (CDP)",
    description: "Número del Certificado de Disponibilidad Presupuestal que respalda la adición. El CDP garantiza que existen recursos disponibles en el presupuesto para la modificación solicitada.",
    example: "CDP-2024-001234, 001234-2024"
  },

  cdp_value: {
    title: "Valor del CDP",
    description: "Monto en pesos del Certificado de Disponibilidad Presupuestal. Este valor debe ser igual o mayor al valor de la adición solicitada.",
    example: "15000000 (debe ser >= valor de adición)"
  },

  extension_days: {
    title: "Días de Prórroga",
    description: "Número de días calendario que se extenderá el plazo de ejecución del proyecto. El sistema calculará automáticamente la nueva fecha de finalización sumando estos días a la fecha actual de terminación.",
    example: "90 (tres meses), 180 (seis meses)"
  },

  new_end_date: {
    title: "Nueva Fecha de Finalización",
    description: "Nueva fecha en que finalizará el proyecto después de aplicar la prórroga. Esta fecha se calcula automáticamente al ingresar los días de extensión, o puede especificarla manualmente.",
    example: "30/06/2025"
  },

  suspension_start_date: {
    title: "Fecha de Inicio de Suspensión",
    description: "Fecha en que inicia el período de suspensión del proyecto. A partir de esta fecha se detienen las actividades y el conteo del plazo de ejecución.",
    example: "15/03/2024"
  },

  suspension_reason: {
    title: "Motivo de la Suspensión",
    description: "Explique detalladamente las razones que justifican la suspensión temporal del proyecto. Incluya causas, situación actual y plan de acción para el reinicio.",
    example: "Suspensión temporal por caso fortuito - emergencia sanitaria que impide el desarrollo normal de actividades presenciales requeridas para la ejecución."
  }
}

// ========== TOOLTIPS PARA CATÁLOGOS ==========
export const catalogTooltips = {
  entity_name: {
    title: "Nombre de la Entidad",
    description: "Nombre oficial completo de la entidad, empresa u organización. Utilice la razón social exacta como aparece en documentos legales.",
    example: "Ministerio de Ciencia, Tecnología e Innovación, Empresa Colombiana de Petróleos S.A."
  },

  tax_id: {
    title: "NIT (Número de Identificación Tributaria)",
    description: "Número de identificación tributaria de la entidad sin puntos ni guiones. Incluya el dígito de verificación separado por guion.",
    example: "830000001-2, 9001234567-3"
  },

  entity_type: {
    title: "Tipo de Entidad",
    description: "Clasificación de la entidad según su naturaleza jurídica y sector. Esta clasificación ayuda en la organización y análisis de proyectos.",
    example: "Pública, Privada, Mixta, ONG, Organismo Internacional"
  },

  contact_name: {
    title: "Nombre del Contacto",
    description: "Nombre completo de la persona responsable o punto de contacto en la entidad para asuntos relacionados con proyectos.",
    example: "María Fernanda González Pérez"
  },

  contact_email: {
    title: "Correo del Contacto",
    description: "Dirección de correo electrónico del contacto principal en la entidad. Verifique que sea correcta para garantizar comunicación efectiva.",
    example: "contacto@entidad.gov.co"
  }
}