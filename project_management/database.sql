-- Adminer 5.1.0 PostgreSQL 16.0 dump

DROP TABLE IF EXISTS "contracting_modalities";
DROP SEQUENCE IF EXISTS contracting_modalities_id_seq;
CREATE SEQUENCE contracting_modalities_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."contracting_modalities" (
    "contracting_modality_id" integer DEFAULT nextval('contracting_modalities_id_seq') NOT NULL,
    "modality_name" character varying(100) NOT NULL,
    "modality_description" text,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "created_by_user_id" integer,
    "updated_at" timestamp,
    "updated_by_user_id" integer,
    CONSTRAINT "pk_contracting_modalities" PRIMARY KEY ("contracting_modality_id")
) WITH (oids = false);

COMMENT ON TABLE "public"."contracting_modalities" IS 'Catalog of contracting modalities';

CREATE UNIQUE INDEX uk_contracting_modalities_name ON public.contracting_modalities USING btree (modality_name);

INSERT INTO "contracting_modalities" ("contracting_modality_id", "modality_name", "modality_description", "is_active", "created_at", "created_by_user_id", "updated_at", "updated_by_user_id") VALUES
(1,	'Public Bidding',	'Open public procurement process',	'1',	'2025-10-23 18:36:32.132706',	1,	NULL,	NULL),
(2,	'Direct Contract',	'Direct contracting without bidding process',	'1',	'2025-10-23 18:36:32.132706',	1,	NULL,	NULL);

DROP TABLE IF EXISTS "entities";
DROP SEQUENCE IF EXISTS entities_id_seq;
CREATE SEQUENCE entities_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."entities" (
    "entity_id" integer DEFAULT nextval('entities_id_seq') NOT NULL,
    "entity_name" character varying(255) NOT NULL,
    "tax_id" character varying(100) NOT NULL,
    "entity_type_id" integer NOT NULL,
    "main_address" character varying(200),
    "main_phone" character varying(100),
    "institutional_email" character varying(200),
    "website" character varying(200),
    "main_contact" character varying(100),
    "contact_position" character varying(100),
    "contact_phone" character varying(50),
    "contact_email" character varying(200),
    "last_update_date" date,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "created_by_user_id" integer,
    "updated_at" timestamp,
    "updated_by_user_id" integer,
    CONSTRAINT "pk_entities" PRIMARY KEY ("entity_id")
) WITH (oids = false);

COMMENT ON TABLE "public"."entities" IS 'External entities participating in projects';

COMMENT ON COLUMN "public"."entities"."tax_id" IS 'Tax identification number (NIT)';

CREATE UNIQUE INDEX uk_entities_tax_id ON public.entities USING btree (tax_id);

CREATE INDEX idx_entities_type ON public.entities USING btree (entity_type_id);

CREATE INDEX idx_entities_tax_id ON public.entities USING btree (tax_id);

CREATE INDEX idx_entities_active ON public.entities USING btree (is_active);

INSERT INTO "entities" ("entity_id", "entity_name", "tax_id", "entity_type_id", "main_address", "main_phone", "institutional_email", "website", "main_contact", "contact_position", "contact_phone", "contact_email", "last_update_date", "is_active", "created_at", "created_by_user_id", "updated_at", "updated_by_user_id") VALUES
(1,	'Ministry of National Education',	'899999001-1',	1,	'Calle 43 No. 57-14, Bogotá D.C., Colombia',	'+57 (1) 222-2800',	'contacto@mineducacion.gov.co',	'https://www.mineducacion.gov.co',	'María González Pérez',	'Director of Higher Education',	'+57 (1) 222-2850',	'maria.gonzalez@mineducacion.gov.co',	'2025-10-23',	'1',	'2025-10-23 18:36:32.137772',	1,	NULL,	NULL),
(2,	'Colombian Institute of Educational Development - ICETEX',	'899999002-2',	1,	'Carrera 3 No. 18-32, Bogotá D.C., Colombia',	'+57 (1) 417-3535',	'servicioalcliente@icetex.gov.co',	'https://www.icetex.gov.co',	'Carlos Rodríguez Martínez',	'General Director',	'+57 (1) 417-3540',	'carlos.rodriguez@icetex.gov.co',	'2025-10-23',	'1',	'2025-10-23 18:36:32.137772',	1,	NULL,	NULL);

