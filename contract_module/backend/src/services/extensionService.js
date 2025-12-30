export const createExtension = async (client, data, baseAdditionId) => {
    try {
        const query = `INSERT INTO extension(
        base_addition_id,
        time_extension
        ) VALUES ($1, $2) RETURNING *`;

        const values = [
            baseAdditionId,
            data.EX_time_extension
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}

export const updateExtension = async (client, data) => {
    try {
        const query = `UPDATE extension SET
        base_addition_id = $1,
        time_extension = $2,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 RETURNING *`;

        const values = [
            data.EX_base_addition_id,
            data.EX_time_extension,
            data.EX_id
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}

export const listExtensions = async (client, baseAdditionId) => {
    try {
        const query = `SELECT 
            extension.time_extension AS EX_time_extension
        FROM extension WHERE base_addition_id = $1`;
        const values = [baseAdditionId];
        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
}
