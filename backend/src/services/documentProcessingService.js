/**
 * Document Processing Service — CareWeave Project 2.0
 *
 * Responsible for:
 *  - Locating stored documents via the in-memory registry
 *  - Validating documents before processing
 *  - Determining processing strategy by MIME type
 *  - Extracting text from text-based PDFs (via pdf-parse)
 *  - Normalizing extracted text
 *  - Returning structured processing metadata (never raw text in API responses)
 *
 * Does NOT perform medical interpretation.
 * Does NOT call any LLM or AI service.
 */

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { UPLOADS_DIR, MAX_UPLOAD_BYTES } from './documentService.js';
import { getDocument, updateDocument } from './documentRegistry.js';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

// ──────────────────────────────────────────────
// Processing State Constants
// ──────────────────────────────────────────────

export const PROCESSING_STATUS = {
  UPLOADED: 'UPLOADED',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  OCR_REQUIRED: 'OCR_REQUIRED',
  FAILED: 'FAILED',
};

// MIME types that support text extraction
const PDF_MIME = 'application/pdf';
const IMAGE_MIMES = ['image/jpeg', 'image/png'];

// Safe document ID format: doc_ followed by UUID or alphanumeric slug
const DOCUMENT_ID_PATTERN = /^doc_[a-zA-Z0-9_-]{3,64}$/;

// ──────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────

/**
 * Validate that a document ID matches the expected format.
 * Prevents path traversal and injection.
 * @param {string} documentId
 * @returns {boolean}
 */
export function isValidDocumentId(documentId) {
  if (!documentId || typeof documentId !== 'string') return false;
  return DOCUMENT_ID_PATTERN.test(documentId);
}

/**
 * Resolve the absolute path to a stored document and verify it stays
 * within the uploads directory (path traversal protection).
 * @param {string} storedFilename
 * @returns {string|null} Absolute path, or null if unsafe
 */
export function resolveDocumentPath(storedFilename) {
  const resolved = path.resolve(UPLOADS_DIR, storedFilename);

  // Ensure the resolved path is contained within UPLOADS_DIR
  const uploadsNormalized = path.resolve(UPLOADS_DIR) + path.sep;
  if (!resolved.startsWith(uploadsNormalized) && resolved !== path.resolve(UPLOADS_DIR)) {
    return null;
  }

  return resolved;
}

/**
 * Validate that a stored document is safe to process.
 * @param {object} doc — Document record from registry
 * @returns {{ valid: boolean, error?: string }}
 */
function validateDocumentForProcessing(doc) {
  if (!doc) {
    return { valid: false, error: 'Document not found.' };
  }

  if (!doc.storedFilename) {
    return { valid: false, error: 'Document storage metadata is incomplete.' };
  }

  const filePath = resolveDocumentPath(doc.storedFilename);
  if (!filePath) {
    return { valid: false, error: 'Document storage path is invalid.' };
  }

  // Verify the file actually exists on disk
  if (!fs.existsSync(filePath)) {
    return { valid: false, error: 'Document file is no longer available.' };
  }

  // Re-validate file size (defense in depth — already limited by Multer)
  const stats = fs.statSync(filePath);
  if (stats.size > MAX_UPLOAD_BYTES) {
    return { valid: false, error: 'Document file exceeds processing size limit.' };
  }

  if (stats.size === 0) {
    return { valid: false, error: 'Document file is empty.' };
  }

  return { valid: true, filePath };
}

// ──────────────────────────────────────────────
// Text Normalization
// ──────────────────────────────────────────────

/**
 * Normalize extracted text:
 *  - Collapse runs of spaces/tabs into single spaces
 *  - Preserve paragraph breaks (double newlines)
 *  - Trim leading/trailing whitespace
 *  - Do NOT summarize, rewrite, or interpret content
 *
 * @param {string} rawText
 * @returns {string}
 */
function normalizeExtractedText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  return rawText
    // Replace \r\n and \r with \n for consistency
    .replace(/\r\n?/g, '\n')
    // Collapse horizontal whitespace (spaces/tabs) into single spaces per line
    .replace(/[ \t]+/g, ' ')
    // Collapse 3+ consecutive newlines into double newlines (paragraph break)
    .replace(/\n{3,}/g, '\n\n')
    // Trim each line
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    // Final trim
    .trim();
}

// ──────────────────────────────────────────────
// PDF Text Extraction
// ──────────────────────────────────────────────

/**
 * Extract text from a PDF file using pdf-parse.
 * @param {string} filePath — Absolute path to the PDF
 * @returns {Promise<{ text: string, pageCount: number }>}
 */
export async function extractPdfText(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: dataBuffer });
  try {
    const result = await parser.getText();
    const normalizedText = normalizeExtractedText(result.text || '');
    return {
      text: normalizedText,
      pageCount: result.total || (result.pages ? result.pages.length : 0),
    };
  } finally {
    if (typeof parser.destroy === 'function') {
      try {
        await parser.destroy();
      } catch {
        // Ignore destroy error
      }
    }
  }
}

