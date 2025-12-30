import { listContractsBaseById } from './contractBaseService.js';
import { listCdpById } from './cdpService.js';


// Crea un registro en la tabla contract_derivative
// Recibe:
//   - client: conexión activa a PostgreSQL
//   - data: objeto con los datos del contrato derivado
//   - contract_base_id: id del contrato base al que pertenece el contrato derivado
// Devuelve:
//   - el registro creado (primer row de RETURNING *)
export const createContractDerivative = async (client, data, contract_base_id) => {
    try {

        const specific_obligations = data.CD_specific_obligations
            ? data.CD_specific_obligations.split(";").map(s => s.trim()).filter(Boolean)
            : null;

        const deliverables = data.CD_deliverables
            ? data.CD_deliverables.split(";").map(s => s.trim()).filter(Boolean)
            : null;

        const query = `INSERT INTO contract_derivative(
        contract_base_id,
        contracting_entity,
        cia_object,
        contract_purpose,
        specific_obligations,
        deliverables,
        education_level_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;

        const values = [
            contract_base_id,
            data.CD_contracting_entity,
            data.CD_cia_object,
            data.CD_contract_purpose,
            specific_obligations,
            deliverables,
            data.CD_education_level_id
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}

// Actualiza un registro en la tabla contract_derivative
// Recibe:
//   - client: conexión activa a PostgreSQL
//   - data: objeto con los datos del contrato derivado
// Devuelve:
//   - el registro actualizado (primer row de RETURNING *)
export const updateContractDerivative = async (client, data, contract_base_id) => {
    try {

        const specific_obligations = Array.isArray(data.CD_specific_obligations)
            ? data.CD_specific_obligations
            : (data.CD_specific_obligations
                ? data.CD_specific_obligations.split(",").map(s => s.trim()).filter(Boolean)
                : null);

        const deliverables = Array.isArray(data.CD_deliverables)
            ? data.CD_deliverables
            : (data.CD_deliverables
                ? data.CD_deliverables.split(",").map(s => s.trim()).filter(Boolean)
                : null);


        const query = `UPDATE contract_derivative SET
        contract_base_id = $1,
        contracting_entity = $2,
        cia_object = $3,
        contract_purpose = $4,
        specific_obligations = $5,
        deliverables = $6,
        education_level_id = $7,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $8 RETURNING *`;

        const values = [
            contract_base_id,
            data.CD_contracting_entity,
            data.CD_cia_object,
            data.CD_contract_purpose,
            specific_obligations,
            deliverables,
            data.CD_education_level_id,
            data.CD_id
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}


// Obtiene un registro de la tabla contract_derivative por su id
// Recibe:
//   - client: conexión activa a PostgreSQL
//   - id: id del registro a obtener
// Devuelve:
//   - el registro encontrado (primer row de RETURNING *)
export const listContractsDerivativeById = async (client, id) => {
    try {
        const contract_base = await listContractsBaseById(client, id);

        const cdp = await listCdpById(client, contract_base.CB_id);

        const query = `SELECT
            cd.id AS "CD_id",
            cd.contract_base_id AS "CD_contract_base_id",
            cd.contracting_entity AS "CD_contracting_entity",
            cd.cia_object AS "CD_cia_object",
            cd.contract_purpose AS "CD_contract_purpose",
            cd.specific_obligations AS "CD_specific_obligations",
            cd.deliverables AS "CD_deliverables",
            cd.education_level_id AS "CD_education_level_id",
            el.name AS "CD_education_level_name"
        FROM contract_derivative cd
        LEFT JOIN education_level el ON cd.education_level_id = el.id
        WHERE cd.contract_base_id = $1`;
        const result = await client.query(query, [contract_base.CB_id]);

        const merge = {
            ...contract_base,
            ...result.rows[0],
            ...cdp
        }
        return merge;
    } catch (error) {
        throw error;
    }
}
