import React, { useState, useRef } from 'react';
import documentService, {
  validateDocumentFile,
  formatFileSize,
  MAX_FILE_SIZE_MB,
} from '../../services/documentService';
import './DocumentUploadModal.css';

export default function DocumentUploadModal({ isOpen, onClose, onUploadSuccess, onExtractionComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadedDocumentMeta, setUploadedDocumentMeta] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('idle'); // 'idle' | 'processing' | 'done'
  const [processingResult, setProcessingResult] = useState(null);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setStatusMessage('');
    setUploadedDocumentMeta(null);
    setProcessingStatus('idle');
    setProcessingResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (uploadStatus === 'uploading' || processingStatus === 'processing' || processingStatus === 'extracting') return;
    handleReset();
    onClose();
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      setUploadStatus('error');
      setStatusMessage(validation.error);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setUploadStatus('idle');
    setStatusMessage('');
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * Trigger document processing followed by medical information extraction.
   * Runs silently — does not block the upload success UI.
   */
  const triggerProcessing = async (documentId) => {
    setProcessingStatus('processing');
    setProcessingResult(null);

    try {
      // Step 8: Document text processing
      const processResult = await documentService.processDocument(documentId);

      // If document is an image requiring OCR or processing failed, stop here
      const processStatus = processResult?.processing?.status || processResult?.document?.status;
      if (processStatus !== 'READY') {
        setProcessingStatus('done');
        setProcessingResult(processResult);
        return;
      }

      // Step 9: Medical information extraction
      setProcessingStatus('extracting');
      const extractionResult = await documentService.extractDocument(documentId);

      setProcessingStatus('done');
      setProcessingResult({
        ...processResult,
        extraction: extractionResult?.extraction,
      });

      if (onExtractionComplete) {
        onExtractionComplete(extractionResult);
      }
    } catch (err) {
      setProcessingStatus('done');
      setProcessingResult({ error: err.message });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || uploadStatus === 'uploading') return;

    setUploadStatus('uploading');
    setStatusMessage('');

    try {
      const response = await documentService.uploadDocument(selectedFile);
      setUploadStatus('success');
      setStatusMessage('Document uploaded successfully.');
      setUploadedDocumentMeta(response.document);
      if (onUploadSuccess) {
        onUploadSuccess(response.document);
      }

      // Auto-trigger processing and extraction after successful upload
      if (response.document?.id) {
        triggerProcessing(response.document.id);
      }
    } catch (err) {
      setUploadStatus('error');
      setStatusMessage(err.message || 'Upload failed. Please try again.');
    }
  };

  /**
   * Render a minimal processing and extraction status line below the success message.
   * Clinical and understated — no flashy animations.
   */
  const renderProcessingStatus = () => {
    if (processingStatus === 'idle') return null;

    if (processingStatus === 'processing') {
      return (
        <p className="cw-processing-status cw-processing-active">
          Processing document...
        </p>
      );
    }

    if (processingStatus === 'extracting') {
      return (
        <p className="cw-processing-status cw-processing-active">
          Extracting medical information...
        </p>
      );
    }

    // processingStatus === 'done'
    if (processingResult?.error) {
      return (
        <p className="cw-processing-status cw-processing-failed">
          Processing could not be completed.
        </p>
      );
    }

    if (processingResult?.extraction?.status === 'EXTRACTED') {
      return (
        <p className="cw-processing-status cw-processing-ready">
          Medical information extracted.
        </p>
      );
    }

    const status = processingResult?.processing?.status || processingResult?.document?.status;

    if (status === 'READY') {
      return (
        <p className="cw-processing-status cw-processing-ready">
          Document processed successfully.
        </p>
      );
    }

    if (status === 'OCR_REQUIRED') {
      return (
        <p className="cw-processing-status cw-processing-ocr">
          Image document uploaded. OCR processing will be available soon.
        </p>
      );
    }

    if (status === 'FAILED') {
      return (
        <p className="cw-processing-status cw-processing-failed">
          Processing could not be completed.
        </p>
      );
    }

    return null;
  };

  return (
    <div className="cw-modal-backdrop" onClick={handleClose} role="dialog" aria-modal="true" aria-labelledby="upload-modal-title">
      <div className="cw-upload-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="cw-upload-modal-header">
          <div className="cw-upload-modal-title-group">
            <h2 id="upload-modal-title" className="cw-upload-modal-title">
              Add Medical Document
            </h2>
            <p className="cw-upload-modal-subtitle">
              Upload a medical document to add information to your care journey.
            </p>
          </div>
          <button
            type="button"
            className="cw-modal-close-btn"
            aria-label="Close dialog"
            onClick={handleClose}
            disabled={uploadStatus === 'uploading' || processingStatus === 'processing' || processingStatus === 'extracting'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="cw-upload-modal-body">
          {/* Error Message Banner */}
          {uploadStatus === 'error' && statusMessage && (
            <div className="cw-upload-banner cw-banner-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Success State */}
          {uploadStatus === 'success' ? (
            <div className="cw-upload-success-panel">
              <div className="cw-success-icon-wrap" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="cw-success-heading">Document uploaded successfully</h3>
              <p className="cw-success-details">
                {uploadedDocumentMeta?.originalName} ({formatFileSize(uploadedDocumentMeta?.size)})
              </p>
              <p className="cw-success-hint">
                Your medical document has been securely stored.
              </p>
              {/* Processing status line */}
              {renderProcessingStatus()}
            </div>
          ) : (
            <>
              {/* Drop / Selection Zone */}
              <div
                className={`cw-file-dropzone ${isDragging ? 'cw-dropzone-active' : ''} ${selectedFile ? 'cw-dropzone-has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => {
                  if (!selectedFile && fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="cw-hidden-file-input"
                  accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                  onChange={handleFileInputChange}
                  disabled={uploadStatus === 'uploading'}
                  aria-label="Upload medical document file"
                />

                {!selectedFile ? (
                  <div className="cw-dropzone-prompt">
                    <div className="cw-dropzone-icon" aria-hidden="true">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="12" x2="12" y2="18" />
                        <polyline points="9 15 12 12 15 15" />
                      </svg>
                    </div>
                    <p className="cw-dropzone-primary-text">
                      <span className="cw-dropzone-link">Select a document</span> or drag and drop here
                    </p>
                    <p className="cw-dropzone-secondary-text">
                      Supported formats: PDF, PNG, JPG (up to {MAX_FILE_SIZE_MB} MB)
                    </p>
                  </div>
                ) : (
                  <div className="cw-selected-file-card" onClick={(e) => e.stopPropagation()}>
                    <div className="cw-file-type-icon" aria-hidden="true">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5B4DF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className="cw-selected-file-info">
                      <span className="cw-file-name" title={selectedFile.name}>
                        {selectedFile.name}
                      </span>
                      <span className="cw-file-meta">
                        {formatFileSize(selectedFile.size)}
                      </span>
                    </div>
                    {uploadStatus !== 'uploading' && (
                      <button
                        type="button"
                        className="cw-remove-file-btn"
                        aria-label="Remove selected file"
                        title="Remove file"
                        onClick={handleReset}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="cw-upload-modal-footer">
          {uploadStatus === 'success' ? (
            <>
              <button
                type="button"
                className="cw-btn-secondary"
                onClick={handleReset}
              >
                Upload another
              </button>
              <button
                type="button"
                className="cw-btn-primary"
                onClick={handleClose}
              >
                Done
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="cw-btn-secondary"
                onClick={handleClose}
                disabled={uploadStatus === 'uploading'}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cw-btn-primary"
                onClick={handleUpload}
                disabled={!selectedFile || uploadStatus === 'uploading'}
              >
                {uploadStatus === 'uploading' ? 'Uploading document...' : 'Upload Document'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