DROP TABLE IF EXISTS "entity_types";
DROP SEQUENCE IF EXISTS entity_types_id_seq;
CREATE SEQUENCE entity_types_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."entity_types" (
    "entity_type_id" integer DEFAULT nextval('entity_types_id_seq') NOT NULL,
    "type_name" character varying(100) NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "created_by_user_id" integer,
    CONSTRAINT "pk_entity_types" PRIMARY KEY ("entity_type_id")
) WITH (oids = false);

COMMENT ON TABLE "public"."entity_types" IS 'Catalog of entity types';

COMMENT ON COLUMN "public"."entity_types"."entity_type_id" IS 'Primary key';

COMMENT ON COLUMN "public"."entity_types"."type_name" IS 'Name of the entity type';

COMMENT ON COLUMN "public"."entity_types"."is_active" IS 'Indicates if the type is active';

CREATE UNIQUE INDEX uk_entity_types_name ON public.entity_types USING btree (type_name);

INSERT INTO "entity_types" ("entity_type_id", "type_name", "is_active", "created_at", "created_by_user_id") VALUES
(1,	'Public Entity',	'1',	'2025-10-23 18:36:32.117667',	1),
(2,	'Private Entity',	'1',	'2025-10-23 18:36:32.117667',	1);

DROP TABLE IF EXISTS "executing_departments";
DROP SEQUENCE IF EXISTS executing_departments_id_seq;
CREATE SEQUENCE executing_departments_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."executing_departments" (
    "department_id" integer DEFAULT nextval('executing_departments_id_seq') NOT NULL,
    "department_name" character varying(200) NOT NULL,
    "website" character varying(200),
    "address" character varying(200),
    "phone" character varying(50),
    "email" character varying(100),
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "created_by_user_id" integer,
    "updated_at" timestamp,
    "updated_by_user_id" integer,
    CONSTRAINT "pk_executing_departments" PRIMARY KEY ("department_id")
) WITH (oids = false);

COMMENT ON TABLE "public"."executing_departments" IS 'University departments executing projects';

CREATE UNIQUE INDEX uk_executing_departments_name ON public.executing_departments USING btree (department_name);

INSERT INTO "executing_departments" ("department_id", "department_name", "website", "address", "phone", "email", "is_active", "created_at", "created_by_user_id", "updated_at", "updated_by_user_id") VALUES
(1,	'Office of Extension and Social Projection',	'https://extension.udistrital.edu.co',	'Carrera 7 No. 40B-53, Bogotá D.C.',	'+57 (1) 323-9300 Ext. 1501',	'extension@udistrital.edu.co',	'1',	'2025-10-23 18:36:32.141401',	1,	NULL,	NULL),
(2,	'Faculty of Engineering',	'https://ingenieria.udistrital.edu.co',	'Carrera 7 No. 40B-53, Bogotá D.C.',	'+57 (1) 323-9300 Ext. 2001',	'ingenieria@udistrital.edu.co',	'1',	'2025-10-23 18:36:32.141401',	1,	NULL,	NULL);

DROP TABLE IF EXISTS "execution_modalities";
DROP SEQUENCE IF EXISTS execution_modalities_id_seq;
CREATE SEQUENCE execution_modalities_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."execution_modalities" (
    "execution_modality_id" integer DEFAULT nextval('execution_modalities_id_seq') NOT NULL,
    "modality_name" character varying(100) NOT NULL,
    "modality_description" text,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "created_by_user_id" integer,
    "updated_at" timestamp,
    "updated_by_user_id" integer,
    CONSTRAINT "pk_execution_modalities" PRIMARY KEY ("execution_modality_id")
) WITH (oids = false);

COMMENT ON TABLE "public"."execution_modalities" IS 'Catalog of project execution modalities';

CREATE UNIQUE INDEX uk_execution_modalities_name ON public.execution_modalities USING btree (modality_name);

INSERT INTO "execution_modalities" ("execution_modality_id", "modality_name", "modality_description", "is_active", "created_at", "created_by_user_id", "updated_at", "updated_by_user_id") VALUES
(1,	'Direct Execution',	'Project executed directly by the university',	'1',	'2025-10-23 18:36:32.128795',	1,	NULL,	NULL),
(2,	'Indirect Execution',	'Project executed through external contractors',	'1',	'2025-10-23 18:36:32.128795',	1,	NULL,	NULL);

DROP TABLE IF EXISTS "financing_types";
DROP SEQUENCE IF EXISTS financing_types_id_seq;
CREATE SEQUENCE financing_types_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."financing_types" (
    "financing_type_id" integer DEFAULT nextval('financing_types_id_seq') NOT NULL,
    "financing_name" character varying(100) NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    CONSTRAINT "pk_financing_types" PRIMARY KEY ("financing_type_id")
) WITH (oids = false);

