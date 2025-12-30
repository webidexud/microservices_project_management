export const createSupplier = async (client, data) => {
    try {
        const query = `INSERT INTO supplier(
        name,
        type_identification_id,
        legal_representative_id,
        legal_representation_option_id,
        number_identification,
        email,
        phone
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;

        const values = [
            data.SU_name,
            data.SU_type_identification_id,
            data.SU_legal_representative_id,
            data.SU_legal_representation_option_id,
            data.SU_number_identification,
            data.SU_email,
            data.SU_phone
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}

export const updateSupplier = async (client, data) => {
    try {
        const query = `UPDATE supplier SET
        name = $1,
        type_identification_id = $2,
        legal_representative_id = $3,
        legal_representation_option_id = $4,
        number_identification = $5,
        email = $6,
        phone = $7,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $8 RETURNING *`;

        const values = [
            data.SU_name,
            data.SU_type_identification_id,
            data.SU_legal_representative_id,
            data.SU_legal_representation_option_id,
            data.SU_number_identification,
            data.SU_email,
            data.SU_phone,
            data.SU_id
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}
