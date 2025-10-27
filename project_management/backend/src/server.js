import express from 'express';
import cors from 'cors';
import { testConnection, getDatabaseStats } from './config/database.js';
import { pool } from './config/database.js';

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', async (req, res) => {
  const dbConnection = await testConnection();
  const stats = dbConnection.success ? await getDatabaseStats() : [];
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnection,
    tables: stats
  });
});

// Connection status
app.get('/api/connection-status', async (req, res) => {
  const dbConnection = await testConnection();
  
  res.json({
    connected: dbConnection.success,
    details: dbConnection
  });
});

// ============================================
// ENDPOINTS DE CATÁLOGOS
// ============================================

// ========== ENTIDADES ==========
app.get('/api/entities', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT 
        entity_id as id, 
        entity_name as name, 
        tax_id as nit, 
        CASE entity_type_id 
          WHEN 1 THEN 'Public Entity'
          WHEN 2 THEN 'Private Entity'
          ELSE 'Unknown'
        END as type,
        entity_type_id as type_id,
        main_address as address,
        main_phone as phone,
        institutional_email as email,
        website,
        main_contact as contact_name,
        contact_position,
        contact_phone as contact_phone_number,
        contact_email,
        is_active as active 
      FROM entities 
      ORDER BY entity_id`
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener entidades:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/entities/active', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT 
        entity_id as id, 
        entity_name as name, 
        tax_id as nit, 
        CASE entity_type_id 
          WHEN 1 THEN 'Public Entity'
          WHEN 2 THEN 'Private Entity'
          ELSE 'Unknown'
        END as type,
        entity_type_id as type_id,
        main_address as address,
        main_phone as phone,
        institutional_email as email,
        website,
        main_contact as contact_name,
        contact_position,
        contact_phone as contact_phone_number,
        contact_email,
        is_active as active 
      FROM entities 
      WHERE is_active = true 
      ORDER BY entity_name`
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/entities', async (req, res) => {
  try {
    const { 
      name, 
      nit, 
      type, 
      address, 
      phone, 
      email, 
      website, 
      contact_name, 
      contact_position, 
      contact_phone_number, 
      contact_email 
    } = req.body;
    
    if (!name || !nit || !type) {
      return res.status(400).json({ error: 'Nombre, NIT y Tipo son obligatorios' });
    }
    
    const typeId = type === 'Public Entity' ? 1 : 2;
    
    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO entities (
        entity_name, 
        tax_id, 
        entity_type_id, 
        main_address, 
        main_phone, 
        institutional_email, 
        website, 
        main_contact, 
        contact_position, 
        contact_phone, 
        contact_email,
        is_active, 
        created_at, 
        created_by_user_id
      ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, CURRENT_TIMESTAMP, 1) 
       RETURNING 
        entity_id as id, 
        entity_name as name, 
        tax_id as nit, 
        CASE entity_type_id 
          WHEN 1 THEN 'Public Entity'
          WHEN 2 THEN 'Private Entity'
        END as type,
        entity_type_id as type_id,
        main_address as address,
        main_phone as phone,
        institutional_email as email,
        website,
        main_contact as contact_name,
        contact_position,
        contact_phone as contact_phone_number,
        contact_email,
        is_active as active`,
      [name, nit, typeId, address, phone, email, website, contact_name, contact_position, contact_phone_number, contact_email]
    );
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear entidad:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una entidad con ese NIT' });
    }
    
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/entities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      nit, 
      type, 
      address, 
      phone, 
      email, 
      website, 
      contact_name, 
      contact_position, 
      contact_phone_number, 
      contact_email 
    } = req.body;
    
    if (!name || !nit || !type) {
      return res.status(400).json({ error: 'Nombre, NIT y Tipo son obligatorios' });
    }
    
    const typeId = type === 'Public Entity' ? 1 : 2;
    
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE entities 
       SET 
        entity_name = $1, 
        tax_id = $2, 
        entity_type_id = $3, 
        main_address = $4, 
        main_phone = $5, 
        institutional_email = $6, 
        website = $7, 
        main_contact = $8, 
        contact_position = $9, 
        contact_phone = $10, 
        contact_email = $11,
        updated_at = CURRENT_TIMESTAMP, 
        updated_by_user_id = 1 
       WHERE entity_id = $12 
       RETURNING 
        entity_id as id, 
        entity_name as name, 
        tax_id as nit,
        CASE entity_type_id 
          WHEN 1 THEN 'Public Entity'
          WHEN 2 THEN 'Private Entity'
        END as type,
        entity_type_id as type_id,
        main_address as address,
        main_phone as phone,
        institutional_email as email,
        website,
        main_contact as contact_name,
        contact_position,
        contact_phone as contact_phone_number,
        contact_email,
        is_active as active`,
      [name, nit, typeId, address, phone, email, website, contact_name, contact_position, contact_phone_number, contact_email, id]
    );
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entidad no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar entidad:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una entidad con ese NIT' });
    }
    
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/entities/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE entities 
       SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP, updated_by_user_id = 1 
       WHERE entity_id = $1 
       RETURNING 
        entity_id as id, 
        entity_name as name, 
        tax_id as nit,
        CASE entity_type_id 
          WHEN 1 THEN 'Public Entity'
          WHEN 2 THEN 'Private Entity'
        END as type,
        entity_type_id as type_id,
        main_address as address,
        main_phone as phone,
        institutional_email as email,
        website,
        main_contact as contact_name,
        contact_position,
        contact_phone as contact_phone_number,
        contact_email,
        is_active as active`,
      [id]
    );
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entidad no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== DEPENDENCIAS ==========
app.get('/api/dependencies', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT 
        department_id as id, 
        department_name as name,
        website,
        address,
        phone,
        email,
        is_active as active 
      FROM executing_departments 
      ORDER BY department_id`
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener dependencias:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dependencies/active', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT 
        department_id as id, 
        department_name as name,
        website,
        address,
        phone,
        email,
        is_active as active 
      FROM executing_departments 
      WHERE is_active = true 
      ORDER BY department_name`
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/dependencies', async (req, res) => {
  try {
    const { name, website, address, phone, email } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    
    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO executing_departments (department_name, website, address, phone, email, is_active, created_by_user_id) 
       VALUES ($1, $2, $3, $4, $5, true, 1) 
       RETURNING department_id as id, department_name as name, website, address, phone, email, is_active as active`,
      [name, website, address, phone, email]
    );
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear dependencia:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/dependencies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, website, address, phone, email } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE executing_departments 
       SET department_name = $1, website = $2, address = $3, phone = $4, email = $5, updated_at = CURRENT_TIMESTAMP, updated_by_user_id = 1 
       WHERE department_id = $6 
       RETURNING department_id as id, department_name as name, website, address, phone, email, is_active as active`,
      [name, website, address, phone, email, id]
    );
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dependencia no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar dependencia:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/dependencies/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE executing_departments 
       SET is_active = NOT is_active 
       WHERE department_id = $1 
       RETURNING department_id as id, department_name as name, website, address, phone, email, is_active as active`,
      [id]
    );
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dependencia no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== TIPOS DE PROYECTO ==========
app.get('/api/project-types', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT 
        project_type_id as id, 
        type_name as name,
        is_active as active 
      FROM project_types 
      ORDER BY project_type_id`
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener tipos de proyecto:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/project-types/active', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT 
        project_type_id as id, 
        type_name as name,
        is_active as active 
      FROM project_types 
      WHERE is_active = true 
      ORDER BY type_name`
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/project-types', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    
    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO project_types (type_name, is_active) 
       VALUES ($1, true) 
       RETURNING project_type_id as id, type_name as name, is_active as active`,
      [name]
    );
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear tipo de proyecto:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/project-types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE project_types 
       SET type_name = $1 
       WHERE project_type_id = $2 
       RETURNING project_type_id as id, type_name as name, is_active as active`,
      [name, id]
    );
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tipo de proyecto no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar tipo de proyecto:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/project-types/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE project_types 
       SET is_active = NOT is_active 
       WHERE project_type_id = $1 
       RETURNING project_type_id as id, type_name as name, is_active as active`,
      [id]
    );
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tipo de proyecto no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== TIPOS DE FINANCIACIÓN ==========
app.get('/api/financing-types', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT 
        financing_type_id as id, 
        financing_name as name,
        is_active as active 
      FROM financing_types 
      ORDER BY financing_type_id`
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener tipos de financiación:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/financing-types/active', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT 
        financing_type_id as id, 
        financing_name as name,
        is_active as active 
      FROM financing_types 
      WHERE is_active = true 
      ORDER BY financing_type_id`
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener tipos de financiación activos:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/financing-types', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    
    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO financing_types (financing_name, is_active) 
       VALUES ($1, true) 
       RETURNING financing_type_id as id, financing_name as name, is_active as active`,
      [name]
    );
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear tipo de financiación:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/financing-types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE financing_types 
       SET financing_name = $1 
       WHERE financing_type_id = $2 
       RETURNING financing_type_id as id, financing_name as name, is_active as active`,
      [name, id]
    );
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tipo de financiación no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar tipo de financiación:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/financing-types/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE financing_types 
       SET is_active = NOT is_active 
       WHERE financing_type_id = $1 
       RETURNING financing_type_id as id, financing_name as name, is_active as active`,
      [id]
    );
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tipo de financiación no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== MODALIDADES DE EJECUCIÓN ==========
app.get('/api/execution-modalities', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT 
        execution_modality_id as id, 
        modality_name as name, 
        modality_description as description, 
        is_active as active 
      FROM execution_modalities 
      ORDER BY execution_modality_id`
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener modalidades de ejecución:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/execution-modalities/active', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT 
        execution_modality_id as id, 
        modality_name as name, 
        modality_description as description, 
        is_active as active 
      FROM execution_modalities 
      WHERE is_active = true 
      ORDER BY modality_name`
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/execution-modalities', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    
    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO execution_modalities (modality_name, modality_description, is_active, created_by_user_id) 
       VALUES ($1, $2, true, 1) 
       RETURNING execution_modality_id as id, modality_name as name, modality_description as description, is_active as active`,
      [name, description]
    );
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear modalidad de ejecución:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/execution-modalities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE execution_modalities 
       SET modality_name = $1, modality_description = $2, updated_at = CURRENT_TIMESTAMP, updated_by_user_id = 1 
       WHERE execution_modality_id = $3 
       RETURNING execution_modality_id as id, modality_name as name, modality_description as description, is_active as active`,
      [name, description, id]
    );
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Modalidad de ejecución no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar modalidad de ejecución:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/execution-modalities/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE execution_modalities 
       SET is_active = NOT is_active 
       WHERE execution_modality_id = $1 
       RETURNING execution_modality_id as id, modality_name as name, modality_description as description, is_active as active`,
      [id]
    );
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Modalidad de ejecución no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== MODALIDADES DE CONTRATACIÓN ==========
app.get('/api/contracting-modalities', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT 
        contracting_modality_id as id, 
        modality_name as name, 
        modality_description as description, 
        is_active as active 
      FROM contracting_modalities 
      ORDER BY contracting_modality_id`
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener modalidades de contratación:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/contracting-modalities/active', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT 
        contracting_modality_id as id, 
        modality_name as name, 
        modality_description as description, 
        is_active as active 
      FROM contracting_modalities 
      WHERE is_active = true 
      ORDER BY modality_name`
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/contracting-modalities', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    
    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO contracting_modalities (modality_name, modality_description, is_active, created_by_user_id) 
       VALUES ($1, $2, true, 1) 
       RETURNING contracting_modality_id as id, modality_name as name, modality_description as description, is_active as active`,
      [name, description]
    );
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear modalidad de contratación:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/contracting-modalities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE contracting_modalities 
       SET modality_name = $1, modality_description = $2, updated_at = CURRENT_TIMESTAMP, updated_by_user_id = 1 
       WHERE contracting_modality_id = $3 
       RETURNING contracting_modality_id as id, modality_name as name, modality_description as description, is_active as active`,
      [name, description, id]
    );
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Modalidad de contratación no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar modalidad de contratación:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/contracting-modalities/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE contracting_modalities 
       SET is_active = NOT is_active 
       WHERE contracting_modality_id = $1 
       RETURNING contracting_modality_id as id, modality_name as name, modality_description as description, is_active as active`,
      [id]
    );
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Modalidad de contratación no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== ESTADOS DE PROYECTO ==========
app.get('/api/project-states', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT 
        status_id as id, 
        status_name as name, 
        status_code as code, 
        status_color as color,
        status_description as description,
        is_active as active 
      FROM project_statuses 
      ORDER BY status_order, status_id`
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener estados:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/project-states/active', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT 
        status_id as id, 
        status_name as name, 
        status_code as code, 
        status_color as color,
        status_description as description,
        is_active as active 
      FROM project_statuses 
      WHERE is_active = true 
      ORDER BY status_order, status_id`
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/project-states', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    
    const code = name.substring(0, 10).toUpperCase().replace(/\s/g, '_');
    
    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO project_statuses (status_code, status_name, status_description, status_color, is_active, created_by_user_id) 
       VALUES ($1, $2, $3, '#4CAF50', true, 1) 
       RETURNING status_id as id, status_name as name, status_code as code, status_color as color, status_description as description, is_active as active`,
      [code, name, description]
    );
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear estado:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/project-states/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE project_statuses 
       SET status_name = $1, status_description = $2 
       WHERE status_id = $3 
       RETURNING status_id as id, status_name as name, status_code as code, status_color as color, status_description as description, is_active as active`,
      [name, description, id]
    );
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estado no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/project-states/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE project_statuses 
       SET is_active = NOT is_active 
       WHERE status_id = $1 
       RETURNING status_id as id, status_name as name, status_code as code, status_color as color, status_description as description, is_active as active`,
      [id]
    );
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estado no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== FUNCIONARIOS ORDENADORES ==========
app.get('/api/officials', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT 
        official_id as id, 
        first_name,
        second_name,
        first_surname,
        second_surname,
        CONCAT(first_name, ' ', COALESCE(second_name, ''), ' ', first_surname, ' ', COALESCE(second_surname, '')) as name,
        identification_type,
        identification_number,
        appointment_resolution as position,
        resolution_date,
        institutional_email as email,
        phone,
        is_active as active 
      FROM ordering_officials 
      ORDER BY official_id`
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener funcionarios:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/officials/active', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT 
        official_id as id, 
        first_name,
        second_name,
        first_surname,
        second_surname,
        CONCAT(first_name, ' ', COALESCE(second_name, ''), ' ', first_surname, ' ', COALESCE(second_surname, '')) as name,
        identification_type,
        identification_number,
        appointment_resolution as position,
        resolution_date,
        institutional_email as email,
        phone,
        is_active as active 
      FROM ordering_officials 
      WHERE is_active = true 
      ORDER BY first_name`
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/officials', async (req, res) => {
  try {
    const { 
      first_name, 
      second_name, 
      first_surname, 
      second_surname, 
      identification_type, 
      identification_number, 
      position, 
      resolution_date, 
      email, 
      phone 
    } = req.body;
    
    if (!first_name || !first_surname || !identification_type || !identification_number) {
      return res.status(400).json({ error: 'Primer nombre, primer apellido, tipo y número de identificación son obligatorios' });
    }
    
    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO ordering_officials (
        first_name, 
        second_name, 
        first_surname, 
        second_surname, 
        identification_type, 
        identification_number, 
        appointment_resolution, 
        resolution_date, 
        institutional_email, 
        phone, 
        is_active, 
        created_by_user_id
      ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, 1) 
       RETURNING 
        official_id as id, 
        first_name,
        second_name,
        first_surname,
        second_surname,
        CONCAT(first_name, ' ', COALESCE(second_name, ''), ' ', first_surname, ' ', COALESCE(second_surname, '')) as name,
        identification_type,
        identification_number,
        appointment_resolution as position, 
        resolution_date,
        institutional_email as email, 
        phone, 
        is_active as active`,
      [first_name, second_name, first_surname, second_surname, identification_type, identification_number, position, resolution_date, email, phone]
    );
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear funcionario:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un funcionario con esa identificación' });
    }
    
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/officials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      first_name, 
      second_name, 
      first_surname, 
      second_surname, 
      identification_type, 
      identification_number, 
      position, 
      resolution_date, 
      email, 
      phone 
    } = req.body;
    
    if (!first_name || !first_surname || !identification_type || !identification_number) {
      return res.status(400).json({ error: 'Primer nombre, primer apellido, tipo y número de identificación son obligatorios' });
    }
    
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE ordering_officials 
       SET 
        first_name = $1, 
        second_name = $2, 
        first_surname = $3, 
        second_surname = $4, 
        identification_type = $5, 
        identification_number = $6, 
        appointment_resolution = $7, 
        resolution_date = $8, 
        institutional_email = $9, 
        phone = $10, 
        updated_at = CURRENT_TIMESTAMP, 
        updated_by_user_id = 1 
       WHERE official_id = $11 
       RETURNING 
        official_id as id,
        first_name,
        second_name,
        first_surname,
        second_surname,
        CONCAT(first_name, ' ', COALESCE(second_name, ''), ' ', first_surname, ' ', COALESCE(second_surname, '')) as name,
        identification_type,
        identification_number,
        appointment_resolution as position, 
        resolution_date,
        institutional_email as email, 
        phone, 
        is_active as active`,
      [first_name, second_name, first_surname, second_surname, identification_type, identification_number, position, resolution_date, email, phone, id]
    );
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionario no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar funcionario:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un funcionario con esa identificación' });
    }
    
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/officials/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE ordering_officials 
       SET is_active = NOT is_active 
       WHERE official_id = $1 
       RETURNING 
        official_id as id,
        first_name,
        second_name,
        first_surname,
        second_surname,
        CONCAT(first_name, ' ', COALESCE(second_name, ''), ' ', first_surname, ' ', COALESCE(second_surname, '')) as name,
        identification_type,
        identification_number,
        appointment_resolution as position, 
        resolution_date,
        institutional_email as email, 
        phone, 
        is_active as active`,
      [id]
    );
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionario no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PROYECTOS
// ============================================