COMMENT ON TABLE "public"."financing_types" IS 'Catalog of financing types';

CREATE UNIQUE INDEX uk_financing_types_name ON public.financing_types USING btree (financing_name);

INSERT INTO "financing_types" ("financing_type_id", "financing_name", "is_active") VALUES
(1,	'FINANCED. University = 0%',	'1'),
(2,	'CO-FINANCED. University < 50%',	'1'),
(3,	'COOPERATION. University = 50%',	'1'),
(4,	'SOLIDARITY. University > 50%',	'1'),
(5,	'FRAMEWORK AGREEMENT',	'1'),
(6,	'UNIVERSITY SOCIAL OUTREACH',	'1');

DROP TABLE IF EXISTS "ordering_officials";
DROP SEQUENCE IF EXISTS ordering_officials_id_seq;
CREATE SEQUENCE ordering_officials_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."ordering_officials" (
    "official_id" integer DEFAULT nextval('ordering_officials_id_seq') NOT NULL,
    "first_name" character varying(50) NOT NULL,
    "second_name" character varying(50),
    "first_surname" character varying(50) NOT NULL,
    "second_surname" character varying(50),
    "identification_type" character varying(10) NOT NULL,
    "identification_number" character varying(20) NOT NULL,
    "appointment_resolution" character varying(50),
    "resolution_date" date,
    "institutional_email" character varying(200),
    "phone" character varying(50),
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "created_by_user_id" integer,
    "updated_at" timestamp,
    "updated_by_user_id" integer,
    CONSTRAINT "pk_ordering_officials" PRIMARY KEY ("official_id"),
    CONSTRAINT "ck_ordering_officials_id_type" CHECK (((identification_type)::text = ANY ((ARRAY['CC'::character varying, 'CE'::character varying, 'TI'::character varying, 'PP'::character varying, 'NIT'::character varying])::text[])))
) WITH (oids = false);

COMMENT ON TABLE "public"."ordering_officials" IS 'Officials authorized to order expenditures';

CREATE UNIQUE INDEX uk_ordering_officials_identification ON public.ordering_officials USING btree (identification_type, identification_number);

CREATE INDEX idx_ordering_officials_active ON public.ordering_officials USING btree (is_active);

INSERT INTO "ordering_officials" ("official_id", "first_name", "second_name", "first_surname", "second_surname", "identification_type", "identification_number", "appointment_resolution", "resolution_date", "institutional_email", "phone", "is_active", "created_at", "created_by_user_id", "updated_at", "updated_by_user_id") VALUES
(1,	'Ricardo',	'Antonio',	'García',	'López',	'CC',	'79456123',	'Resolution 001-2024',	'2024-01-15',	'ricardo.garcia@udistrital.edu.co',	'+57 (1) 323-9300 Ext. 1001',	'1',	'2025-10-23 18:36:32.144731',	1,	NULL,	NULL),
(2,	'Ana',	'María',	'Martínez',	'Hernández',	'CC',	'52789456',	'Resolution 002-2024',	'2024-02-01',	'ana.martinez@udistrital.edu.co',	'+57 (1) 323-9300 Ext. 1002',	'1',	'2025-10-23 18:36:32.144731',	1,	NULL,	NULL);

DROP TABLE IF EXISTS "project_document_types";
DROP SEQUENCE IF EXISTS project_document_types_id_seq;
CREATE SEQUENCE project_document_types_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."project_document_types" (
    "document_type_id" integer DEFAULT nextval('project_document_types_id_seq') NOT NULL,
    "type_code" character varying(10) NOT NULL,
    "type_name" character varying(100) NOT NULL,
    "type_description" text,
    "is_active" boolean DEFAULT true NOT NULL,
    CONSTRAINT "pk_project_document_types" PRIMARY KEY ("document_type_id")
) WITH (oids = false);

COMMENT ON TABLE "public"."project_document_types" IS 'Catalog of document types for projects';

CREATE UNIQUE INDEX uk_project_document_types_code ON public.project_document_types USING btree (type_code);

CREATE UNIQUE INDEX uk_project_document_types_name ON public.project_document_types USING btree (type_name);

INSERT INTO "project_document_types" ("document_type_id", "type_code", "type_name", "type_description", "is_active") VALUES
(1,	'CONV',	'Agreement/Convention',	'Main project agreement or convention document',	'1'),
(2,	'RPT',	'Progress Report',	'Project progress and status report',	'1');

