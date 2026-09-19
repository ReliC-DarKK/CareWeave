/**
 * Medical Extraction Service — CareWeave Project 2.0
 *
 * Grounded Medical Document Understanding Layer
 *
 * Coordinates the extraction of structured, document-grounded medical information
 * from the text already extracted during Step 8, and persists the structured result
 * in the SQLite database (Step 10).
 *
 * RULES:
 *  - Grounded in source text: never invents facts or creates ungrounded data.
 *  - Zero clinical interpretation: never infers clinical status (NORMAL/HIGH/LOW).
 *  - Three-category distinction:
 *      1. Present in document -> extracted
 *      2. Not in document -> null or []
 *      3. Clinical interpretation -> never generated
 *  - Consumes internally stored _extractedText from memory, or recovers it from the
 *    stored PDF if the backend restarted prior to extraction.
 *  - Persists structured extraction results in the SQLite database.
 *  - Never logs or exposes raw text or sensitive PHI in server responses.
 */

import { getDocument, updateDocument } from './documentRegistry.js';
import { databaseService } from './databaseService.js';
import {
  PROCESSING_STATUS,
  resolveDocumentPath,
  extractPdfText,
} from './documentProcessingService.js';
import { extractFromText } from './extractors/deterministicExtractor.js';

// ──────────────────────────────────────────────
// Extraction State Constants
// ──────────────────────────────────────────────

export const EXTRACTION_STATUS = {
  EXTRACTION_PENDING: 'EXTRACTION_PENDING',
  EXTRACTING: 'EXTRACTING',
  EXTRACTED: 'EXTRACTED',
  EXTRACTION_FAILED: 'EXTRACTION_FAILED',
};

// ──────────────────────────────────────────────
// Custom Error Class
// ──────────────────────────────────────────────

export class ExtractionError extends Error {
  /**
   * @param {string} message — Safe, user-facing error message
   * @param {number} statusCode — HTTP status code
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'ExtractionError';
    this.statusCode = statusCode;
  }
}

// ──────────────────────────────────────────────
// Core Orchestrator
// ──────────────────────────────────────────────

/**
 * Extract structured medical information from an already-processed document
 * and persist the result into the SQLite database.
 *
 * @param {string} documentId
 * @param {object} [options]
 * @returns {Promise<{ document: object, extraction: object }>}
 */
export async function extractMedicalInformation(documentId, options = {}) {
  const doc = getDocument(documentId);

  // 1. Verify document exists
  if (!doc) {
    throw new ExtractionError('Document not found.', 404);
  }

  // 2. Validate Step 8 processing state
  if (doc.processingStatus === PROCESSING_STATUS.OCR_REQUIRED) {
    throw new ExtractionError(
      'Document is an image file requiring OCR. Text extraction is not yet available for image files.',
      422
    );
  }

  if (doc.processingStatus === PROCESSING_STATUS.FAILED) {
    throw new ExtractionError(
      'Document text extraction previously failed. Cannot extract medical information.',
      422
    );
  }

  if (doc.processingStatus !== PROCESSING_STATUS.READY) {
    throw new ExtractionError(
      'Document text processing must complete successfully before medical information can be extracted.',
      409
    );
  }

  // 3. Check persistent database first (prevents re-extraction and handles restarts)
  const persistedExtraction = databaseService.getExtractionByDocumentId(documentId);
  if (persistedExtraction) {
    return {
      document: {
        id: doc.id,
        status: doc.processingStatus,
        extractionStatus: EXTRACTION_STATUS.EXTRACTED,
      },
      extraction: {
        status: EXTRACTION_STATUS.EXTRACTED,
        data: persistedExtraction,
      },
    };
  }

  // Also check memory cache
  if (doc.extractionStatus === EXTRACTION_STATUS.EXTRACTED && doc.extractionResult) {
    return {
      document: {
        id: doc.id,
        status: doc.processingStatus,
        extractionStatus: doc.extractionStatus,
      },
      extraction: {
        status: doc.extractionStatus,
        data: doc.extractionResult,
      },
    };
  }

  // 4. Obtain raw extracted text (from session cache, or recover from stored PDF)
  let rawText = doc._extractedText;
  if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
    // If backend restarted after processing, recover text from stored PDF
    if (doc.storedFilename && doc.mimeType === 'application/pdf') {
      const filePath = resolveDocumentPath(doc.storedFilename);
      if (filePath) {
        try {
          const extraction = await extractPdfText(filePath);
          rawText = extraction.text;
          doc._extractedText = rawText;
        } catch {
          // Fall through to validation below
        }
      }
    }
  }

  if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
    throw new ExtractionError(
      'No extracted text found for this document.',
      422
    );
  }

  // 5. Update state to EXTRACTING
  updateDocument(documentId, {
    extractionStatus: EXTRACTION_STATUS.EXTRACTING,
  });

  try {
    // 6. Perform deterministic grounded medical extraction
    const structuredData = extractFromText(documentId, rawText, options);

    // 7. Persist structured extraction to SQLite database (Step 10)
    databaseService.saveExtraction(documentId, structuredData);

    // Update document record in registry/database
    updateDocument(documentId, {
      extractionStatus: EXTRACTION_STATUS.EXTRACTED,
      extractionResult: structuredData,
    });

    // Safe metadata-only logging — NEVER logs patient names, values, or PHI
    console.log(
      `Document ${documentId}: Medical extraction persisted to SQLite (${structuredData.provenance?.fieldCounts?.tests || 0} tests, ${structuredData.provenance?.fieldCounts?.medications || 0} medications)`
    );

    // 8. Return structured result
    return {
      document: {
        id: doc.id,
        status: doc.processingStatus,
        extractionStatus: EXTRACTION_STATUS.EXTRACTED,
      },
      extraction: {
        status: EXTRACTION_STATUS.EXTRACTED,
        data: structuredData,
      },
    };
  } catch (err) {
    updateDocument(documentId, {
      extractionStatus: EXTRACTION_STATUS.EXTRACTION_FAILED,
    });

    if (err instanceof ExtractionError) throw err;

    console.error(`Document ${documentId}: Medical extraction failed — ${err.message}`);
    throw new ExtractionError(
      'Medical information extraction failed. The document structure could not be processed.',
      500
    );
  }
}

export default {
  extractMedicalInformation,
  EXTRACTION_STATUS,
  ExtractionError,
};
