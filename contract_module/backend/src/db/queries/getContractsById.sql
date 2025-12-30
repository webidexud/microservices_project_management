SELECT
    cb.id AS number_contract,
    cb.value,
    cb.start_date,
    cb.end_date,
    cb.total_duration,
    cb.signature_ci_date,
    cb.issue_date as issue_data,
    cb.project_name,
    cb.execution_location,
    cb.email AS email,
    cb.created_at as creation_day,
    st.id as status,

    ct.id AS contract_type_id,
    ct.name as contract_type_name,
    pm.id AS payment_method_id,
    pm.name AS payment_method_name,

    -- CDPs agrupados
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'cdp_number', cdp.number,
                'cdp_date', cdp.date
            )
        ) FILTER (WHERE cdp.id IS NOT NULL),
        '[]'
    ) AS cdps,

    -- Otrosí agrupados
    -- COALESCE(
    --     json_agg(
    --         DISTINCT jsonb_build_object(
    --             'value', os.value,
    --             'date', os.date,
    --             'description', os.description
    --         )
    --     ) FILTER (WHERE os.id IS NOT NULL),
    --     '[]'
    -- ) AS otrosi,
    -- Agrupamos Amparos
    COALESCE(
    json_agg(
        DISTINCT jsonb_build_object(
        'amparo_id', amp.id,
        'valor', amp.value
        )
    ) FILTER (WHERE amp.id IS NOT NULL),
    '[]'
    ) AS amparos,

    -- FROM COMMERCIAL_SERVICE_CONTRACT
    csc.agreement,
    csc.supplier_justification,
    sup.name AS supplier_name,
    tisup.id AS type_identification_id_supplier,
    sup.number_identification as number_identification_id_supplier,
    lr.name AS legal_representative_name,
    tilr.id AS type_identification_id,
    lr.number_identification AS legal_representative_id_number,
    lr.email AS legal_representative_email,
    lr.phone AS legal_representative_phone,
    sup.email AS email_supplier,
    sup.phone AS phone_supplier,
    lro.option AS legal_representative, 
    
    -- FROM CONTRACT_DERIVATIVE
    cd.contracting_entity,
    cd.cia_object,
    cd.contract_purpose,
    cd.specific_obligations,
    cd.deliverables,
    el.id AS education_level_id,
    el.name AS education_level_name

FROM contract_base cb
LEFT JOIN contract_type ct ON cb.contract_type_id = ct.id
LEFT JOIN payment_method pm ON cb.payment_method_id = pm.id
LEFT JOIN cdp cdp ON cb.id = cdp.contract_base_id
-- LEFT JOIN otro_si os ON cb.id = os.contract_base_id
LEFT JOIN commercial_service_contract csc ON csc.contract_base_id = cb.id
LEFT JOIN supplier sup ON csc.supplier_id = sup.id
LEFT JOIN type_identification tisup ON sup.type_identification_id = tisup.id
LEFT JOIN amparo amp ON sup.id = amp.supplier_id
LEFT JOIN legal_representative lr ON sup.legal_representative_id = lr.id
LEFT JOIN type_identification tilr ON lr.type_identification_id = tilr.id
LEFT JOIN contract_derivative cd ON cd.contract_base_id = cb.id
LEFT JOIN education_level el ON cd.education_level_id = el.id
LEFT JOIN legal_representation_option lro ON sup.legal_representation_option_id = lro.id
LEFT JOIN status_type st ON cb.status_type_id = st.id

WHERE cb.id = $1

GROUP BY
    cb.id, ct.id, pm.id,
    csc.agreement, csc.supplier_justification,
    sup.name, tisup.id,
    lr.name, tilr.id, lr.email, lr.phone,
    sup.number_identification,
    lr.number_identification, 
    sup.email, sup.phone,
    cd.contracting_entity, cd.cia_object, cd.contract_purpose,
    cd.specific_obligations, cd.deliverables, el.id,
    lro.option,st.id

ORDER BY cb.id ASC;
