export const createModification = async (client, data, baseAdditionId) => {
    try {
        const query = `INSERT INTO modification(
        base_addition_id,
        clause_modification
        ) VALUES ($1, $2) RETURNING *`;

        const values = [
            baseAdditionId,
            data.MO_clause_modification
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}

export const updateModification = async (client, data) => {
    try {
        const query = `UPDATE modification SET
        base_addition_id = $1,
        clause_modification = $2,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 RETURNING *`;

        const values = [
            data.MO_base_addition_id,
            data.MO_clause_modification,
            data.MO_id
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}
