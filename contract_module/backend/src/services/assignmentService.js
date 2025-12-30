export const createAssignment = async (client, data, baseAdditionId) => {
    try {
        const query = `INSERT INTO assignment(
        base_addition_id,
        value_assignor,
        amount_due,
        value_given,
        update_warranty
        ) VALUES ($1, $2, $3, $4, $5) RETURNING *`;

        const values = [
            baseAdditionId,
            data.AS_value_assignor,
            data.AS_amount_due,
            data.AS_value_given,
            data.AS_update_warranty
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}

export const updateAssignment = async (client, data) => {
    try {
        const query = `UPDATE assignment SET
        base_addition_id = $1,
        value_assignor = $2,
        amount_due = $3,
        value_given = $4,
        update_warranty = $5,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $6 RETURNING *`;

        const values = [
            data.AS_base_addition_id,
            data.AS_value_assignor,
            data.AS_amount_due,
            data.AS_value_given,
            data.AS_update_warranty,
            data.AS_id
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}
