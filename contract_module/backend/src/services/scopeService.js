export const createScope = async (client, data, baseAdditionId) => {
    try {
        const query = `INSERT INTO scope(
        base_addition_id,
        new_obligations
        ) VALUES ($1, $2) RETURNING *`;

        const values = [
            baseAdditionId,
            data.SC_new_obligations
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}

export const updateScope = async (client, data) => {
    try {
        const query = `UPDATE scope SET
        base_addition_id = $1,
        new_obligations = $2,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 RETURNING *`;

        const values = [
            data.SC_base_addition_id,
            data.SC_new_obligations,
            data.SC_id
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}
