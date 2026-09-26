import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'mateomind.db');

const isPostgres = process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith('postgres://') || process.env.DATABASE_URL.startsWith('postgresql://'));

let sqliteDb = null;
let pgPool = null;

if (isPostgres) {
  pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
} else {
  sqliteDb = new DatabaseSync(dbPath);
}

// Convert SQLite '?' placeholder query to Postgres '$1, $2, ...'
function convertSqlToPg(sql) {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

export const db = {
  isPostgres,

  async exec(sql) {
    if (isPostgres) {
      const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
      for (const stmt of statements) {
        await pgPool.query(stmt);
      }
    } else {
      sqliteDb.exec(sql);
    }
  },

  async query(sql, params = []) {
    if (isPostgres) {
      const pgSql = convertSqlToPg(sql);
      const res = await pgPool.query(pgSql, params);
      return res.rows;
    } else {
      const stmt = sqliteDb.prepare(sql);
      return stmt.all(...params);
    }
  },

  async get(sql, params = []) {
    if (isPostgres) {
      const pgSql = convertSqlToPg(sql);
      const res = await pgPool.query(pgSql, params);
      return res.rows[0] || null;
    } else {
      const stmt = sqliteDb.prepare(sql);
      return stmt.get(...params) || null;
    }
  },

  async run(sql, params = []) {
    if (isPostgres) {
      let pgSql = convertSqlToPg(sql);
      if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.toUpperCase().includes('RETURNING')) {
        pgSql += ' RETURNING id';
      }
      const res = await pgPool.query(pgSql, params);
      return {
        lastInsertRowid: res.rows[0]?.id || null,
        changes: res.rowCount
      };
    } else {
      const stmt = sqliteDb.prepare(sql);
      const result = stmt.run(...params);
      return {
        lastInsertRowid: result.lastInsertRowid,
        changes: result.changes
      };
    }
  }
};

