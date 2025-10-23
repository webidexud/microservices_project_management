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