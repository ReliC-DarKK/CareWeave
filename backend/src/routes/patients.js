/**
 * Patient Routes — CareWeave Project 2.0
 *
 * Endpoints:
 *  - GET /api/patients: Retrieve all patients accessible to authenticated user
 *  - GET /api/patients/:patientId: Retrieve aggregated multi-document medical record for a patient
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { patientService } from '../services/patientService.js';

const router = express.Router();

// Strict patient ID format: pat_ followed by a UUID
const PATIENT_ID_PATTERN = /^pat_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

/**
 * Validate patient ID format to prevent traversal/injection
 * @param {string} patientId
 * @returns {boolean}
 */
function isValidPatientId(patientId) {
  if (!patientId || typeof patientId !== 'string') return false;
  return PATIENT_ID_PATTERN.test(patientId);
}

/**
 * GET /api/patients
 * Protected endpoint returning all patients for the authenticated user.
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    const ownerEmail = req.user.email;
    const patients = patientService.getPatientsByOwner(ownerEmail);

    const sanitizedPatients = patients.map((p) => ({
      id: p.id,
      name: p.name,
      dateOfBirth: p.dateOfBirth,
      identifier: p.identifier,
      documentCount: p.documentCount || 0,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      patients: sanitizedPatients,
    });
  } catch (err) {
    console.error(`Error retrieving patients for ${req.user?.email}: ${err.message}`);
    return res.status(500).json({
      error: 'An unexpected error occurred while retrieving patients.',
    });
  }
});

/**
 * GET /api/patients/:patientId
 * Protected endpoint returning aggregated multi-document medical record for a patient.
 * Strictly verifies ownership against authenticated user JWT.
 */
router.get('/:patientId', authenticateToken, (req, res) => {
  try {
    const { patientId } = req.params;

    // 1. Validate ID format
    if (!isValidPatientId(patientId)) {
      return res.status(400).json({
        error: 'Invalid patient identifier format.',
      });
    }

    const ownerEmail = req.user.email;

    // 2. Verify existence
    const patient = patientService.getPatientById(patientId);
    if (!patient) {
      return res.status(404).json({
        error: 'Patient not found.',
      });
    }

    // 3. Verify ownership
    if (patient.ownerEmail !== ownerEmail) {
      return res.status(403).json({
        error: 'You do not have permission to view this patient record.',
      });
    }

    // 4. Build aggregated record across all linked documents
    const aggregated = patientService.getAggregatedPatientRecord(patientId, ownerEmail);
    if (!aggregated) {
      return res.status(404).json({
        error: 'Patient record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      ...aggregated,
    });
  } catch (err) {
    console.error(`Error retrieving patient ${req.params?.patientId}: ${err.message}`);
    return res.status(500).json({
      error: 'An unexpected error occurred while retrieving the patient record.',
    });
  }
});

export default router;
