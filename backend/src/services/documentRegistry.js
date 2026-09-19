/**
 * Document Registry — CareWeave Project 2.0
 *
 * Backed by SQLite persistent storage (via databaseService).
 * Maintains an in-memory session cache for fast access and temporary internal data
 * (such as active session extracted text).
 *
 * All document metadata and statuses survive server restarts.
 */

import { databaseService } from './databaseService.js';

/** @type {Map<string, object>} */
const inMemoryCache = new Map();

/**
 * Register a newly uploaded document in persistent SQLite storage.
 * @param {object} metadata
 * @returns {object} The stored document record
 */
export function registerDocument(metadata) {
  const record = {
    id: metadata.id,
    storedFilename: metadata.storedFilename,
    originalName: metadata.originalName,
    mimeType: metadata.mimeType,
    size: metadata.size,
    ownerEmail: metadata.ownerEmail,
    uploadedAt: metadata.uploadedAt || new Date().toISOString(),
    processingStatus: 'UPLOADED',
    processingResult: null,
    extractionStatus: null,
    extractionResult: null,
  };

  // Persist to SQLite
  databaseService.saveDocument(record);

  // Store in memory cache
  inMemoryCache.set(record.id, record);
  return record;
}

/**
 * Retrieve a document record by ID (checks memory cache, falls back to SQLite).
 * @param {string} documentId
 * @returns {object|null}
 */
export function getDocument(documentId) {
  if (!documentId) return null;

  // Check in-memory cache first
  const cached = inMemoryCache.get(documentId);
  if (cached) return cached;

  // Fallback to SQLite persistent storage
  const persisted = databaseService.getDocumentById(documentId);
  if (persisted) {
    inMemoryCache.set(documentId, persisted);
    return persisted;
  }

  return null;
}

/**
 * Retrieve all documents belonging to a specific owner from persistent storage.
 * @param {string} ownerEmail
 * @returns {object[]}
 */
export function getDocumentsByOwner(ownerEmail) {
  if (!ownerEmail) return [];
  return databaseService.getDocumentsByOwner(ownerEmail);
}

/**
 * Update specific fields on a document record (persists to SQLite and updates cache).
 * @param {string} documentId
 * @param {object} updates — Partial fields to merge
 * @returns {object|null} Updated record, or null if not found
 */
export function updateDocument(documentId, updates) {
  const doc = getDocument(documentId);
  if (!doc) return null;

  // Merge updates
  const updated = { ...doc, ...updates };

  // Persist to SQLite
  databaseService.saveDocument(updated);

  // Update memory cache
  inMemoryCache.set(documentId, updated);
  return updated;
}

export default {
  registerDocument,
  getDocument,
  getDocumentsByOwner,
  updateDocument,
};