DROP TABLE IF EXISTS "project_documents";
DROP SEQUENCE IF EXISTS project_documents_id_seq;
CREATE SEQUENCE project_documents_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."project_documents" (
    "document_id" integer DEFAULT nextval('project_documents_id_seq') NOT NULL,
    "project_year" smallint NOT NULL,
    "internal_project_number" smallint NOT NULL,
    "document_number" integer NOT NULL,
    "document_type_id" integer NOT NULL,
    "document_name" character varying(200) NOT NULL,
    "document_description" text,
    "document_date" date,
    "file_path" character varying(300),
    "original_filename" character varying(200),
    "file_extension" character varying(10),
    "file_size" integer,
    "is_minutes" boolean DEFAULT false,
    "minutes_number" integer,
    "document_status" character varying(20) DEFAULT 'ACTIVE',
    "signature_date" date,
    "document_version" smallint DEFAULT '1',
    "observations" text,
    "is_confidential" boolean DEFAULT false,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "created_by_user_id" integer,
    "updated_at" timestamp,
    "updated_by_user_id" integer,
    CONSTRAINT "pk_project_documents" PRIMARY KEY ("document_id"),
    CONSTRAINT "ck_documents_file_size" CHECK (((file_size IS NULL) OR (file_size > 0)))
) WITH (oids = false);

COMMENT ON TABLE "public"."project_documents" IS 'Documents attached to projects';

COMMENT ON COLUMN "public"."project_documents"."is_minutes" IS 'Indicates if the document is meeting minutes';

COMMENT ON COLUMN "public"."project_documents"."is_confidential" IS 'Indicates if the document is confidential';

CREATE INDEX idx_documents_year ON public.project_documents USING btree (project_year);

CREATE INDEX idx_documents_type ON public.project_documents USING btree (document_type_id);

CREATE INDEX idx_documents_date ON public.project_documents USING btree (document_date);

INSERT INTO "project_documents" ("document_id", "project_year", "internal_project_number", "document_number", "document_type_id", "document_name", "document_description", "document_date", "file_path", "original_filename", "file_extension", "file_size", "is_minutes", "minutes_number", "document_status", "signature_date", "document_version", "observations", "is_confidential", "is_active", "created_at", "created_by_user_id", "updated_at", "updated_by_user_id") VALUES
(1,	2024,	1,	1,	1,	'Main Agreement - STEM Educational Project MEN 2024',	'Principal agreement document between Universidad Distrital and Ministry of National Education for the STEM strengthening project',	'2024-01-15',	'/documents/2024/001/agreement_main_2024-001.pdf',	'Convenio_MEN_STEM_2024_001_Original.pdf',	'pdf',	2458624,	'0',	NULL,	'ACTIVE',	'2024-01-15',	1,	'Original signed agreement. Contains all terms, conditions and responsibilities.',	'0',	'1',	'2025-10-23 18:36:32.193383',	1,	NULL,	NULL),
(2,	2024,	2,	1,	2,	'First Quarter Progress Report - ICETEX Digital Platform',	'Detailed progress report for Q1 2024 covering platform design phase, database architecture and initial development sprint',	'2024-06-30',	'/documents/2024/002/report_q1_2024-002.pdf',	'Informe_Avance_Q1_ICETEX_Plataforma_2024.pdf',	'pdf',	1876543,	'0',	NULL,	'ACTIVE',	NULL,	1,	'Report submitted on time. Includes technical documentation and UI/UX mockups.',	'0',	'1',	'2025-10-23 18:36:32.193383',	1,	NULL,	NULL);

DROP TABLE IF EXISTS "project_modifications";
DROP SEQUENCE IF EXISTS project_modifications_id_seq;
CREATE SEQUENCE project_modifications_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."project_modifications" (
    "modification_id" integer DEFAULT nextval('project_modifications_id_seq') NOT NULL,
    "project_id" integer NOT NULL,
    "modification_number" smallint NOT NULL,
    "modification_type" character varying(20) NOT NULL,
    "addition_value" numeric(15,2),
    "extension_days" integer,
    "new_end_date" date,
    "new_total_value" numeric(15,2),
    "justification" text NOT NULL,
    "administrative_act" character varying(50),
    "approval_date" date,
    "created_by_user_id" integer,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    CONSTRAINT "pk_project_modifications" PRIMARY KEY ("modification_id"),
    CONSTRAINT "ck_modifications_type" CHECK (((modification_type)::text = ANY ((ARRAY['ADDITION'::character varying, 'EXTENSION'::character varying, 'BOTH'::character varying])::text[]))),
    CONSTRAINT "ck_modifications_values" CHECK (((((modification_type)::text = 'ADDITION'::text) AND (addition_value IS NOT NULL)) OR (((modification_type)::text = 'EXTENSION'::text) AND (extension_days IS NOT NULL)) OR (((modification_type)::text = 'BOTH'::text) AND (addition_value IS NOT NULL) AND (extension_days IS NOT NULL))))
) WITH (oids = false);

