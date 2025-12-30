// utils/fillWordTemplate.js
const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

/**
 * Llena la plantilla Word con los datos del contrato
 * @param {Object} contract - Datos del contrato
 * @returns {Buffer} Buffer del documento Word generado
 */
const fillContractTemplate = async (contract) => {
  try {
    const templatePath = path.join(__dirname, '../media/templates/derivada/Derivada.docx');

    if (!fs.existsSync(templatePath)) {
      throw new Error('Plantilla Word no encontrada');
    }

    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    const templateData = {
      // ---------------------------------------------------------
      // 🟦 DATOS BÁSICOS DEL CONTRATO
      // ---------------------------------------------------------
      numbercontract: contract.CB_id || "N/A",
      projectname: contract.CB_project_name || "N/A",
      contracttypename: contract.CB_contract_type_name || "N/A",
      paymentmethodname: contract.CB_payment_method_name || "N/A",
      value: formatCurrency(contract.CB_value),
      valueLetter: formatCurrencyLetter(contract.CB_value),
      startdate: formatDate(contract.CB_start_date),
      enddate: formatDate(contract.CB_end_date),
      totalduration: contract.CB_total_duration || "N/A",
      issuedate: formatDate(contract.CB_issue_date),
      signaturecidate: formatDate(contract.CB_signature_ci_date),
      creationday: formatDate(contract.CB_creation_day),
      executionlocation: contract.CB_execution_location || "N/A",
      email: contract.CB_email || "N/A",
      statuslabel: getStatusLabel(contract.CB_status_type_name),

      // ---------------------------------------------------------
      // 🟩 CDPs (Array → Lista formateada)
      // ---------------------------------------------------------
      cdps: normalizeArray(contract.CDP).map(c => ({
        cdpnumber: c.CDP_number || "N/A",
        cdpdate: formatDate(c.CDP_date),
      })),

      cdps_text:
        normalizeArray(contract.CDP)
          .map(c => `CDP No. ${c.CDP_number} de fecha ${formatDate(c.CDP_date)}`)
          .join(", ") || "N/A",


      // ---------------------------------------------------------
      // 🟨 OTROSÍ (Array formateado)
      // ---------------------------------------------------------
      // otrosi: normalizeArray(contract.otrosi).map(o => ({
      //   value: formatCurrency(o.value),
      //   date: formatDate(o.date),
      //   description: o.description || "",
      // })),

      // ---------------------------------------------------------
      // 🟥 AMPAROS
      // ---------------------------------------------------------
      // amparos: normalizeArray(contract.amparos).map(a => ({
      //   amparoid: a.amparo_id,
      //   valor: formatCurrency(a.valor),
      // })),

      // ---------------------------------------------------------
      // 🟧 DATOS DEL SERVICIO COMERCIAL
      // ---------------------------------------------------------
      // agreement: contract.agreement || "N/A",
      // supplierjustification: contract.supplier_justification || "N/A",

      // ---------------------------------------------------------
      // 🟦 DATOS DEL PROVEEDOR
      // ---------------------------------------------------------
      // suppliername: contract.supplier_name || "N/A",
      // email_supplier: contract.email_supplier || "N/A",
      // phone_supplier: contract.phone_supplier || "N/A",
      // type_identification_id_supplier: contract.type_identification_id_supplier || "N/A",
      // number_identification_id_supplier: contract.number_identification_id_supplier || "N/A",

      // ---------------------------------------------------------
      // 🟪 REPRESENTANTE LEGAL
      // ---------------------------------------------------------
      // legalrepresentativeoption: contract.legal_representative || "N/A",
      // legalrepresentativename: contract.legal_representative_name || "N/A",
      // legalrepresentativeemail: contract.legal_representative_email || "N/A",
      // legalrepresentativephone: contract.legal_representative_phone || "N/A",
      // legalrepresentativeidnumber: contract.legal_representative_id_number || "N/A",
      // type_identification_id: contract.type_identification_id || "N/A",

      // ---------------------------------------------------------
      // 🟫 CONTRATO DERIVADO
      // ---------------------------------------------------------
      contractingentity: contract.CD_contracting_entity || "N/A",
      ciaobject: contract.CD_cia_object || "N/A",
      contractpurpose: contract.CD_contract_purpose || "N/A",

      // Obligaciones y entregables vienen como arrays
      specificobligations: normalizeArray(contract.CD_specific_obligations).join(", ") || "N/A",

      deliverables: normalizeArray(contract.CD_deliverables).join(", ") || "N/A",
      // ---------------------------------------------------------
      // 🎓 NIVEL EDUCATIVO
      // ---------------------------------------------------------
      educationlevelname: contract.CD_education_level_name || "N/A",

      // signed_abog: getSignedStatus(contract.signed_abog, `
      //   Fecha de firma: ${formatDate(contract.signed_abog_date)}\n
      //   Huella digital: ${contract.hash_signed_abog}
      //   `),
      // signed_leader: getSignedStatus(contract.signed_leader, `
      //   Fecha de firma: ${formatDate(contract.signed_leader_date)}\n
      //   Huella digital: ${contract.hash_signed_leader}
      //   `),
      // signed_client: getSignedStatus(contract.signed_client, `
      //   Fecha de firma: ${formatDate(contract.signed_client_date)}\n
      //   Huella digital: ${contract.hash_signed_client}
      //   `),
      // signed_boss: getSignedStatus(contract.signed_boss, `
      //   Fecha de firma: ${formatDate(contract.signed_boss_date)}\n
      //   Huella digital: ${contract.hash_signed_boss}
      //   `),


    };

    doc.render(templateData);

    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    console.log('✅ Documento generado exitosamente');
    return buf;

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
};

const formatCurrencyLetter = (amount) => {
  if (!amount) return 'N/A';

  // Formateo básico sin currencyDisplay
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  // Convertir a letras si es necesario
  const numberInWords = convertNumberToWords(amount);

  return `${formatted} (${numberInWords} pesos)`;
};

/**
 * Convierte números a palabras en español
 */
const convertNumberToWords = (number) => {
  if (!number || isNaN(number)) return "cero";

  const unidades = [
    "", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"
  ];

  const decenas = [
    "", "diez", "veinte", "treinta", "cuarenta", "cincuenta",
    "sesenta", "setenta", "ochenta", "noventa"
  ];

  const especiales = {
    11: "once", 12: "doce", 13: "trece", 14: "catorce", 15: "quince",
    16: "dieciséis", 17: "diecisiete", 18: "dieciocho", 19: "diecinueve",
    21: "veintiuno", 22: "veintidós", 23: "veintitrés", 24: "veinticuatro",
    25: "veinticinco", 26: "veintiséis", 27: "veintisiete", 28: "veintiocho", 29: "veintinueve"
  };

  // Para números enteros simples
  const num = Math.round(number);

  if (num === 0) return "cero";
  if (num < 10) return unidades[num];
  if (especiales[num]) return especiales[num];

  if (num < 100) {
    const decena = Math.floor(num / 10);
    const unidad = num % 10;

    if (unidad === 0) {
      return decenas[decena];
    } else {
      return `${decenas[decena]} y ${unidades[unidad]}`;
    }
  }

  // Para números grandes, devolvemos una versión simplificada
  if (num < 1000) {
    const centena = Math.floor(num / 100);
    const resto = num % 100;

    let centenaTexto = centena === 1 ? "ciento" : `${unidades[centena]}cientos`;

    if (resto === 0) return centenaTexto;
    return `${centenaTexto} ${convertNumberToWords(resto)}`;
  }

  // Para números más grandes
  if (num < 1000000) {
    const millar = Math.floor(num / 1000);
    const resto = num % 1000;

    let millarTexto = millar === 1 ? "mil" : `${convertNumberToWords(millar)} mil`;

    if (resto === 0) return millarTexto;
    return `${millarTexto} ${convertNumberToWords(resto)}`;
  }

  // Devolver el número en formato normal si es muy grande
  return number.toString();
};

/**
 * Calcula el valor total (contrato + otrosí)
 */
const calculateTotalValue = (contract) => {
  let total = contract.value || 0;

  if (contract.otrosi && contract.otrosi.length > 0) {
    contract.otrosi.forEach(otro => {
      total += (otro.value || 0);
    });
  }

  return total;
};

/**
 * Convierte booleanos de firma a texto legible
 */
const getSignedStatus = (signedValue, message) => {
  if (signedValue === true) {
    return message;
  } else if (signedValue === false) {
    return "Sin firma digital";
  } else {
    return signedValue || "no firmado"; // Para valores null/undefined/string
  }
};

/**
 * Formatea currency
 */
const formatCurrency = (amount) => {
  if (!amount) return 'N/A';
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  } catch (error) {
    // Fallback simple
    return `$${parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
  }
};

/**
 * Formatea fecha
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }

    // Formatear con día, mes y año
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    return 'Fecha inválida';
  }
};

/**
 * Obtiene el label del estado
 */
const getStatusLabel = (status) => {
  const statusLabels = {
    'incompleto': 'Incompleto',
    'firmando_abogado': 'Firmando por Abogado',
    'firmando_cliente': 'Firmando por Cliente',
    'firmando_director': 'Firmando por Director',
    'activa': 'Activa',
    'suspendida': 'Suspendida',
    'cancelada': 'Cancelada'
  };
  return statusLabels[status] || status;
};

const normalizeArray = (value) => {
  if (!value) return [];

  // Si ya es arreglo, perfecto
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    let str = value.trim();

    // 1. Si viene como JSON array → ["A","B"]
    if (str.startsWith("[") && str.endsWith("]")) {
      try {
        return JSON.parse(str);
      } catch (e) {
        // Si falla el parse, continuar con otros métodos
      }
    }

    // 2. Si viene en formato PostgreSQL → {A,B} o {"A","B"}
    if (str.startsWith("{") && str.endsWith("}")) {
      str = str.substring(1, str.length - 1); // remover {}
      return str
        .split(",")
        .map((x) => x.replace(/^"|"$/g, "").trim()) // quitar comillas de inicio y fin
        .filter((x) => x.length > 0);
    }

    // 3. Si viene como string raro con llaves escapadas → "{\"A\",\"B\"}"
    if (str.includes("{") || str.includes("}")) {
      str = str.replace(/\\{/g, "{").replace(/\\}/g, "}");
      str = str.replace(/[{}]/g, "");
      return str
        .split(",")
        .map((x) => x.replace(/"/g, "").trim())
        .filter((x) => x.length > 0);
    }

    // 4. Separar por comas si hay múltiples valores
    if (str.includes(",")) {
      return str.split(",")
        .map(x => x.trim())
        .filter(x => x.length > 0);
    }

    // 5. Último recurso
    return [str];
  }

  return [String(value)];
};

module.exports = { fillContractTemplate };