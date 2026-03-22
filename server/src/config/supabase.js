const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString, { ssl: 'require' });

module.exports = sql;

async function testConnection() {
  try {
    await sql`SELECT 1`;
    console.log('Connected to Supabase DB!');
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    await sql.end();
  }
}

testConnection();