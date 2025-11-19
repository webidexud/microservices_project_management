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
      ORDER BY type_name ASC`
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
      ORDER BY type_name ASC`
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
      ORDER BY financing_name ASC`
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
      ORDER BY modality_name ASC`
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
      ORDER BY modality_name ASC`
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
      ORDER BY modality_name ASC`
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
      ORDER BY modality_name ASC`
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
      ORDER BY status_name ASC`
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
      ORDER BY status_name ASC`
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
      ORDER BY first_name ASC, first_surname ASC`
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
      ORDER BY first_name ASC, first_surname ASC`
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


// GET - Proyectos recientes
app.get('/api/projects/recent', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT 
        p.project_id as id,
        CONCAT(p.project_year, '-', LPAD(p.internal_project_number::text, 3, '0')) as code,
        p.project_name as name,
        p.project_value as value,
        p.start_date,
        p.end_date,
        e.entity_name as entity,
        ps.status_name as status,
        ps.status_color as status_color
      FROM projects p
      LEFT JOIN entities e ON p.entity_id = e.entity_id
      LEFT JOIN project_statuses ps ON p.project_status_id = ps.status_id
      WHERE p.is_active = true
      ORDER BY p.created_at DESC
      LIMIT 5`
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener proyectos recientes:', error);
    res.status(500).json({ error: error.message });
  }
});


// GET - Obtener un proyecto por ID
// GET - Obtener un proyecto por ID
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    
    // Obtener proyecto principal con TODOS los datos necesarios
    const projectResult = await client.query(
      `SELECT 
        p.project_id,
        p.project_year,
        p.internal_project_number,
        p.external_project_number,
        CONCAT(p.project_year, '-', LPAD(p.internal_project_number::text, 3, '0')) as code,
        p.project_name,
        p.project_purpose,
        p.entity_id,
        p.executing_department_id,
        p.project_status_id,
        p.project_type_id,
        p.financing_type_id,
        p.execution_modality_id,
        p.contracting_modality_id,
        p.project_value,
        p.accounting_code,
        p.institutional_benefit_percentage,
        p.institutional_benefit_value,
        p.university_contribution,
        p.entity_contribution,
        p.beneficiaries_count,
        p.subscription_date,
        p.start_date,
        p.end_date,
        p.ordering_official_id,
        p.main_email,
        p.administrative_act,
        p.secop_link,
        p.observations,
        p.rup_codes_general_observations,
        p.is_active as active,
        p.created_at,
        p.updated_at,
        -- Nombres de las relaciones desde sus tablas correspondientes
        e.entity_name,
        ed.department_name,
        ps.status_name,
        pt.type_name as project_type,
        ft.financing_name as financing_type,
        em.modality_name as execution_modality,
        cm.modality_name as contracting_modality,
        CONCAT(oo.first_name, ' ', COALESCE(oo.second_name || ' ', ''), oo.first_surname, ' ', COALESCE(oo.second_surname, '')) as ordering_official_name
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
    
    // Obtener resumen de modificaciones para calcular fecha final con prórrogas
    const modificationsResult = await client.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN modification_type IN ('EXTENSION', 'BOTH') THEN extension_days ELSE 0 END), 0) as total_extension_days,
        MAX(new_end_date) as final_end_date_with_extensions
      FROM project_modifications
      WHERE project_id = $1 AND is_active = true`,
      [id]
    );
    
    client.release();
    
    const project = projectResult.rows[0];
    project.secondary_emails = emailsResult.rows.map(row => row.email);
    project.total_extension_days = parseInt(modificationsResult.rows[0]?.total_extension_days || 0);
    project.final_end_date_with_extensions = modificationsResult.rows[0]?.final_end_date_with_extensions || project.end_date;
    
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

