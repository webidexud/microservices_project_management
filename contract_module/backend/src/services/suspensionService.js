export const createSuspension = async (client, data, baseAdditionId) => {
    try {
        const query = `INSERT INTO suspension(
        base_addition_id,
        period
        ) VALUES ($1, $2) RETURNING *`;

        const values = [
            baseAdditionId,
            data.SP_period
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}

export const updateSuspension = async (client, data) => {
    try {
        const query = `UPDATE suspension SET
        base_addition_id = $1,
        period = $2,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 RETURNING *`;

        const values = [
            data.SP_base_addition_id,
            data.SP_period,
            data.SP_id
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}
