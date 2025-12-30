export const createUnilateralLiquidation = async (client, data, baseAdditionId) => {
    try {
        const query = `INSERT INTO unilateral_liquidation(
        base_addition_id,
        resolution_date,
        resolution_number,
        causal,
        analysis_causal
        ) VALUES ($1, $2, $3, $4, $5) RETURNING *`;

        const values = [
            baseAdditionId,
            data.UL_resolution_date,
            data.UL_resolution_number,
            data.UL_causal,
            data.UL_analysis_causal
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}

export const updateUnilateralLiquidation = async (client, data) => {
    try {
        const query = `UPDATE unilateral_liquidation SET
        base_addition_id = $1,
        resolution_date = $2,
        resolution_number = $3,
        causal = $4,
        analysis_causal = $5,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $6 RETURNING *`;

        const values = [
            data.UL_base_addition_id,
            data.UL_resolution_date,
            data.UL_resolution_number,
            data.UL_causal,
            data.UL_analysis_causal,
            data.UL_id
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}
