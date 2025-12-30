SELECT
    cb.id AS number_contract,
    cb.value,
    cb.start_date,
    cb.end_date,
    cb.total_duration,
    cb.signature_ci_date,
    cb.issue_date,
    cb.project_name,
    cb.execution_location,
    cb.email AS email_abog,
    st.name as status,

    ct.name AS contract_type,
    pm.name AS payment_method,

    -- CDPs agrupados
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'number', cdp.number,
                'date', cdp.date
            )
        ) FILTER (WHERE cdp.id IS NOT NULL),
        '[]'
    ) AS cdps,

    -- Amparos agrupados
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id', amp.id,
                'name', amp.name,
                'value', amp.value
            )
        ) FILTER (WHERE amp.id IS NOT NULL),
        '[]'
    ) AS amparos,

    -- Firmas agrupadas
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id', sig.id,
                'type', sigt.name,
                'hash', sig.security_hash,
                'date', sig.creation_date,
                'base_addition_id', sig.base_addition_id
            )
        ) FILTER (WHERE sig.id IS NOT NULL),
        '[]'
    ) AS signatures,

    -- -- Adiciones agrupadas (Todo tipo de novedades: Adición, Prórroga, etc.)
    -- COALESCE(
    --     json_agg(
    --         DISTINCT jsonb_build_object(
    --             'id', ba.id,
    --             'start_date', ba.start_date_addition,
    --             'end_date', ba.end_date_addition,
    --             'justification', ba.justification,
    --             'type', at.name,
    --             'created_at', ba.created_at,
                
    --             -- Campos específicos por tipo
    --             'value', add_val.value, -- Adición
    --             'payment_method_id', add_val.payment_method_id, -- Adición
                
    --             'time_extension', ext.time_extension, -- Prórroga
                
    --             'clause_modification', mod.clause_modification, -- Modificación
                
    --             'new_obligations', scp.new_obligations, -- Alcance
                
    --             'suspension_period', susp.period, -- Suspensión
                
    --             'restart_period', rest.period, -- Reinicio
    --             'restart_warranty', rest.update_warranty, -- Reinicio
                
    --             'assignor_value', assign.value_assignor, -- Cesión
    --             'amount_due', assign.amount_due, -- Cesión
    --             'given_value', assign.value_given, -- Cesión
    --             'assignment_warranty', assign.update_warranty, -- Cesión
                
    --             'bilateral_suspension', bilat.suspension, -- Liquidación Bilateral
    --             'bilateral_final_value', bilat.final_value_whit_addition, -- Liquidación Bilateral
    --             'bilateral_balance', bilat.amount_due, -- Liquidación Bilateral
                
    --             'unilateral_resolution_date', unilat.resolution_date, -- Liquidación Unilateral
    --             'unilateral_causal', unilat.causal -- Liquidación Unilateral
    --         )
    --     ) FILTER (WHERE ba.id IS NOT NULL),
    --     '[]'
    -- ) AS additions,

    -- FROM COMMERCIAL_SERVICE_CONTRACT
    csc.agreement,
    csc.supplier_justification,
    sup.name AS name_supplier,
    tisup.name AS type_id_supplier,
    sup.number_identification as number_identification_supplier,
    lr.name AS name_legal_rep,
    tilr.name AS type_id_legal_rep,
    lr.number_identification AS numero_identification_legal_rep,
    lr.email AS email_legal_rep,
    lr.phone AS phone_legal_rep,
    sup.email AS email_supplier,
    sup.phone AS phone_supplier,
    lro.id AS legal_representative, 
    
    -- FROM CONTRACT_DERIVATIVE
    cd.contracting_entity,
    cd.cia_object,
    cd.contract_purpose,
    cd.specific_obligations,
    cd.deliverables,
    el.name AS education_level

FROM contract_base cb
LEFT JOIN contract_type ct ON cb.contract_type_id = ct.id
LEFT JOIN payment_method pm ON cb.payment_method_id = pm.id
LEFT JOIN status_type st ON cb.status_type_id = st.id
LEFT JOIN cdp cdp ON cb.id = cdp.contract_base_id

-- Joins para Commercial Service Contract
LEFT JOIN commercial_service_contract csc ON csc.contract_base_id = cb.id
LEFT JOIN supplier sup ON csc.supplier_id = sup.id
LEFT JOIN type_identification tisup ON sup.type_identification_id = tisup.id
LEFT JOIN amparo amp ON sup.id = amp.supplier_id
LEFT JOIN legal_representative lr ON sup.legal_representative_id = lr.id
LEFT JOIN type_identification tilr ON lr.type_identification_id = tilr.id
LEFT JOIN legal_representation_option lro ON sup.legal_representation_option_id = lro.id

-- Joins para Contract Derivative
LEFT JOIN contract_derivative cd ON cd.contract_base_id = cb.id
LEFT JOIN education_level el ON cd.education_level_id = el.id

-- Joins para Firmas
LEFT JOIN signed sig ON sig.contract_base_id = cb.id
LEFT JOIN signed_type sigt ON sig.signed_type_id = sigt.id

-- Joins para Adiciones (Base Addition y Tipos)
LEFT JOIN base_addition ba ON ba.contract_base_id = cb.id
-- LEFT JOIN addition_type_pivot atp ON atp.base_addition_id = ba.id
-- LEFT JOIN addition_type at ON atp.addition_type_id = at.id

-- Joins para Tablas Específicas de Adiciones
LEFT JOIN addition add_val ON add_val.base_addition_id = ba.id
LEFT JOIN extension ext ON ext.base_addition_id = ba.id
LEFT JOIN modification mod ON mod.base_addition_id = ba.id
LEFT JOIN scope scp ON scp.base_addition_id = ba.id
LEFT JOIN suspension susp ON susp.base_addition_id = ba.id
LEFT JOIN restart rest ON rest.base_addition_id = ba.id
LEFT JOIN assignment assign ON assign.base_addition_id = ba.id
LEFT JOIN bilateral_settlement bilat ON bilat.base_addition_id = ba.id
LEFT JOIN unilateral_liquidation unilat ON unilat.base_addition_id = ba.id

GROUP BY
    cb.id, ct.name, pm.name, st.name,
    csc.agreement, csc.supplier_justification,
    sup.name, tisup.name,
    lr.name, tilr.name, lr.email, lr.phone,
    sup.number_identification,
    lr.number_identification, 
    sup.email, sup.phone,
    cd.contracting_entity, cd.cia_object, cd.contract_purpose,
    cd.specific_obligations, cd.deliverables, el.name,
    lro.id

ORDER BY cb.id ASC;
