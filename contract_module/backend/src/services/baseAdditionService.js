import { listExtensions } from "./extensionService.js";

export const createBaseAddition = async (client, data, contractBaseId) => {
    try {
        console.log("Data", data)
        console.log("Contract Base Id", contractBaseId)

        const query = `INSERT INTO base_addition(
        contract_base_id,
        addition_type_id,
        start_date_addition,
        end_date_addition,
        justification
        ) VALUES ($1, $2, $3, $4, $5) RETURNING *`;

        const values = [
            contractBaseId,
            data.BA_addition_type_id,
            data.BA_start_date_addition,
            data.BA_end_date_addition,
            data.BA_justification
        ];

        console.log("Values", values)

        const result = await client.query(query, values);

        return result.rows[0];

    } catch (error) {
        throw error;
    }
}

export const updateBaseAddition = async (client, data) => {
    try {
        const query = `UPDATE base_addition SET
        contract_base_id = $1,
        start_date_addition = $2,
        end_date_addition = $3,
        justification = $4,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $5 RETURNING *`;

        const values = [
            data.BA_contract_base_id,
            data.BA_start_date_addition,
            data.BA_end_date_addition,
            data.BA_justification,
            data.BA_id
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}

export const listBaseAddition = async (client, contractBaseId) => {
    try {
        const query = `SELECT 
            json_agg(
                jsonb_build_object(
                    'BA_id', ba.id,
                    'BA_addition_type_id', ba.addition_type_id,
                    'BA_addition_type_name', at.name,
                    'BA_start_date_addition', ba.start_date_addition,
                    'BA_end_date_addition', ba.end_date_addition,
                    'BA_justification', ba.justification,
                    
                    -- Solo traer datos del tipo correspondiente
                    'specific_data', CASE 
                        WHEN ba.addition_type_id = 1 THEN jsonb_build_object(
                            'EX_time_extension', ext.time_extension
                        )
                        WHEN ba.addition_type_id = 2 THEN jsonb_build_object(
                            'AD_value', add.value,
                            'AD_payment_method_name', pm.name
                        )
                        WHEN ba.addition_type_id = 3 THEN jsonb_build_object(
                            'MO_clause_modification', mod.clause_modification
                        )
                        WHEN ba.addition_type_id = 4 THEN jsonb_build_object(
                            'SC_new_obligations', sco.new_obligations
                        )
                        WHEN ba.addition_type_id = 5 THEN jsonb_build_object(
                            'SP_period', sus.period
                        )
                        WHEN ba.addition_type_id = 6 THEN jsonb_build_object(
                            'RE_period', res.period,
                            'RE_update_warranty', res.update_warranty
                        )
                        WHEN ba.addition_type_id = 7 THEN jsonb_build_object(
                            'AS_value_assignor', ass.value_assignor,
                            'AS_amount_due', ass.amount_due,
                            'AS_value_given', ass.value_given,
                            'AS_update_warranty', ass.update_warranty
                        )
                        WHEN ba.addition_type_id = 8 THEN jsonb_build_object(
                            'BS_final_value_whit_addition', bil.final_value_whit_addition,
                            'BS_value_execution', bil.value_execution,
                            'BS_amount_due', bil.amount_due
                        )
                        WHEN ba.addition_type_id = 9 THEN jsonb_build_object(
                            'UL_resolution_date', uni.resolution_date,
                            'UL_resolution_number', uni.resolution_number,
                            'UL_causal', uni.causal
                        )
                        ELSE '{}'::jsonb
                    END
                )
                ORDER BY ba.start_date_addition
            ) AS "baseAddition"
        FROM base_addition ba
        INNER JOIN addition_type at ON ba.addition_type_id = at.id
        
        -- Todos los LEFT JOINs sin condiciones en el ON
        LEFT JOIN extension ext ON ext.base_addition_id = ba.id
        LEFT JOIN addition add ON add.base_addition_id = ba.id
        LEFT JOIN payment_method pm ON pm.id = add.payment_method_id
        LEFT JOIN modification mod ON mod.base_addition_id = ba.id
        LEFT JOIN scope sco ON sco.base_addition_id = ba.id
        LEFT JOIN suspension sus ON sus.base_addition_id = ba.id
        LEFT JOIN restart res ON res.base_addition_id = ba.id
        LEFT JOIN assignment ass ON ass.base_addition_id = ba.id
        LEFT JOIN bilateral_settlement bil ON bil.base_addition_id = ba.id
        LEFT JOIN unilateral_liquidation uni ON uni.base_addition_id = ba.id
        
        WHERE ba.contract_base_id = $1
        GROUP BY ba.contract_base_id;`;

        const result = await client.query(query, [contractBaseId]);
        return result.rows[0]?.baseAddition || [];
    } catch (error) {
        throw error;
    }
}
