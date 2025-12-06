const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de la base de datos PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'nuevo_siexud',
  password: 'tu_password',  // CAMBIA ESTO
  port: 5432,
});

// Función para manejar errores de base de datos
const handleDatabaseError = (error, res) => {
  console.error('Database error:', error);
  res.status(500).json({
    error: 'Error en la base de datos',
    details: error.message
  });
};

// ============================================================================
// RUTAS PARA PROYECTOS (PROJECTS)
// ============================================================================

// GET - Obtener todos los proyectos con información completa
app.get('/api/proyectos', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.*,
        e.entity_name,
        e.tax_id,
        et.type_name as entity_type,
        ed.department_name as executing_department,
        ps.status_name as project_status,
        ps.status_color,
        pt.type_name as project_type,
        ft.type_name as financing_type,
        em.modality_name as execution_modality,
        oo.first_name || ' ' || oo.first_surname as ordering_official_name
      FROM projects p
      LEFT JOIN entities e ON p.entity_id = e.entity_id
      LEFT JOIN entity_types et ON e.entity_type_id = et.entity_type_id
      LEFT JOIN executing_departments ed ON p.executing_department_id = ed.department_id
      LEFT JOIN project_statuses ps ON p.project_status_id = ps.status_id
      LEFT JOIN project_types pt ON p.project_type_id = pt.project_type_id
      LEFT JOIN financing_types ft ON p.financing_type_id = ft.financing_type_id
      LEFT JOIN execution_modalities em ON p.execution_modality_id = em.execution_modality_id
      LEFT JOIN ordering_officials oo ON p.ordering_official_id = oo.official_id
      WHERE p.is_active = true
      ORDER BY p.project_year DESC, p.internal_project_number DESC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// GET - Obtener un proyecto específico por ID
app.get('/api/proyectos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        p.*,
        e.entity_name,
        e.tax_id,
        e.main_address,
        e.main_phone,
        e.institutional_email as entity_email,
        et.type_name as entity_type,
        ed.department_name as executing_department,
        ed.phone as department_phone,
        ed.email as department_email,
        ps.status_name as project_status,
        ps.status_color,
        ps.status_description,
        pt.type_name as project_type,
        ft.type_name as financing_type,
        em.modality_name as execution_modality,
        em.modality_description,
        oo.first_name || ' ' || oo.first_surname as ordering_official_name,
        oo.identification_number as ordering_official_id,
        oo.institutional_email as ordering_official_email
      FROM projects p
      LEFT JOIN entities e ON p.entity_id = e.entity_id
      LEFT JOIN entity_types et ON e.entity_type_id = et.entity_type_id
      LEFT JOIN executing_departments ed ON p.executing_department_id = ed.department_id
      LEFT JOIN project_statuses ps ON p.project_status_id = ps.status_id
      LEFT JOIN project_types pt ON p.project_type_id = pt.project_type_id
      LEFT JOIN financing_types ft ON p.financing_type_id = ft.financing_type_id
      LEFT JOIN execution_modalities em ON p.execution_modality_id = em.execution_modality_id
      LEFT JOIN ordering_officials oo ON p.ordering_official_id = oo.official_id
      WHERE p.project_id = $1 AND p.is_active = true
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// GET - Obtener proyectos por año
app.get('/api/proyectos/year/:year', async (req, res) => {
  try {
    const { year } = req.params;
    
    const query = `
      SELECT 
        p.*,
        e.entity_name,
        ps.status_name as project_status,
        pt.type_name as project_type
      FROM projects p
      LEFT JOIN entities e ON p.entity_id = e.entity_id
      LEFT JOIN project_statuses ps ON p.project_status_id = ps.status_id
      LEFT JOIN project_types pt ON p.project_type_id = pt.project_type_id
      WHERE p.project_year = $1 AND p.is_active = true
      ORDER BY p.internal_project_number DESC
    `;
    
    const result = await pool.query(query, [year]);
    res.json(result.rows);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// GET - Obtener proyectos por estado
app.get('/api/proyectos/status/:statusId', async (req, res) => {
  try {
    const { statusId } = req.params;
    
    const query = `
      SELECT 
        p.*,
        e.entity_name,
        ps.status_name as project_status,
        ps.status_color
      FROM projects p
      LEFT JOIN entities e ON p.entity_id = e.entity_id
      LEFT JOIN project_statuses ps ON p.project_status_id = ps.status_id
      WHERE p.project_status_id = $1 AND p.is_active = true
      ORDER BY p.project_year DESC, p.internal_project_number DESC
    `;
    
    const result = await pool.query(query, [statusId]);
    res.json(result.rows);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// POST - Crear un nuevo proyecto
app.post('/api/proyectos', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {
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
      rup_codes_general_observations,
      session_type,
      minutes_date,
      minutes_number,
      created_by_user_id
    } = req.body;

    // Validaciones básicas
    if (!project_year || !internal_project_number || !project_name || !project_purpose || 
        !entity_id || !executing_department_id || !project_status_id || !project_type_id ||
        !financing_type_id || !execution_modality_id || !project_value || 
        !start_date || !end_date || !ordering_official_id) {
      return res.status(400).json({ 
        error: 'Faltan campos obligatorios',
        required_fields: [
          'project_year', 'internal_project_number', 'project_name', 'project_purpose',
          'entity_id', 'executing_department_id', 'project_status_id', 'project_type_id',
          'financing_type_id', 'execution_modality_id', 'project_value',
          'start_date', 'end_date', 'ordering_official_id'
        ]
      });
    }

    await client.query('BEGIN');

    const query = `
      INSERT INTO projects (
        project_year, internal_project_number, external_project_number,
        project_name, project_purpose, entity_id, executing_department_id,
        project_status_id, project_type_id, financing_type_id, execution_modality_id,
        project_value, accounting_code, institutional_benefit_percentage,
        institutional_benefit_value, university_contribution, entity_contribution,
        beneficiaries_count, subscription_date, start_date, end_date,
        ordering_official_id, main_email, administrative_act, secop_link,
        observations, rup_codes_general_observations, session_type,
        minutes_date, minutes_number, created_by_user_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
        $29, $30, $31
      ) RETURNING *
    `;

    const values = [
      project_year, internal_project_number, external_project_number,
      project_name, project_purpose, entity_id, executing_department_id,
      project_status_id, project_type_id, financing_type_id, execution_modality_id,
      project_value, accounting_code, institutional_benefit_percentage || 12.00,
      institutional_benefit_value, university_contribution || 0, entity_contribution,
      beneficiaries_count, subscription_date, start_date, end_date,
      ordering_official_id, main_email, administrative_act, secop_link,
      observations, rup_codes_general_observations, session_type,
      minutes_date, minutes_number, created_by_user_id
    ];

    const result = await client.query(query, values);
    
    await client.query('COMMIT');
    
    res.status(201).json({
      message: 'Proyecto creado exitosamente',
      project: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    
    if (error.code === '23505') { // Duplicate key error
      return res.status(409).json({
        error: 'Ya existe un proyecto con ese año y número interno'
      });
    }
    
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
});

// PUT - Actualizar un proyecto existente
app.put('/api/proyectos/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Verificar que el proyecto existe
    const checkQuery = 'SELECT project_id FROM projects WHERE project_id = $1 AND is_active = true';
    const checkResult = await client.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    await client.query('BEGIN');

    // Construir la consulta UPDATE dinámicamente
    const allowedFields = [
      'external_project_number', 'project_name', 'project_purpose',
      'entity_id', 'executing_department_id', 'project_status_id',
      'project_type_id', 'financing_type_id', 'execution_modality_id',
      'project_value', 'accounting_code', 'institutional_benefit_percentage',
      'institutional_benefit_value', 'university_contribution',
      'entity_contribution', 'beneficiaries_count', 'subscription_date',
      'start_date', 'end_date', 'ordering_official_id', 'main_email',
      'administrative_act', 'secop_link', 'observations',
      'rup_codes_general_observations', 'session_type', 'minutes_date',
      'minutes_number', 'updated_by_user_id'
    ];

    const updateFields = [];
    const values = [];
    let paramCounter = 1;

    for (const field of allowedFields) {
      if (updateData.hasOwnProperty(field)) {
        updateFields.push(`${field} = $${paramCounter}`);
        values.push(updateData[field]);
        paramCounter++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    // Agregar updated_at
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // Agregar el ID al final
    values.push(id);

    const query = `
      UPDATE projects 
      SET ${updateFields.join(', ')}
      WHERE project_id = $${paramCounter}
      RETURNING *
    `;

    const result = await client.query(query, values);
    
    await client.query('COMMIT');
    
    res.json({
      message: 'Proyecto actualizado exitosamente',
      project: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
});

// DELETE - Eliminar (desactivar) un proyecto
app.delete('/api/proyectos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      UPDATE projects 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE project_id = $1 AND is_active = true
      RETURNING project_id, project_name
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    res.json({
      message: 'Proyecto eliminado exitosamente',
      project: result.rows[0]
    });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// ============================================================================
// RUTAS PARA CATÁLOGOS Y DATOS RELACIONADOS
// ============================================================================

// GET - Obtener todos los estados de proyecto
app.get('/api/catalogos/estados', async (req, res) => {
  try {
    const query = 'SELECT * FROM project_statuses WHERE is_active = true ORDER BY status_order';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// GET - Obtener todos los tipos de proyecto
app.get('/api/catalogos/tipos', async (req, res) => {
  try {
    const query = 'SELECT * FROM project_types WHERE is_active = true ORDER BY type_name';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// GET - Obtener todas las entidades
app.get('/api/catalogos/entidades', async (req, res) => {
  try {
    const query = `
      SELECT e.*, et.type_name as entity_type
      FROM entities e
      LEFT JOIN entity_types et ON e.entity_type_id = et.entity_type_id
      WHERE e.is_active = true
      ORDER BY e.entity_name
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// GET - Obtener todos los departamentos ejecutores
app.get('/api/catalogos/departamentos', async (req, res) => {
  try {
    const query = 'SELECT * FROM executing_departments WHERE is_active = true ORDER BY department_name';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// GET - Obtener todos los tipos de financiación
app.get('/api/catalogos/financiacion', async (req, res) => {
  try {
    const query = 'SELECT * FROM financing_types WHERE is_active = true ORDER BY type_name';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// GET - Obtener todas las modalidades de ejecución
app.get('/api/catalogos/modalidades', async (req, res) => {
  try {
    const query = 'SELECT * FROM execution_modalities WHERE is_active = true ORDER BY modality_name';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// GET - Obtener todos los funcionarios ordenadores
app.get('/api/catalogos/funcionarios', async (req, res) => {
  try {
    const query = `
      SELECT 
        official_id,
        first_name || ' ' || COALESCE(second_name || ' ', '') || first_surname || ' ' || COALESCE(second_surname, '') as full_name,
        identification_type,
        identification_number,
        institutional_email,
        phone
      FROM ordering_officials 
      WHERE is_active = true 
      ORDER BY first_surname, first_name
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// ============================================================================
// RUTAS PARA ESTADÍSTICAS Y REPORTES
// ============================================================================

// GET - Obtener estadísticas generales
app.get('/api/estadisticas/general', async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_proyectos,
        COUNT(CASE WHEN ps.status_code = 'IN_PROGRESS' THEN 1 END) as en_progreso,
        COUNT(CASE WHEN ps.status_code = 'COMPLETED' THEN 1 END) as completados,
        COUNT(CASE WHEN ps.status_code = 'PENDING' THEN 1 END) as pendientes,
        SUM(project_value) as valor_total,
        AVG(project_value) as valor_promedio,
        COUNT(DISTINCT entity_id) as total_entidades,
        COUNT(DISTINCT executing_department_id) as total_departamentos
      FROM projects p
      LEFT JOIN project_statuses ps ON p.project_status_id = ps.status_id
      WHERE p.is_active = true
    `;
    
    const result = await pool.query(query);
    res.json(result.rows[0]);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// GET - Obtener proyectos por año (estadísticas)
app.get('/api/estadisticas/por-year', async (req, res) => {
  try {
    const query = `
      SELECT 
        project_year,
        COUNT(*) as cantidad,
        SUM(project_value) as valor_total
      FROM projects
      WHERE is_active = true
      GROUP BY project_year
      ORDER BY project_year DESC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// GET - Obtener proyectos por entidad (top 10)
app.get('/api/estadisticas/por-entidad', async (req, res) => {
  try {
    const query = `
      SELECT 
        e.entity_name,
        COUNT(p.project_id) as cantidad_proyectos,
        SUM(p.project_value) as valor_total
      FROM projects p
      INNER JOIN entities e ON p.entity_id = e.entity_id
      WHERE p.is_active = true
      GROUP BY e.entity_id, e.entity_name
      ORDER BY cantidad_proyectos DESC
      LIMIT 10
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// ============================================================================
// RUTA DE SALUD Y VERIFICACIÓN
// ============================================================================

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'OK',
      database: 'Connected',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      database: 'Disconnected',
      error: error.message
    });
  }
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API de Proyectos SIEXUD',
    version: '1.0.0',
    endpoints: {
      projects: {
        'GET /api/proyectos': 'Obtener todos los proyectos',
        'GET /api/proyectos/:id': 'Obtener un proyecto por ID',
        'GET /api/proyectos/year/:year': 'Obtener proyectos por año',
        'GET /api/proyectos/status/:statusId': 'Obtener proyectos por estado',
        'POST /api/proyectos': 'Crear un nuevo proyecto',
        'PUT /api/proyectos/:id': 'Actualizar un proyecto',
        'DELETE /api/proyectos/:id': 'Eliminar (desactivar) un proyecto'
      },
      catalogs: {
        'GET /api/catalogos/estados': 'Obtener estados de proyecto',
        'GET /api/catalogos/tipos': 'Obtener tipos de proyecto',
        'GET /api/catalogos/entidades': 'Obtener entidades',
        'GET /api/catalogos/departamentos': 'Obtener departamentos ejecutores',
        'GET /api/catalogos/financiacion': 'Obtener tipos de financiación',
        'GET /api/catalogos/modalidades': 'Obtener modalidades de ejecución',
        'GET /api/catalogos/funcionarios': 'Obtener funcionarios ordenadores'
      },
      statistics: {
        'GET /api/estadisticas/general': 'Estadísticas generales',
        'GET /api/estadisticas/por-year': 'Proyectos por año',
        'GET /api/estadisticas/por-entidad': 'Top 10 entidades'
      },
      health: {
        'GET /api/health': 'Verificar estado del servidor y BD'
      }
    }
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🚀 Servidor API de Proyectos SIEXUD');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📡 Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`📋 Documentación API: http://localhost:${PORT}/`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('Endpoints disponibles:');
  console.log(`  • GET    /api/proyectos`);
  console.log(`  • GET    /api/proyectos/:id`);
  console.log(`  • POST   /api/proyectos`);
  console.log(`  • PUT    /api/proyectos/:id`);
  console.log(`  • DELETE /api/proyectos/:id`);
  console.log('═══════════════════════════════════════════════════════');
});

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Error no manejado:', error);
});