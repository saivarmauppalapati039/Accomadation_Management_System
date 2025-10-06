// server.js
const app = require('./app');
const { sequelize } = require('./config/db');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false
});

// Create session table if not exists
const createSessionTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS "session" (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL
    );
    ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid");
    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
  `;
  await pool.query(query);
  console.log('✅ Session table ensured');
};

const PORT = process.env.PORT || 5000;

// Only in development
if (process.env.NODE_ENV === 'development') {
  sequelize.sync({ force: true }).then(() => {
    console.log('✅ Models synced');
    createSessionTable(); // 👈 Create session table
  });
}

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});