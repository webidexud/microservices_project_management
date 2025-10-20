import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || 'db_siexud_new',
  port: process.env.DB_PORT || 5432,
  database: process.env.POSTGRES_DB || 'nuevo_siexud',
  user: process.env.POSTGRES_USER || 'admin',
  password: process.env.POSTGRES_PASSWORD || 'qZVmQxZPE532qu39gGoH7F1DqrbUlW',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Verificar conexión
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    client.release();
    return {
      success: true,
      timestamp: result.rows[0].current_time,
      version: result.rows[0].pg_version,
      database: process.env.POSTGRES_DB || 'nuevo_siexud',
      host: process.env.DB_HOST || 'db_siexud_new'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

// Obtener TODAS las tablas de la base de datos
export async function getDatabaseStats() {
  let client;
  try {
    console.log('🔍 Intentando obtener tablas...');
    client = await pool.connect();
    console.log('✅ Cliente conectado');
    
    // Primero verificar en qué base de datos estamos
    const dbCheck = await client.query('SELECT current_database(), current_schema()');
    console.log('📊 Base de datos actual:', dbCheck.rows[0].current_database);
    console.log('📊 Schema actual:', dbCheck.rows[0].current_schema);
    
    // Query exacta que funciona en Adminer
    const result = await client.query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
      FROM pg_catalog.pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename ASC;
    `);
    
    console.log(`✅ Query ejecutada. Filas retornadas: ${result.rows.length}`);
    
    if (result.rows.length > 0) {
      console.log(`📋 Primeras 3 tablas:`, result.rows.slice(0, 3).map(t => t.tablename));
    } else {
      console.log('⚠️ La query no retornó ninguna tabla');
      // Intentar ver qué esquemas existen
      const schemas = await client.query(`SELECT schema_name FROM information_schema.schemata`);
      console.log('📋 Esquemas disponibles:', schemas.rows.map(s => s.schema_name));
    }
    
    return result.rows;
  } catch (error) {
    console.error('❌ Error al obtener tablas:', error.message);
    console.error('📍 Stack:', error.stack);
    return [];
  } finally {
    if (client) {
      client.release();
      console.log('🔌 Cliente liberado');
    }
  }
}