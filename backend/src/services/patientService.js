/**
 * Patient Service — CareWeave Project 2.0
 *
 * Handles:
 *  - Deterministic patient identity matching & association
 *  - Multi-document clinical aggregation
 *  - Enforces strict user ownership
 *
 * RULES:
 *  1. DETERMINISTIC ASSOCIATION:
 *     - Tier 1: Explicit identifier match (scoped to owner_email)
 *     - Tier 2: Normalized name + date of birth match
 *     - Tier 3: Insufficient identity (no identifier, and missing name or DOB) ->
 *       DO NOT create a patient record; leave documents.patient_id as NULL.
 *  2. ZERO CLINICAL INTERPRETATION:
 *     - Does not invent diagnoses, symptoms, or status.
 *     - Preserves explicit document flags only.
 *  3. DEDUPLICATION:
 *     - Document ID is uniqueness boundary.
 *     - Doctors deduplicated by normalized name and clinic.
 */

import crypto from 'crypto';
import { databaseService } from './databaseService.js';

/**
 * Normalize text string for deterministic comparison
 * @param {string} str
 * @returns {string}
 */
function normalizeString(str) {
  if (!str || typeof str !== 'string') return '';
  return str.toLowerCase().replace(/[ \t]+/g, ' ').trim();
}

export const patientService = {
  /**
   * Deterministically associate a document with a patient based on extracted patient information.
   * If identity is insufficient, does not create an empty patient (leaves patient_id NULL).
   *
   * @param {string} documentId
   * @param {string} ownerEmail
   * @param {object|null} patientInfo — { name, dateOfBirth, identifier }
   * @returns {object|null} The associated patient record or null if unassociated
   */
  associateDocumentWithPatient(documentId, ownerEmail, patientInfo) {
    if (!documentId || !ownerEmail) return null;

    const info = patientInfo || {};
    const rawIdentifier = info.identifier ? String(info.identifier).trim() : '';
    const rawName = info.name ? String(info.name).trim() : '';
    const rawDob = info.dateOfBirth ? String(info.dateOfBirth).trim() : '';

    // ── Tier 1: Explicit Patient Identifier Match ──
    if (rawIdentifier.length > 0) {
      const existing = databaseService.findPatientByIdentifier(ownerEmail, rawIdentifier);
      if (existing) {
        databaseService.updateDocumentPatientId(documentId, existing.id);
        return existing;
      }

      // Create new patient with identifier
      const patientId = `pat_${crypto.randomUUID()}`;
      const patientName = rawName.length > 0 ? rawName : (rawIdentifier.length > 0 ? rawIdentifier : 'Unknown');
      const newPatient = databaseService.createPatient({
        id: patientId,
        ownerEmail,
        name: patientName,
        dateOfBirth: rawDob.length > 0 ? rawDob : null,
        identifier: rawIdentifier,
      });

      databaseService.updateDocumentPatientId(documentId, patientId);
      return newPatient;
    }

    // ── Tier 2: Normalized Name + Date of Birth Match ──
    if (rawName.length > 0 && rawDob.length > 0) {
      const normName = normalizeString(rawName);
      const normDob = normalizeString(rawDob);

      const existing = databaseService.findPatientByNameAndDob(ownerEmail, normName, normDob);
      if (existing) {
        databaseService.updateDocumentPatientId(documentId, existing.id);
        return existing;
      }

      // Create new patient with name + DOB
      const patientId = `pat_${crypto.randomUUID()}`;
      const newPatient = databaseService.createPatient({
        id: patientId,
        ownerEmail,
        name: rawName,
        dateOfBirth: rawDob,
        identifier: null,
      });

      databaseService.updateDocumentPatientId(documentId, patientId);
      return newPatient;
    }

    // ── Tier 3: Insufficient Identity Protection (CORRECTION RULE) ──
    // No explicit identifier and missing either name or DOB:
    // DO NOT create an anonymous or empty patient.
    // Leave document.patient_id as NULL.
    databaseService.updateDocumentPatientId(documentId, null);
    return null;
  },

  /**
   * List all patients for an authenticated owner
   * @param {string} ownerEmail
   * @returns {object[]}
   */
  getPatientsByOwner(ownerEmail) {
    if (!ownerEmail) return [];
    return databaseService.getPatientsByOwner(ownerEmail);
  },

  /**
   * Retrieve a single patient by ID
   * @param {string} patientId
   * @returns {object|null}
   */
  getPatientById(patientId) {
    if (!patientId) return null;
    return databaseService.getPatientById(patientId);
  },

  /**
   * Build the aggregated multi-document medical record for a patient.
   * Aggregates tests, medications, doctors, findings, and recommendations across all
   * associated documents.
   *
   * @param {string} patientId
   * @param {string} ownerEmail
   * @returns {object|null}
   */
  getAggregatedPatientRecord(patientId, ownerEmail) {
    const patient = databaseService.getPatientById(patientId);
    if (!patient) return null;

    // Strict ownership enforcement
    if (patient.ownerEmail !== ownerEmail) {
      return null;
    }

    // Retrieve all documents linked to this patient
    const rawDocs = databaseService.getDocumentsByPatientId(patientId);

    const docSummaries = [];
    const doctorsMap = new Map();
    const tests = [];
    const medications = [];
    const clinicalInformation = {
      symptoms: [],
      diagnoses: [],
      findings: [],
      recommendations: [],
      followUp: [],
    };

    for (const doc of rawDocs) {
      const ext = databaseService.getExtractionByDocumentId(doc.id);

      docSummaries.push({
        id: doc.id,
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        size: doc.size,
        uploadedAt: doc.uploadedAt,
        documentDate: ext?.documentDate || null,
        reportId: ext?.reportId || null,
      });

      if (!ext) continue;

      // ── Aggregate Doctors (Deduplicated by name & clinic) ──
      if (ext.doctor && ext.doctor.name) {
        const docKey = `${normalizeString(ext.doctor.name)}|${normalizeString(ext.doctor.clinic)}`;
        if (doctorsMap.has(docKey)) {
          const existingDoc = doctorsMap.get(docKey);
          if (!existingDoc.documentIds.includes(doc.id)) {
            existingDoc.documentIds.push(doc.id);
          }
        } else {
          doctorsMap.set(docKey, {
            name: ext.doctor.name,
            speciality: ext.doctor.speciality || null,
            clinic: ext.doctor.clinic || null,
            documentIds: [doc.id],
          });
        }
      }

      // ── Aggregate Tests ──
      if (Array.isArray(ext.tests)) {
        for (const t of ext.tests) {
          tests.push({
            documentId: doc.id,
            documentDate: ext.documentDate || null,
            name: t.name,
            value: t.value,
            numericValue: t.numericValue !== undefined ? t.numericValue : null,
            unit: t.unit || null,
            referenceRange: t.referenceRange || null,
            documentFlag: t.documentFlag || null,
            date: t.date || ext.documentDate || null,
          });
        }
      }

      // ── Aggregate Medications ──
      if (Array.isArray(ext.medications)) {
        for (const m of ext.medications) {
          medications.push({
            documentId: doc.id,
            name: m.name,
            dose: m.dose || null,
            unit: m.unit || null,
            frequency: m.frequency || null,
            route: m.route || null,
            duration: m.duration || null,
            instructions: m.instructions || null,
          });
        }
      }

      // ── Aggregate Clinical Information ──
      if (ext.clinicalInformation) {
        if (Array.isArray(ext.clinicalInformation.symptoms)) {
          for (const s of ext.clinicalInformation.symptoms) {
            if (!clinicalInformation.symptoms.includes(s)) clinicalInformation.symptoms.push(s);
          }
        }
        if (Array.isArray(ext.clinicalInformation.diagnoses)) {
          for (const d of ext.clinicalInformation.diagnoses) {
            if (!clinicalInformation.diagnoses.includes(d)) clinicalInformation.diagnoses.push(d);
          }
        }
        if (Array.isArray(ext.clinicalInformation.findings)) {
          for (const f of ext.clinicalInformation.findings) {
            if (!clinicalInformation.findings.includes(f)) clinicalInformation.findings.push(f);
          }
        }
        if (Array.isArray(ext.clinicalInformation.recommendations)) {
          for (const r of ext.clinicalInformation.recommendations) {
            if (!clinicalInformation.recommendations.includes(r)) clinicalInformation.recommendations.push(r);
          }
        }
        if (Array.isArray(ext.clinicalInformation.followUp)) {
          for (const fu of ext.clinicalInformation.followUp) {
            if (!clinicalInformation.followUp.includes(fu)) clinicalInformation.followUp.push(fu);
          }
        }
      }
    }

    return {
      patient: {
        id: patient.id,
        name: patient.name,
        dateOfBirth: patient.dateOfBirth,
        identifier: patient.identifier,
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt,
      },
      documents: docSummaries,
      doctors: Array.from(doctorsMap.values()),
      tests,
      medications,
      clinicalInformation,
      provenance: {
        documentCount: docSummaries.length,
        aggregatedAt: new Date().toISOString(),
        totalTests: tests.length,
        totalMedications: medications.length,
      },
    };
  },

  /**
   * Retrieve all medications across all persisted documents for a patient.
   * Grounded in source extractions, with exact provenance and zero clinical inferences.
   *
   * @param {string} patientId
   * @param {string} ownerEmail
   * @returns {object[]|null} Array of medications or null if unauthorized/not found
   */
  getMedicationsForPatient(patientId, ownerEmail) {
    const patient = databaseService.getPatientById(patientId);
    if (!patient || patient.ownerEmail !== ownerEmail) {
      return null;
    }

    const rawDocs = databaseService.getDocumentsByPatientId(patientId);
    const medications = [];

    for (const doc of rawDocs) {
      const ext = databaseService.getExtractionByDocumentId(doc.id);
      if (!ext || !Array.isArray(ext.medications)) continue;

      ext.medications.forEach((m, idx) => {
        medications.push({
          id: `med_${doc.id}_${idx}`,
          name: m.name,
          dose: m.dose || null,
          unit: m.unit || null,
          frequency: m.frequency || null,
          route: m.route || null,
          duration: m.duration || null,
          instructions: m.instructions || null,
          provenance: {
            documentId: doc.id,
            originalName: doc.originalName,
            documentDate: ext.documentDate || null,
            reportId: ext.reportId || null,
          },
        });
      });
    }

    return medications;
  },
};

export default patientService;
