import { listBaseAddition } from "./baseAdditionService.js";

// Crea un registro en la tabla contract_base
// Recibe:
//   - client: conexión activa a PostgreSQL
//   - data: objeto con los datos del contrato base
// Devuelve:
//   - el registro creado (primer row de RETURNING id)
export const createContractBase = async (client, data) => {
    try {

        const query = `INSERT INTO contract_base(
        contract_type_id,
        payment_method_id,
        status_type_id,
        value,
        start_date,
        end_date,
        total_duration,
        signature_ci_date,
        issue_date,
        project_name,
        execution_location,
        email
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`;

        const values = [
            data.CB_contract_type_id,
            data.CB_payment_method_id,
            data.CB_status_type_id,
            data.CB_value,
            data.CB_start_date,
            data.CB_end_date,
            data.CB_total_duration,
            data.CB_signature_ci_date,
            data.CB_issue_date,
            data.CB_project_name,
            data.CB_execution_location,
            data.CB_email
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}

// Actualiza un registro en la tabla contract_base
// Recibe:
//   - client: conexión activa a PostgreSQL
//   - data: objeto con los datos del contrato base
// Devuelve:
//   - el registro actualizado (primer row de RETURNING *)
export const updateContractBase = async (client, data) => {
    try {
        const query = `UPDATE contract_base SET
        contract_type_id = $1,
        payment_method_id = $2,
        status_type_id = $3,
        value = $4,
        start_date = $5,
        end_date = $6,
        total_duration = $7,
        signature_ci_date = $8,
        issue_date = $9,
        project_name = $10,
        execution_location = $11,
        email = $12
        WHERE id = $13 RETURNING id`;

        const values = [
            data.CB_contract_type_id,
            data.CB_payment_method_id,
            data.CB_status_type_id,
            data.CB_value,
            data.CB_start_date,
            data.CB_end_date,
            data.CB_total_duration,
            data.CB_signature_ci_date,
            data.CB_issue_date,
            data.CB_project_name,
            data.CB_execution_location,
            data.CB_email,
            data.CB_id
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}

// Obtiene todos los registros de la tabla contract_base
// Recibe:
//   - client: conexión activa a PostgreSQL
// Devuelve:
//   - un array con todos los registros de la tabla contract_base
export const listContractsBase = async (client) => {
    try {
        const query = `SELECT 
                        contract_base.id AS "CB_id",
                        contract_base.contract_type_id AS "CB_contract_type_id",
                        contract_base.payment_method_id AS "CB_payment_method_id",
                        contract_base.status_type_id AS "CB_status_type_id",
                        contract_base.value AS "CB_value",
                        contract_base.start_date AS "CB_start_date",
                        contract_base.end_date AS "CB_end_date",
                        contract_base.total_duration AS "CB_total_duration",
                        contract_base.signature_ci_date AS "CB_signature_ci_date",
                        contract_base.issue_date AS "CB_issue_date",
                        contract_base.project_name AS "CB_project_name",
                        contract_base.execution_location AS "CB_execution_location",
                        contract_base.email AS "CB_email",
                        contract_base.status_type_id AS "CB_status",
                        contract_type.name AS "CB_contract_type_name",
                        payment_method.name AS "CB_payment_method_name",
                        status_type.name AS "CB_status_type_name"
                        FROM contract_base
                        LEFT JOIN contract_type ON contract_base.contract_type_id = contract_type.id
                        LEFT JOIN payment_method ON contract_base.payment_method_id = payment_method.id
                        LEFT JOIN status_type ON contract_base.status_type_id = status_type.id
                        ORDER BY contract_base.id ASC;`;
        const result = await client.query(query);
        return result.rows;
    } catch (error) {
        throw error;
    }
}

// Obtiene un registro de la tabla contract_base por su id
// Recibe:
//   - client: conexión activa a PostgreSQL
//   - id: id del registro a obtener
// Devuelve:
//   - el registro encontrado (primer row de RETURNING *)
export const listContractsBaseById = async (client, id) => {
    try {
        const baseAddition = await listBaseAddition(client, id);

        const query = `SELECT
                        contract_base.id AS "CB_id",
                        contract_base.contract_type_id AS "CB_contract_type_id",
                        contract_base.payment_method_id AS "CB_payment_method_id",
                        contract_base.status_type_id AS "CB_status_type_id",
                        contract_base.value AS "CB_value",
                        contract_base.start_date AS "CB_start_date",
                        contract_base.end_date AS "CB_end_date",
                        contract_base.total_duration AS "CB_total_duration",
                        contract_base.signature_ci_date AS "CB_signature_ci_date",
                        contract_base.issue_date AS "CB_issue_date",
                        contract_base.project_name AS "CB_project_name",
                        contract_base.execution_location AS "CB_execution_location",
                        contract_base.email AS "CB_email",
                        contract_base.status_type_id AS "CB_status",
                        contract_type.name AS "CB_contract_type_name",
                        payment_method.name AS "CB_payment_method_name",
                        status_type.name AS "CB_status_type_name",
                        (
                            SELECT json_agg(
                                jsonb_build_object(
                                    'CB_signed_id', s.id,
                                    'CB_signed_contract_base_id', s.contract_base_id,
                                    'CB_signed_security_hash', s.security_hash,
                                    'CB_signed_creation_date', s.creation_date,
                                    'CB_signed_status_type_name', status_type.name
                                )
                            )
                            FROM signed s
                            LEFT JOIN status_type ON s.status_type_id = status_type.id
                            WHERE s.contract_base_id = contract_base.id
                        ) AS "CB_signed"
                        FROM contract_base
                        LEFT JOIN contract_type ON contract_base.contract_type_id = contract_type.id
                        LEFT JOIN payment_method ON contract_base.payment_method_id = payment_method.id
                        LEFT JOIN status_type ON contract_base.status_type_id = status_type.id
                        WHERE contract_base.id = $1;`;

        const result = await client.query(query, [id]);
        const res = {
            ...result.rows[0],
            baseAddition
        }
        return res;
    } catch (error) {
        throw error;
    }
}