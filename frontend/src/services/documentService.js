import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
export const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * Validate file client-side before dispatching network request
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateDocumentFile(file) {
  if (!file) {
    return { valid: false, error: 'Please select a document to upload.' };
  }

  const name = file.name.toLowerCase();
  const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) || hasValidExt;

  if (!hasValidExt || !hasValidMime) {
    return {
      valid: false,
      error: 'Unsupported format. Please select a PDF, PNG, or JPEG file.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File exceeds maximum allowed size of ${MAX_FILE_SIZE_MB} MB.`,
    };
  }

  return { valid: true };
}

/**
 * Format bytes into human-readable representation
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export const documentService = {
  /**
   * Upload medical document to Project 2.0 backend
   * @param {File} file
   * @returns {Promise<{ success: boolean, document: object }>}
   */
  async uploadDocument(file, patientId = null) {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required. Please log in to upload documents.');
    }

    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const formData = new FormData();
    formData.append('file', file);
    if (patientId) {
      formData.append('patientId', patientId);
    }

    let response;
    try {
      response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
    } catch (netErr) {
      throw new Error('Network error. Unable to reach document upload service.');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.error || 'Document upload failed. Please try again.');
    }

    return data;
  },

  /**
   * Trigger document processing (text extraction) on a previously uploaded document.
   * @param {string} documentId — Server-generated document ID from upload response
   * @returns {Promise<{ success: boolean, document: object, processing: object }>}
   */
  async processDocument(documentId) {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required. Please log in to process documents.');
    }

    if (!documentId || typeof documentId !== 'string') {
      throw new Error('Invalid document identifier.');
    }

    let response;
    try {
      response = await fetch(`${API_BASE_URL}/api/documents/${encodeURIComponent(documentId)}/process`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (netErr) {
      throw new Error('Network error. Unable to reach document processing service.');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.error || 'Document processing failed. Please try again.');
    }

    return data;
  },

  /**
   * Trigger medical information extraction on a previously processed document.
   * @param {string} documentId — Server-generated document ID
   * @returns {Promise<{ success: boolean, document: object, extraction: object }>}
   */
  async extractDocument(documentId) {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required. Please log in to extract document data.');
    }

    if (!documentId || typeof documentId !== 'string') {
      throw new Error('Invalid document identifier.');
    }

    let response;
    try {
      response = await fetch(`${API_BASE_URL}/api/documents/${encodeURIComponent(documentId)}/extract`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (netErr) {
      throw new Error('Network error. Unable to reach medical extraction service.');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.error || 'Medical information extraction failed. Please try again.');
    }

    return data;
  },

  /**
   * Fetch all persisted documents for the authenticated user
   * @returns {Promise<{ success: boolean, documents: Array<object> }>}
   */
  async getDocuments() {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required. Please log in to view documents.');
    }

    let response;
    try {
      response = await fetch(`${API_BASE_URL}/api/documents`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (netErr) {
      throw new Error('Network error. Unable to fetch documents.');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.error || 'Failed to retrieve documents.');
    }

    return data;
  },

  /**
   * Fetch a single persisted document and its structured extraction details
   * @param {string} documentId
   * @returns {Promise<{ success: boolean, document: object, extraction: object|null }>}
   */
  async getDocument(documentId) {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required. Please log in to view document.');
    }

    if (!documentId || typeof documentId !== 'string') {
      throw new Error('Invalid document identifier.');
    }

    let response;
    try {
      response = await fetch(`${API_BASE_URL}/api/documents/${encodeURIComponent(documentId)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (netErr) {
      throw new Error('Network error. Unable to fetch document details.');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.error || 'Failed to retrieve document details.');
    }

    return data;
  },
};

export default documentService;
