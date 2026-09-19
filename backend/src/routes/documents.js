import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import {
  uploadMiddleware,
  sanitizeFilename,
  MAX_UPLOAD_MB,
} from '../services/documentService.js';

const router = express.Router();

/**
 * POST /api/documents/upload
 * Authenticated endpoint for medical document upload.
 * Validates JWT, processes multipart file, applies strict size and type constraints.
 */
router.post(
  '/upload',
  authenticateToken,
  (req, res) => {
    // Custom wrapper around multer to handle multer errors gracefully
    uploadMiddleware.single('file')(req, res, (err) => {
      // Handle Multer-specific errors
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            error: `File exceeds maximum allowed size of ${MAX_UPLOAD_MB} MB.`,
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            error: 'Unexpected file field. Please submit file under field "file".',
          });
        }
        return res.status(400).json({
          error: `Upload processing error: ${err.message}`,
        });
      }

      // Handle custom fileFilter errors (e.g. invalid MIME/extension)
      if (err) {
        return res.status(400).json({
          error: err.message || 'File validation failed.',
        });
      }

      // Verify that a file was provided
      if (!req.file) {
        return res.status(400).json({
          error: 'No file provided. Please select a document to upload.',
        });
      }

      const safeOriginalName = sanitizeFilename(req.file.originalname);
      const documentId = req.uploadedDocumentId || `doc_${Date.now()}`;

      // Return clean metadata without exposing server filesystem paths or file contents
      return res.status(200).json({
        success: true,
        document: {
          id: documentId,
          originalName: safeOriginalName,
          mimeType: req.file.mimetype,
          size: req.file.size,
          uploadedAt: new Date().toISOString(),
        },
      });
    });
  }
);

export default router;
