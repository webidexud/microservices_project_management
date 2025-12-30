const { Pool } = require('pg');


// Configuration for PostgreSQL connection
const conexion = new Pool({
    user: 'contract_admin',
    host: 'contract_module_database',
    database: 'contract_module',
    password: 'contract_password123',
    port: 5432,
});

// event listener for errors on the pool
conexion.on('connect', () => {
    console.log('Connected to the database');
});

conexion.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = conexion;