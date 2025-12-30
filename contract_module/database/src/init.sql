-- =============================================
-- INITIALIZATION SCRIPT FOR CONTRACT MANAGEMENT
-- =============================================

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLAS CATALOGOS
-- =============================================

-- Tabla: Tipo de Identificación
CREATE TABLE type_identification (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Tabla: Tipo de Contrato
CREATE TABLE contract_type (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Tabla: Nivel Educativo
CREATE TABLE education_level (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Tabla: Método de Pago
CREATE TABLE payment_method (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Tabla: opcion del representante legal
CREATE TABLE legal_representation_option(
    id SERIAL PRIMARY KEY,
    option BOOLEAN
);

-- Tablaa: opcion de los estados
CREATE TABLE status_type(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255)
);


CREATE TABLE addition_type(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- =============================================
-- TABLAS PRINCIPALES
-- =============================================

-- Tabla: Representante Legal
CREATE TABLE legal_representative (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type_identification_id INTEGER NOT NULL REFERENCES type_identification(id),
    number_identification BIGINT,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Proveedor
CREATE TABLE supplier (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type_identification_id INTEGER NOT NULL REFERENCES type_identification(id),
    legal_representative_id INTEGER REFERENCES legal_representative(id),
    legal_representation_option_id INTEGER REFERENCES legal_representation_option(id),
    number_identification BIGINT,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Amparo
CREATE TABLE amparo (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES supplier(id),
    name TEXT NOT NULL,
    value BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



-- Tabla: Contrato Base (Tabla principal)
CREATE TABLE contract_base (
    id SERIAL PRIMARY KEY,
    contract_type_id INTEGER NOT NULL REFERENCES contract_type(id),
    payment_method_id INTEGER NOT NULL REFERENCES payment_method(id),
    status_type_id INTEGER NOT NULL REFERENCES status_type(id),
    value NUMERIC(15,2) NOT NULL CHECK (value >= 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_duration INTEGER CHECK (total_duration >= 0),
    signature_ci_date DATE,
    issue_date DATE,
    project_name TEXT NOT NULL,
    execution_location TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints de validación
    CONSTRAINT valid_dates CHECK (end_date >= start_date)
    -- CONSTRAINT valid_signature CHECK (signature_ci_date >= issue_date OR signature_ci_date IS NULL)
);

-- Tabla: CDP (Certificado de Disponibilidad Presupuestal)
CREATE TABLE cdp (
    id SERIAL PRIMARY KEY,
    contract_base_id INTEGER NOT NULL REFERENCES contract_base(id),
    number BIGINT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



-- Tabla: Contrato Derivado (Especialización)
CREATE TABLE contract_derivative (
    id SERIAL PRIMARY KEY,
    contract_base_id INTEGER NOT NULL REFERENCES contract_base(id) ON DELETE CASCADE,
    contracting_entity TEXT NOT NULL,
    cia_object TEXT,
    contract_purpose TEXT,
    specific_obligations TEXT[],
    deliverables TEXT[],
    education_level_id INTEGER REFERENCES education_level(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Contrato de Servicio Comercial (Especialización)
CREATE TABLE commercial_service_contract (
    id SERIAL PRIMARY KEY,
    contract_base_id INTEGER NOT NULL REFERENCES contract_base(id) ON DELETE CASCADE,
    supplier_id INTEGER NOT NULL REFERENCES supplier(id),
    agreement TEXT,
    supplier_justification TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Base de Adición
CREATE TABLE base_addition (
    id SERIAL PRIMARY KEY,
    contract_base_id INTEGER NOT NULL REFERENCES contract_base(id) ON DELETE CASCADE,
    addition_type_id INTEGER NOT NULL REFERENCES addition_type(id),
    start_date_addition DATE NOT NULL,
    end_date_addition DATE NOT NULL,
    justification TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Firmado
CREATE TABLE signed (
    id SERIAL PRIMARY KEY,
    contract_base_id INTEGER REFERENCES contract_base(id),
    base_addition_id INTEGER REFERENCES base_addition(id),
    status_type_id INTEGER REFERENCES status_type(id),
    security_hash TEXT NOT NULL,
    creation_date DATE NOT NULL,
    salt TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Adición
CREATE TABLE addition(
    id SERIAL PRIMARY KEY,
    base_addition_id INTEGER NOT NULL REFERENCES base_addition(id),
    payment_method_id INTEGER NOT NULL REFERENCES payment_method(id),
    value BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Extensión
CREATE TABLE extension(
    id SERIAL PRIMARY KEY,
    base_addition_id INTEGER NOT NULL REFERENCES base_addition(id),
    time_extension INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Modificación
CREATE TABLE modification(
    id SERIAL PRIMARY KEY,
    base_addition_id INTEGER NOT NULL REFERENCES base_addition(id),
    clause_modification TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: alcance
CREATE TABLE scope(
    id SERIAL PRIMARY KEY,
    base_addition_id INTEGER NOT NULL REFERENCES base_addition(id),
    new_obligations TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Suspensión
CREATE TABLE suspension(
    id SERIAL PRIMARY KEY,
    base_addition_id INTEGER NOT NULL REFERENCES base_addition(id),
    period INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Reanudación
CREATE TABLE restart(
    id SERIAL PRIMARY KEY,
    base_addition_id INTEGER NOT NULL REFERENCES base_addition(id),
    period INTEGER NOT NULL,
    update_warranty TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: cesión
CREATE TABLE assignment(
    id SERIAL PRIMARY KEY,
    base_addition_id INTEGER NOT NULL REFERENCES base_addition(id),
    value_assignor BIGINT NOT NULL,
    amount_due BIGINT NOT NULL,
    value_given BIGINT NOT NULL,
    update_warranty TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: liquidación bilateral
CREATE TABLE bilateral_settlement(
    id SERIAL PRIMARY KEY,
    base_addition_id INTEGER NOT NULL REFERENCES base_addition(id),
    suspension TEXT NOT NULL,
    number_extension INTEGER NOT NULL,
    number_addition INTEGER NOT NULL,
    final_value_whit_addition BIGINT NOT NULL,
    percentage_completion INTEGER NOT NULL,
    value_execution BIGINT NOT NULL,
    amount_due BIGINT NOT NULL,
    value_released BIGINT NOT NULL,
    liquidation_request TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: liquidación unilateral
CREATE TABLE unilateral_liquidation(
    id SERIAL PRIMARY KEY,
    base_addition_id INTEGER NOT NULL REFERENCES base_addition(id),
    resolution_date DATE NOT NULL,
    resolution_number INTEGER NOT NULL,
    causal TEXT NOT NULL,
    analysis_causal TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- =============================================
-- TABLAS PIVOTE
-- =============================================

-- -- Tabla pivote: tipo de adición
-- CREATE TABLE addition_type_pivot(
--     id SERIAL PRIMARY KEY,
--     base_addition_id INTEGER NOT NULL REFERENCES base_addition(id),
--     addition_type_id INTEGER NOT NULL REFERENCES addition_type(id),
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- =============================================
-- ÍNDICES PARA MEJOR PERFORMANCE
-- =============================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_contract_base_status ON contract_base(status_type_id);
CREATE INDEX idx_contract_base_dates ON contract_base(start_date, end_date);
CREATE INDEX idx_contract_base_project ON contract_base(project_name);
CREATE INDEX idx_contract_base_id ON contract_base(id);


CREATE INDEX idx_supplier_identification ON supplier(number_identification);
CREATE INDEX idx_supplier_name ON supplier(name);
CREATE INDEX idx_legal_rep_identification ON legal_representative(number_identification);

CREATE INDEX idx_contract_derivative_contract ON contract_derivative(contract_base_id);
CREATE INDEX idx_commercial_service_contract ON commercial_service_contract(contract_base_id);
CREATE INDEX idx_commercial_service_supplier ON commercial_service_contract(supplier_id);

-- Índices para foreign keys
CREATE INDEX idx_contract_base_type ON contract_base(contract_type_id);
CREATE INDEX idx_contract_base_payment ON contract_base(payment_method_id);
CREATE INDEX idx_supplier_type_identification ON supplier(type_identification_id);
CREATE INDEX idx_cdp_number ON cdp(number);

-- Nuevos índices para Foreign Keys
CREATE INDEX idx_legal_rep_type_id ON legal_representative(type_identification_id);
CREATE INDEX idx_supplier_legal_rep ON supplier(legal_representative_id);
CREATE INDEX idx_supplier_legal_opt ON supplier(legal_representation_option_id);
CREATE INDEX idx_amparo_supplier ON amparo(supplier_id);
CREATE INDEX idx_cdp_contract_base ON cdp(contract_base_id);
CREATE INDEX idx_contract_derivative_edu ON contract_derivative(education_level_id);
CREATE INDEX idx_base_addition_contract ON base_addition(contract_base_id);
CREATE INDEX idx_signed_contract_base ON signed(contract_base_id);
CREATE INDEX idx_signed_base_addition ON signed(base_addition_id);
CREATE INDEX idx_addition_base_addition ON addition(base_addition_id);
CREATE INDEX idx_addition_payment ON addition(payment_method_id);
CREATE INDEX idx_extension_base_addition ON extension(base_addition_id);
CREATE INDEX idx_modification_base_addition ON modification(base_addition_id);
CREATE INDEX idx_scope_base_addition ON scope(base_addition_id);
CREATE INDEX idx_suspension_base_addition ON suspension(base_addition_id);
CREATE INDEX idx_restart_base_addition ON restart(base_addition_id);
CREATE INDEX idx_assignment_base_addition ON assignment(base_addition_id);
CREATE INDEX idx_bilateral_settlement_base ON bilateral_settlement(base_addition_id);
CREATE INDEX idx_unilateral_liquidation_base ON unilateral_liquidation(base_addition_id);
-- CREATE INDEX idx_addition_pivot_base ON addition_type_pivot(base_addition_id);
-- CREATE INDEX idx_addition_pivot_type ON addition_type_pivot(addition_type_id);

-- =============================================
-- DATOS INICIALES (Seed Data)
-- =============================================

-- Insertar tipos de identificación
INSERT INTO type_identification (name) VALUES
    ('Cédula de Ciudadanía'),
    ('Cédula de Extranjería'),
    ('NIT'),
    ('Pasaporte'),
    ('Tarjeta de Identidad');

-- Insertar tipos de contrato
INSERT INTO contract_type (name) VALUES
    ('Contrato Derivado');
    -- ('Contrato Compras');

-- Insertar niveles educativos
INSERT INTO education_level (name) VALUES
    ('Técnico'),
    ('Tecnólogo'),
    ('Pregrado'),
    ('Especialización'),
    ('Maestría'),
    ('Doctorado');

-- Insertar métodos de pago
INSERT INTO payment_method (name) VALUES
    ('Transferencia Bancaria'),
    ('Cheque'),
    ('Efectivo'),
    ('Tarjeta de Crédito'),
    ('Tarjeta Débito'),
    ('PSE');

-- Insertar opciones del legal
INSERT INTO legal_representation_option (option) VALUES
    (true),
    (false);

-- DATOS DE LAS TABLAS CENTRALES PARA EJEMPLOS DENTRO DE TODO EL SISTEMA --

-- legal representative de ejemplo
INSERT INTO legal_representative (name,
type_identification_id,
number_identification,
email,
phone) VALUES
    ('Pepito Perez',1, 98417236,'pepPer@outlook.com','3015686421'),
    ('Pepita Rosas',1, 98417236,'pepRos@outlook.com','0123456789');



-- Insertar algunos proveedores de ejemplo
INSERT INTO supplier (name, type_identification_id, legal_representative_id, number_identification,email, phone) VALUES
    ('Proveedor A', 2, 1, 12384781, 'example@gmail.com', '3001234567'),
    ('Proveedor B', 1, 2, 12384781, 'example2@outlook.com', '3109876543'),
    ('Proveedor C', 3, 1, 12384781, 'example3@yahoo.com', '3204567890');

-- Insertar algunos amparos de ejemplo
INSERT INTO amparo (supplier_id ,name, value) VALUES
    (1,'Cámara de Comercio de Bogotá', 50),
    (1,'Cámara de Comercio de Medellín', 30),
    (2,'Cámara de Comercio de Cali', 40);


-- Insertar los tipo de estado
INSERT INTO status_type (name) VALUES
    ('incompleto'),
    ('firmando Abogado Designado'),
    ('firmando Contratista'),
    ('firmando Lider de Area'),
    ('firmando Ordenador del Gasto'),
    ('firmando Cesionado'),
    ('activa'),
    ('suspendida'),
    ('cancelada');

-- Insertar tipos de adición
INSERT INTO addition_type (name) VALUES
    ('Prórroga'),
    ('Adición'),
    ('Modificación'),
    ('Alcance'),
    ('Suspensión'),
    ('Reinicio'),
    ('Cesión'),
    ('Liquidación Bilateral'),
    ('Liquidación Unilateral');




-- 1️⃣ Crear el contrato base 1
INSERT INTO contract_base (
    contract_type_id,
    payment_method_id,
    status_type_id,
    value,
    start_date,
    end_date,
    issue_date,
    signature_ci_date,
    project_name,
    execution_location,
    email
) VALUES (
    1,                     -- Contrato Derivado
    1,                     -- Transferencia Bancaria
    1,                     -- Activa
    35000000.00,           -- Valor del contrato
    '2025-02-01',          -- Fecha inicio
    '2025-11-30',          -- Fecha fin
    '2025-01-20',          -- Fecha de emisión
    '2025-01-25',          -- Fecha de firma
    'Servicios Profesionales de Salud', -- Proyecto
    'Bogotá D.C.',         -- Lugar de ejecución
    'contacto@salud.gov.co'
);

-- 2️⃣ Asociar el contrato derivado 1
INSERT INTO contract_derivative (
    contract_base_id,
    contracting_entity,
    cia_object,
    contract_purpose,
    specific_obligations,
    deliverables,
    education_level_id
) VALUES (
    1,  -- ID del contrato base recién creado
    'Secretaria de Salud',
    'Prestación de servicios profesionales',
    'Apoyo a la gestión administrativa de la secretaría.',
    ARRAY['Elaboración de informes', 'Apoyo en auditorías'],
    ARRAY['Informe mensual de actividades'],
    3   -- Pregrado
);

-- 3️⃣ Crear el contrato base 2
INSERT INTO contract_base (
    contract_type_id,
    payment_method_id,
    status_type_id,
    value,
    start_date,
    end_date,
    issue_date,
    signature_ci_date,
    project_name,
    execution_location,
    email
) VALUES (
    1,                     -- Contrato Derivado
    1,                     -- Transferencia Bancaria
    1,                     -- Activa
    42000000.00,           -- Valor del contrato
    '2025-03-01',          -- Fecha inicio
    '2025-12-31',          -- Fecha fin
    '2025-02-15',          -- Fecha de emisión
    '2025-02-20',          -- Fecha de firma
    'Interventoría Técnica de Obras', -- Proyecto
    'Bogotá D.C.',         -- Lugar de ejecución
    'contacto@idu.gov.co'
);

-- 4️⃣ Asociar el contrato derivado 2
INSERT INTO contract_derivative (
    contract_base_id,
    contracting_entity,
    cia_object,
    contract_purpose,
    specific_obligations,
    deliverables,
    education_level_id
) VALUES (
    2,  -- ID del contrato base recién creado
    'Instituto de Desarrollo Urbano',
    'Interventoría técnica, administrativa y financiera',
    'Realizar la interventoría al contrato de obra No. 123.',
    ARRAY['Supervisión de obra', 'Revisión de actas'],
    ARRAY['Informes de interventoría', 'Actas de recibo'],
    4   -- Especialización
);

-- CDP de ejemplo
INSERT INTO cdp (contract_base_id ,number, date) VALUES
    (1, 2025001, '2025-01-15'),
    (2, 2025002, '2025-02-10');

-- =============================================
-- DATOS DE ADICIONES (Ejemplo Reinicio)
-- =============================================

-- 1️⃣ Crear la base de la adición (Reinicio) para el Contrato 1
INSERT INTO base_addition (
    contract_base_id,
    addition_type_id,
    start_date_addition,
    end_date_addition,
    justification
) VALUES (
    1,              -- ID del contrato base 1
    6,              -- ID del tipo de adición (Reinicio)
    '2025-06-01',   -- Fecha inicio reinicio
    '2025-06-15',   -- Fecha fin reinicio
    'Reinicio de actividades tras suspensión.'
);

-- 2️⃣ Crear la base de la adición (Prórroga) para el Contrato 1
INSERT INTO base_addition (
    contract_base_id,
    addition_type_id,
    start_date_addition,
    end_date_addition,
    justification
) VALUES (
    1,              -- ID del contrato base 1
    1,              -- ID del tipo de adición (Prórroga)
    '2025-06-01',   -- Fecha inicio reinicio
    '2025-06-15',   -- Fecha fin reinicio
    'Prórroga de actividades.'
);


-- 3️⃣ Crear el registro de reinicio
INSERT INTO restart (
    base_addition_id,
    period,
    update_warranty
) VALUES (
    1,  -- ID de la base_addition recién creada
    15, -- Periodo en días
    'Se actualizan las pólizas de cumplimiento.'
);


-- =============================================
-- VISTAS ÚTILES
-- =============================================


-- =============================================
-- FUNCIONES Y TRIGGERS
-- =============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_contract_base_updated_at 
    BEFORE UPDATE ON contract_base 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_updated_at 
    BEFORE UPDATE ON supplier 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legal_representative_updated_at 
    BEFORE UPDATE ON legal_representative 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contract_derivative_updated_at 
    BEFORE UPDATE ON contract_derivative 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commercial_service_contract_updated_at 
    BEFORE UPDATE ON commercial_service_contract 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cdp_updated_at 
    BEFORE UPDATE ON cdp 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_amparo_updated_at 
    BEFORE UPDATE ON amparo 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_base_addition_updated_at 
    BEFORE UPDATE ON base_addition 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_signed_updated_at 
    BEFORE UPDATE ON signed 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addition_updated_at 
    BEFORE UPDATE ON addition 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_extension_updated_at 
    BEFORE UPDATE ON extension 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modification_updated_at 
    BEFORE UPDATE ON modification 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scope_updated_at 
    BEFORE UPDATE ON scope 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suspension_updated_at 
    BEFORE UPDATE ON suspension 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restart_updated_at 
    BEFORE UPDATE ON restart 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignment_updated_at 
    BEFORE UPDATE ON assignment 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bilateral_settlement_updated_at 
    BEFORE UPDATE ON bilateral_settlement 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_unilateral_liquidation_updated_at 
    BEFORE UPDATE ON unilateral_liquidation 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_addition_type_pivot_updated_at 
--     BEFORE UPDATE ON addition_type_pivot 
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



-- Función para calcular duración automáticamente
CREATE OR REPLACE FUNCTION calculate_contract_duration()
RETURNS TRIGGER AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
BEGIN
    -- Para INSERT: usar NEW (OLD no existe)
    -- Para UPDATE: usar NEW si tiene valor, de lo contrario OLD
    v_start_date := COALESCE(NEW.start_date, OLD.start_date);
    v_end_date := COALESCE(NEW.end_date, OLD.end_date);
    
    IF v_start_date IS NOT NULL AND v_end_date IS NOT NULL THEN
        NEW.total_duration := (v_end_date - v_start_date);
    ELSE
        NEW.total_duration := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_contract_duration_trigger
    BEFORE INSERT OR UPDATE ON contract_base
    FOR EACH ROW EXECUTE FUNCTION calculate_contract_duration();







-- =============================================
-- CONFIGURACIÓN ADICIONAL
-- =============================================

-- Configurar timezone para Colombia
SET timezone = 'America/Bogota';

-- Mensaje de confirmación
DO $$ 
BEGIN
    RAISE NOTICE '✅ Base de datos de Gestión de Contratos inicializada correctamente';
    RAISE NOTICE '📍 Timezone configurado: America/Bogota';
    RAISE NOTICE '📊 Tablas creadas: 7 tablas principales + 5 tablas maestras';
    RAISE NOTICE '🔍 Índices creados: 13 índices para optimización';
    RAISE NOTICE '👁️  Vistas creadas: 0 vista para consultas complejas';
END $$;