// server.js
const app = require('./app');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false
});

// ✅ Create session table on startup (idempotent)
const createSessionTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS "session" (
      "sid" varchar NOT NULL,
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL
    );
    ALTER TABLE "session" 
    ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid");
    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
  `;
  await pool.query(query);
  console.log('✅ Session table ensured');
};

const PORT = process.env.PORT || 5000;

// Run once on startup
createSessionTable().catch(console.error);

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});