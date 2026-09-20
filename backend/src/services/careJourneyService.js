/**
 * Care Journey Service — CareWeave Project 2.0
 *
 * Dynamically builds a factual, document-grounded Care Journey Timeline
 * for a patient from their persisted medical documents and Step 9 structured extractions.
 *
 * RULES:
 *  1. ZERO CLINICAL INFERENCE:
 *     - Never infers improvement, deterioration, recovery, risk, diagnosis, health score.
 *     - Does not compare laboratory values or interpret reference ranges.
 *     - Only includes explicit document flags (e.g. documentFlag: "HIGH") present in source.
 *  2. STRICT FACTUAL GROUNDING & PROVENANCE:
 *     - Every event is derived directly from a stored document.
 *     - Uses document date where available; falls back to uploadedAt.
 *     - Retains source documentId and reportId.
 *  3. CHRONOLOGICAL ORDERING:
 *     - Primary: document clinical date / uploadedAt timestamp.
 *     - Secondary: deterministic document ID comparison.
 *  4. DATA PRIVACY:
 *     - No filesystem paths or raw extracted text content.
 */

import { databaseService } from './databaseService.js';
import { patientService } from './patientService.js';

/**
 * Format a raw documentType code into a factual human-readable title.
 * @param {string} docType
 * @returns {string}
 */
function formatDocumentTitle(docType) {
  if (!docType || typeof docType !== 'string') return 'Medical Document';

  const cleaned = docType.toUpperCase().trim();
  switch (cleaned) {
    case 'LABORATORY_REPORT':
      return 'Laboratory Report';
    case 'CARDIOLOGY_REPORT':
      return 'Cardiology Report';
    case 'RADIOLOGY_REPORT':
      return 'Radiology Report';
    case 'PRESCRIPTION':
      return 'Prescription';
    case 'DISCHARGE_SUMMARY':
      return 'Discharge Summary';
    case 'CONSULTATION':
    case 'CONSULTATION_NOTE':
      return 'Consultation Note';
    case 'PATHOLOGY_REPORT':
      return 'Pathology Report';
    default:
      // Convert CONSTANT_CASE to Title Case
      return cleaned
        .split('_')
        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(' ');
  }
}

/**
 * Parse date string to integer timestamp for deterministic sorting.
 * Supports standard ISO dates, "18 September 2026", "05/12/1975", etc.
 *
 * @param {string|null} dateStr
 * @param {string} fallbackIso
 * @returns {number}
 */
function parseDateToTimestamp(dateStr, fallbackIso) {
  if (dateStr && typeof dateStr === 'string') {
    const parsed = Date.parse(dateStr);
    if (!isNaN(parsed)) return parsed;
  }
  if (fallbackIso && typeof fallbackIso === 'string') {
    const fallbackParsed = Date.parse(fallbackIso);
    if (!isNaN(fallbackParsed)) return fallbackParsed;
  }
  return 0;
}