COMMENT ON TABLE "public"."project_modifications" IS 'Modifications to projects (budget additions, time extensions)';

COMMENT ON COLUMN "public"."project_modifications"."modification_type" IS 'ADDITION: budget increase, EXTENSION: time extension, BOTH: both types';

CREATE INDEX idx_modifications_project ON public.project_modifications USING btree (project_id);

CREATE INDEX idx_modifications_date ON public.project_modifications USING btree (approval_date);

INSERT INTO "project_modifications" ("modification_id", "project_id", "modification_number", "modification_type", "addition_value", "extension_days", "new_end_date", "new_total_value", "justification", "administrative_act", "approval_date", "created_by_user_id", "created_at", "is_active") VALUES
(1,	1,	1,	'EXTENSION',	NULL,	90,	'2025-03-31',	450000000.00,	'Extension required due to delays in educational materials procurement and to complete the full training cycle for all teachers. The Ministry of Education has approved the extension to ensure all objectives are met.',	'Modification Agreement 001-A-2024',	'2024-10-15',	1,	'2025-10-23 18:36:32.186764',	'1'),
(2,	2,	1,	'BOTH',	150000000.00,	180,	'2025-09-30',	1000000000.00,	'Budget addition required due to: 1) Additional integration requirements with third-party banking systems, 2) Enhanced security features requested by ICETEX, 3) Mobile application development scope increase. Time extension needed to properly implement all new requirements and conduct thorough testing.',	'Modification Agreement 045-A-2024',	'2024-09-20',	1,	'2025-10-23 18:36:32.186764',	'1');

DROP TABLE IF EXISTS "project_rup_codes";
DROP SEQUENCE IF EXISTS project_rup_codes_id_seq;
CREATE SEQUENCE project_rup_codes_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."project_rup_codes" (
    "project_rup_code_id" integer DEFAULT nextval('project_rup_codes_id_seq') NOT NULL,
    "project_year" smallint NOT NULL,
    "internal_project_number" smallint NOT NULL,
    "rup_code_id" integer NOT NULL,
    "is_main_code" boolean DEFAULT false,
    "participation_percentage" numeric(5,2),
    "observations" text,
    "assignment_date" date,
    "assigned_by_user_id" integer,
    "is_active" boolean DEFAULT true NOT NULL,
    CONSTRAINT "pk_project_rup_codes" PRIMARY KEY ("project_rup_code_id"),
    CONSTRAINT "ck_project_rup_codes_percentage" CHECK (((participation_percentage IS NULL) OR ((participation_percentage >= (0)::numeric) AND (participation_percentage <= (100)::numeric))))
) WITH (oids = false);

COMMENT ON TABLE "public"."project_rup_codes" IS 'RUP codes assigned to projects';

COMMENT ON COLUMN "public"."project_rup_codes"."is_main_code" IS 'Indicates if this is the primary RUP code for the project';

COMMENT ON COLUMN "public"."project_rup_codes"."participation_percentage" IS 'Percentage of project related to this RUP code';

CREATE INDEX idx_project_rup_codes_year ON public.project_rup_codes USING btree (project_year);

CREATE INDEX idx_project_rup_codes_rup ON public.project_rup_codes USING btree (rup_code_id);

INSERT INTO "project_rup_codes" ("project_rup_code_id", "project_year", "internal_project_number", "rup_code_id", "is_main_code", "participation_percentage", "observations", "assignment_date", "assigned_by_user_id", "is_active") VALUES
(1,	2024,	1,	1,	'1',	100.00,	'Primary classification for educational project. All activities fall under educational services.',	'2024-01-20',	1,	'1'),
(2,	2024,	2,	2,	'1',	100.00,	'Primary classification for software development project. Main deliverable is the digital platform.',	'2024-03-15',	1,	'1');

