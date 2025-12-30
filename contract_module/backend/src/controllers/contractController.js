const conexion = require('../db/conexion');
const { decisionSend } = require('../utils/send');
// const statusConfig = require('../utils/statusMessages');

const path = require('path');
const fs = require('fs');
const _ = require('lodash');

const crypto = require('crypto');

const { createContractBase, updateContractBase, listContractsBase } = require('../services/contractBaseService');
const { createCdp, updateCdp } = require('../services/cdpService');
const { createContractDerivative, updateContractDerivative } = require('../services/contractDerivativeService');

// const { listContractsBaseById } = require('../services/contractBaseService');

const { listContractsDerivativeById } = require('../services/contractDerivativeService');
const { createBaseAddition } = require('../services/baseAdditionService');
const { createAddition: createAdditionService } = require('../services/additionService');
const { createExtension } = require('../services/extensionService');
const { createModification } = require('../services/modificationService');
const { createScope } = require('../services/scopeService');
const { createSuspension } = require('../services/suspensionService');
const { createRestart } = require('../services/restartService');
const { createAssignment } = require('../services/assignmentService');
const { createBilateralSettlement } = require('../services/bilateralSettlementService');
const { createUnilateralLiquidation } = require('../services/unilateralLiquidationService');
const { createSigned } = require('../services/signedService');