export const careJourneyService = {
  /**
   * Build the Care Journey timeline for an authenticated patient.
   *
   * @param {string} patientId
   * @param {string} ownerEmail
   * @returns {object|null} { patient, events, count } or null if unauthorized/not found
   */
  getCareJourneyForPatient(patientId, ownerEmail) {
    if (!patientId || !ownerEmail) return null;

    // 1. Verify patient existence and ownership
    const patient = patientService.getPatientById(patientId);
    if (!patient) return null;
    if (patient.ownerEmail !== ownerEmail) return null;

    // 2. Fetch all documents associated with this patient
    const docs = databaseService.getDocumentsByPatientId(patientId);

    // 3. Transform documents into normalized timeline events
    const rawEvents = [];

    for (const doc of docs) {
      const ext = databaseService.getExtractionByDocumentId(doc.id);

      // Determine clinical date vs upload date fallback
      const clinicalDate = ext?.documentDate && typeof ext.documentDate === 'string' && ext.documentDate.trim().length > 0
        ? ext.documentDate.trim()
        : null;

      const eventDate = clinicalDate || doc.uploadedAt;
      const dateSource = clinicalDate ? 'DOCUMENT_DATE' : 'UPLOAD_DATE';
      const timestamp = parseDateToTimestamp(clinicalDate, doc.uploadedAt);

      // Factual title derived from document type
      const docType = ext?.documentType || 'DOCUMENT';
      const title = formatDocumentTitle(docType);

      // Doctor & clinic details
      const doctor = ext?.doctor && ext.doctor.name ? {
        name: ext.doctor.name,
        speciality: ext.doctor.speciality || null,
        clinic: ext.doctor.clinic || null,
      } : null;

      const clinic = ext?.doctor?.clinic || null;

      // Extract associated clinical lists
      const tests = Array.isArray(ext?.tests) ? ext.tests.map((t) => ({
        name: t.name,
        value: t.value,
        numericValue: t.numericValue !== undefined ? t.numericValue : null,
        unit: t.unit || null,
        referenceRange: t.referenceRange || null,
        documentFlag: t.documentFlag || null,
      })) : [];

      const medications = Array.isArray(ext?.medications) ? ext.medications.map((m) => ({
        name: m.name,
        dose: m.dose || null,
        unit: m.unit || null,
        frequency: m.frequency || null,
        route: m.route || null,
        duration: m.duration || null,
        instructions: m.instructions || null,
      })) : [];

      const recommendations = Array.isArray(ext?.clinicalInformation?.recommendations)
        ? ext.clinicalInformation.recommendations
        : [];

      const followUp = Array.isArray(ext?.clinicalInformation?.followUp)
        ? ext.clinicalInformation.followUp
        : [];

      const findings = Array.isArray(ext?.clinicalInformation?.findings)
        ? ext.clinicalInformation.findings
        : [];

      // Factual, non-inferential summary
      const summaryParts = [];
      if (tests.length > 0) summaryParts.push(`${tests.length} test${tests.length === 1 ? '' : 's'}`);
      if (medications.length > 0) summaryParts.push(`${medications.length} medication${medications.length === 1 ? '' : 's'}`);
      if (recommendations.length > 0) summaryParts.push(`${recommendations.length} recommendation${recommendations.length === 1 ? '' : 's'}`);
      const summary = summaryParts.length > 0 ? summaryParts.join(' · ') : 'Document recorded';

      rawEvents.push({
        id: `evt_${doc.id}`,
        documentId: doc.id,
        originalName: doc.originalName,
        date: eventDate,
        dateSource,
        title,
        documentType: docType,
        doctor,
        clinic,
        summary,
        tests,
        medications,
        recommendations,
        followUp,
        findings,
        provenance: {
          documentId: doc.id,
          reportId: ext?.reportId || null,
          uploadedAt: doc.uploadedAt,
          extractedAt: ext?.extractedAt || null,
        },
        _timestamp: timestamp,
      });
    }

    // 4. De-duplicate events by reportId or clinical signature
    const seenEventKeys = new Set();
    const uniqueEvents = [];

    for (const evt of rawEvents) {
      const reportId = evt.provenance?.reportId;
      const testSig = evt.tests?.length || 0;
      const medSig = evt.medications?.length || 0;
      const fallbackKey = `${evt.documentType}|${evt.date}|${evt.doctor?.name || ''}|${evt.clinic || ''}|${testSig}|${medSig}`;
      const dedupKey = reportId ? `report_${reportId}` : `sig_${fallbackKey}`;

      if (seenEventKeys.has(dedupKey)) {
        continue;
      }
      seenEventKeys.add(dedupKey);
      uniqueEvents.push(evt);
    }

    // 5. Sort events chronologically (earliest to latest), with secondary deterministic sort by documentId
    uniqueEvents.sort((a, b) => {
      if (a._timestamp !== b._timestamp) {
        return a._timestamp - b._timestamp;
      }
      return a.documentId.localeCompare(b.documentId);
    });

    // 6. Clean internal sort keys before returning
    const sanitizedEvents = uniqueEvents.map(({ _timestamp, ...rest }) => rest);

    return {
      patient: {
        id: patient.id,
        name: patient.name,
        dateOfBirth: patient.dateOfBirth,
        identifier: patient.identifier,
      },
      events: sanitizedEvents,
      count: sanitizedEvents.length,
    };
  },
};

export default careJourneyService;
