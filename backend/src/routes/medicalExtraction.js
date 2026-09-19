/**
 * Medical Extraction Routes — CareWeave Project 2.0
 *
 * POST /api/documents/:documentId/extract
 *
 * Authenticated endpoint that triggers structured medical information extraction
 * from the text extracted during Step 8.
 *
 * Grounded in source document text. Zero clinical interpretation.
 * Returns structured metadata and entities — never raw text or filesystem paths.
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDocument } from '../services/documentRegistry.js';
import { isValidDocumentId } from '../services/documentProcessingService.js';
import {
  extractMedicalInformation,
  ExtractionError,
} from '../services/medicalExtractionService.js';

const router = express.Router();

/**
 * POST /api/documents/:documentId/extract
 *
 * 1. Authenticate user via JWT
 * 2. Validate documentId format (strict UUID regex)
 * 3. Verify document exists in registry
 * 4. Verify ownership (req.user.email === doc.ownerEmail)
 * 5. Verify Step 8 text processing readiness
 * 6. Execute structured extraction
 * 7. Return database-ready structured response
 */
router.post(
  '/:documentId/extract',
  authenticateToken,
  async (req, res) => {
    try {
      const { documentId } = req.params;

      // 1. Validate document ID format
      if (!isValidDocumentId(documentId)) {
        return res.status(400).json({
          error: 'Invalid document identifier format.',
        });
      }

      // 2. Verify document exists
      const doc = getDocument(documentId);
      if (!doc) {
        return res.status(404).json({
          error: 'Document not found.',
        });
      }

      // 3. Verify ownership
      if (!req.user || !req.user.email || doc.ownerEmail !== req.user.email) {
        return res.status(403).json({
          error: 'You do not have permission to access or extract this document.',
        });
      }

      // 4. Extract structured medical information
      const result = await extractMedicalInformation(documentId);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      if (err instanceof ExtractionError) {
        return res.status(err.statusCode).json({
          error: err.message,
        });
      }

      // Safe error response — no stack traces or server paths
      console.error(`Medical extraction route error for ${req.params.documentId}: ${err.message}`);
      return res.status(500).json({
        error: 'An unexpected error occurred during medical information extraction.',
      });
    }
  }
);

export default router;
