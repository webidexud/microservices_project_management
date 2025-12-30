export const createCdp = async (client, data, contract_base_id) => {
    try {
        const query = `INSERT INTO cdp(
        contract_base_id,
        number,
        date
        ) VALUES ($1, $2, $3) RETURNING id`;

        const values = [
            contract_base_id,
            data.CDP_number,
            data.CDP_date
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}

export const updateCdp = async (client, data, contract_base_id) => {
    try {
        const query = `UPDATE cdp SET
        contract_base_id = $1,
        number = $2,
        date = $3,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $4 RETURNING *`;

        const values = [
            contract_base_id,
            data.CDP_number,
            data.CDP_date,
            data.CDP_id
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}



export const listCdpById = async (client, id) => {
    try {
        const query = `SELECT
                            COALESCE(
                                json_agg(
                                    DISTINCT jsonb_build_object(
                                        'CDP_id', cdp.id,
                                        'CDP_contract_base_id', cdp.contract_base_id,
                                        'CDP_number', cdp.number,
                                        'CDP_date', cdp.date
                                    )
                                ) FILTER (WHERE cdp.id IS NOT NULL),
                                '[]'
                            ) AS "CDP"
                        FROM cdp
                        WHERE contract_base_id = $1;`;
        const result = await client.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
}