exports.createAddition = async (req, res) => {
  const client = await conexion.connect();

  try {
    await client.query("BEGIN");

    const body = req.body;

    const id = req.params.id;

    const baseAdditionData = Object.fromEntries(
      Object.entries(body).filter(([key]) => key.startsWith("BA_"))
    );

    // console.log(baseAdditionData)


    const baseAddition = await createBaseAddition(client, baseAdditionData, id);

    const additionType = baseAdditionData.BA_addition_type_id;


    switch (String(additionType)) {
      case "1": // Prórroga
        const extensionData = Object.fromEntries(Object.entries(body).filter(([key]) => key.startsWith("EX_")));
        await createExtension(client, extensionData, baseAddition.id);
        break;
      case "2": // Adición
        const additionData = Object.fromEntries(Object.entries(body).filter(([key]) => key.startsWith("AD_")));
        await createAdditionService(client, additionData, baseAddition.id);
        break;
      case "3": // Modificación
        const modificationData = Object.fromEntries(Object.entries(body).filter(([key]) => key.startsWith("MO_")));
        await createModification(client, modificationData, baseAddition.id);
        break;
      case "4": // Alcance
        const scopeData = Object.fromEntries(Object.entries(body).filter(([key]) => key.startsWith("SC_")));
        await createScope(client, scopeData, baseAddition.id);
        break;
      case "5": // Suspensión
        const suspensionData = Object.fromEntries(Object.entries(body).filter(([key]) => key.startsWith("SP_")));
        await createSuspension(client, suspensionData, baseAddition.id);
        break;
      case "6": // Reinicio
        const restartData = Object.fromEntries(Object.entries(body).filter(([key]) => key.startsWith("RE_")));
        await createRestart(client, restartData, baseAddition.id);
        break;
      case "7": // Cesión
        const assignmentData = Object.fromEntries(Object.entries(body).filter(([key]) => key.startsWith("AS_")));
        await createAssignment(client, assignmentData, baseAddition.id);
        break;
      case "8": // Liquidación Bilateral
        const bilateralSettlementData = Object.fromEntries(Object.entries(body).filter(([key]) => key.startsWith("BS_")));
        await createBilateralSettlement(client, bilateralSettlementData, baseAddition.id);
        break;
      case "9": // Liquidación Unilateral
        const unilateralLiquidationData = Object.fromEntries(Object.entries(body).filter(([key]) => key.startsWith("UL_")));
        await createUnilateralLiquidation(client, unilateralLiquidationData, baseAddition.id);
        break;
      default:
        break;
    }







    await client.query("COMMIT");
    return res.status(200).json({ message: "Adición creada correctamente" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error en createAddition:", error);
    return res.status(500).json({ message: 'Error loading Contract model', error: error.message });
  } finally {
    client.release();
  }

};

exports.getContracts = async (req, res) => {

  const client = await conexion.connect();

  try {
    const contracts = await listContractsBase(client);
    return res.status(200).json({ contracts: contracts });
  } catch (error) {
    return res.status(500).json({ message: 'Error loading Contract model', error: error.message });
  } finally {
    client.release();
  }
};

exports.getCatalogsTables = async (req, res) => {
  try {
    const client = await conexion.connect();
    const Contract_type = await client.query('SELECT * FROM Contract_type;');
    const education_level = await client.query('SELECT * FROM Education_level;');
    const type_identification = await client.query('SELECT * FROM type_identification;');
    const payment_method = await client.query('SELECT * FROM payment_method;');
    const amparos = await client.query('SELECT * FROM amparo;');
    const status_type = await client.query('SELECT * FROM status_type');
    const addition_type = await client.query('SELECT * FROM addition_type');
    client.release();
    return res.status(200).json({
      catalogs: {
        Contract_type: Contract_type.rows,
        education_level: education_level.rows,
        type_identification: type_identification.rows,
        payment_method: payment_method.rows,
        amparos: amparos.rows,
        status_type: status_type.rows,
        addition_type: addition_type.rows,
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Error loading Catalogs Tables', error: err.message });
  }
};

exports.getSuppliers = async (req, res) => {
  try {
    const client = await conexion.connect();
    const result = await client.query('SELECT * FROM supplier;');
    client.release();
    return res.status(200).json({ suppliers: result.rows });
  } catch (err) {
    return res.status(500).json({ message: 'Error loading Suppliers', error: err.message });
  }
};

exports.createContract = async (req, res) => {
  const client = await conexion.connect();
  try {
    await client.query("BEGIN");


    const contractBaseData = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => key.startsWith("CB_"))
    );

    const contractDerivativeData = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => key.startsWith("CD_"))
    );

    const body = req.body;

    const contractBase = await createContractBase(client, contractBaseData);
    const contractDerivative = await createContractDerivative(client, contractDerivativeData, contractBase.id);

    const cdps = body.CDP;
    for (const cdp of cdps) {
      const hasNumber = cdp.CDP_number && cdp.CDP_number.trim() !== "";
      const hasDate = cdp.CDP_date && cdp.CDP_date.trim() !== "";

      if (hasNumber && hasDate) {
        const cdpCreated = await createCdp(client, cdp, contractBase.id);
      }
    };

    await client.query("COMMIT");

    return res.status(200).json({ message: "Contract created successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error en createContract:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor", error });
  } finally {
    client.release();
  }
};


exports.getContractById = async (req, res) => {
  const client = await conexion.connect();

  try {
    const { id } = req.params;
    const type = await client.query(`SELECT contract_type_id FROM contract_base WHERE id = $1`, [id]);
    let result;
    if (type.rows[0].contract_type_id === 1) {
      result = await listContractsDerivativeById(client, id);
    }
    return res.status(200).json({ contract: result });
  } catch (error) {
    return res.status(500).json({ message: 'Error actualizando los datos', error: error.message });
  } finally {
    client.release();
  }
};

exports.updateContract = async (req, res) => {
  const client = await conexion.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const body = req.body;

    // Aquí iría el código para actualizar el contrato, similar al createContract pero con UPDATEs

    console.log(body);

    const contractBaseData = Object.fromEntries(
      Object.entries(body).filter(([key]) => key.startsWith("CB_"))
    );

    const contractDerivativeData = Object.fromEntries(
      Object.entries(body).filter(([key]) => key.startsWith("CD_"))
    );

    const contractBase = await updateContractBase(client, contractBaseData);
    const contractDerivative = await updateContractDerivative(client, contractDerivativeData, contractBase.id);

    const cdps = body.CDP;
    for (const cdp of cdps) {
      const hasNumber = cdp.CDP_number && String(cdp.CDP_number).trim() !== "";
      const hasDate = cdp.CDP_date && String(cdp.CDP_date).trim() !== "";

      if (hasNumber && hasDate) {
        const cdpCreated = await updateCdp(client, cdp, contractBase.id);
      }
    };



    await client.query("COMMIT");

    return res.status(200).json({ message: "Contrato actualizado correctamente" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error en updateContract:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor", error });
  } finally {
    client.release();
  }
};


exports.changeStatus = async (req, res) => {

  const client = await conexion.connect()

  try {
    const { id, status } = req.params;

    console.log(id, status);

    switch (status) {
      case "incompleto":
        await client.query("UPDATE contract_base SET status_type_id = $1 WHERE id=$2", [1, id])
        break;
      case "firmando_abogado":
        await client.query("UPDATE contract_base SET status_type_id = $1 WHERE id=$2", [2, id])
        break;
      case "firmando_cliente":
        await client.query("UPDATE contract_base SET status_type_id = $1 WHERE id=$2", [3, id])
        break;
      case "firmando_lider":
        await client.query("UPDATE contract_base SET status_type_id = $1 WHERE id=$2", [4, id])
        break;
      case "firmando_director":
        await client.query("UPDATE contract_base SET status_type_id = $1 WHERE id=$2", [5, id])
        break;
      case "activa":
        await client.query("UPDATE contract_base SET status_type_id = $1 WHERE id=$2", [6, id])
        break;
      case "suspendida":
        await client.query("UPDATE contract_base SET status_type_id = $1 WHERE id=$2", [7, id])
        break;
      case "cancelada":
        await client.query("UPDATE contract_base SET status_type_id = $1 WHERE id=$2", [8, id])
        break;
      default:
        console.log("Default");
        break;
    }
    return res.status(200).json({ message: "Estado actualizado correctamente" });
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json({ message: 'Error actualizando los datos', error: error.message });
  } finally {
    client.release();
  }
};


exports.signed = async (req, res) => {

  const client = await conexion.connect()

  try {
    const { id, status } = req.params;

    await client.query("BEGIN");

    const date = new Date().toISOString().slice(0, 10);

    console.log("Id", id);
    console.log("Status", status);
    // ('incompleto'),
    // ('firmando Abogado Designado'),
    // ('firmando Contratista'),
    // ('firmando Lider de Area'),
    // ('firmando Ordenador del Gasto'),
    // ('firmando Cesionado'),
    // ('activa'),
    // ('suspendida'),
    // ('cancelada');



    // const signed = createSignature(client, id);

    switch (status) {
      case "1":
        await client.query("UPDATE contract_base SET status_type_id = $1 WHERE id=$2", [2, id])
        break;
      case "2":
        await createSigned(client, id, status);
        await client.query("UPDATE contract_base SET status_type_id = $1 WHERE id=$2", [3, id])
        break;
      case "3":
        await createSigned(client, id, status);
        await client.query("UPDATE contract_base SET status_type_id = $1 WHERE id=$2", [4, id])
        break;
      case "4":
        await createSigned(client, id, status);
        await client.query("UPDATE contract_base SET status_type_id = $1 WHERE id=$2", [5, id])
        break;
      case "5":
        await createSigned(client, id, status);
        await client.query("UPDATE contract_base SET status_type_id = $1 WHERE id=$2", [7, id])
        break;
      case "6":
        await createSigned(client, id, status);
        await client.query("UPDATE contract_base SET status_type_id = $1 WHERE id=$2", [5, id])
        break;
      default:
        break;
    }
    await client.query("COMMIT");
    return res.status(200).json({ message: "Contrato firmado correctamente" });
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json({ message: 'Error actualizando los datos', error: error.message });
  } finally {
    client.release();
  }
};

