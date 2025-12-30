export const createLegalRepresentative = async (client, data) => {
    try {
        const query = `INSERT INTO legal_representative(
        name,
        type_identification_id,
        number_identification,
        email,
        phone
        ) VALUES ($1, $2, $3, $4, $5) RETURNING *`;

        const values = [
            data.LR_name,
            data.LR_type_identification_id,
            data.LR_number_identification,
            data.LR_email,
            data.LR_phone
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}

export const updateLegalRepresentative = async (client, data) => {
    try {
        const query = `UPDATE legal_representative SET
        name = $1,
        type_identification_id = $2,
        number_identification = $3,
        email = $4,
        phone = $5,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $6 RETURNING *`;

        const values = [
            data.LR_name,
            data.LR_type_identification_id,
            data.LR_number_identification,
            data.LR_email,
            data.LR_phone,
            data.LR_id
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}