// GET - Métricas del Dashboard
app.get('/api/dashboard/metrics', async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Proyectos activos
    const activeProjectsResult = await client.query(
      `SELECT COUNT(*) as count 
       FROM projects 
       WHERE is_active = true`
    );
    
    // Valor total de proyectos
    const totalValueResult = await client.query(
      `SELECT SUM(project_value) as total 
       FROM projects 
       WHERE is_active = true`
    );
    
    // Proyectos por vencer (próximos 30 días)
    const expiringResult = await client.query(
      `SELECT COUNT(*) as count 
       FROM projects 
       WHERE is_active = true 
       AND end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'`
    );
    
    // Total de entidades
    const entitiesResult = await client.query(
      `SELECT COUNT(*) as count 
       FROM entities 
       WHERE is_active = true`
    );
    
    client.release();
    
    res.json({
      activeProjects: {
        value: parseInt(activeProjectsResult.rows[0].count),
        change: 0 // Calcular comparación con mes anterior si se requiere
      },
      totalValue: {
        value: parseFloat(totalValueResult.rows[0].total) || 0,
        change: 0
      },
      expiring: {
        value: parseInt(expiringResult.rows[0].count),
      },
      entities: {
        value: parseInt(entitiesResult.rows[0].count),
        change: 0
      }
    });
  } catch (error) {
    console.error('Error al obtener métricas:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Gráficos del Dashboard
app.get('/api/dashboard/charts', async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Proyectos por estado (con valor total)
    const projectsByStatusResult = await client.query(
      `SELECT 
        ps.status_name as name,
        ps.status_color as color,
        COUNT(p.project_id) as value,
        COALESCE(SUM(p.project_value), 0) as total_value
       FROM project_statuses ps
       LEFT JOIN projects p ON ps.status_id = p.project_status_id AND p.is_active = true
       WHERE ps.is_active = true
       GROUP BY ps.status_id, ps.status_name, ps.status_color, ps.status_order
       ORDER BY ps.status_order`
    );
    
    // Asignar colores según el estado
    const statusColors = {
      'En ejecución': '#0097A7',
      'Por iniciar': '#FFB300',
      'Finalizado': '#43A047',
      'Suspendido': '#E53935',
      'Planeación': '#7B1FA2',
      'En revisión': '#FB8C00'
    };
    
    projectsByStatusResult.rows.forEach(row => {
      row.color = statusColors[row.name] || '#0097A7';
    });
    
    // Proyectos por tipo
    // Proyectos por tipo (Top 10 con valor total)
    const projectsByTypeResult = await client.query(
      `SELECT 
        pt.type_name as name,
        COUNT(p.project_id) as count,
        COALESCE(SUM(p.project_value), 0) as total_value
       FROM project_types pt
       LEFT JOIN projects p ON pt.project_type_id = p.project_type_id AND p.is_active = true
       WHERE pt.is_active = true
       GROUP BY pt.project_type_id, pt.type_name
       HAVING COUNT(p.project_id) > 0
       ORDER BY count DESC, total_value DESC
       LIMIT 10`
    );
    
    // Evolución mensual (últimos 6 meses)
    const monthlyEvolutionResult = await client.query(
      `SELECT 
        TO_CHAR(p.start_date, 'Mon') as month,
        SUM(p.project_value) as value
       FROM projects p
       WHERE p.is_active = true
       AND p.start_date >= CURRENT_DATE - INTERVAL '6 months'
       GROUP BY TO_CHAR(p.start_date, 'Mon'), DATE_TRUNC('month', p.start_date)
       ORDER BY DATE_TRUNC('month', p.start_date)`
    );

    // Top entidades con más proyectos
    const topEntitiesResult = await client.query(
      `SELECT 
        e.entity_id,
        e.entity_name,
        e.tax_id,
        COUNT(p.project_id) as project_count,
        COALESCE(SUM(p.project_value), 0) as total_value
       FROM entities e
       INNER JOIN projects p ON e.entity_id = p.entity_id
       WHERE e.is_active = true 
         AND p.is_active = true
       GROUP BY e.entity_id, e.entity_name, e.tax_id
       HAVING COUNT(p.project_id) > 0
       ORDER BY project_count DESC, total_value DESC
       LIMIT 15`
    );
    
    client.release();
    
    res.json({
      projectsByStatus: projectsByStatusResult.rows,
      projectsByType: projectsByTypeResult.rows,
      monthlyEvolution: monthlyEvolutionResult.rows,
      topEntities: topEntitiesResult.rows, 
    });
  } catch (error) {
    console.error('Error al obtener gráficos:', error);
    res.status(500).json({ error: error.message });
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

// Búsqueda avanzada de códigos RUP con filtros jerárquicos
app.get('/api/rup-codes/search', async (req, res) => {
  try {
    const { query = '', segment = '', family = '', class_code = '', product = '', limit = 50, offset = 0 } = req.query;
    
    const client = await pool.connect();
    
    let conditions = ['is_active = true'];
    let params = [];
    let paramIndex = 1;
    
    // Filtro por texto general
    if (query.trim()) {
      conditions.push(`(
        rup_code ILIKE $${paramIndex} OR
        code_description ILIKE $${paramIndex} OR
        segment_name ILIKE $${paramIndex} OR
        family_name ILIKE $${paramIndex} OR
        class_name ILIKE $${paramIndex} OR
        keywords ILIKE $${paramIndex}
      )`);
      params.push(`%${query}%`);
      paramIndex++;
    }
    
    // Filtros jerárquicos - solo aplicar los que tengan valor
    if (segment.trim() && segment !== '') {
      conditions.push(`segment_code = $${paramIndex}`);
      params.push(segment);
      paramIndex++;
    }
    
    if (family.trim() && family !== '') {
      conditions.push(`family_code = $${paramIndex}`);
      params.push(family);
      paramIndex++;
    }
    
    if (class_code.trim() && class_code !== '') {
      conditions.push(`class_code = $${paramIndex}`);
      params.push(class_code);
      paramIndex++;
    }

    if (product && product.trim() !== '') {
      conditions.push(`product_code = $${paramIndex}`);
      params.push(product.trim());
      paramIndex++;
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Query principal
    // Query principal
    const sqlQuery = `
      SELECT 
        rup_code_id as id,
        rup_code as code,
        code_description as description,
        segment_code,
        segment_name,
        family_code,
        family_name,
        class_code,
        class_name,
        product_code,
        product_name,
        is_active as active
      FROM rup_codes
      ${whereClause}
      ORDER BY segment_code, family_code, class_code, product_code, rup_code
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(parseInt(limit), parseInt(offset));
    
    console.log('🔍 Búsqueda RUP:', { query, segment, family, class_code, limit, offset });
    console.log('📝 SQL:', sqlQuery);
    console.log('📊 Params:', params);
    
    const result = await client.query(sqlQuery, params);
    
    // Contar total
    const countQuery = `SELECT COUNT(*) FROM rup_codes ${whereClause}`;
    const countParams = params.slice(0, params.length - 2); // Excluir LIMIT y OFFSET
    const countResult = await client.query(countQuery, countParams);
    
    client.release();
    
    console.log(`✅ Encontrados ${result.rows.length} resultados de ${countResult.rows[0].count} totales`);
    
    res.json({
      results: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
  } catch (error) {
    console.error('❌ Error al buscar códigos RUP:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener segmentos únicos (primer nivel de jerarquía)
app.get('/api/rup-codes/segments', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT DISTINCT 
        segment_code as code,
        segment_name as name
      FROM rup_codes
      WHERE is_active = true 
        AND segment_code IS NOT NULL
      ORDER BY segment_code`
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener segmentos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener familias de un segmento
app.get('/api/rup-codes/families/:segmentCode', async (req, res) => {
  try {
    const { segmentCode } = req.params;
    const client = await pool.connect();
    const result = await client.query(
      `SELECT DISTINCT 
        family_code as code,
        family_name as name
      FROM rup_codes
      WHERE is_active = true 
        AND segment_code = $1
        AND family_code IS NOT NULL
      ORDER BY family_code`,
      [segmentCode]
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener familias:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener clases de una familia
app.get('/api/rup-codes/classes/:familyCode', async (req, res) => {
  try {
    const { familyCode } = req.params;
    const client = await pool.connect();
    const result = await client.query(
      `SELECT DISTINCT 
        class_code as code,
        class_name as name
      FROM rup_codes
      WHERE is_active = true 
        AND family_code = $1
        AND class_code IS NOT NULL
      ORDER BY class_code`,
      [familyCode]
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener clases:', error);
    res.status(500).json({ error: error.message });
  }
});
// Obtener productos de una clase
app.get('/api/rup-codes/products/:classCode', async (req, res) => {
  try {
    const { classCode } = req.params;
    const client = await pool.connect();
    const result = await client.query(
      `SELECT DISTINCT 
        product_code as code,
        product_name as name
      FROM rup_codes
      WHERE is_active = true 
        AND class_code = $1
        AND product_code IS NOT NULL
      ORDER BY product_code`,
      [classCode]
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: error.message });
  }
});
// Endpoint legacy (mantener para compatibilidad)
app.get('/api/rup-codes', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT 
        rup_code_id as id,
        rup_code as code,
        code_description as description,
        hierarchy_level,
        parent_code,
        keywords,
        segment_code,
        segment_name,
        family_code,
        family_name,
        class_code,
        class_name,
        is_active as active
      FROM rup_codes
      WHERE is_active = true
      ORDER BY rup_code
      LIMIT 100`
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener códigos RUP:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener códigos RUP asignados a un proyecto
// Obtener códigos RUP asignados a un proyecto
app.get('/api/projects/:projectYear/:projectNumber/rup-codes', async (req, res) => {
  try {
    const { projectYear, projectNumber } = req.params;
    const client = await pool.connect();
    
    // Obtener códigos RUP
    const result = await client.query(
      `SELECT 
        prc.project_rup_code_id as id,
        prc.rup_code_id,
        rc.rup_code as code,
        rc.code_description as description,
        rc.segment_code,
        rc.segment_name,
        rc.family_code,
        rc.family_name,
        rc.class_code,
        rc.class_name,
        prc.is_main_code,
        prc.assignment_date
      FROM project_rup_codes prc
      INNER JOIN rup_codes rc ON prc.rup_code_id = rc.rup_code_id
      WHERE prc.project_year = $1 
        AND prc.internal_project_number = $2
        AND prc.is_active = true
      ORDER BY prc.is_main_code DESC, rc.rup_code`,
      [projectYear, projectNumber]
    );
    
    // Obtener observaciones generales del proyecto
    const projectResult = await client.query(
      `SELECT rup_codes_general_observations 
       FROM projects 
       WHERE project_year = $1 AND internal_project_number = $2`,
      [projectYear, projectNumber]
    );
    
    client.release();
    
    res.json({
      codes: result.rows,
      general_observations: projectResult.rows[0]?.rup_codes_general_observations || ''
    });
  } catch (error) {
    console.error('Error al obtener códigos RUP del proyecto:', error);
    res.status(500).json({ error: error.message });
  }
});
// Asignar códigos RUP a un proyecto (usado al crear/editar)
app.post('/api/projects/:projectYear/:projectNumber/rup-codes', async (req, res) => {
  try {
    const { projectYear, projectNumber } = req.params;
    const { rup_codes, general_observations } = req.body;
    
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
            assignment_date,
            assigned_by_user_id,
            is_active
          ) VALUES ($1, $2, $3, $4, CURRENT_DATE, 1, true)`,
          [
            projectYear,
            projectNumber,
            rupCode.rup_code_id,
            rupCode.is_main_code || false
          ]
        );
      });
      
      await Promise.all(insertPromises);
      
      // Actualizar observaciones generales en la tabla projects
      await client.query(
        `UPDATE projects 
         SET rup_codes_general_observations = $1 
         WHERE project_year = $2 AND internal_project_number = $3`,
        [general_observations || null, projectYear, projectNumber]
      );
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
// MODIFICACIONES DE PROYECTOS
// ============================================

// GET - Obtener todas las modificaciones de un proyecto
app.get('/api/projects/:projectId/modifications', async (req, res) => {
  try {
    const { projectId } = req.params;
    const client = await pool.connect();
    
    const result = await client.query(
      `SELECT 
        modification_id as id,
        project_id,
        modification_number as number,
        modification_type as type,
        addition_value,
        extension_days,
        new_end_date,
        new_total_value,
        justification,
        administrative_act,
        approval_date,
        created_at,
        is_active as active
      FROM project_modifications
      WHERE project_id = $1 AND is_active = true
      ORDER BY modification_number DESC`,
      [projectId]
    );
    
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener modificaciones:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear nueva modificación
app.post('/api/projects/:projectId/modifications', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { projectId } = req.params;
    const {
      modification_type,
      addition_value,
      extension_days,
      new_end_date,
      justification,
      administrative_act,
      approval_date
    } = req.body;
    
    // 1. Validar campos requeridos
    if (!modification_type || !justification) {
      return res.status(400).json({ 
        error: 'El tipo de modificación y la justificación son obligatorios' 
      });
    }
    
    // 2. Validar según tipo
    if (modification_type === 'ADDITION' && !addition_value) {
      return res.status(400).json({ 
        error: 'El valor de adición es obligatorio para modificaciones tipo ADICIÓN' 
      });
    }
    
    if (modification_type === 'EXTENSION' && (!extension_days || !new_end_date)) {
      return res.status(400).json({ 
        error: 'Los días de extensión y la nueva fecha son obligatorios para modificaciones tipo PRÓRROGA' 
      });
    }
    
    if (modification_type === 'BOTH' && (!addition_value || !extension_days || !new_end_date)) {
      return res.status(400).json({ 
        error: 'Todos los campos son obligatorios para modificaciones tipo AMBAS' 
      });
    }
    
    await client.query('BEGIN');
    
    // 3. Obtener datos actuales del proyecto
    const projectResult = await client.query(
      'SELECT project_value, end_date FROM projects WHERE project_id = $1',
      [projectId]
    );
    
    if (projectResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    const currentProject = projectResult.rows[0];
    
    // 4. Obtener suma de adiciones anteriores
    const additionsResult = await client.query(
      `SELECT COALESCE(SUM(addition_value), 0) as total_additions
       FROM project_modifications
       WHERE project_id = $1 AND is_active = true
       AND modification_type IN ('ADDITION', 'BOTH')`,
      [projectId]
    );
    
    const totalAdditions = parseFloat(additionsResult.rows[0].total_additions);
    
    // 5. Calcular nuevo valor total
    const currentValue = parseFloat(currentProject.project_value);
    const additionAmount = addition_value ? parseFloat(addition_value) : 0;
    const newTotalValue = currentValue + totalAdditions + additionAmount;
    
    // 6. Obtener siguiente número de modificación
    const numberResult = await client.query(
      `SELECT COALESCE(MAX(modification_number), 0) + 1 as next_number
       FROM project_modifications
       WHERE project_id = $1`,
      [projectId]
    );
    
    const modificationNumber = numberResult.rows[0].next_number;
    
    console.log(`📝 Creando modificación #${modificationNumber} para proyecto ${projectId}`);
    
    // 7. Insertar modificación
    const insertResult = await client.query(
      `INSERT INTO project_modifications (
        project_id,
        modification_number,
        modification_type,
        addition_value,
        extension_days,
        new_end_date,
        new_total_value,
        justification,
        administrative_act,
        approval_date,
        created_by_user_id,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NULL, true)
      RETURNING 
        modification_id as id,
        modification_number as number,
        modification_type as type,
        addition_value,
        extension_days,
        new_end_date,
        new_total_value,
        justification,
        administrative_act,
        approval_date,
        created_at`,
      [
        projectId,
        modificationNumber,
        modification_type,
        additionAmount || null,
        extension_days || null,
        new_end_date || null,
        newTotalValue,
        justification,
        administrative_act || null,
        approval_date || null
      ]
    );
    
    await client.query('COMMIT');
    
    console.log(`✅ Modificación #${modificationNumber} creada exitosamente`);
    
    res.status(201).json({
      success: true,
      message: 'Modificación creada exitosamente',
      modification: insertResult.rows[0]
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error al crear modificación:', error);
    res.status(500).json({ 
      error: 'Error al crear la modificación',
      details: error.message 
    });
  } finally {
    client.release();
  }
});

// DELETE - Deshabilitar modificación (soft delete)
app.delete('/api/modifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    
    const result = await client.query(
      `UPDATE project_modifications 
       SET is_active = false 
       WHERE modification_id = $1
       RETURNING modification_id as id, modification_number as number`,
      [id]
    );
    
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Modificación no encontrada' });
    }
    
    res.json({ 
      success: true, 
      message: 'Modificación eliminada exitosamente' 
    });
  } catch (error) {
    console.error('Error al eliminar modificación:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener resumen de modificaciones de un proyecto
app.get('/api/projects/:projectId/modifications/summary', async (req, res) => {
  try {
    const { projectId } = req.params;
    const client = await pool.connect();
    
    const result = await client.query(
      `SELECT 
        COUNT(*) as total_modifications,
        COALESCE(SUM(CASE WHEN modification_type IN ('ADDITION', 'BOTH') THEN addition_value ELSE 0 END), 0) as total_additions,
        COALESCE(SUM(CASE WHEN modification_type IN ('EXTENSION', 'BOTH') THEN extension_days ELSE 0 END), 0) as total_extension_days,
        MAX(new_end_date) as final_end_date,
        MAX(new_total_value) as final_total_value
      FROM project_modifications
      WHERE project_id = $1 AND is_active = true`,
      [projectId]
    );
    
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener resumen de modificaciones:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// REPORTES AVANZADOS
// ============================================

// Endpoint principal de reportes
app.get('/api/reports', async (req, res) => {
  try {
    const {
      type = 'general',
      dateFrom,
      dateTo,
      entity,
      dependency,
      projectType,
      status,
      rupSegment,
      rupFamily,
      rupClass
    } = req.query;

    const client = await pool.connect();
    let conditions = ['p.is_active = true'];
    let params = [];
    let paramIndex = 1;

    // Filtros de fecha
    if (dateFrom) {
      conditions.push(`p.start_date >= $${paramIndex}`);
      params.push(dateFrom);
      paramIndex++;
    }
    if (dateTo) {
      conditions.push(`p.start_date <= $${paramIndex}`);
      params.push(dateTo);
      paramIndex++;
    }

    // Filtros por entidad, dependencia, tipo, estado
    if (entity && entity !== 'all') {
      conditions.push(`p.entity_id = $${paramIndex}`);
      params.push(parseInt(entity));
      paramIndex++;
    }
    if (dependency && dependency !== 'all') {
      conditions.push(`p.executing_department_id = $${paramIndex}`);
      params.push(parseInt(dependency));
      paramIndex++;
    }
    if (projectType && projectType !== 'all') {
      conditions.push(`p.project_type_id = $${paramIndex}`);
      params.push(parseInt(projectType));
      paramIndex++;
    }
    if (status && status !== 'all') {
      conditions.push(`ps.state_name = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Reporte según tipo
    let reportData = {};

    if (type === 'general') {
      // Métricas generales
      const metricsQuery = `
        SELECT 
          COUNT(*) as total_projects,
          SUM(p.project_value) as total_value,
          AVG(p.project_value) as average_value,
          COUNT(DISTINCT p.entity_id) as total_entities,
          COUNT(DISTINCT p.executing_department_id) as total_dependencies
        FROM projects p
        LEFT JOIN project_states ps ON p.project_state_id = ps.project_state_id
        ${whereClause}
      `;
      const metrics = await client.query(metricsQuery, params);
      reportData.metrics = metrics.rows[0];

      // Por entidad
      const byEntityQuery = `
        SELECT 
          e.entity_name as name,
          COUNT(p.project_id) as count,
          SUM(p.project_value) as value
        FROM projects p
        INNER JOIN entities e ON p.entity_id = e.entity_id
        LEFT JOIN project_states ps ON p.project_state_id = ps.project_state_id
        ${whereClause}
        GROUP BY e.entity_id, e.entity_name
        ORDER BY value DESC
        LIMIT 10
      `;
      const byEntity = await client.query(byEntityQuery, params);
      reportData.byEntity = byEntity.rows;

      // Por dependencia
      const byDependencyQuery = `
        SELECT 
          ed.department_name as name,
          COUNT(p.project_id) as count,
          SUM(p.project_value) as value
        FROM projects p
        INNER JOIN executing_departments ed ON p.executing_department_id = ed.department_id
        LEFT JOIN project_states ps ON p.project_state_id = ps.project_state_id
        ${whereClause}
        GROUP BY ed.department_id, ed.department_name
        ORDER BY value DESC
      `;
      const byDependency = await client.query(byDependencyQuery, params);
      reportData.byDependency = byDependency.rows;

      // Por estado
      const byStatusQuery = `
        SELECT 
          ps.state_name as name,
          COUNT(p.project_id) as count,
          SUM(p.project_value) as value
        FROM projects p
        INNER JOIN project_states ps ON p.project_state_id = ps.project_state_id
        ${whereClause}
        GROUP BY ps.state_name
        ORDER BY count DESC
      `;
      const byStatus = await client.query(byStatusQuery, params);
      reportData.byStatus = byStatus.rows;

      // Por mes
      const byMonthQuery = `
        SELECT 
          TO_CHAR(p.start_date, 'YYYY-MM') as month,
          COUNT(p.project_id) as count,
          SUM(p.project_value) as value
        FROM projects p
        LEFT JOIN project_states ps ON p.project_state_id = ps.project_state_id
        ${whereClause}
        GROUP BY TO_CHAR(p.start_date, 'YYYY-MM')
        ORDER BY month
      `;
      const byMonth = await client.query(byMonthQuery, params);
      reportData.byMonth = byMonth.rows;
    }

    if (type === 'rup' || type === 'general') {
      // Filtros adicionales para RUP
      let rupConditions = conditions.slice();
      let rupParams = params.slice();
      let rupParamIndex = paramIndex;

      if (rupSegment && rupSegment !== 'all') {
        rupConditions.push(`rc.segment_code = $${rupParamIndex}`);
        rupParams.push(rupSegment);
        rupParamIndex++;
      }
      if (rupFamily && rupFamily !== 'all') {
        rupConditions.push(`rc.family_code = $${rupParamIndex}`);
        rupParams.push(rupFamily);
        rupParamIndex++;
      }
      if (rupClass && rupClass !== 'all') {
        rupConditions.push(`rc.class_code = $${rupParamIndex}`);
        rupParams.push(rupClass);
        rupParamIndex++;
      }

      const rupWhereClause = rupConditions.length > 0 ? `WHERE ${rupConditions.join(' AND ')}` : '';

      // Por Segmento RUP
      const byRupSegmentQuery = `
        SELECT 
          rc.segment_code as code,
          rc.segment_name as name,
          COUNT(DISTINCT p.project_id) as count,
          SUM(p.project_value) as value
        FROM projects p
        INNER JOIN project_rup_codes prc ON p.project_year = prc.project_year 
          AND p.internal_project_number = prc.internal_project_number
        INNER JOIN rup_codes rc ON prc.rup_code_id = rc.rup_code_id
        LEFT JOIN project_states ps ON p.project_state_id = ps.project_state_id
        ${rupWhereClause}
        AND prc.is_active = true
        AND rc.segment_code IS NOT NULL
        GROUP BY rc.segment_code, rc.segment_name
        ORDER BY value DESC
        LIMIT 15
      `;
      const byRupSegment = await client.query(byRupSegmentQuery, rupParams);
      reportData.byRupSegment = byRupSegment.rows;

      // Por Familia RUP
      const byRupFamilyQuery = `
        SELECT 
          rc.family_code as code,
          rc.family_name as name,
          COUNT(DISTINCT p.project_id) as count,
          SUM(p.project_value) as value
        FROM projects p
        INNER JOIN project_rup_codes prc ON p.project_year = prc.project_year 
          AND p.internal_project_number = prc.internal_project_number
        INNER JOIN rup_codes rc ON prc.rup_code_id = rc.rup_code_id
        LEFT JOIN project_states ps ON p.project_state_id = ps.project_state_id
        ${rupWhereClause}
        AND prc.is_active = true
        AND rc.family_code IS NOT NULL
        GROUP BY rc.family_code, rc.family_name
        ORDER BY value DESC
        LIMIT 15
      `;
      const byRupFamily = await client.query(byRupFamilyQuery, rupParams);
      reportData.byRupFamily = byRupFamily.rows;

      // Top códigos RUP específicos
      const topRupCodesQuery = `
        SELECT 
          rc.rup_code as code,
          rc.code_description as name,
          rc.segment_name,
          rc.family_name,
          COUNT(DISTINCT p.project_id) as count,
          SUM(p.project_value) as value,
          AVG(prc.participation_percentage) as avg_participation
        FROM projects p
        INNER JOIN project_rup_codes prc ON p.project_year = prc.project_year 
          AND p.internal_project_number = prc.internal_project_number
        INNER JOIN rup_codes rc ON prc.rup_code_id = rc.rup_code_id
        LEFT JOIN project_states ps ON p.project_state_id = ps.project_state_id
        ${rupWhereClause}
        AND prc.is_active = true
        GROUP BY rc.rup_code_id, rc.rup_code, rc.code_description, rc.segment_name, rc.family_name
        ORDER BY count DESC, value DESC
        LIMIT 20
      `;
      const topRupCodes = await client.query(topRupCodesQuery, rupParams);
      reportData.topRupCodes = topRupCodes.rows;

      // Proyectos sin códigos RUP
      const projectsWithoutRupQuery = `
        SELECT COUNT(*) as count
        FROM projects p
        LEFT JOIN project_states ps ON p.project_state_id = ps.project_state_id
        ${whereClause}
        AND NOT EXISTS (
          SELECT 1 FROM project_rup_codes prc 
          WHERE prc.project_year = p.project_year 
            AND prc.internal_project_number = p.internal_project_number
            AND prc.is_active = true
        )
      `;
      const projectsWithoutRup = await client.query(projectsWithoutRupQuery, params);
      reportData.projectsWithoutRup = projectsWithoutRup.rows[0].count;
    }

    client.release();
    res.json(reportData);

  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({ error: error.message });
  }
});

// Exportar reporte detallado (para Excel/PDF)
app.get('/api/reports/detailed', async (req, res) => {
  try {
    const {
      dateFrom,
      dateTo,
      entity,
      dependency,
      projectType,
      status,
      rupSegment,
      rupFamily,
      rupClass
    } = req.query;

    const client = await pool.connect();
    let conditions = ['p.is_active = true'];
    let params = [];
    let paramIndex = 1;

    // Aplicar filtros
    if (dateFrom) {
      conditions.push(`p.start_date >= $${paramIndex}`);
      params.push(dateFrom);
      paramIndex++;
    }
    if (dateTo) {
      conditions.push(`p.start_date <= $${paramIndex}`);
      params.push(dateTo);
      paramIndex++;
    }
    if (entity && entity !== 'all') {
      conditions.push(`p.entity_id = $${paramIndex}`);
      params.push(parseInt(entity));
      paramIndex++;
    }
    if (dependency && dependency !== 'all') {
      conditions.push(`p.executing_department_id = $${paramIndex}`);
      params.push(parseInt(dependency));
      paramIndex++;
    }
    if (projectType && projectType !== 'all') {
      conditions.push(`p.project_type_id = $${paramIndex}`);
      params.push(parseInt(projectType));
      paramIndex++;
    }
    if (status && status !== 'all') {
      conditions.push(`ps.state_name = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        p.project_id,
        p.project_year,
        p.internal_project_number,
        p.external_project_number,
        p.project_name,
        p.project_value,
        p.start_date,
        p.end_date,
        e.entity_name,
        ed.department_name,
        pt.type_name as project_type,
        ps.state_name as status,
        STRING_AGG(DISTINCT rc.rup_code, ', ') as rup_codes,
        STRING_AGG(DISTINCT rc.segment_name, ', ') as rup_segments
      FROM projects p
      LEFT JOIN entities e ON p.entity_id = e.entity_id
      LEFT JOIN executing_departments ed ON p.executing_department_id = ed.department_id
      LEFT JOIN project_types pt ON p.project_type_id = pt.project_type_id
      LEFT JOIN project_states ps ON p.project_state_id = ps.project_state_id
      LEFT JOIN project_rup_codes prc ON p.project_year = prc.project_year 
        AND p.internal_project_number = prc.internal_project_number AND prc.is_active = true
      LEFT JOIN rup_codes rc ON prc.rup_code_id = rc.rup_code_id
      ${whereClause}
      GROUP BY p.project_id, e.entity_name, ed.department_name, pt.type_name, ps.state_name
      ORDER BY p.project_year DESC, p.internal_project_number DESC
    `;

    const result = await client.query(query, params);
    client.release();

    res.json({ projects: result.rows });

  } catch (error) {
    console.error('Error al generar reporte detallado:', error);
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