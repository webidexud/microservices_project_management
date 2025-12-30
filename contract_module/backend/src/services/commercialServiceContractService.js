export const createCommercialServiceContract = async (client, data) => {
    try {
        const query = `INSERT INTO commercial_service_contract(
        contract_base_id,
        supplier_id,
        agreement,
        supplier_justification
        ) VALUES ($1, $2, $3, $4) RETURNING *`;

        const values = [
            data.CSC_contract_base_id,
            data.CSC_supplier_id,
            data.CSC_agreement,
            data.CSC_supplier_justification
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}

export const updateCommercialServiceContract = async (client, data) => {
    try {
        const query = `UPDATE commercial_service_contract SET
        contract_base_id = $1,
        supplier_id = $2,
        agreement = $3,
        supplier_justification = $4,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $5 RETURNING *`;

        const values = [
            data.CSC_contract_base_id,
            data.CSC_supplier_id,
            data.CSC_agreement,
            data.CSC_supplier_justification,
            data.CSC_id
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}
