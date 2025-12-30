import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.POSTGRES_DB || 'POSBD',
  user: process.env.POSTGRES_USER || 'admin',
  password: process.env.POSTGRES_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    client.release();
    return {
      success: true,
      timestamp: result.rows[0].current_time,
      version: result.rows[0].pg_version,
      database: process.env.POSTGRES_DB || 'POSBD',
      host: process.env.DB_HOST || 'localhost'
    };
  } catch (error) {
    console.error('❌ Error:', error.message);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

export async function getDatabaseStats() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`
      SELECT 
        tablename,
        pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size
      FROM pg_catalog.pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename ASC;
    `);
    return result.rows;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return [];
  } finally {
    if (client) client.release();
  }
}