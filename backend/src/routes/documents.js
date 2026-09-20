/**
 * Document Routes — CareWeave Project 2.0
 *
 * Endpoints:
 *  - POST /api/documents/upload: Upload medical document (PDF/PNG/JPEG)
 *  - GET  /api/documents: Retrieve all persisted documents for authenticated owner
 *  - GET  /api/documents/:documentId: Retrieve single document metadata + structured extraction
 */

import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import {
  uploadMiddleware,
  sanitizeFilename,
  MAX_UPLOAD_MB,
} from '../services/documentService.js';
import { registerDocument } from '../services/documentRegistry.js';
import { databaseService } from '../services/databaseService.js';
import { isValidDocumentId } from '../services/documentProcessingService.js';

const router = express.Router();

/**
 * POST /api/documents/upload
 * Authenticated endpoint for medical document upload.
 * Validates JWT, processes multipart file, applies strict size and type constraints.
 * Registers document metadata in SQLite for downstream processing.
 */
router.post(
  '/upload',
  authenticateToken,
  (req, res) => {
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
      const uploadedAt = new Date().toISOString();

      // Check if uploaded within an active patient context
      const requestedPatientId = req.body?.patientId ? String(req.body.patientId).trim() : null;
      let assignedPatientId = null;
      if (requestedPatientId) {
        const targetPatient = databaseService.getPatientById(requestedPatientId);
        if (targetPatient && targetPatient.ownerEmail === req.user.email) {
          assignedPatientId = targetPatient.id;
        }
      }

      // Register document in persistent SQLite storage
      registerDocument({
        id: documentId,
        storedFilename: req.file.filename,
        originalName: safeOriginalName,
        mimeType: req.file.mimetype,
        size: req.file.size,
        ownerEmail: req.user.email,
        uploadedAt,
        patientId: assignedPatientId,
      });

      // Return clean metadata without exposing server filesystem paths or file contents
      return res.status(200).json({
        success: true,
        document: {
          id: documentId,
          originalName: safeOriginalName,
          mimeType: req.file.mimetype,
          size: req.file.size,
          uploadedAt,
        },
      });
    });
  }
);

/**
 * GET /api/documents
 * Authenticated endpoint retrieving all persisted documents for the authenticated user.
 * Strictly no filesystem paths and no raw document text.
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    const ownerEmail = req.user.email;
    const documents = databaseService.getDocumentsByOwner(ownerEmail);

    // Return safe, sanitized document representations with summary metadata
    const sanitizedDocuments = documents.map((doc) => {
      const ext = databaseService.getExtractionByDocumentId(doc.id);
      return {
        id: doc.id,
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        size: doc.size,
        uploadedAt: doc.uploadedAt,
        processingStatus: doc.processingStatus,
        extractionStatus: doc.extractionStatus || null,
        patientId: doc.patientId || null,
        hasExtraction: doc.extractionStatus === 'EXTRACTED',
        documentDate: ext?.documentDate || null,
        documentType: ext?.documentType || null,
        doctor: ext?.doctor ? {
          name: ext.doctor.name || null,
          clinic: ext.doctor.clinic || null,
          speciality: ext.doctor.speciality || null,
        } : null,
        counts: {
          tests: Array.isArray(ext?.tests) ? ext.tests.length : 0,
          medications: Array.isArray(ext?.medications) ? ext.medications.length : 0,
        },
      };
    });

    return res.status(200).json({
      success: true,
      documents: sanitizedDocuments,
    });
  } catch (err) {
    console.error(`Error retrieving documents for ${req.user?.email}: ${err.message}`);
    return res.status(500).json({
      error: 'An unexpected error occurred while retrieving documents.',
    });
  }
});

/**
 * GET /api/documents/:documentId
 * Authenticated endpoint retrieving a single persisted document and its structured extraction.
 * Strictly checks ownership. Never exposes filesystem paths or raw document text.
 */
router.get('/:documentId', authenticateToken, (req, res) => {
  try {
    const { documentId } = req.params;

    // 1. Validate document ID format
    if (!isValidDocumentId(documentId)) {
      return res.status(400).json({
        error: 'Invalid document identifier format.',
      });
    }

    // 2. Fetch document with extraction from persistent SQLite storage
    const result = databaseService.getDocumentWithExtraction(documentId);
    if (!result || !result.document) {
      return res.status(404).json({
        error: 'Document not found.',
      });
    }

    const { document: doc, extraction } = result;

    // 3. Ownership verification
    if (!req.user || !req.user.email || doc.ownerEmail !== req.user.email) {
      return res.status(403).json({
        error: 'You do not have permission to view this document.',
      });
    }

    // 4. Return safe structured result
    return res.status(200).json({
      success: true,
      document: {
        id: doc.id,
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        size: doc.size,
        uploadedAt: doc.uploadedAt,
        processingStatus: doc.processingStatus,
        extractionStatus: doc.extractionStatus || null,
        patientId: doc.patientId || null,
      },
      extraction: extraction || null,
    });
  } catch (err) {
    console.error(`Error retrieving document ${req.params?.documentId}: ${err.message}`);
    return res.status(500).json({
      error: 'An unexpected error occurred while retrieving document details.',
    });
  }
});

export default router;
