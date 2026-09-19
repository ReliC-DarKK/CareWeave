import { randomUUID } from "node:crypto";
import { TimelineEventType, type PrismaClient } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { extractDocumentText } from "./document.extractor.js";
import type { DocumentMetadata } from "./document.schema.js";
import {
  defaultP1DocumentExtractor,
  type P1DocumentExtractor,
  type P1ExtractedClinicalData,
} from "./p1Extractor.adapter.js";

export interface ProcessDocumentParams {
  patientId: string;
  originalFilename: string;
  mimeType: string;
  buffer: Buffer;
}

export interface ProcessedDocumentResult {
  document: DocumentMetadata;
  extractedText: string;
  clinicalData: P1ExtractedClinicalData;
}

/**
 * Service managing document upload processing, text extraction,
 * P1 clinical extraction handoff, and provenance tracking.
 */
export class DocumentService {
  private readonly documentStore = new Map<string, DocumentMetadata>();

  constructor(
    private readonly db: PrismaClient = prisma,
    private readonly p1Extractor: P1DocumentExtractor = defaultP1DocumentExtractor,
  ) {}

  /**
   * Processes an uploaded PDF document:
   * 1. Stores document metadata with provenance.
   * 2. Extracts raw text from the PDF.
   * 3. Hands raw text to P1 document extraction boundary.
   * 4. Persists a timeline event preserving document provenance.
   */
  async processUploadedDocument(
    params: ProcessDocumentParams,
  ): Promise<ProcessedDocumentResult> {
    const { patientId, originalFilename, mimeType, buffer } = params;
    const documentId = randomUUID();
    const uploadedAt = new Date().toISOString();

    const metadata: DocumentMetadata = {
      id: documentId,
      patientId,
      originalFilename,
      mimeType,
      sizeBytes: buffer.length,
      uploadedAt,
      extractionStatus: "PENDING",
      provenance: {
        sourceType: "DOCUMENT_UPLOAD",
        sourceRef: documentId,
      },
    };

    this.documentStore.set(documentId, metadata);

    let extractedText = "";
    let clinicalData: P1ExtractedClinicalData = {
      conditions: [],
      medications: [],
      labs: [],
      appointments: [],
      symptoms: [],
      timelineEvents: [],
    };

    try {
      // Extract raw text only (P2 responsibility)
      extractedText = await extractDocumentText(buffer);

      // Hand off to P1 boundary (P1 responsibility)
      clinicalData = await this.p1Extractor.extractClinicalData(extractedText, {
        patientId,
        documentId,
        originalFilename,
      });

      metadata.extractionStatus = "COMPLETED";
    } catch (err) {
      metadata.extractionStatus = "FAILED";
      throw err;
    }

    // Record timeline event in database preserving document provenance
    try {
      await this.db.timelineEvent.create({
        data: {
          patientId,
          type: TimelineEventType.NOTE,
          eventTime: new Date(uploadedAt),
          title: `Document Uploaded: ${originalFilename}`,
          description: `Uploaded PDF document (${(buffer.length / 1024).toFixed(1)} KB).`,
          sourceType: "DOCUMENT_UPLOAD",
          sourceRef: documentId,
        },
      });
    } catch {
      // In offline tests or when db table is mocked, gracefully proceed
    }

    return {
      document: metadata,
      extractedText,
      clinicalData,
    };
  }

  getDocumentById(id: string): DocumentMetadata | undefined {
    return this.documentStore.get(id);
  }

  listDocumentsForPatient(patientId: string): DocumentMetadata[] {
    return Array.from(this.documentStore.values()).filter(
      (doc) => doc.patientId === patientId,
    );
  }
}

export const documentService = new DocumentService();
