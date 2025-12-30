// utils/statusMessages.js

const statusConfig = {
  incompleto: {
    variant: 'secondary',
    label: 1,
    email: {
      subject: '📋 Contrato Incompleto',
      message: 'está incompleto y requiere más información para continuar con el proceso.'
    },
    telegram: {
      emoji: '❓',
      message: 'está INCOMPLETO y requiere más información'
    }
  },
  firmando_abogado: {
    variant: 'outline', 
    label: 2,
    email: {
      subject: '📝 Firma por Abogado',
      message: 'está en proceso de firma por el abogado. Por favor revisa y firma el documento.'
    },
    telegram: {
      emoji: '📝👨‍💼',
      message: 'está en proceso de FIRMA POR EL ABOGADO'
    }
  },
  firmando_cliente: {
    variant: 'secondary',
    label: 3, 
    email: {
      subject: '📝 Firma por Cliente',
      message: 'está en proceso de firma por el cliente. Esperando la firma del cliente para continuar.'
    },
    telegram: {
      emoji: '📝👤',
      message: 'está en proceso de FIRMA POR EL CLIENTE'
    }
  },
  firmando_director: {
    variant: 'outline',
    label: 4,
    email: {
      subject: '📝 Firma por Director',
      message: 'está en proceso de firma por el director. Última etapa de firma.'
    },
    telegram: {
      emoji: '📝👔',
      message: 'está en proceso de FIRMA POR EL DIRECTOR'
    }
  },
  activa: {
    variant: 'default',
    label: 5,
    email: {
      subject: '✅ Contrato Activado',
      message: 'ha sido ACTIVADO exitosamente. El contrato está ahora en ejecución.'
    },
    telegram: {
      emoji: '✅',
      message: 'ha sido ACTIVADO 🎉'
    }
  },
  suspendida: {
    variant: 'destructive',
    label: 6, 
    email: {
      subject: '⏸️ Contrato Suspendido',
      message: 'ha sido SUSPENDIDO temporalmente. Se requiere revisión.'
    },
    telegram: {
      emoji: '⏸️',
      message: 'ha sido SUSPENDIDO ⚠️'
    }
  },
  cancelada: {
    variant: 'destructive',
    label: 7,
    email: {
      subject: '❌ Contrato Cancelado',
      message: 'ha sido CANCELADO. El proceso ha finalizado.'
    },
    telegram: {
      emoji: '❌',
      message: 'ha sido CANCELADO 🛑'
    }
  }
};

module.exports = statusConfig;