// ========== FUNCIONES AUXILIARES ==========

/**
 * Limpia un número formateado y lo convierte a float
 * Ejemplo: "450.000.000" → 450000000
 */
function cleanNumber(value) {
  if (!value || value === '') return null;
  if (typeof value === 'number') return value;
  return parseFloat(value.toString().replace(/\./g, ''));
}

/**
 * Genera el siguiente número interno de proyecto para un año dado
 */
async function getNextProjectNumber(client, year) {
  const result = await client.query(
    `SELECT COALESCE(MAX(internal_project_number), 0) + 1 as next_number
     FROM projects 
     WHERE project_year = $1`,
    [year]
  );
  return result.rows[0].next_number;
}

/**
 * Valida que todos los campos requeridos estén presentes
 */
function validateProjectData(data) {
  const errors = [];
  
  const requiredFields = [
    { field: 'anio_proyecto', name: 'Año del proyecto' },
    { field: 'nombre_proyecto', name: 'Nombre del proyecto' },
    { field: 'objeto_proyecto', name: 'Objeto del proyecto' },
    { field: 'entidad_id', name: 'Entidad' },
    { field: 'dependencia_ejecutora_id', name: 'Dependencia ejecutora' },
    { field: 'estado_proyecto_id', name: 'Estado del proyecto' },
    { field: 'tipo_proyecto_id', name: 'Tipo de proyecto' },
    { field: 'tipo_financiacion_id', name: 'Tipo de financiación' },
    { field: 'modalidad_ejecucion_id', name: 'Modalidad de ejecución' },
    { field: 'valor_proyecto', name: 'Valor del proyecto' },
    { field: 'fecha_inicio', name: 'Fecha de inicio' },
    { field: 'fecha_finalizacion', name: 'Fecha de finalización' },
    { field: 'funcionario_ordenador_id', name: 'Funcionario ordenador' }
  ];
  
  for (const { field, name } of requiredFields) {
    if (!data[field] || data[field] === '') {
      errors.push(`${name} es obligatorio`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// ========== ENDPOINTS DE PROYECTOS ==========

// GET - Listar todos los proyectos
app.get('/api/projects', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT 
        p.project_id as id,
        p.project_year as year,
        p.internal_project_number as internal_number,
        p.external_project_number as external_number,
        CONCAT(p.project_year, '-', LPAD(p.internal_project_number::text, 3, '0')) as code,
        p.project_name as name,
        p.project_purpose as purpose,
        p.project_value as value,
        p.start_date,
        p.end_date,
        p.is_active as active,
        e.entity_name as entity,
        ed.department_name as department,
        ps.status_name as status,
        pt.type_name as type,
        ft.financing_name as financing,
        em.modality_name as execution_modality,
        cm.modality_name as contracting_modality,
        CONCAT(oo.first_name, ' ', oo.first_surname) as ordering_official
      FROM projects p
      LEFT JOIN entities e ON p.entity_id = e.entity_id
      LEFT JOIN executing_departments ed ON p.executing_department_id = ed.department_id
      LEFT JOIN project_statuses ps ON p.project_status_id = ps.status_id
      LEFT JOIN project_types pt ON p.project_type_id = pt.project_type_id
      LEFT JOIN financing_types ft ON p.financing_type_id = ft.financing_type_id
      LEFT JOIN execution_modalities em ON p.execution_modality_id = em.execution_modality_id
      LEFT JOIN contracting_modalities cm ON p.contracting_modality_id = cm.contracting_modality_id
      LEFT JOIN ordering_officials oo ON p.ordering_official_id = oo.official_id
      WHERE p.is_active = true
      ORDER BY p.project_year DESC, p.internal_project_number DESC`
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener un proyecto por ID
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    
    // Obtener proyecto principal
    const projectResult = await client.query(
      `SELECT 
        p.*,
        e.entity_name,
        ed.department_name,
        ps.status_name,
        pt.type_name,
        ft.financing_name,
        em.modality_name as execution_modality_name,
        cm.modality_name as contracting_modality_name,
        CONCAT(oo.first_name, ' ', oo.first_surname) as ordering_official_name
      FROM projects p
      LEFT JOIN entities e ON p.entity_id = e.entity_id
      LEFT JOIN executing_departments ed ON p.executing_department_id = ed.department_id
      LEFT JOIN project_statuses ps ON p.project_status_id = ps.status_id
      LEFT JOIN project_types pt ON p.project_type_id = pt.project_type_id
      LEFT JOIN financing_types ft ON p.financing_type_id = ft.financing_type_id
      LEFT JOIN execution_modalities em ON p.execution_modality_id = em.execution_modality_id
      LEFT JOIN contracting_modalities cm ON p.contracting_modality_id = cm.contracting_modality_id
      LEFT JOIN ordering_officials oo ON p.ordering_official_id = oo.official_id
      WHERE p.project_id = $1`,
      [id]
    );
    
    if (projectResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    // Obtener correos secundarios
    const emailsResult = await client.query(
      `SELECT email 
       FROM project_secondary_emails 
       WHERE project_id = $1 AND is_active = true`,
      [id]
    );
    
    client.release();
    
    const project = projectResult.rows[0];
    project.secondary_emails = emailsResult.rows.map(row => row.email);
    
    res.json(project);
  } catch (error) {
    console.error('Error al obtener proyecto:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear nuevo proyecto
app.post('/api/projects', async (req, res) => {
  const client = await pool.connect();
  
  try {
    // 1. Validar datos requeridos
    const validation = validateProjectData(req.body);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validation.errors 
      });
    }
    
    // 2. Extraer y limpiar datos
    const {
      anio_proyecto,
      numero_proyecto_externo,
      nombre_proyecto,
      objeto_proyecto,
      entidad_id,
      dependencia_ejecutora_id,
      estado_proyecto_id,
      tipo_proyecto_id,
      tipo_financiacion_id,
      modalidad_ejecucion_id,
      modalidad_contratacion_id,
      valor_proyecto,
      codigo_contable,
      porcentaje_beneficio,
      valor_beneficio,
      aporte_universidad,
      aporte_entidad,
      cantidad_beneficiarios,
      fecha_suscripcion,
      fecha_inicio,
      fecha_finalizacion,
      funcionario_ordenador_id,
      correo_principal,
      acto_administrativo,
      enlace_secop,
      observaciones,
      correos_secundarios
    } = req.body;
    
    // Limpiar números (quitar separadores de miles)
    const projectValue = cleanNumber(valor_proyecto);
    const benefitValue = cleanNumber(valor_beneficio);
    const univContribution = cleanNumber(aporte_universidad);
    const entityContribution = cleanNumber(aporte_entidad);
    
    // 3. Validaciones adicionales
    if (projectValue <= 0) {
      return res.status(400).json({ error: 'El valor del proyecto debe ser mayor a cero' });
    }
    
    if (new Date(fecha_finalizacion) < new Date(fecha_inicio)) {
      return res.status(400).json({ error: 'La fecha de finalización debe ser posterior a la fecha de inicio' });
    }
    
    // 4. Iniciar transacción
    await client.query('BEGIN');
    
    // 5. Auto-generar número interno de proyecto
    const internalNumber = await getNextProjectNumber(client, anio_proyecto);
    
    console.log(`🔢 Generando proyecto: ${anio_proyecto}-${internalNumber}`);
    
    // 6. Insertar proyecto principal
    const projectResult = await client.query(
      `INSERT INTO projects (
        project_year,
        internal_project_number,
        external_project_number,
        project_name,
        project_purpose,
        entity_id,
        executing_department_id,
        project_status_id,
        project_type_id,
        financing_type_id,
        execution_modality_id,
        contracting_modality_id,
        project_value,
        accounting_code,
        institutional_benefit_percentage,
        institutional_benefit_value,
        university_contribution,
        entity_contribution,
        beneficiaries_count,
        subscription_date,
        start_date,
        end_date,
        ordering_official_id,
        main_email,
        administrative_act,
        secop_link,
        observations,
        is_active,
        created_by_user_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, true, NULL
      ) RETURNING project_id`,
      [
        anio_proyecto,
        internalNumber,
        numero_proyecto_externo || null,
        nombre_proyecto,
        objeto_proyecto,
        entidad_id,
        dependencia_ejecutora_id,
        estado_proyecto_id,
        tipo_proyecto_id,
        tipo_financiacion_id,
        modalidad_ejecucion_id,
        modalidad_contratacion_id || null,
        projectValue,
        codigo_contable || null,
        porcentaje_beneficio || 12,
        benefitValue,
        univContribution || 0,
        entityContribution,
        cantidad_beneficiarios || null,
        fecha_suscripcion || null,
        fecha_inicio,
        fecha_finalizacion,
        funcionario_ordenador_id,
        correo_principal || null,
        acto_administrativo || null,
        enlace_secop || null,
        observaciones || null
      ]
    );
    
    const projectId = projectResult.rows[0].project_id;
    
    console.log(`✅ Proyecto creado con ID: ${projectId}`);
    
    // 7. Insertar correos secundarios (si existen)
    if (correos_secundarios && Array.isArray(correos_secundarios) && correos_secundarios.length > 0) {
      for (const email of correos_secundarios) {
        if (email && email.trim() !== '') {
          await client.query(
            `INSERT INTO project_secondary_emails (project_id, email, is_active)
             VALUES ($1, $2, true)`,
            [projectId, email.trim()]
          );
        }
      }
      console.log(`📧 ${correos_secundarios.length} correos secundarios agregados`);
    }
    
    // 8. Confirmar transacción
    await client.query('COMMIT');
    
    // 9. Obtener el proyecto completo para devolver
    const fullProjectResult = await client.query(
      `SELECT 
        p.project_id as id,
        p.project_year as year,
        p.internal_project_number as internal_number,
        p.external_project_number as external_number,
        CONCAT(p.project_year, '-', LPAD(p.internal_project_number::text, 3, '0')) as code,
        p.project_name as name,
        p.project_purpose as purpose,
        p.project_value as value,
        p.start_date,
        p.end_date,
        e.entity_name as entity,
        ed.department_name as department,
        ps.status_name as status
      FROM projects p
      LEFT JOIN entities e ON p.entity_id = e.entity_id
      LEFT JOIN executing_departments ed ON p.executing_department_id = ed.department_id
      LEFT JOIN project_statuses ps ON p.project_status_id = ps.status_id
      WHERE p.project_id = $1`,
      [projectId]
    );
    
    console.log(`🎉 Proyecto ${anio_proyecto}-${internalNumber} creado exitosamente`);
    
    res.status(201).json({
      success: true,
      message: 'Proyecto creado exitosamente',
      project: fullProjectResult.rows[0]
    });
    
  } catch (error) {
    // Revertir transacción en caso de error
    await client.query('ROLLBACK');
    
    console.error('❌ Error al crear proyecto:', error);
    
    // Manejo de errores específicos de PostgreSQL
    if (error.code === '23505') {
      return res.status(409).json({ 
        error: 'Ya existe un proyecto con ese año y número interno' 
      });
    }
    
    if (error.code === '23503') {
      return res.status(400).json({ 
        error: 'Una o más relaciones (entidad, departamento, etc.) no existen en la base de datos' 
      });
    }
    
    if (error.code === '23514') {
      return res.status(400).json({ 
        error: 'Los datos no cumplen con las restricciones de la base de datos' 
      });
    }
    
    res.status(500).json({ 
      error: 'Error al crear el proyecto',
      details: error.message 
    });
    
  } finally {
    client.release();
  }
});

// PUT - Actualizar proyecto existente
app.put('/api/projects/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    
    // 1. Verificar que el proyecto existe
    const checkProject = await client.query(
      'SELECT project_id FROM projects WHERE project_id = $1',
      [id]
    );
    
    if (checkProject.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    // 2. Validar datos requeridos
    const validation = validateProjectData(req.body);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validation.errors 
      });
    }
    
    // 3. Extraer y limpiar datos
    const {
      anio_proyecto,
      numero_proyecto_externo,
      nombre_proyecto,
      objeto_proyecto,
      entidad_id,
      dependencia_ejecutora_id,
      estado_proyecto_id,
      tipo_proyecto_id,
      tipo_financiacion_id,
      modalidad_ejecucion_id,
      modalidad_contratacion_id,
      valor_proyecto,
      codigo_contable,
      porcentaje_beneficio,
      valor_beneficio,
      aporte_universidad,
      aporte_entidad,
      cantidad_beneficiarios,
      fecha_suscripcion,
      fecha_inicio,
      fecha_finalizacion,
      funcionario_ordenador_id,
      correo_principal,
      acto_administrativo,
      enlace_secop,
      observaciones,
      correos_secundarios
    } = req.body;
    
    // Limpiar números
    const projectValue = cleanNumber(valor_proyecto);
    const benefitValue = cleanNumber(valor_beneficio);
    const univContribution = cleanNumber(aporte_universidad);
    const entityContribution = cleanNumber(aporte_entidad);
    
    // 4. Validaciones adicionales
    if (projectValue <= 0) {
      return res.status(400).json({ error: 'El valor del proyecto debe ser mayor a cero' });
    }
    
    if (new Date(fecha_finalizacion) < new Date(fecha_inicio)) {
      return res.status(400).json({ error: 'La fecha de finalización debe ser posterior a la fecha de inicio' });
    }
    
    // 5. Iniciar transacción
    await client.query('BEGIN');
    
    console.log(`🔄 Actualizando proyecto ID: ${id}`);
    
    // 6. Actualizar proyecto principal
    const projectResult = await client.query(
      `UPDATE projects SET
        project_year = $1,
        external_project_number = $2,
        project_name = $3,
        project_purpose = $4,
        entity_id = $5,
        executing_department_id = $6,
        project_status_id = $7,
        project_type_id = $8,
        financing_type_id = $9,
        execution_modality_id = $10,
        contracting_modality_id = $11,
        project_value = $12,
        accounting_code = $13,
        institutional_benefit_percentage = $14,
        institutional_benefit_value = $15,
        university_contribution = $16,
        entity_contribution = $17,
        beneficiaries_count = $18,
        subscription_date = $19,
        start_date = $20,
        end_date = $21,
        ordering_official_id = $22,
        main_email = $23,
        administrative_act = $24,
        secop_link = $25,
        observations = $26,
        updated_at = CURRENT_TIMESTAMP,
        updated_by_user_id = NULL
      WHERE project_id = $27
      RETURNING project_id`,
      [
        anio_proyecto,
        numero_proyecto_externo || null,
        nombre_proyecto,
        objeto_proyecto,
        entidad_id,
        dependencia_ejecutora_id,
        estado_proyecto_id,
        tipo_proyecto_id,
        tipo_financiacion_id,
        modalidad_ejecucion_id,
        modalidad_contratacion_id || null,
        projectValue,
        codigo_contable || null,
        porcentaje_beneficio || 12,
        benefitValue,
        univContribution || 0,
        entityContribution,
        cantidad_beneficiarios || null,
        fecha_suscripcion || null,
        fecha_inicio,
        fecha_finalizacion,
        funcionario_ordenador_id,
        correo_principal || null,
        acto_administrativo || null,
        enlace_secop || null,
        observaciones || null,
        id
      ]
    );
    
    console.log(`✅ Proyecto actualizado: ID ${id}`);
    
    // 7. Actualizar correos secundarios
    // Primero, desactivar todos los correos existentes
    await client.query(
      `UPDATE project_secondary_emails 
       SET is_active = false 
       WHERE project_id = $1`,
      [id]
    );
    
    // Luego, insertar los nuevos correos (si existen)
    if (correos_secundarios && Array.isArray(correos_secundarios) && correos_secundarios.length > 0) {
      for (const email of correos_secundarios) {
        if (email && email.trim() !== '') {
          // Intentar reactivar si ya existe, sino insertar nuevo
          const existingEmail = await client.query(
            `SELECT secondary_email_id 
             FROM project_secondary_emails 
             WHERE project_id = $1 AND email = $2`,
            [id, email.trim()]
          );
          
          if (existingEmail.rows.length > 0) {
            // Reactivar correo existente
            await client.query(
              `UPDATE project_secondary_emails 
               SET is_active = true 
               WHERE secondary_email_id = $1`,
              [existingEmail.rows[0].secondary_email_id]
            );
          } else {
            // Insertar nuevo correo
            await client.query(
              `INSERT INTO project_secondary_emails (project_id, email, is_active)
               VALUES ($1, $2, true)`,
              [id, email.trim()]
            );
          }
        }
      }
      console.log(`📧 Correos secundarios actualizados`);
    }
    
    // 8. Confirmar transacción
    await client.query('COMMIT');
    
    // 9. Obtener el proyecto actualizado completo
    const fullProjectResult = await client.query(
      `SELECT 
        p.project_id as id,
        p.project_year as year,
        p.internal_project_number as internal_number,
        p.external_project_number as external_number,
        CONCAT(p.project_year, '-', LPAD(p.internal_project_number::text, 3, '0')) as code,
        p.project_name as name,
        p.project_purpose as purpose,
        p.project_value as value,
        p.start_date,
        p.end_date,
        e.entity_name as entity,
        ed.department_name as department,
        ps.status_name as status
      FROM projects p
      LEFT JOIN entities e ON p.entity_id = e.entity_id
      LEFT JOIN executing_departments ed ON p.executing_department_id = ed.department_id
      LEFT JOIN project_statuses ps ON p.project_status_id = ps.status_id
      WHERE p.project_id = $1`,
      [id]
    );

    console.log(`🎉 Proyecto ${id} actualizado exitosamente`);

    res.json({
      success: true,
      message: 'Proyecto actualizado exitosamente',
      project: fullProjectResult.rows[0]  // ← DEBE SER fullProjectResult, no fullProject
    });
    
  } catch (error) {
    // Revertir transacción en caso de error
    await client.query('ROLLBACK');
    
    console.error('❌ Error al actualizar proyecto:', error);
    
    // Manejo de errores específicos
    if (error.code === '23503') {
      return res.status(400).json({ 
        error: 'Una o más relaciones (entidad, departamento, etc.) no existen en la base de datos' 
      });
    }
    
    if (error.code === '23514') {
      return res.status(400).json({ 
        error: 'Los datos no cumplen con las restricciones de la base de datos' 
      });
    }
    
    res.status(500).json({ 
      error: 'Error al actualizar el proyecto',
      details: error.message 
    });
    
  } finally {
    client.release();
  }
});

// DELETE - Deshabilitar proyecto (soft delete)
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    
    // 1. Verificar que el proyecto existe
    const checkProject = await client.query(
      'SELECT project_id, is_active, project_name FROM projects WHERE project_id = $1',
      [id]
    );
    
    if (checkProject.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    const project = checkProject.rows[0];
    
    // 2. Verificar si ya está deshabilitado
    if (!project.is_active) {
      client.release();
      return res.status(400).json({ 
        error: 'El proyecto ya está deshabilitado',
        project_id: id,
        is_active: false
      });
    }
    
    console.log(`🗑️ Deshabilitando proyecto: ${project.project_name} (ID: ${id})`);
    
    // 3. Deshabilitar proyecto (soft delete)
    const result = await client.query(
      `UPDATE projects 
       SET is_active = false, 
           updated_at = CURRENT_TIMESTAMP,
           updated_by_user_id = NULL
       WHERE project_id = $1
       RETURNING 
         project_id as id,
         project_name as name,
         is_active as active,
         updated_at`,
      [id]
    );
    
    client.release();
    
    console.log(`✅ Proyecto ${id} deshabilitado exitosamente`);
    
    res.json({
      success: true,
      message: 'Proyecto deshabilitado exitosamente',
      project: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Error al deshabilitar proyecto:', error);
    res.status(500).json({ 
      error: 'Error al deshabilitar el proyecto',
      details: error.message 
    });
  }
});

// ========== CÓDIGOS RUP ==========

// Obtener todos los códigos RUP activos
app.get('/api/rup-codes', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT 
        rup_code_id as id,
        rup_code as code,
        code_description as description,
        main_category,
        subcategory,
        hierarchy_level,
        parent_code,
        keywords,
        is_active as active
      FROM rup_codes
      WHERE is_active = true
      ORDER BY rup_code`
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener códigos RUP:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener códigos RUP asignados a un proyecto
app.get('/api/projects/:projectYear/:projectNumber/rup-codes', async (req, res) => {
  try {
    const { projectYear, projectNumber } = req.params;
    const client = await pool.connect();
    
    const result = await client.query(
      `SELECT 
        prc.project_rup_code_id as id,
        prc.rup_code_id,
        rc.rup_code as code,
        rc.code_description as description,
        rc.main_category,
        rc.subcategory,
        prc.is_main_code,
        prc.participation_percentage,
        prc.observations,
        prc.assignment_date
      FROM project_rup_codes prc
      INNER JOIN rup_codes rc ON prc.rup_code_id = rc.rup_code_id
      WHERE prc.project_year = $1 
        AND prc.internal_project_number = $2
        AND prc.is_active = true
      ORDER BY prc.is_main_code DESC, rc.rup_code`,
      [projectYear, projectNumber]
    );
    
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener códigos RUP del proyecto:', error);
    res.status(500).json({ error: error.message });
  }
});

// Asignar códigos RUP a un proyecto (usado al crear/editar)
app.post('/api/projects/:projectYear/:projectNumber/rup-codes', async (req, res) => {
  try {
    const { projectYear, projectNumber } = req.params;
    const { rup_codes } = req.body; // Array de { rup_code_id, is_main_code, participation_percentage, observations }
    
    if (!rup_codes || !Array.isArray(rup_codes)) {
      return res.status(400).json({ error: 'Se requiere un array de códigos RUP' });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Primero, desactivar todos los códigos RUP existentes del proyecto
      await client.query(
        `UPDATE project_rup_codes 
         SET is_active = false 
         WHERE project_year = $1 AND internal_project_number = $2`,
        [projectYear, projectNumber]
      );
      
      // Luego, insertar los nuevos códigos RUP
      const insertPromises = rup_codes.map(rupCode => {
        return client.query(
          `INSERT INTO project_rup_codes (
            project_year,
            internal_project_number,
            rup_code_id,
            is_main_code,
            participation_percentage,
            observations,
            assignment_date,
            assigned_by_user_id,
            is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, 1, true)`,
          [
            projectYear,
            projectNumber,
            rupCode.rup_code_id,
            rupCode.is_main_code || false,
            rupCode.participation_percentage || null,
            rupCode.observations || null
          ]
        );
      });
      
      await Promise.all(insertPromises);
      await client.query('COMMIT');
      
      res.json({ 
        success: true, 
        message: 'Códigos RUP asignados correctamente',
        count: rup_codes.length 
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error al asignar códigos RUP:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un código RUP específico de un proyecto
app.delete('/api/project-rup-codes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    
    const result = await client.query(
      `UPDATE project_rup_codes 
       SET is_active = false 
       WHERE project_rup_code_id = $1 
       RETURNING project_rup_code_id`,
      [id]
    );
    
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Código RUP no encontrado' });
    }
    
    res.json({ success: true, message: 'Código RUP eliminado' });
  } catch (error) {
    console.error('Error al eliminar código RUP:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log('📊 Endpoints disponibles:');
  console.log(`   - GET http://localhost:${PORT}/api/health`);
  console.log(`   - GET http://localhost:${PORT}/api/entities`);
  console.log(`   - GET http://localhost:${PORT}/api/dependencies`);
  console.log(`   - GET http://localhost:${PORT}/api/project-types`);
  console.log(`   - GET http://localhost:${PORT}/api/financing-types`);
  console.log(`   - GET http://localhost:${PORT}/api/execution-modalities`);
  console.log(`   - GET http://localhost:${PORT}/api/contracting-modalities`);
  console.log(`   - GET http://localhost:${PORT}/api/project-states`);
  console.log(`   - GET http://localhost:${PORT}/api/officials`);
  console.log(`   - GET http://localhost:${PORT}/api/projects`);
  console.log(`   - POST http://localhost:${PORT}/api/projects`);
  console.log(`   - PUT http://localhost:${PORT}/api/projects/:id`);
  console.log(`   - DELETE http://localhost:${PORT}/api/projects/:id`);
  
  testConnection().then(result => {
    if (result.success) {
      console.log('✅ Conexión exitosa a PostgreSQL');
      console.log(`   - Base de datos: ${result.database}`);
      console.log(`   - Host: ${result.host}`);
    } else {
      console.error('❌ Error de conexión a PostgreSQL:', result.error);
    }
  });
});