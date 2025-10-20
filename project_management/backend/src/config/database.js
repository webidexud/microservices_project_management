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
      database: process.env.POSTGRES_DB,
      host: process.env.DB_HOST
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

// Obtener estadísticas de tablas
export async function getDatabaseStats() {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      LIMIT 10;
    `);
    client.release();
    return result.rows;
  } catch (error) {
    return [];
  }
}