// ──────────────────────────────────────────────
// Main Processing Orchestrator
// ──────────────────────────────────────────────

/**
 * Process a document: validate, extract text (for PDFs), update registry.
 *
 * @param {string} documentId
 * @returns {Promise<object>} Processing result metadata (never includes raw text)
 */
export async function processDocument(documentId) {
  const doc = getDocument(documentId);

  if (!doc) {
    throw new ProcessingError('Document not found.', 404);
  }

  // If already processed successfully, return cached result
  if (doc.processingStatus === PROCESSING_STATUS.READY) {
    return {
      document: { id: doc.id, status: doc.processingStatus },
      processing: doc.processingResult,
    };
  }

  // If OCR_REQUIRED, return that status (no re-processing)
  if (doc.processingStatus === PROCESSING_STATUS.OCR_REQUIRED) {
    return {
      document: { id: doc.id, status: doc.processingStatus },
      processing: doc.processingResult,
    };
  }

  // If currently being processed by another request, return current state
  if (doc.processingStatus === PROCESSING_STATUS.PROCESSING) {
    return {
      document: { id: doc.id, status: doc.processingStatus },
      processing: { type: 'pending', status: PROCESSING_STATUS.PROCESSING },
    };
  }

  // Validate the stored file before processing
  const validation = validateDocumentForProcessing(doc);
  if (!validation.valid) {
    updateDocument(documentId, {
      processingStatus: PROCESSING_STATUS.FAILED,
      processingResult: { type: 'validation_error', status: PROCESSING_STATUS.FAILED, error: validation.error },
    });
    throw new ProcessingError(validation.error, 422);
  }

  // Mark as processing
  updateDocument(documentId, { processingStatus: PROCESSING_STATUS.PROCESSING });

  try {
    const mimeType = (doc.mimeType || '').toLowerCase();

    // ── PDF Text Extraction ──
    if (mimeType === PDF_MIME) {
      const extraction = await extractPdfText(validation.filePath);

      if (!extraction.text || extraction.text.length === 0) {
        // PDF exists but contains no extractable text (scanned/image-only PDF)
        const result = {
          type: 'pdf_image',
          status: PROCESSING_STATUS.OCR_REQUIRED,
          pageCount: extraction.pageCount,
          characterCount: 0,
        };

        updateDocument(documentId, {
          processingStatus: PROCESSING_STATUS.OCR_REQUIRED,
          processingResult: result,
        });

        return { document: { id: doc.id, status: PROCESSING_STATUS.OCR_REQUIRED }, processing: result };
      }

      // Successful text extraction
      const result = {
        type: 'pdf_text',
        status: PROCESSING_STATUS.READY,
        pageCount: extraction.pageCount,
        characterCount: extraction.text.length,
      };

      updateDocument(documentId, {
        processingStatus: PROCESSING_STATUS.READY,
        processingResult: result,
        // Store extracted text in registry for later consumption by medical extraction layer
        // This is NEVER returned in API responses
        _extractedText: extraction.text,
      });

      // Log safe metadata only — never log extracted text
      console.log(`Document ${documentId}: PDF text extracted (${extraction.text.length} chars, ${extraction.pageCount} pages)`);

      return { document: { id: doc.id, status: PROCESSING_STATUS.READY }, processing: result };
    }

    // ── Image Files ──
    if (IMAGE_MIMES.includes(mimeType)) {
      const result = {
        type: 'image',
        status: PROCESSING_STATUS.OCR_REQUIRED,
        characterCount: 0,
      };

      updateDocument(documentId, {
        processingStatus: PROCESSING_STATUS.OCR_REQUIRED,
        processingResult: result,
      });

      console.log(`Document ${documentId}: Image file — OCR required`);

      return { document: { id: doc.id, status: PROCESSING_STATUS.OCR_REQUIRED }, processing: result };
    }

    // ── Unsupported MIME (should not reach here due to upload validation) ──
    const result = {
      type: 'unsupported',
      status: PROCESSING_STATUS.FAILED,
    };

    updateDocument(documentId, {
      processingStatus: PROCESSING_STATUS.FAILED,
      processingResult: result,
    });

    throw new ProcessingError('Unsupported document type for processing.', 422);
  } catch (err) {
    // If it's already a ProcessingError, re-throw
    if (err instanceof ProcessingError) throw err;

    // Catch unexpected errors (e.g., corrupted PDF, I/O failure)
    // Log safe metadata only — no stack traces to client
    console.error(`Document ${documentId}: Processing failed — ${err.message}`);

    updateDocument(documentId, {
      processingStatus: PROCESSING_STATUS.FAILED,
      processingResult: { type: 'error', status: PROCESSING_STATUS.FAILED },
    });

    throw new ProcessingError('Document processing failed. The file may be corrupted or unreadable.', 500);
  }
}

// ──────────────────────────────────────────────
// Custom Error Class
// ──────────────────────────────────────────────

export class ProcessingError extends Error {
  /**
   * @param {string} message — Safe, user-facing message
   * @param {number} statusCode — HTTP status code
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'ProcessingError';
    this.statusCode = statusCode;
  }
}
