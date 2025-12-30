// controllers/documentController.js
const { fillContractTemplate } = require('../utils/fillWordTemplates');
const conexion = require('../db/conexion');
const path = require("path");
const fs = require('fs');
const { listContractsDerivativeById } = require('../services/contractDerivativeService');

/**
 * Genera y descarga el documento Word basado en la plantilla
 */
const downloadContractWord = async (req, res) => {
  const client = await conexion.connect();
  try {

    const { id } = req.params;
    const contract = await listContractsDerivativeById(client, id);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrato no encontrado'
      });
    }
    // Llenar la plantilla con los datos del contrato
    const buffer = await fillContractTemplate(contract);

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=contrato-${contract.CD_id}.docx`);
    res.setHeader('Content-Length', buffer.length);

    // Enviar el archivo
    res.send(buffer);

  } catch (error) {
    console.error('❌ Error generando documento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el documento: ' + error.message
    });
  } finally {
    client.release();
  }
};

module.exports = { downloadContractWord };