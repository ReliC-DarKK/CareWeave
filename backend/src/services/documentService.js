import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uploads directory path safely isolated to backend/uploads
export const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configurable upload limit (default 10 MB)
export const MAX_UPLOAD_MB = parseInt(process.env.MAX_UPLOAD_MB || '10', 10);
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

// Allowed MIME types & associated extensions
export const ALLOWED_MIME_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
};

/**
 * Validates whether the given MIME type and extension are allowed
 */
export function isAllowedFileType(mimeType, ext) {
  const allowedExts = ALLOWED_MIME_TYPES[mimeType.toLowerCase()];
  if (!allowedExts) return false;
  return allowedExts.includes(ext.toLowerCase());
}

/**
 * Sanitizes original filename for safe presentation (no path segments or null bytes)
 */
export function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') return 'document';
  return path.basename(filename).replace(/[\0\r\n\t]/g, '').trim();
}

/**
 * Configure secure Multer disk storage
 * - Server-generated random UUID filename
 * - Never trusts user-supplied filename as disk path
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = Object.values(ALLOWED_MIME_TYPES).flat().includes(ext) ? ext : '.bin';
    const documentId = `doc_${crypto.randomUUID()}`;
    const serverFilename = `${documentId}${safeExt}`;
    // Attach documentId to request object for route consumption
    req.uploadedDocumentId = documentId;
    cb(null, serverFilename);
  },
});

/**
 * Multer file filter to validate MIME type and extension before saving
 */
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  if (!isAllowedFileType(mime, ext)) {
    const err = new Error('Unsupported file format. Please upload a PDF, PNG, or JPEG file.');
    err.code = 'INVALID_FILE_TYPE';
    return cb(err, false);
  }

  cb(null, true);
};

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
    files: 1,
  },
  fileFilter,
});
