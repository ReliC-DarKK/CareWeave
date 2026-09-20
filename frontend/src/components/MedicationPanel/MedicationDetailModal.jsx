import React, { useEffect } from 'react';
import './MedicationDetailModal.css';

export default function MedicationDetailModal({ medication, onClose }) {
  useEffect(() => {
    if (!medication) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [medication, onClose]);

  if (!medication) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="cw-med-detail-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="med-detail-title"
    >
      <div className="cw-med-detail-card">
        {/* Header */}
        <div className="cw-med-detail-header">
          <div className="cw-med-title-group">
            <span className="cw-med-type-badge">Medication</span>
            <h2 id="med-detail-title" className="cw-med-detail-title">
              {medication.name}
            </h2>
          </div>
          <button
            type="button"
            className="cw-med-close-btn"
            onClick={onClose}
            aria-label="Close medication details"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="cw-med-detail-body">
          <div className="cw-med-section">
            <h3 className="cw-med-section-title">Prescription Details</h3>
            <div className="cw-med-meta-grid">
              {medication.dose && (
                <div className="cw-med-meta-item">
                  <strong>Dose:</strong> {medication.dose} {medication.unit || ''}
                </div>
              )}
              {medication.frequency && (
                <div className="cw-med-meta-item">
                  <strong>Frequency:</strong> {medication.frequency}
                </div>
              )}
              {medication.route && (
                <div className="cw-med-meta-item">
                  <strong>Route:</strong> {medication.route}
                </div>
              )}
              {medication.duration && (
                <div className="cw-med-meta-item">
                  <strong>Duration:</strong> {medication.duration}
                </div>
              )}
            </div>
            {medication.instructions && (
              <div className="cw-med-instructions">
                <strong>Instructions:</strong>
                <p>{medication.instructions}</p>
              </div>
            )}
          </div>

          <div className="cw-med-section cw-med-provenance-section">
            <h3 className="cw-med-section-title">Document Provenance</h3>
            <p className="cw-med-provenance-text">
              <strong>Source Document:</strong> {medication.provenance?.originalName || 'Unknown Document'}
            </p>
            <p className="cw-med-provenance-text">
              <strong>Document Date:</strong> {
                medication.provenance?.documentDate 
                  ? medication.provenance.documentDate 
                  : 'Not Recorded'
              }
            </p>
            {medication.provenance?.reportId && (
              <p className="cw-med-provenance-text">
                <strong>Report ID:</strong> <code>{medication.provenance.reportId}</code>
              </p>
            )}
            <p className="cw-med-provenance-text">
              <strong>Document ID:</strong> <code>{medication.provenance?.documentId}</code>
            </p>
            <div className="cw-med-provenance-warning">
              ℹ️ CareWeave displays factual records extracted from source medical documents. 
              No active or inactive status is inferred.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="cw-med-detail-footer">
          <button type="button" className="cw-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
