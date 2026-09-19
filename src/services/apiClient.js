/**
 * CareWeave — Hardened API Client
 *
 * Provides a secure, defensively-handled HTTP client using standard fetch.
 * Designed for safe client-side communication with CareWeave's backend services.
 *
 * ============================================================================
 * SECURITY ARCHITECTURE & DESIGN PRINCIPLES:
 * ============================================================================
 * 1. In-Memory Session Tokens:
 *    Authentication tokens are stored STRICTLY in-memory. They are never written
 *    to localStorage or sessionStorage to mitigate token exfiltration via XSS.
 *
 * 2. Zero Hardcoded Secrets:
 *    Never store API keys, service credentials, or confidential tokens in
 *    client-side bundles. All configuration is injected via environment variables.
 *
 * 3. Error Masking & Defense-in-Depth:
 *    Backend stack traces, database exceptions, or raw internal server errors
 *    are intercepted and masked with sanitized user-friendly messages before
 *    reaching calling UI components.
 *
 * 4. Request Timeout & Resource Protection:
 *    All outbound requests enforce an AbortController-backed timeout (10s default)
 *    to prevent hanging promises and resource exhaustion.
 *
 * ============================================================================
 * BACKEND INTEGRATION ENDPOINTS (P2 SERVICE CONTRACT):
 * ============================================================================
 * Once backend services are active, frontend components will consume endpoints
 * through this client:
 *
 * - Authentication & Session:
 *     POST /api/auth/login        -> Verify credentials & receive session token
 *     POST /api/auth/logout       -> Invalidate server session & revoke token
 *     GET  /api/auth/me           -> Resolve active session profile & roles
 *
 * - Patient Profile & Care State:
 *     GET  /api/patients/:id      -> Fetch patient demographic & clinical overview
 *     PATCH /api/patients/:id     -> Update care coordination parameters
 *
 * - Care Journey & Timeline:
 *     GET  /api/timeline          -> Fetch chronological clinical timeline events
 *     POST /api/timeline/events   -> Log new clinical event, observation, or lab
 *
 * - Medications & Prescriptions:
 *     GET  /api/medications       -> Fetch active and historical medication regimens
 *     POST /api/medications       -> Add or reconcile new prescription order
 *
 * - Health Records & Diagnostics:
 *     GET  /api/records           -> Fetch diagnostic panels and clinical notes
 *     POST /api/records/upload    -> Multipart upload for PDF/image records
 * ============================================================================
 */

/**
 * Base API URL derived from environment configuration or default relative path.
 */
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

/**
 * Default request timeout in milliseconds (10 seconds).
 */
const DEFAULT_TIMEOUT_MS = 10000;

/**
 * In-memory authentication token.
 * Held strictly in closure memory; never persisted to Web Storage.
 */
let inMemoryToken = null;

/**
 * Sets the active authentication token in memory.
 *
 * @param {string|null} token - Bearer token received from backend authentication.
 */
export function setAuthToken(token) {
  if (typeof token === 'string' && token.trim()) {
    inMemoryToken = token.trim();
  } else {
    inMemoryToken = null;
  }
}

/**
 * Clears the active authentication token from memory.
 */
export function clearAuthToken() {
  inMemoryToken = null;
}

/**
 * Retrieves the current in-memory authentication token (for inspection or diagnostics).
 *
 * @returns {string|null} The active token or null if unauthenticated.
 */
export function getAuthToken() {
  return inMemoryToken;
}

/**
 * Custom error class representing an API failure with sanitized messaging.
 */
export class ApiError extends Error {
  /**
   * @param {string} message - Sanitized, user-safe error message.
   * @param {number} status - HTTP response status code (0 for network/timeout errors).
   * @param {any} [data=null] - Optional sanitized response payload.
   */
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Determines whether a string looks like raw HTML, a stack trace, or database error.
 *
 * @param {string} str
 * @returns {boolean}
 */
function containsUnsafeDetails(str) {
  if (typeof str !== 'string') return false;
  const lower = str.toLowerCase();
  return (
    lower.includes('<!doctype') ||
    lower.includes('<html') ||
    lower.includes('<body') ||
    lower.includes('stack trace') ||
    lower.includes('traceback') ||
    lower.includes('sql') ||
    lower.includes('syntaxerror') ||
    lower.includes('exception in') ||
    lower.includes('at process.') ||
    lower.includes('node_modules') ||
    lower.includes('c:\\') ||
    lower.includes('/var/')
  );
}

/**
 * Generates a safe, sanitized error message corresponding to HTTP status code.
 *
 * @param {number} status - HTTP status code.
 * @param {any} [serverPayload] - Parsed server response, if any.
 * @returns {string} Sanitized message suitable for user-facing feedback.
 */
function getSanitizedErrorMessage(status, serverPayload) {
  // If server provided a clean, non-leaking message string, use it
  if (
    serverPayload &&
    typeof serverPayload.message === 'string' &&
    !containsUnsafeDetails(serverPayload.message) &&
    serverPayload.message.length <= 250
  ) {
    return serverPayload.message.trim();
  }

  // Fallback to standard defensive messages by status code
  switch (status) {
    case 400:
      return 'The request was invalid or malformed. Please verify your input.';
    case 401:
      return 'Your session has expired or you are not logged in. Please sign in again.';
    case 403:
      return 'You do not have permission to access this resource or perform this action.';
    case 404:
      return 'The requested clinical resource could not be found.';
    case 408:
      return 'The request timed out while waiting for a response. Please try again.';
    case 409:
      return 'A conflict occurred while processing this update. Please refresh and try again.';
    case 422:
      return 'The submitted clinical data could not be validated. Please check the fields.';
    case 429:
      return 'Too many requests were received. Please wait a moment before trying again.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'An unexpected service error occurred. Please try again later.';
    default:
      return `An unexpected error occurred (Status ${status}). Please try again later.`;
  }
}

/**
 * Internal core request handler executing fetch with headers, timeouts, and defensive parsing.
 *
 * @param {string} endpoint - API path or endpoint (e.g., '/patients' or 'patients').
 * @param {Object} [options={}] - Request configuration options.
 * @param {string} [options.method='GET'] - HTTP method.
 * @param {Object} [options.headers] - Custom headers to merge.
 * @param {any} [options.body] - Request body (objects are automatically JSON stringified).
 * @param {number} [options.timeout=DEFAULT_TIMEOUT_MS] - Timeout in milliseconds.
 * @param {AbortSignal} [options.signal] - Optional external AbortSignal.
 * @returns {Promise<any>} Parsed JSON response.
 */
async function request(endpoint, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = DEFAULT_TIMEOUT_MS,
    signal: externalSignal,
    ...restOptions
  } = options;