DROP TABLE IF EXISTS "project_secondary_emails";
DROP SEQUENCE IF EXISTS project_secondary_emails_id_seq;
CREATE SEQUENCE project_secondary_emails_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."project_secondary_emails" (
    "secondary_email_id" integer DEFAULT nextval('project_secondary_emails_id_seq') NOT NULL,
    "project_id" integer NOT NULL,
    "email" character varying(200) NOT NULL,
    "contact_type" character varying(50),
    "contact_name" character varying(100),
    "contact_position" character varying(100),
    "contact_phone" character varying(20),
    "observations" text,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "created_by_user_id" integer,
    "updated_at" timestamp,
    "updated_by_user_id" integer,
    CONSTRAINT "pk_project_secondary_emails" PRIMARY KEY ("secondary_email_id")
) WITH (oids = false);

COMMENT ON TABLE "public"."project_secondary_emails" IS 'Additional contact emails for projects';

CREATE INDEX idx_secondary_emails_project ON public.project_secondary_emails USING btree (project_id);


DROP TABLE IF EXISTS "project_statuses";
DROP SEQUENCE IF EXISTS project_statuses_id_seq;
CREATE SEQUENCE project_statuses_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."project_statuses" (
    "status_id" integer DEFAULT nextval('project_statuses_id_seq') NOT NULL,
    "status_code" character varying(10) NOT NULL,
    "status_name" character varying(100) NOT NULL,
    "status_color" character varying(7),
    "status_order" smallint DEFAULT '1',
    "status_description" text,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "created_by_user_id" integer,
    CONSTRAINT "pk_project_statuses" PRIMARY KEY ("status_id"),
    CONSTRAINT "ck_project_statuses_color" CHECK (((status_color)::text ~ '^#[0-9A-Fa-f]{6}$'::text))
) WITH (oids = false);

COMMENT ON TABLE "public"."project_statuses" IS 'Catalog of project statuses';

COMMENT ON COLUMN "public"."project_statuses"."status_color" IS 'Hexadecimal color code for UI display';

CREATE UNIQUE INDEX uk_project_statuses_code ON public.project_statuses USING btree (status_code);

CREATE UNIQUE INDEX uk_project_statuses_name ON public.project_statuses USING btree (status_name);

INSERT INTO "project_statuses" ("status_id", "status_code", "status_name", "status_color", "status_order", "status_description", "is_active", "created_at", "created_by_user_id") VALUES
(1,	'ACTIVE',	'In Progress',	'#4CAF50',	1,	'Project is currently active and in progress',	'1',	'2025-10-23 18:36:32.125686',	1),
(2,	'COMPLETED',	'Completed',	'#2196F3',	2,	'Project has been successfully completed',	'1',	'2025-10-23 18:36:32.125686',	1);

DROP TABLE IF EXISTS "project_types";
DROP SEQUENCE IF EXISTS project_types_id_seq;
CREATE SEQUENCE project_types_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."project_types" (
    "project_type_id" integer DEFAULT nextval('project_types_id_seq') NOT NULL,
    "type_name" character varying(100) NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    CONSTRAINT "pk_project_types" PRIMARY KEY ("project_type_id")
) WITH (oids = false);

COMMENT ON TABLE "public"."project_types" IS 'Catalog of project types';

CREATE UNIQUE INDEX uk_project_types_name ON public.project_types USING btree (type_name);

INSERT INTO "project_types" ("project_type_id", "type_name", "is_active") VALUES
(1,	'Extension Project',	'1'),
(2,	'Research Project',	'1');

