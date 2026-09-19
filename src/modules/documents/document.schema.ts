import { z } from "zod";
import { patientParamsSchema } from "../patients/patient.schema.js";

export const documentParamsSchema = patientParamsSchema;
export type DocumentParams = z.infer<typeof documentParamsSchema>;

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_DOCUMENT_MIME_TYPES = ["application/pdf"] as const;

export type DocumentExtractionStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface DocumentMetadata {
  id: string;
  patientId: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  extractionStatus: DocumentExtractionStatus;
  provenance: {
    sourceType: "DOCUMENT_UPLOAD";
    sourceRef: string;
  };
}
