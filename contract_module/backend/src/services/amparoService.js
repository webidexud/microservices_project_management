export const createAmparo = async (client, data) => {
    try {
        const query = `INSERT INTO amparo(
        supplier_id,
        name,
        value
        ) VALUES ($1, $2, $3) RETURNING *`;

        const values = [
            data.AM_supplier_id,
            data.AM_name,
            data.AM_value
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}

export const updateAmparo = async (client, data) => {
    try {
        const query = `UPDATE amparo SET
        supplier_id = $1,
        name = $2,
        value = $3,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $4 RETURNING *`;

        const values = [
            data.AM_supplier_id,
            data.AM_name,
            data.AM_value,
            data.AM_id
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}