DROP TABLE IF EXISTS "projects";
DROP SEQUENCE IF EXISTS projects_id_seq;
CREATE SEQUENCE projects_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."projects" (
    "project_id" integer DEFAULT nextval('projects_id_seq') NOT NULL,
    "project_year" smallint NOT NULL,
    "internal_project_number" smallint NOT NULL,
    "external_project_number" character varying(20),
    "project_name" character varying(800) NOT NULL,
    "project_purpose" text NOT NULL,
    "entity_id" integer NOT NULL,
    "executing_department_id" integer NOT NULL,
    "project_status_id" integer NOT NULL,
    "project_type_id" integer NOT NULL,
    "financing_type_id" integer NOT NULL,
    "execution_modality_id" integer NOT NULL,
    "contracting_modality_id" integer,
    "project_value" numeric(15,2) NOT NULL,
    "accounting_code" character varying(50),
    "institutional_benefit_percentage" numeric(5,2) DEFAULT '12.00',
    "institutional_benefit_value" numeric(15,2),
    "university_contribution" numeric(15,2) DEFAULT '0',
    "entity_contribution" numeric(15,2),
    "beneficiaries_count" integer,
    "subscription_date" date,
    "start_date" date NOT NULL,
    "end_date" date NOT NULL,
    "ordering_official_id" integer NOT NULL,
    "main_email" character varying(200),
    "administrative_act" character varying(50),
    "secop_link" character varying(1000),
    "observations" text,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "created_by_user_id" integer,
    "updated_at" timestamp,
    "updated_by_user_id" integer,
    CONSTRAINT "pk_projects" PRIMARY KEY ("project_id"),
    CONSTRAINT "ck_projects_value_positive" CHECK ((project_value > (0)::numeric)),
    CONSTRAINT "ck_projects_dates_valid" CHECK ((end_date >= start_date)),
    CONSTRAINT "ck_projects_year_valid" CHECK (((project_year >= 2020) AND (project_year <= 2100))),
    CONSTRAINT "ck_projects_benefit_percentage" CHECK (((institutional_benefit_percentage >= (0)::numeric) AND (institutional_benefit_percentage <= (100)::numeric))),
    CONSTRAINT "ck_projects_contributions" CHECK (((university_contribution >= (0)::numeric) AND (entity_contribution >= (0)::numeric) AND ((university_contribution + entity_contribution) <= project_value)))
) WITH (oids = false);

COMMENT ON TABLE "public"."projects" IS 'Main projects table containing all project information';

COMMENT ON COLUMN "public"."projects"."project_value" IS 'Total value of the project in COP';

COMMENT ON COLUMN "public"."projects"."institutional_benefit_percentage" IS 'Percentage of institutional benefit (default 12%)';

COMMENT ON COLUMN "public"."projects"."secop_link" IS 'Link to SECOP (Colombian procurement system)';

CREATE UNIQUE INDEX uk_projects_year_number ON public.projects USING btree (project_year, internal_project_number);

CREATE INDEX idx_projects_status ON public.projects USING btree (project_status_id);

CREATE INDEX idx_projects_year ON public.projects USING btree (project_year);

CREATE INDEX idx_projects_entity ON public.projects USING btree (entity_id);

CREATE INDEX idx_projects_department ON public.projects USING btree (executing_department_id);

CREATE INDEX idx_projects_start_date ON public.projects USING btree (start_date);

CREATE INDEX idx_projects_end_date ON public.projects USING btree (end_date);

CREATE INDEX idx_projects_type ON public.projects USING btree (project_type_id);

CREATE INDEX idx_projects_active ON public.projects USING btree (is_active);

INSERT INTO "projects" ("project_id", "project_year", "internal_project_number", "external_project_number", "project_name", "project_purpose", "entity_id", "executing_department_id", "project_status_id", "project_type_id", "financing_type_id", "execution_modality_id", "contracting_modality_id", "project_value", "accounting_code", "institutional_benefit_percentage", "institutional_benefit_value", "university_contribution", "entity_contribution", "beneficiaries_count", "subscription_date", "start_date", "end_date", "ordering_official_id", "main_email", "administrative_act", "secop_link", "observations", "is_active", "created_at", "created_by_user_id", "updated_at", "updated_by_user_id") VALUES
(1,	2024,	1,	'MEN-CONV-2024-001',	'Strengthening of Educational Competencies in STEM Areas for Secondary Education',	'Develop and implement an innovative pedagogical program for strengthening competencies in Science, Technology, Engineering and Mathematics (STEM) in public secondary education institutions in Bogotá, benefiting approximately 500 students and 50 teachers through specialized workshops, educational materials and continuous follow-up.',	1,	1,	1,	1,	1,	1,	2,	450000000.00,	'A-1234-2024',	12.00,	54000000.00,	0.00,	450000000.00,	500,	'2024-01-15',	'2024-02-01',	'2024-12-31',	1,	'proyecto.stem@udistrital.edu.co',	'Agreement 001-2024',	'https://www.colombiacompra.gov.co/secop/2024-001',	'Priority project for the institution. Monthly follow-up meetings scheduled.',	'1',	'2025-10-23 18:36:32.151946',	1,	NULL,	NULL),
(2,	2024,	2,	'ICETEX-2024-045',	'Development of Digital Platform for Student Loan Management and Tracking',	'Design, develop and implement a comprehensive digital platform that allows students and ICETEX to efficiently manage educational loan applications, approvals, disbursements and tracking. The system must include mobile application, web portal, automated notifications and integration with existing financial systems.',	2,	2,	1,	1,	2,	1,	1,	850000000.00,	'A-2345-2024',	12.00,	102000000.00,	200000000.00,	650000000.00,	100000,	'2024-03-10',	'2024-04-01',	'2025-03-31',	2,	'plataforma.icetex@udistrital.edu.co',	'Resolution 045-2024',	'https://www.colombiacompra.gov.co/secop/2024-045',	'Strategic project. Requires specialized software development team. Agile methodology approved.',	'1',	'2025-10-23 18:36:32.151946',	1,	NULL,	NULL);

