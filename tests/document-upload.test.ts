import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";
import { prisma } from "../src/db/prisma.js";
import {
  extractDocumentText,
  isValidPdfBuffer,
} from "../src/modules/documents/document.extractor.js";
import {
  DefaultP1DocumentExtractor,
  type P1DocumentExtractor,
} from "../src/modules/documents/p1Extractor.adapter.js";
import {
  DocumentService,
  documentService,
} from "../src/modules/documents/document.service.js";
import { MAX_DOCUMENT_SIZE_BYTES } from "../src/modules/documents/document.schema.js";

// Mock Prisma for deterministic testing
vi.mock("../src/db/prisma.js", () => {
  const mockPrisma = {
    patient: {
      findUnique: vi.fn(),
    },
    timelineEvent: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    $disconnect: vi.fn(),
  };

  return {
    prisma: mockPrisma,
    disconnectPrisma: vi.fn(),
  };
});

// Helper to construct multipart/form-data payload for Fastify injection
function buildMultipartPayload(options: {
  fieldName?: string;
  filename?: string;
  contentType?: string;
  content: Buffer | string;
  boundary?: string;
}) {
  const boundary = options.boundary ?? "----WebKitFormBoundaryCareWeaveTest123";
  const fieldName = options.fieldName ?? "file";
  const filename = options.filename ?? "clinical_report.pdf";
  const contentType = options.contentType ?? "application/pdf";
  const contentBuffer = Buffer.isBuffer(options.content)
    ? options.content
    : Buffer.from(options.content, "utf8");

  const head = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\nContent-Type: ${contentType}\r\n\r\n`,
  );
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`);

  return {
    payload: Buffer.concat([head, contentBuffer, tail]),
    headers: {
      "content-type": `multipart/form-data; boundary=${boundary}`,
    },
  };
}

// Minimal valid PDF containing test clinical text
const validPdfString =
  "%PDF-1.4\n" +
  "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n" +
  "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n" +
  "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n" +
  "4 0 obj\n<< /Length 85 >>\nstream\n" +
  "BT\n/F1 12 Tf\n100 700 Td\n(Diagnosis: Breast Cancer. Medication: Metformin 500mg. HbA1c: 6.8%.) Tj\nET\n" +
  "endstream\nendobj\n" +
  "xref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \n" +
  "trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n340\n%%EOF";

const validPdfBuffer = Buffer.from(validPdfString, "latin1");

