/**
 * CareWeave — Input & File Upload Validation Utilities
 *
 * NOTE ON SECURITY ARCHITECTURE:
 * The utilities in this file serve as client-side defensive hygiene. They provide
 * immediate user feedback, prevent unintentional invalid submissions, and enforce
 * basic sanitization in the UI.
 *
 * CRITICAL: Client-side validation CANNOT be relied upon as a security boundary.
 * Backend APIs must independently and rigorously enforce identical checks, including:
 * - Server-side file size ceilings and MIME/magic byte inspection.
 * - Server-side file name sanitization and storage path isolation (e.g. S3 / isolated blob store).
 * - Input validation, schema verification, and parameterization to prevent injection attacks.
 * - Server-side URL whitelisting and protocol verification.
 */

/**
 * Maximum allowed file size for prototype uploads: 5 MB (5 * 1024 * 1024 bytes)
 */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Permitted safe MIME types and corresponding file extensions for medical records.
 */
export const ALLOWED_FILE_TYPES = Object.freeze({
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
});

/**
 * Validates a file intended for medical record upload.
 *
 * Defensive checks:
 * 1. Verifies file existence and valid object shape.
 * 2. Enforces file size <= MAX_FILE_SIZE_BYTES.
 * 3. Enforces declared MIME type is within ALLOWED_FILE_TYPES.
 * 4. Ensures file extension matches permitted extensions for the declared MIME type.
 *
 * NOTE: Frontend MIME and extension checks inspect client metadata only.
 * The backend must verify file contents using magic numbers/byte headers.
 *
 * @param {File|Blob|Object} file - The file to validate.
 * @returns {{ isValid: boolean, error: string | null }} Validation result.
 */
export function validateFileUpload(file) {
  if (!file || typeof file !== 'object') {
    return { isValid: false, error: 'No file provided for validation.' };
  }

  // Verify file size
  if (typeof file.size !== 'number' || file.size <= 0) {
    return { isValid: false, error: 'File appears to be empty or corrupted.' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const maxSizeInMB = (MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0);
    return {
      isValid: false,
      error: `File size (${sizeInMB} MB) exceeds the maximum allowed limit of ${maxSizeInMB} MB.`,
    };
  }

  // Verify MIME type
  const mimeType = (file.type || '').toLowerCase().trim();
  const allowedExtensions = ALLOWED_FILE_TYPES[mimeType];

  if (!mimeType || !allowedExtensions) {
    return {
      isValid: false,
      error: 'File type is not permitted. Only PDF, PNG, and JPEG documents are allowed.',
    };
  }

  // Validate file extension
  const fileName = typeof file.name === 'string' ? file.name : '';
  const lastDotIndex = fileName.lastIndexOf('.');
  const extension = lastDotIndex !== -1 ? fileName.slice(lastDotIndex).toLowerCase() : '';

  if (!extension || !allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `File extension '${extension || 'unknown'}' does not match permitted extensions for type ${mimeType}.`,
    };
  }

  return { isValid: true, error: null };
}

/**
 * Sanitizes a file name to prevent directory traversal and unsafe characters.
 *
 * Defensive checks:
 * 1. Strips directory traversal sequences (e.g., '../', '..\\', absolute paths).
 * 2. Removes non-alphanumeric characters except safe punctuation ('.', '-', '_').
 * 3. Prevents hidden files (leading dots).
 * 4. Caps excessive lengths (> 100 chars) while preserving the file extension.
 *
 * NOTE: Backend storage should store uploaded files under generated UUIDs or
 * random hashes rather than preserving user-supplied file names on the filesystem.
 *
 * @param {string} fileName - The raw input file name.
 * @returns {string} Clean, safe file name.
 */
export function sanitizeFileName(fileName) {
  if (typeof fileName !== 'string' || !fileName.trim()) {
    return 'unnamed_file';
  }

  // Strip directory paths and traversal sequences (e.g. '../', '..\', '/path/to/')
  let sanitized = fileName.split(/[/\\]/).pop() || '';

  // Remove any remaining directory traversal sequences
  sanitized = sanitized.replace(/\.\.+/g, '.');

  // Remove non-alphanumeric characters except safe punctuation ('.', '-', '_')
  sanitized = sanitized.replace(/[^a-zA-Z0-9.\-_]/g, '_');

  // Prevent hidden files by stripping leading dots
  sanitized = sanitized.replace(/^\.+/, '');

  // If sanitized name becomes empty after stripping
  if (!sanitized) {
    return 'unnamed_file';
  }

  // Limit length to 100 characters while preserving extension
  if (sanitized.length > 100) {
    const lastDot = sanitized.lastIndexOf('.');
    if (lastDot > 0 && lastDot > sanitized.length - 15) {
      const ext = sanitized.slice(lastDot);
      const namePart = sanitized.slice(0, lastDot);
      sanitized = namePart.slice(0, 100 - ext.length) + ext;
    } else {
      sanitized = sanitized.slice(0, 100);
    }
  }

  return sanitized;
}

/**
 * Sanitizes raw text input to mitigate client-side XSS injection vectors.
 * Trims whitespace and escapes HTML special characters (<, >, &, ", ').
 *
 * NOTE: Client-side escaping provides defense-in-depth for UI rendering.
 * The backend must use parameterized queries and context-aware output encoding.
 *
 * @param {string} text - Raw text input.
 * @returns {string} Sanitized string with HTML entities escaped.
 */
export function sanitizeTextInput(text) {
  if (typeof text !== 'string') {
    return '';
  }

  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  };

  return text.trim().replace(/[&<>"']/g, (char) => escapeMap[char]);
}

/**
 * Validates text length against minimum and maximum bounds.
 *
 * @param {string} text - Input text to evaluate.
 * @param {number} [min=1] - Minimum acceptable length (inclusive).
 * @param {number} [max=500] - Maximum acceptable length (inclusive).
 * @returns {{ isValid: boolean, error: string | null }} Validation result.
 */
export function validateLength(text, min = 1, max = 500) {
  if (typeof text !== 'string') {
    return { isValid: false, error: 'Input must be a valid string.' };
  }

  const length = text.trim().length;

  if (length < min) {
    return {
      isValid: false,
      error: `Input must be at least ${min} character${min === 1 ? '' : 's'}.`,
    };
  }

  if (length > max) {
    return {
      isValid: false,
      error: `Input cannot exceed ${max} characters (currently ${length}).`,
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validates that a given URL uses safe protocols ('http:' or 'https:' only).
 * Rejects unsafe schemes such as 'javascript:', 'data:', 'vbscript:', or 'file:'.
 *
 * NOTE: Client-side URL validation prevents open-redirect and protocol-based XSS in the UI.
 * Backend services must re-validate target URLs against an explicit domain allowlist.
 *
 * @param {string} url - Target URL to validate.
 * @returns {boolean} True if the URL uses http: or https: protocols, false otherwise.
 */
export function isSafeUrl(url) {
  if (typeof url !== 'string' || !url.trim()) {
    return false;
  }

  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