DROP TABLE IF EXISTS "rup_codes";
DROP SEQUENCE IF EXISTS rup_codes_id_seq;
CREATE SEQUENCE rup_codes_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."rup_codes" (
    "rup_code_id" integer DEFAULT nextval('rup_codes_id_seq') NOT NULL,
    "rup_code" character varying(20) NOT NULL,
    "code_description" text NOT NULL,
    "main_category" character varying(100),
    "subcategory" character varying(100),
    "hierarchy_level" smallint,
    "parent_code" character varying(20),
    "keywords" text,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "created_by_user_id" integer,
    CONSTRAINT "pk_rup_codes" PRIMARY KEY ("rup_code_id")
) WITH (oids = false);

COMMENT ON TABLE "public"."rup_codes" IS 'RUP classification codes for procurement';

COMMENT ON COLUMN "public"."rup_codes"."parent_code" IS 'Parent code for hierarchical structure';

CREATE UNIQUE INDEX uk_rup_codes_code ON public.rup_codes USING btree (rup_code);

CREATE INDEX idx_rup_codes_active ON public.rup_codes USING btree (is_active);

CREATE INDEX idx_rup_codes_parent ON public.rup_codes USING btree (parent_code);

INSERT INTO "rup_codes" ("rup_code_id", "rup_code", "code_description", "main_category", "subcategory", "hierarchy_level", "parent_code", "keywords", "is_active", "created_at", "created_by_user_id") VALUES
(1,	'80111500',	'Educational and training services',	'Professional, Scientific and Technical Services',	'Education and Training',	2,	'80110000',	'education, training, courses, workshops, academic services',	'1',	'2025-10-23 18:36:32.148238',	1),
(2,	'81112000',	'Software development services',	'Information Technology Services',	'Software Development',	2,	'81110000',	'software, programming, development, applications, systems',	'1',	'2025-10-23 18:36:32.148238',	1);

ALTER TABLE ONLY "public"."entities" ADD CONSTRAINT "fk_entities_entity_types" FOREIGN KEY (entity_type_id) REFERENCES entity_types(entity_type_id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."project_documents" ADD CONSTRAINT "fk_documents_document_types" FOREIGN KEY (document_type_id) REFERENCES project_document_types(document_type_id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."project_modifications" ADD CONSTRAINT "fk_modifications_projects" FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."project_rup_codes" ADD CONSTRAINT "fk_project_rup_codes_rup_codes" FOREIGN KEY (rup_code_id) REFERENCES rup_codes(rup_code_id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."project_secondary_emails" ADD CONSTRAINT "fk_secondary_emails_projects" FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."projects" ADD CONSTRAINT "fk_projects_contracting_modalities" FOREIGN KEY (contracting_modality_id) REFERENCES contracting_modalities(contracting_modality_id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."projects" ADD CONSTRAINT "fk_projects_departments" FOREIGN KEY (executing_department_id) REFERENCES executing_departments(department_id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."projects" ADD CONSTRAINT "fk_projects_entities" FOREIGN KEY (entity_id) REFERENCES entities(entity_id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."projects" ADD CONSTRAINT "fk_projects_execution_modalities" FOREIGN KEY (execution_modality_id) REFERENCES execution_modalities(execution_modality_id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."projects" ADD CONSTRAINT "fk_projects_financing_types" FOREIGN KEY (financing_type_id) REFERENCES financing_types(financing_type_id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."projects" ADD CONSTRAINT "fk_projects_ordering_officials" FOREIGN KEY (ordering_official_id) REFERENCES ordering_officials(official_id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."projects" ADD CONSTRAINT "fk_projects_project_types" FOREIGN KEY (project_type_id) REFERENCES project_types(project_type_id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."projects" ADD CONSTRAINT "fk_projects_statuses" FOREIGN KEY (project_status_id) REFERENCES project_statuses(status_id) NOT DEFERRABLE;

-- 2025-10-23 18:40:50 UTC