describe("Document / PDF Upload Pipeline (P2)", () => {
  let app: FastifyInstance;

  const mockPatient = {
    id: "patient-001",
    userId: "user-001",
    firstName: "Jordan",
    lastName: "Rivera",
    dateOfBirth: new Date("1972-04-18"),
    createdAt: new Date("2025-01-15T08:00:00.000Z"),
    updatedAt: new Date("2025-01-15T08:00:00.000Z"),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();
  });

  afterEach(async () => {
    await app.close();
  });

  // =========================================================================
  // 1. Valid PDF upload & end-to-end processing
  // =========================================================================
  describe("POST /api/v1/patients/:patientId/documents - Happy Path", () => {
    it("successfully uploads a valid PDF, extracts text, invokes P1 adapter, and returns structured result", async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValue(mockPatient as any);
      vi.mocked(prisma.timelineEvent.create).mockResolvedValue({} as any);

      const { payload, headers } = buildMultipartPayload({
        filename: "discharge_summary.pdf",
        contentType: "application/pdf",
        content: validPdfBuffer,
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/patients/patient-001/documents",
        headers,
        payload,
      });

      expect(response.statusCode).toBe(201);
      const json = response.json();
      expect(json.data).toBeDefined();

      // Validate Document Metadata
      const { document, extractedText, clinicalData } = json.data;
      expect(document.id).toBeDefined();
      expect(document.patientId).toBe("patient-001");
      expect(document.originalFilename).toBe("discharge_summary.pdf");
      expect(document.mimeType).toBe("application/pdf");
      expect(document.sizeBytes).toBe(validPdfBuffer.length);
      expect(document.extractionStatus).toBe("COMPLETED");
      expect(document.provenance).toEqual({
        sourceType: "DOCUMENT_UPLOAD",
        sourceRef: document.id,
      });

      // Validate Raw Text Extraction
      expect(extractedText).toContain("Breast Cancer");
      expect(extractedText).toContain("Metformin");

      // Validate P1 Structured Clinical Data
      expect(clinicalData.conditions).toEqual([
        {
          name: "Breast Cancer",
          status: "active",
        },
      ]);
      expect(clinicalData.medications).toEqual([
        {
          name: "Metformin",
          dosage: "500mg",
          frequency: "Twice daily",
          status: "prescribed",
        },
      ]);
      expect(clinicalData.labs).toEqual([
        {
          name: "HbA1c",
          value: 6.8,
          unit: "%",
          referenceRange: "< 7.0%",
        },
      ]);

      // Validate Provenance Timeline Event Creation
      expect(prisma.timelineEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            patientId: "patient-001",
            sourceType: "DOCUMENT_UPLOAD",
            sourceRef: document.id,
            title: "Document Uploaded: discharge_summary.pdf",
          }),
        }),
      );
    });
  });

  // =========================================================================
  // 2. Validation: Unknown Patient (404)
  // =========================================================================
  describe("POST /api/v1/patients/:patientId/documents - Unknown Patient", () => {
    it("returns 404 when the patient does not exist", async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValue(null);

      const { payload, headers } = buildMultipartPayload({
        filename: "test.pdf",
        content: validPdfBuffer,
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/patients/nonexistent-patient/documents",
        headers,
        payload,
      });

      expect(response.statusCode).toBe(404);
      const json = response.json();
      expect(json.error.code).toBe("NOT_FOUND");
      expect(json.error.message).toContain("Patient not found: nonexistent-patient");
    });
  });

  // =========================================================================
  // 3. Validation: Missing File or Non-Multipart (400)
  // =========================================================================
  describe("POST /api/v1/patients/:patientId/documents - Missing File", () => {
    it("returns 400 when request is not multipart/form-data", async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValue(mockPatient as any);

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/patients/patient-001/documents",
        headers: {
          "content-type": "application/json",
        },
        payload: JSON.stringify({ filename: "test.pdf" }),
      });

      expect(response.statusCode).toBe(400);
      const json = response.json();
      expect(json.error.code).toBe("BAD_REQUEST");
      expect(json.error.message).toContain("Request must be multipart/form-data");
    });

    it("returns 400 when multipart body has no file uploaded", async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValue(mockPatient as any);

      const boundary = "----CareWeaveEmptyTest";
      const payload = Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="comment"\r\n\r\nHello\r\n--${boundary}--\r\n`,
      );

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/patients/patient-001/documents",
        headers: {
          "content-type": `multipart/form-data; boundary=${boundary}`,
        },
        payload,
      });

      expect(response.statusCode).toBe(400);
      const json = response.json();
      expect(json.error.code).toBe("BAD_REQUEST");
      expect(json.error.message).toContain("No document file uploaded");
    });
  });

  // =========================================================================
  // 4. Validation: Invalid File Type (400)
  // =========================================================================
  describe("POST /api/v1/patients/:patientId/documents - Invalid File Type", () => {
    it("rejects non-PDF files such as images or text files", async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValue(mockPatient as any);

      const { payload, headers } = buildMultipartPayload({
        filename: "scan.png",
        contentType: "image/png",
        content: Buffer.from("\x89PNG\r\n\x1a\nfake image bytes"),
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/patients/patient-001/documents",
        headers,
        payload,
      });

      expect(response.statusCode).toBe(400);
      const json = response.json();
      expect(json.error.code).toBe("BAD_REQUEST");
      expect(json.error.message).toContain("only PDF documents are supported");
    });

    it("rejects corrupted files with PDF extension but missing %PDF- header", async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValue(mockPatient as any);

      const { payload, headers } = buildMultipartPayload({
        filename: "corrupted.pdf",
        contentType: "application/pdf",
        content: Buffer.from("NOT_A_REAL_PDF_CONTENT"),
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/patients/patient-001/documents",
        headers,
        payload,
      });

      expect(response.statusCode).toBe(400);
      const json = response.json();
      expect(json.error.code).toBe("BAD_REQUEST");
      expect(json.error.message).toContain("Invalid PDF format");
    });
  });

  // =========================================================================
  // 5. Validation: Oversized File (413)
  // =========================================================================
  describe("POST /api/v1/patients/:patientId/documents - Oversized File", () => {
    it("rejects files that exceed the 10MB limit", async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValue(mockPatient as any);

      // Create a buffer larger than MAX_DOCUMENT_SIZE_BYTES (10MB)
      const oversizedSize = MAX_DOCUMENT_SIZE_BYTES + 1024;
      const oversizedBuffer = Buffer.alloc(oversizedSize);
      oversizedBuffer.write("%PDF-1.4\n", 0, "latin1");

      const { payload, headers } = buildMultipartPayload({
        filename: "oversized.pdf",
        contentType: "application/pdf",
        content: oversizedBuffer,
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/patients/patient-001/documents",
        headers,
        payload,
      });

      expect(response.statusCode).toBe(413);
      const json = response.json();
      expect(json.error.code).toBe("PAYLOAD_TOO_LARGE");
      expect(json.error.message).toContain("Document size exceeds maximum allowed limit");
    });
  });

  // =========================================================================
  // 6. Unit Tests: PDF Text Extractor & Magic Bytes
  // =========================================================================
  describe("PDF Text Extractor Unit Tests", () => {
    it("identifies valid and invalid PDF buffers by %PDF- magic bytes", () => {
      expect(isValidPdfBuffer(validPdfBuffer)).toBe(true);
      expect(isValidPdfBuffer(Buffer.from("%PDF-2.0 something"))).toBe(true);
      expect(isValidPdfBuffer(Buffer.from("Hello world"))).toBe(false);
      expect(isValidPdfBuffer(Buffer.alloc(2))).toBe(false);
    });

    it("extracts text correctly from PDF buffer", async () => {
      const text = await extractDocumentText(validPdfBuffer);
      expect(text).toContain("Breast Cancer");
      expect(text).toContain("Metformin 500mg");
      expect(text).toContain("HbA1c: 6.8%");
    });

    it("throws error when attempting to extract text from non-PDF buffer", async () => {
      await expect(
        extractDocumentText(Buffer.from("Invalid buffer")),
      ).rejects.toThrow("Invalid PDF format: missing %PDF- header");
    });
  });

  // =========================================================================
  // 7. Unit Tests: P1 Extractor Adapter Boundary
  // =========================================================================
  describe("P1 Document Extractor Boundary", () => {
    it("DefaultP1DocumentExtractor extracts structured clinical concepts from raw text", async () => {
      const adapter = new DefaultP1DocumentExtractor();
      const rawText =
        "Patient seen on 2025-03-10. Diagnosed with Breast Cancer. Prescribed Metformin 500mg. HbA1c: 7.2%. Appointment: Oncology Follow-up. Reports Fatigue.";

      const result = await adapter.extractClinicalData(rawText, {
        patientId: "p123",
        documentId: "doc123",
        originalFilename: "notes.pdf",
      });

      expect(result.conditions).toHaveLength(1);
      expect(result.conditions[0]?.name).toBe("Breast Cancer");

      expect(result.medications).toHaveLength(1);
      expect(result.medications[0]?.name).toBe("Metformin");

      expect(result.labs).toHaveLength(1);
      expect(result.labs[0]?.name).toBe("HbA1c");
      expect(result.labs[0]?.value).toBe(7.2);

      expect(result.appointments).toHaveLength(1);
      expect(result.appointments[0]?.title).toBe("Oncology Follow-up");

      expect(result.symptoms).toHaveLength(1);
      expect(result.symptoms[0]?.name).toBe("Fatigue");

      expect(result.timelineEvents).toHaveLength(1);
      expect(result.timelineEvents[0]?.title).toBe("Clinical Document Extraction: notes.pdf");
    });

    it("supports injecting a custom P1 extractor into DocumentService", async () => {
      const customExtractor: P1DocumentExtractor = {
        extractClinicalData: vi.fn().mockResolvedValue({
          conditions: [{ name: "Type 2 Diabetes", status: "controlled" }],
          medications: [{ name: "Insulin Glargine", dosage: "20 units" }],
          labs: [],
          appointments: [],
          symptoms: [],
          timelineEvents: [],
        }),
      };

      const customService = new DocumentService(prisma, customExtractor);

      const result = await customService.processUploadedDocument({
        patientId: "patient-001",
        originalFilename: "custom_report.pdf",
        mimeType: "application/pdf",
        buffer: validPdfBuffer,
      });

      expect(customExtractor.extractClinicalData).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          patientId: "patient-001",
          originalFilename: "custom_report.pdf",
        }),
      );

      expect(result.clinicalData.conditions[0]?.name).toBe("Type 2 Diabetes");
      expect(result.clinicalData.medications[0]?.name).toBe("Insulin Glargine");
    });
  });

  // =========================================================================
  // 8. Document Metadata & Provenance Retrieval
  // =========================================================================
  describe("GET /api/v1/patients/:patientId/documents/:documentId", () => {
    it("retrieves previously processed document metadata", async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValue(mockPatient as any);

      // Process a document directly via service
      const processed = await documentService.processUploadedDocument({
        patientId: "patient-001",
        originalFilename: "lab_results.pdf",
        mimeType: "application/pdf",
        buffer: validPdfBuffer,
      });

      const response = await app.inject({
        method: "GET",
        url: `/api/v1/patients/patient-001/documents/${processed.document.id}`,
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json.data.id).toBe(processed.document.id);
      expect(json.data.patientId).toBe("patient-001");
      expect(json.data.originalFilename).toBe("lab_results.pdf");
      expect(json.data.provenance.sourceType).toBe("DOCUMENT_UPLOAD");
      expect(json.data.provenance.sourceRef).toBe(processed.document.id);
    });

    it("returns 404 for unknown document ID", async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValue(mockPatient as any);

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/patients/patient-001/documents/nonexistent-doc-id",
      });

      expect(response.statusCode).toBe(404);
      const json = response.json();
      expect(json.error.code).toBe("NOT_FOUND");
    });
  });
});
