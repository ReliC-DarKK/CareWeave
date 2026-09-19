/**
 * Database Service — CareWeave Project 2.0
 *
 * Data Access Layer for SQLite persistent storage.
 * Handles documents and structured Step 9 medical information extraction records.
 * Uses parameterized queries to prevent SQL injection.
 */

import { getDb } from '../database/db.js';

/**
 * Format a database row into a standardized document object
 * @param {object} row
 * @returns {object|null}
 */
function mapDocumentRow(row) {
  if (!row) return null;

  let processingResult = null;
  if (row.processing_result) {
    try {
      processingResult = JSON.parse(row.processing_result);
    } catch {
      processingResult = null;
    }
  }

  return {
    id: row.id,
    ownerEmail: row.owner_email,
    originalName: row.original_name,
    storedFilename: row.stored_filename,
    mimeType: row.mime_type,
    size: row.size,
    uploadedAt: row.uploaded_at,
    processingStatus: row.processing_status,
    processingResult,
    extractionStatus: row.extraction_status || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Format an extraction database row into the standardized Step 9 medical schema
 * @param {object} row
 * @returns {object|null}
 */
function mapExtractionRow(row) {
  if (!row) return null;

  let tests = [];
  let medications = [];
  let clinicalInformation = { symptoms: [], diagnoses: [], findings: [], recommendations: [], followUp: [] };
  let provenance = null;

  try {
    tests = JSON.parse(row.tests || '[]');
  } catch {}
  try {
    medications = JSON.parse(row.medications || '[]');
  } catch {}
  try {
    clinicalInformation = JSON.parse(row.clinical_information || '{}');
  } catch {}
  try {
    provenance = JSON.parse(row.provenance || '{}');
  } catch {}

  return {
    documentId: row.document_id,
    documentType: row.document_type || 'UNKNOWN',
    documentDate: row.document_date || null,
    reportId: row.report_id || null,
    patient: {
      name: row.patient_name || null,
      dateOfBirth: row.patient_dob || null,
      identifier: row.patient_identifier || null,
    },
    doctor: {
      name: row.doctor_name || null,
      speciality: row.doctor_speciality || null,
      clinic: row.doctor_clinic || null,
    },
    tests,
    medications,
    clinicalInformation,
    provenance,
  };
}

export const databaseService = {
  /**
   * Insert a newly uploaded document or update its metadata
   * @param {object} doc
   * @returns {object} The saved document
   */
  saveDocument(doc) {
    const db = getDb();
    const now = new Date().toISOString();
    const processingResultStr = doc.processingResult ? JSON.stringify(doc.processingResult) : null;

    const stmt = db.prepare(`
      INSERT INTO documents (
        id, owner_email, original_name, stored_filename, mime_type,
        size, uploaded_at, processing_status, processing_result, extraction_status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        owner_email = excluded.owner_email,
        original_name = excluded.original_name,
        stored_filename = excluded.stored_filename,
        mime_type = excluded.mime_type,
        size = excluded.size,
        processing_status = excluded.processing_status,
        processing_result = excluded.processing_result,
        extraction_status = excluded.extraction_status,
        updated_at = excluded.updated_at
    `);

    stmt.run(
      doc.id,
      doc.ownerEmail,
      doc.originalName,
      doc.storedFilename,
      doc.mimeType,
      doc.size,
      doc.uploadedAt || now,
      doc.processingStatus || 'UPLOADED',
      processingResultStr,
      doc.extractionStatus || null,
      doc.createdAt || now,
      now
    );

    return this.getDocumentById(doc.id);
  },

  /**
   * Retrieve a document by ID
   * @param {string} documentId
   * @returns {object|null}
   */
  getDocumentById(documentId) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM documents WHERE id = ?').get(documentId);
    return mapDocumentRow(row);
  },

  /**
   * Retrieve all documents owned by an email address
   * @param {string} ownerEmail
   * @returns {object[]}
   */
  getDocumentsByOwner(ownerEmail) {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM documents WHERE owner_email = ? ORDER BY uploaded_at DESC').all(ownerEmail);
    return rows.map(mapDocumentRow);
  },

  /**
   * Update specific fields on a document
   * @param {string} documentId
   * @param {object} updates
   * @returns {object|null}
   */
  updateDocument(documentId, updates) {
    const existing = this.getDocumentById(documentId);
    if (!existing) return null;

    const merged = { ...existing, ...updates };
    return this.saveDocument(merged);
  },

  /**
   * Persist structured Step 9 extraction results for a document.
   * Handles idempotency: replaces existing record on conflict so repeated extractions don't duplicate.
   *
   * @param {string} documentId
   * @param {object} extractionData — Step 9 structured clinical data
   * @returns {object} Stored extraction data
   */
  saveExtraction(documentId, extractionData) {
    const db = getDb();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO extractions (
        document_id, document_type, document_date, report_id,
        patient_name, patient_dob, patient_identifier,
        doctor_name, doctor_speciality, doctor_clinic,
        tests, medications, clinical_information, provenance, extracted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(document_id) DO UPDATE SET
        document_type = excluded.document_type,
        document_date = excluded.document_date,
        report_id = excluded.report_id,
        patient_name = excluded.patient_name,
        patient_dob = excluded.patient_dob,
        patient_identifier = excluded.patient_identifier,
        doctor_name = excluded.doctor_name,
        doctor_speciality = excluded.doctor_speciality,
        doctor_clinic = excluded.doctor_clinic,
        tests = excluded.tests,
        medications = excluded.medications,
        clinical_information = excluded.clinical_information,
        provenance = excluded.provenance,
        extracted_at = excluded.extracted_at
    `);

    stmt.run(
      documentId,
      extractionData.documentType || 'UNKNOWN',
      extractionData.documentDate || null,
      extractionData.reportId || null,
      extractionData.patient?.name || null,
      extractionData.patient?.dateOfBirth || null,
      extractionData.patient?.identifier || null,
      extractionData.doctor?.name || null,
      extractionData.doctor?.speciality || null,
      extractionData.doctor?.clinic || null,
      JSON.stringify(extractionData.tests || []),
      JSON.stringify(extractionData.medications || []),
      JSON.stringify(extractionData.clinicalInformation || {}),
      JSON.stringify(extractionData.provenance || {}),
      now
    );

    // Also update extraction_status on document
    this.updateDocument(documentId, { extractionStatus: 'EXTRACTED' });

    return this.getExtractionByDocumentId(documentId);
  },

  /**
   * Retrieve structured extraction by document ID
   * @param {string} documentId
   * @returns {object|null}
   */
  getExtractionByDocumentId(documentId) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM extractions WHERE document_id = ?').get(documentId);
    return mapExtractionRow(row);
  },

  /**
   * Retrieve document metadata combined with its extraction data (if available)
   * @param {string} documentId
   * @returns {{ document: object, extraction: object|null }|null}
   */
  getDocumentWithExtraction(documentId) {
    const doc = this.getDocumentById(documentId);
    if (!doc) return null;

    const extraction = this.getExtractionByDocumentId(documentId);
    return {
      document: doc,
      extraction,
    };
  },
};

export default databaseService;
