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

// Tipos de Financiación
app.get('/api/financing-types', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT tipo_financiacion_id as id, nombre_financiacion as name, es_activo as active FROM tipo_financiacion ORDER BY tipo_financiacion_id'
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener tipos de financiación:', error);
    res.status(500).json({ error: error.message });
  }
});

// Tipos de Financiación activos
app.get('/api/financing-types/active', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT tipo_financiacion_id as id, nombre_financiacion as name, es_activo as active FROM tipo_financiacion WHERE es_activo = true ORDER BY tipo_financiacion_id'
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener tipos de financiación activos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Crear tipo de financiación
app.post('/api/financing-types', async (req, res) => {
  try {
    const { name } = req.body;
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO tipo_financiacion (nombre_financiacion, es_activo) VALUES ($1, true) RETURNING tipo_financiacion_id as id, nombre_financiacion as name, es_activo as active',
      [name]
    );
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear tipo de financiación:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar tipo de financiación
app.put('/api/financing-types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const client = await pool.connect();
    const result = await client.query(
      'UPDATE tipo_financiacion SET nombre_financiacion = $1, fecha_actualizacion = CURRENT_TIMESTAMP WHERE tipo_financiacion_id = $2 RETURNING tipo_financiacion_id as id, nombre_financiacion as name, es_activo as active',
      [name, id]
    );
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar tipo de financiación:', error);
    res.status(500).json({ error: error.message });
  }
});

// Toggle activo/inactivo
app.patch('/api/financing-types/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    const result = await client.query(
      'UPDATE tipo_financiacion SET es_activo = NOT es_activo WHERE tipo_financiacion_id = $1 RETURNING tipo_financiacion_id as id, nombre_financiacion as name, es_activo as active',
      [id]
    );
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ENDPOINTS GENÉRICOS PARA OTROS CATÁLOGOS
// ============================================

// Tipos de Proyecto
app.get('/api/project-types', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT tipo_proyecto_id as id, nombre_tipo as name, es_activo as active FROM tipo_proyecto ORDER BY tipo_proyecto_id'
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
      'SELECT tipo_proyecto_id as id, nombre_tipo as name, es_activo as active FROM tipo_proyecto WHERE es_activo = true ORDER BY tipo_proyecto_id'
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Entidades
app.get('/api/entities', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT 
        entidad_id as id, 
        nombre_entidad as name, 
        nit, 
        tipo_entidad_id as type,
        correo_institucional as contact,
        es_activo as active 
      FROM entidad 
      ORDER BY entidad_id`
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
        entidad_id as id, 
        nombre_entidad as name, 
        nit, 
        tipo_entidad_id as type,
        correo_institucional as contact,
        es_activo as active 
      FROM entidad 
      WHERE es_activo = true 
      ORDER BY nombre_entidad`
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dependencias
app.get('/api/dependencies', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT dependencia_id as id, nombre_dependencia as name, es_activo as active FROM dependencia_ejecutora ORDER BY dependencia_id'
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
      'SELECT dependencia_id as id, nombre_dependencia as name, es_activo as active FROM dependencia_ejecutora WHERE es_activo = true ORDER BY nombre_dependencia'
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Estados de Proyecto
app.get('/api/project-states', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT estado_id as id, nombre_estado as name, codigo_estado as code, color_estado as color, es_activo as active FROM estado_proyecto ORDER BY estado_id'
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
      'SELECT estado_id as id, nombre_estado as name, codigo_estado as code, color_estado as color, es_activo as active FROM estado_proyecto WHERE es_activo = true ORDER BY estado_id'
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Modalidades de Ejecución
app.get('/api/execution-modalities', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT modalidad_ejecucion_id as id, nombre_modalidad as name, descripcion_modalidad as description, es_activo as active FROM modalidad_ejecucion ORDER BY modalidad_ejecucion_id'
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
      'SELECT modalidad_ejecucion_id as id, nombre_modalidad as name, descripcion_modalidad as description, es_activo as active FROM modalidad_ejecucion WHERE es_activo = true ORDER BY nombre_modalidad'
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Modalidades de Contratación
app.get('/api/contracting-modalities', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT modalidad_contratacion_id as id, nombre_modalidad as name, descripcion_modalidad as description, es_activo as active FROM modalidad_contratacion ORDER BY modalidad_contratacion_id'
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
      'SELECT modalidad_contratacion_id as id, nombre_modalidad as name, descripcion_modalidad as description, es_activo as active FROM modalidad_contratacion WHERE es_activo = true ORDER BY nombre_modalidad'
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Funcionarios Ordenadores
app.get('/api/officials', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT 
        funcionario_ordenador_id as id, 
        CONCAT(primer_nombre, ' ', COALESCE(segundo_nombre, ''), ' ', primer_apellido, ' ', COALESCE(segundo_apellido, '')) as name,
        resolucion_nombramiento as position,
        correo_institucional as email,
        es_activo as active 
      FROM funcionario_ordenador 
      ORDER BY funcionario_ordenador_id`
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
        funcionario_ordenador_id as id, 
        CONCAT(primer_nombre, ' ', COALESCE(segundo_nombre, ''), ' ', primer_apellido, ' ', COALESCE(segundo_apellido, '')) as name,
        resolucion_nombramiento as position,
        correo_institucional as email,
        es_activo as active 
      FROM funcionario_ordenador 
      WHERE es_activo = true 
      ORDER BY primer_nombre`
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
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
  console.log(`   - GET http://localhost:${PORT}/api/financing-types`);
  console.log(`   - GET http://localhost:${PORT}/api/entities`);
  console.log(`   - GET http://localhost:${PORT}/api/dependencies`);
  
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