// Initialize Tables
async function initDb() {
  const sqliteSchema = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      age_group TEXT,
      profile_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT,
      mood_type TEXT,
      score INTEGER,
      risk_level TEXT,
      risk_factors_json TEXT,
      strengths_json TEXT,
      answers_json TEXT,
      recommendations_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      specialty TEXT NOT NULL,
      rating REAL,
      experience TEXT,
      slots_json TEXT,
      fee INTEGER DEFAULT 500,
      email TEXT,
      phone TEXT
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT,
      doctor_id INTEGER,
      doctor_name TEXT,
      appointment_date TEXT,
      slot TEXT,
      payment_method TEXT,
      payment_status TEXT DEFAULT 'confirmed',
      transaction_id TEXT,
      reminder_sent INTEGER DEFAULT 0,
      booked_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notification_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appointment_id INTEGER,
      recipient_role TEXT,
      recipient_name TEXT,
      recipient_email TEXT,
      recipient_phone TEXT,
      notification_type TEXT,
      status TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id TEXT UNIQUE NOT NULL,
      user_id INTEGER,
      username TEXT,
      appointment_id INTEGER,
      amount INTEGER NOT NULL,
      payment_method TEXT NOT NULL,
      payment_details_masked TEXT,
      status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT,
      sender TEXT,
      text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wellness_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT,
      entry_type TEXT NOT NULL,
      content_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const pgSchema = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE,
      password_hash TEXT NOT NULL,
      age_group VARCHAR(50),
      profile_json TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      username VARCHAR(255),
      mood_type VARCHAR(50),
      score INTEGER,
      risk_level VARCHAR(50),
      risk_factors_json TEXT,
      strengths_json TEXT,
      answers_json TEXT,
      recommendations_json TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      specialty VARCHAR(255) NOT NULL,
      rating REAL,
      experience VARCHAR(100),
      slots_json TEXT,
      fee INTEGER DEFAULT 500,
      email VARCHAR(255),
      phone VARCHAR(50)
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      username VARCHAR(255),
      doctor_id INTEGER,
      doctor_name VARCHAR(255),
      appointment_date VARCHAR(100),
      slot VARCHAR(100),
      payment_method VARCHAR(50),
      payment_status VARCHAR(50) DEFAULT 'confirmed',
      transaction_id VARCHAR(255),
      reminder_sent INTEGER DEFAULT 0,
      booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notification_logs (
      id SERIAL PRIMARY KEY,
      appointment_id INTEGER,
      recipient_role VARCHAR(50),
      recipient_name VARCHAR(255),
      recipient_email VARCHAR(255),
      recipient_phone VARCHAR(50),
      notification_type VARCHAR(50),
      status VARCHAR(50),
      message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      transaction_id VARCHAR(255) UNIQUE NOT NULL,
      user_id INTEGER,
      username VARCHAR(255),
      appointment_id INTEGER,
      amount INTEGER NOT NULL,
      payment_method VARCHAR(50) NOT NULL,
      payment_details_masked TEXT,
      status VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      username VARCHAR(255),
      sender VARCHAR(50),
      text TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wellness_entries (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      username VARCHAR(255),
      entry_type VARCHAR(50) NOT NULL,
      content_json TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await db.exec(isPostgres ? pgSchema : sqliteSchema);

  // Column Migrations for SQLite if DB existed prior
  if (!isPostgres) {
    try { await db.exec(`ALTER TABLE appointments ADD COLUMN appointment_date TEXT;`); } catch (e) {}
    try { await db.exec(`ALTER TABLE appointments ADD COLUMN transaction_id TEXT;`); } catch (e) {}
    try { await db.exec(`ALTER TABLE appointments ADD COLUMN payment_status TEXT DEFAULT 'confirmed';`); } catch (e) {}
    try { await db.exec(`ALTER TABLE appointments ADD COLUMN reminder_sent INTEGER DEFAULT 0;`); } catch (e) {}
    try { await db.exec(`ALTER TABLE doctors ADD COLUMN fee INTEGER DEFAULT 500;`); } catch (e) {}
    try { await db.exec(`ALTER TABLE doctors ADD COLUMN email TEXT;`); } catch (e) {}
    try { await db.exec(`ALTER TABLE doctors ADD COLUMN phone TEXT;`); } catch (e) {}
  }

  // Update Doctor Contact Details if null
  try {
    await db.exec(`UPDATE doctors SET email = 'dr.sarah.johnson@mateomind.com', phone = '+1 555-0144' WHERE name LIKE '%Sarah%' AND (email IS NULL OR email = '');`);
    await db.exec(`UPDATE doctors SET email = 'dr.michael.chen@mateomind.com', phone = '+1 555-0188' WHERE name LIKE '%Michael%' AND (email IS NULL OR email = '');`);
    await db.exec(`UPDATE doctors SET email = 'dr.emily.davis@mateomind.com', phone = '+1 555-0122' WHERE name LIKE '%Emily%' AND (email IS NULL OR email = '');`);
  } catch (e) {}

  // Seed default doctors if missing
  const doctorCount = await db.get(`SELECT COUNT(*) as count FROM doctors`);
  const count = Number(doctorCount?.count || 0);

  if (count === 0) {
    const doctors = [
      { name: "Dr. Sarah Johnson", specialty: "Clinical Psychologist", rating: 4.9, experience: "8 years", slots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"], fee: 500, email: "dr.sarah.johnson@mateomind.com", phone: "+1 555-0144" },
      { name: "Dr. Michael Chen", specialty: "Psychiatrist", rating: 4.8, experience: "12 years", slots: ["10:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"], fee: 650, email: "dr.michael.chen@mateomind.com", phone: "+1 555-0188" },
      { name: "Dr. Emily Davis", specialty: "Therapist", rating: 4.7, experience: "6 years", slots: ["8:00 AM", "12:00 PM", "6:00 PM", "7:00 PM"], fee: 450, email: "dr.emily.davis@mateomind.com", phone: "+1 555-0122" }
    ];

    for (const doc of doctors) {
      await db.run(
        `INSERT INTO doctors (name, specialty, rating, experience, slots_json, fee, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [doc.name, doc.specialty, doc.rating, doc.experience, JSON.stringify(doc.slots), doc.fee, doc.email, doc.phone]
      );
    }
  }
}

// Execute initialization
initDb().catch(err => {
  console.error("Database initialization error:", err);
});

export default db;