  // Build target URL
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${path}`;

  // Configure timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  // Link external abort signal if supplied
  if (externalSignal) {
    externalSignal.addEventListener('abort', () => controller.abort());
  }

  // Assemble request headers
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const mergedHeaders = {
    Accept: 'application/json',
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(inMemoryToken && { Authorization: `Bearer ${inMemoryToken}` }),
    ...headers,
  };

  // Format request body
  let formattedBody = body;
  if (body && !isFormData && typeof body === 'object') {
    formattedBody = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, {
      method,
      headers: mergedHeaders,
      body: formattedBody,
      signal: controller.signal,
      ...restOptions,
    });

    clearTimeout(timeoutId);

    // Parse response body defensively
    const contentType = response.headers.get('content-type') || '';
    let parsedData = null;

    if (contentType.includes('application/json')) {
      try {
        parsedData = await response.json();
      } catch {
        parsedData = null;
      }
    } else if (contentType.includes('text/')) {
      // If server returned plain text or HTML
      const rawText = await response.text();
      if (!containsUnsafeDetails(rawText)) {
        parsedData = { message: rawText };
      }
    }

    // Handle non-2xx HTTP responses
    if (!response.ok) {
      const sanitizedMessage = getSanitizedErrorMessage(response.status, parsedData);
      throw new ApiError(sanitizedMessage, response.status, parsedData);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return parsedData;
  } catch (error) {
    clearTimeout(timeoutId);

    // If error is already our sanitized ApiError, re-throw directly
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle timeout aborts
    if (error.name === 'AbortError') {
      throw new ApiError(
        `Request timed out after ${Math.round(timeout / 1000)} seconds. Please check your connection and try again.`,
        408
      );
    }

    // Handle offline / network errors
    if (error instanceof TypeError && error.message.toLowerCase().includes('fetch')) {
      throw new ApiError(
        'Unable to connect to CareWeave services. Please check your network connection and try again.',
        0
      );
    }

    // Catch-all masked error
    throw new ApiError(
      'An unexpected service error occurred. Please try again later.',
      0
    );
  }
}

/**
 * Hardened API Client instance providing standard REST methods and session token management.
 */
export const apiClient = {
  /**
   * Performs an HTTP GET request.
   *
   * @param {string} endpoint - API path.
   * @param {Object} [options] - Optional request configuration.
   * @returns {Promise<any>}
   */
  get(endpoint, options = {}) {
    return request(endpoint, { ...options, method: 'GET' });
  },

  /**
   * Performs an HTTP POST request.
   *
   * @param {string} endpoint - API path.
   * @param {any} [body] - Request body.
   * @param {Object} [options] - Optional request configuration.
   * @returns {Promise<any>}
   */
  post(endpoint, body, options = {}) {
    return request(endpoint, { ...options, method: 'POST', body });
  },

  /**
   * Performs an HTTP PUT request.
   *
   * @param {string} endpoint - API path.
   * @param {any} [body] - Request body.
   * @param {Object} [options] - Optional request configuration.
   * @returns {Promise<any>}
   */
  put(endpoint, body, options = {}) {
    return request(endpoint, { ...options, method: 'PUT', body });
  },

  /**
   * Performs an HTTP DELETE request.
   *
   * @param {string} endpoint - API path.
   * @param {Object} [options] - Optional request configuration.
   * @returns {Promise<any>}
   */
  delete(endpoint, options = {}) {
    return request(endpoint, { ...options, method: 'DELETE' });
  },

  // In-memory token management helpers
  setAuthToken,
  clearAuthToken,
  getAuthToken,
};

export default apiClient;
