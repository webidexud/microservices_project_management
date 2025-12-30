export const createRestart = async (client, data, baseAdditionId) => {
    try {
        const query = `INSERT INTO restart(
        base_addition_id,
        period,
        update_warranty
        ) VALUES ($1, $2, $3) RETURNING *`;

        const values = [
            baseAdditionId,
            data.RE_period,
            data.RE_update_warranty
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}

export const updateRestart = async (client, data) => {
    try {
        const query = `UPDATE restart SET
        base_addition_id = $1,
        period = $2,
        update_warranty = $3,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $4 RETURNING *`;

        const values = [
            data.RE_base_addition_id,
            data.RE_period,
            data.RE_update_warranty,
            data.RE_id
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}
