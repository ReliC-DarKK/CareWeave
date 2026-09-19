/**
 * Document Processing Routes — CareWeave Project 2.0
 *
 * POST /api/documents/:documentId/process
 *
 * Authenticated endpoint that triggers text extraction for a stored document.
 * Returns structured processing metadata — never raw text or filesystem paths.
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDocument } from '../services/documentRegistry.js';
import {
  processDocument,
  isValidDocumentId,
  ProcessingError,
} from '../services/documentProcessingService.js';

const router = express.Router();

/**
 * POST /api/documents/:documentId/process
 *
 * 1. Authenticate user via JWT
 * 2. Validate documentId format (strict regex — prevents path traversal)
 * 3. Verify document exists in registry
 * 4. Verify ownership (req.user.email === doc.ownerEmail)
 * 5. Process the document
 * 6. Return structured result (no text, no filesystem paths)
 */
router.post(
  '/:documentId/process',
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
          error: 'You do not have permission to process this document.',
        });
      }

      // 4. Process
      const result = await processDocument(documentId);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      // Handle our custom ProcessingError with appropriate status codes
      if (err instanceof ProcessingError) {
        return res.status(err.statusCode).json({
          error: err.message,
        });
      }

      // Unexpected errors — log safely, return generic message
      console.error(`Processing route error for ${req.params.documentId}: ${err.message}`);
      return res.status(500).json({
        error: 'An unexpected error occurred during document processing.',
      });
    }
  }
);

export default router;
