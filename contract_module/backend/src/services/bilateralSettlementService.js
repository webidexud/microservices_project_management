export const createBilateralSettlement = async (client, data, baseAdditionId) => {
    try {
        const query = `INSERT INTO bilateral_settlement(
        base_addition_id,
        suspension,
        number_extension,
        number_addition,
        final_value_whit_addition,
        percentage_completion,
        value_execution,
        amount_due,
        value_released,
        liquidation_request
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;

        const values = [
            baseAdditionId,
            data.BS_suspension,
            data.BS_number_extension,
            data.BS_number_addition,
            data.BS_final_value_whit_addition,
            data.BS_percentage_completion,
            data.BS_value_execution,
            data.BS_amount_due,
            data.BS_value_released,
            data.BS_liquidation_request
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}

export const updateBilateralSettlement = async (client, data) => {
    try {
        const query = `UPDATE bilateral_settlement SET
        base_addition_id = $1,
        suspension = $2,
        number_extension = $3,
        number_addition = $4,
        final_value_whit_addition = $5,
        percentage_completion = $6,
        value_execution = $7,
        amount_due = $8,
        value_released = $9,
        liquidation_request = $10,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $11 RETURNING *`;

        const values = [
            data.BS_base_addition_id,
            data.BS_suspension,
            data.BS_number_extension,
            data.BS_number_addition,
            data.BS_final_value_whit_addition,
            data.BS_percentage_completion,
            data.BS_value_execution,
            data.BS_amount_due,
            data.BS_value_released,
            data.BS_liquidation_request,
            data.BS_id
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}
