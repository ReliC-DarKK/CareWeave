import type { FastifyInstance } from "fastify";
import { authenticate, requirePatientAccess } from "../../middleware/auth.js";
import { patientService } from "../patients/patient.service.js";
import {
  documentParamsSchema,
  MAX_DOCUMENT_SIZE_BYTES,
} from "./document.schema.js";
import { documentService } from "./document.service.js";
import { isValidPdfBuffer } from "./document.extractor.js";

/**
 * Documents module routes.
 *
 * POST /api/v1/patients/:patientId/documents
 * Uploads and processes a PDF document for a patient:
 * 1. Validates patient existence.
 * 2. Validates multipart format, PDF MIME/magic bytes, and size limits (10MB).
 * 3. Extracts raw text from the PDF.
 * 4. Hands off raw text to P1 document extraction boundary.
 * 5. Records metadata and provenance, returning structured result.
 */
export async function registerDocumentRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    "/patients/:patientId/documents",
    {
      preHandler: [authenticate, requirePatientAccess],
    },
    async (request, reply) => {
      const { patientId } = documentParamsSchema.parse(request.params);

      // 1. Validate patient existence
      const exists = await patientService.exists(patientId);
      if (!exists) {
        return reply.status(404).send({
          error: {
            message: `Patient not found: ${patientId}`,
            code: "NOT_FOUND",
          },
        });
      }

      // 2. Validate multipart request
      if (!request.isMultipart()) {
        return reply.status(400).send({
          error: {
            message: "Request must be multipart/form-data",
            code: "BAD_REQUEST",
          },
        });
      }

      let filePart;
      try {
        filePart = await request.file();
      } catch (err: unknown) {
        const errorObj = err as { code?: string; statusCode?: number; message?: string };
        if (errorObj?.code === "FST_REQ_FILE_TOO_LARGE" || errorObj?.statusCode === 413) {
          return reply.status(413).send({
            error: {
              message: "Document size exceeds maximum allowed limit of 10MB",
              code: "PAYLOAD_TOO_LARGE",
              details: { maxBytes: MAX_DOCUMENT_SIZE_BYTES },
            },
          });
        }
        throw err;
      }

      // 3. Validate file presence
      if (!filePart) {
        return reply.status(400).send({
          error: {
            message: "No document file uploaded",
            code: "BAD_REQUEST",
          },
        });
      }

      // 4. Validate MIME type and file extension
      const isPdfMime = filePart.mimetype === "application/pdf";
      const isPdfExt = filePart.filename.toLowerCase().endsWith(".pdf");
      if (!isPdfMime && !isPdfExt) {
        return reply.status(400).send({
          error: {
            message: "Invalid file type: only PDF documents are supported",
            code: "BAD_REQUEST",
            details: {
              receivedMime: filePart.mimetype,
              filename: filePart.filename,
            },
          },
        });
      }

      // 5. Read buffer and enforce size limit
      let buffer: Buffer;
      try {
        buffer = await filePart.toBuffer();
      } catch (err: unknown) {
        const errorObj = err as { code?: string; statusCode?: number; message?: string };
        if (errorObj?.code === "FST_REQ_FILE_TOO_LARGE" || errorObj?.statusCode === 413) {
          return reply.status(413).send({
            error: {
              message: "Document size exceeds maximum allowed limit of 10MB",
              code: "PAYLOAD_TOO_LARGE",
              details: { maxBytes: MAX_DOCUMENT_SIZE_BYTES },
            },
          });
        }
        throw err;
      }

      if (filePart.file.truncated || buffer.length > MAX_DOCUMENT_SIZE_BYTES) {
        return reply.status(413).send({
          error: {
            message: "Document size exceeds maximum allowed limit of 10MB",
            code: "PAYLOAD_TOO_LARGE",
            details: { maxBytes: MAX_DOCUMENT_SIZE_BYTES, actualBytes: buffer.length },
          },
        });
      }

      // 6. Validate PDF magic bytes (%PDF-)
      if (!isValidPdfBuffer(buffer)) {
        return reply.status(400).send({
          error: {
            message: "Invalid PDF format: file is corrupted or not a valid PDF",
            code: "BAD_REQUEST",
          },
        });
      }

      // 7. Process document text extraction and P1 clinical handoff
      try {
        const result = await documentService.processUploadedDocument({
          patientId,
          originalFilename: filePart.filename,
          mimeType: filePart.mimetype || "application/pdf",
          buffer,
        });

        return reply.status(201).send({ data: result });
      } catch (err: unknown) {
        request.log.error({ err }, "Document processing failed");
        return reply.status(500).send({
          error: {
            message: "Failed to process document",
            code: "PROCESSING_ERROR",
          },
        });
      }
    },
  );

  // Optional convenience endpoint to inspect document metadata
  app.get(
    "/patients/:patientId/documents/:documentId",
    {
      preHandler: [authenticate, requirePatientAccess],
    },
    async (request, reply) => {
      const { patientId } = documentParamsSchema.parse(request.params);
      const { documentId } = request.params as { documentId: string };

      const document = documentService.getDocumentById(documentId);
      if (!document || document.patientId !== patientId) {
        return reply.status(404).send({
          error: {
            message: `Document not found: ${documentId}`,
            code: "NOT_FOUND",
          },
        });
      }

      return reply.status(200).send({ data: document });
    },
  );
}
