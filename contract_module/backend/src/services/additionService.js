export const createAddition = async (client, data, baseAdditionId) => {
    try {
        const query = `INSERT INTO addition(
        base_addition_id,
        payment_method_id,
        value
        ) VALUES ($1, $2, $3) RETURNING *`;

        const values = [
            baseAdditionId,
            data.AD_payment_method_id,
            data.AD_value
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}

export const updateAddition = async (client, data) => {
    try {
        const query = `UPDATE addition SET
        base_addition_id = $1,
        payment_method_id = $2,
        value = $3,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $4 RETURNING *`;

        const values = [
            data.AD_base_addition_id,
            data.AD_payment_method_id,
            data.AD_value,
            data.AD_id
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}

export const listAdditions = async (client, baseAdditionId) => {
    try {
        const query = `SELECT 
            addition.payment_method_id AS AD_payment_method_id,
            addition.value AS AD_value
        FROM addition WHERE base_addition_id = $1`;
        const values = [baseAdditionId];
        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
}