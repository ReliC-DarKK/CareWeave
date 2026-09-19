/**
 * CareWeave Frontend API Client
 *
 * Resolves API requests against VITE_API_BASE_URL (defaults to http://localhost:3000/api/v1).
 * Ensures correct path concatenation without duplicate slashes or repeated /api/v1 prefixes.
 */

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

/**
 * Performs an HTTP GET request to the backend API.
 * @param {string} endpoint Path starting with / (e.g. /patients/123/care-logic)
 * @returns {Promise<any>} Parsed response data
 */
export async function get(endpoint) {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson?.error?.message) {
        errorMessage = errorJson.error.message;
      }
    } catch {
      // Ignore parse failure on error body
    }
    const err = new Error(errorMessage);
    err.status = response.status;
    throw err;
  }

  return response.json();
}
