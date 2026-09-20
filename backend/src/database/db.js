/**
 * Database Initialization & Connection — CareWeave Project 2.0
 *
 * Provides a lightweight, local SQLite database using better-sqlite3.
 * Automatically initializes required tables and indexes on startup.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbInstance = null;

/**
 * Get the database file path from environment or default to backend/data/careweave.db
 * @returns {string}
 */
export function getDefaultDbPath() {
  if (process.env.DATABASE_PATH) {
    return process.env.DATABASE_PATH;
  }
  return path.resolve(__dirname, '../../data/careweave.db');
}

/**
 * Initialize SQLite database with required tables and pragmas
 * @param {string} [customPath] — Optional custom database path (e.g. for testing)
 * @returns {Database.Database}
 */
export function initDatabase(customPath) {
  const dbPath = customPath || getDefaultDbPath();

  // If already initialized for the same path, return existing instance
  if (dbInstance && dbInstance.name === dbPath) {
    return dbInstance;
  }

  // Ensure target directory exists (unless in-memory database)
  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new Database(dbPath);

  // Performance and integrity pragmas
  db.pragma('foreign_keys = ON');
  if (dbPath !== ':memory:') {
    db.pragma('journal_mode = WAL');
  }

  // Schema creation: patients, documents, extractions
  db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      owner_email TEXT NOT NULL,
      name TEXT NOT NULL,
      date_of_birth TEXT,
      identifier TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_patients_owner ON patients(owner_email);
    CREATE INDEX IF NOT EXISTS idx_patients_lookup ON patients(owner_email, name, date_of_birth);
    CREATE INDEX IF NOT EXISTS idx_patients_identifier ON patients(owner_email, identifier);

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      owner_email TEXT NOT NULL,
      original_name TEXT NOT NULL,
      stored_filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      uploaded_at TEXT NOT NULL,
      processing_status TEXT NOT NULL DEFAULT 'UPLOADED',
      processing_result TEXT,
      extraction_status TEXT,
      patient_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_documents_owner ON documents(owner_email);

    CREATE TABLE IF NOT EXISTS extractions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL UNIQUE,
      document_type TEXT,
      document_date TEXT,
      report_id TEXT,
      patient_name TEXT,
      patient_dob TEXT,
      patient_identifier TEXT,
      doctor_name TEXT,
      doctor_speciality TEXT,
      doctor_clinic TEXT,
      tests TEXT NOT NULL,
      medications TEXT NOT NULL,
      clinical_information TEXT NOT NULL,
      provenance TEXT NOT NULL,
      extracted_at TEXT NOT NULL,
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_extractions_doc ON extractions(document_id);
  `);

  // Idempotently add patient_id column if table was already created in Step 10
  const docColumns = db.prepare('PRAGMA table_info(documents)').all();
  const hasPatientId = docColumns.some((col) => col.name === 'patient_id');
  if (!hasPatientId) {
    db.exec('ALTER TABLE documents ADD COLUMN patient_id TEXT REFERENCES patients(id) ON DELETE SET NULL;');
  }
  db.exec('CREATE INDEX IF NOT EXISTS idx_documents_patient ON documents(patient_id);');

  // Seed default patient profiles for multi-user support
  seedDevelopmentUsersAndPatients(db);

  dbInstance = db;
  return dbInstance;
}

/**
 * Seed and migrate default patient profiles for development accounts:
 * - Aditi Sharma (aditi@careweave.com)
 * - Rohan Mehta (rohan@careweave.com)
 * - Sarah Jenkins (sarah@careweave.com)
 * @param {Database.Database} db
 */
export function seedDevelopmentUsersAndPatients(db) {
  try {
    const now = new Date().toISOString();

    // 1. Migrate any legacy records from demo@example.com to aditi@careweave.com
    db.prepare(`UPDATE patients SET owner_email = 'aditi@careweave.com' WHERE owner_email = 'demo@example.com'`).run();
    db.prepare(`UPDATE documents SET owner_email = 'aditi@careweave.com' WHERE owner_email = 'demo@example.com'`).run();

    // 2. Ensure Aditi Sharma exists
    const aditi = db.prepare(`SELECT * FROM patients WHERE owner_email = 'aditi@careweave.com' AND name LIKE '%Aditi%'`).get();
    let aditiId = aditi?.id;
    if (!aditi) {
      aditiId = 'pat_aditi_sharma_01';
      db.prepare(`
        INSERT INTO patients (id, owner_email, name, date_of_birth, identifier, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(aditiId, 'aditi@careweave.com', 'Aditi Sharma', '1985-06-15', 'MRN-ADITI-01', now, now);
    }

    // Link any orphaned documents belonging to aditi to her primary patient record
    if (aditiId) {
      db.prepare(`UPDATE documents SET patient_id = ? WHERE owner_email = 'aditi@careweave.com' AND patient_id IS NULL`).run(aditiId);
    }

    // 3. Ensure Rohan Mehta exists
    const rohan = db.prepare(`SELECT * FROM patients WHERE owner_email = 'rohan@careweave.com'`).get();
    if (!rohan) {
      db.prepare(`
        INSERT INTO patients (id, owner_email, name, date_of_birth, identifier, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run('pat_rohan_mehta_01', 'rohan@careweave.com', 'Rohan Mehta', '1988-04-12', 'MRN-ROHAN-01', now, now);
    }

    // 4. Ensure Sarah Jenkins exists
    const sarah = db.prepare(`SELECT * FROM patients WHERE owner_email = 'sarah@careweave.com'`).get();
    if (!sarah) {
      db.prepare(`
        INSERT INTO patients (id, owner_email, name, date_of_birth, identifier, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run('pat_sarah_jenkins_01', 'sarah@careweave.com', 'Sarah Jenkins', '1992-09-25', 'MRN-SARAH-01', now, now);
    }
  } catch (err) {
    console.warn('Notice: seedDevelopmentUsersAndPatients info:', err.message);
  }
}

/**
 * Retrieve the active database instance
 * @returns {Database.Database}
 */
export function getDb() {
  if (!dbInstance) {
    return initDatabase();
  }
  return dbInstance;
}

/**
 * Close database connection (for graceful shutdown or test teardown)
 */
export function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

export default {
  initDatabase,
  getDb,
  closeDb,
  getDefaultDbPath,
};
