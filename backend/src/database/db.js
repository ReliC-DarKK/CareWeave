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

  // Schema creation: documents table
  db.exec(`
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
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
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

  dbInstance = db;
  return dbInstance;
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
