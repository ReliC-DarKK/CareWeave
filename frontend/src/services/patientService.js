/**
 * Patient Service — CareWeave Project 2.0
 *
 * Frontend service layer for interacting with /api/patients endpoints.
 */

import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const patientService = {
  /**
   * Fetch all patients accessible to the authenticated user
   * @returns {Promise<{ success: boolean, patients: Array<object> }>}
   */
  async getPatients() {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required. Please log in to view patients.');
    }

    let response;
    try {
      response = await fetch(`${API_BASE_URL}/api/patients`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (netErr) {
      throw new Error('Network error. Unable to reach patient service.');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.error || 'Failed to retrieve patients.');
    }

    return data;
  },

  /**
   * Fetch aggregated multi-document medical record for a specific patient
   * @param {string} patientId
   * @returns {Promise<object>}
   */
  async getPatient(patientId) {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required. Please log in to view patient.');
    }

    if (!patientId || typeof patientId !== 'string') {
      throw new Error('Invalid patient identifier.');
    }

    let response;
    try {
      response = await fetch(`${API_BASE_URL}/api/patients/${encodeURIComponent(patientId)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (netErr) {
      throw new Error('Network error. Unable to reach patient service.');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.error || 'Failed to retrieve patient record.');
    }

    return data;
  },

  /**
   * Fetch Care Journey timeline for a specific patient
   * @param {string} patientId
   * @returns {Promise<{ success: boolean, patient: object, events: Array<object>, count: number }>}
   */
  async getCareJourney(patientId) {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required. Please log in to view care journey.');
    }

    if (!patientId || typeof patientId !== 'string') {
      throw new Error('Invalid patient identifier.');
    }

    let response;
    try {
      response = await fetch(`${API_BASE_URL}/api/patients/${encodeURIComponent(patientId)}/care-journey`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (netErr) {
      throw new Error('Network error. Unable to reach care journey service.');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.error || 'Failed to retrieve care journey.');
    }

    return data;
  },

  /**
   * Fetch factual medications extracted from documents for a specific patient
   * @param {string} patientId
   * @returns {Promise<{ success: boolean, patientId: string, medications: Array<object> }>}
   */
  async getMedications(patientId) {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required. Please log in to view medications.');
    }

    if (!patientId || typeof patientId !== 'string') {
      throw new Error('Invalid patient identifier.');
    }

    let response;
    try {
      response = await fetch(`${API_BASE_URL}/api/patients/${encodeURIComponent(patientId)}/medications`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (netErr) {
      throw new Error('Network error. Unable to reach medications service.');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.error || 'Failed to retrieve medications.');
    }

    return data;
  },
};

export default patientService;
