import React, { useEffect } from 'react';
import './DocumentDetailModal.css';

export default function DocumentDetailModal({ document, extraction, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!document) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const ext = extraction || {};
  const tests = Array.isArray(ext.tests) ? ext.tests : [];
  const medications = Array.isArray(ext.medications) ? ext.medications : [];
  const recommendations = Array.isArray(ext.clinicalInformation?.recommendations) ? ext.clinicalInformation.recommendations : [];
  const followUp = Array.isArray(ext.clinicalInformation?.followUp) ? ext.clinicalInformation.followUp : [];

  return (
    <div
      className="cw-doc-detail-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-detail-title"
    >
      <div className="cw-doc-detail-card">
        {/* Header */}
        <div className="cw-doc-detail-header">
          <div className="cw-doc-title-group">
            {ext.documentType && (
              <span className="cw-doc-type-badge">{ext.documentType.replace(/_/g, ' ')}</span>
            )}
            <h2 id="doc-detail-title" className="cw-doc-detail-title">
              {document.originalName}
            </h2>
          </div>
          <button
            type="button"
            className="cw-doc-close-btn"
            onClick={onClose}
            aria-label="Close document details"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="cw-doc-detail-body">
          {/* Metadata Section */}
          <div className="cw-doc-section">
            <h3 className="cw-doc-section-title">Document Metadata</h3>
            <div className="cw-doc-meta-grid">
              {ext.documentDate && (
                <div className="cw-doc-meta-item">
                  <strong>Document Date:</strong> {ext.documentDate}
                </div>
              )}
              {document.uploadedAt && (
                <div className="cw-doc-meta-item">
                  <strong>Uploaded:</strong> {new Date(document.uploadedAt).toLocaleString()}
                </div>
              )}
              {ext.doctor?.name && (
                <div className="cw-doc-meta-item">
                  <strong>Doctor:</strong> {ext.doctor.name} {ext.doctor.speciality ? `(${ext.doctor.speciality})` : ''}
                </div>
              )}
              {ext.doctor?.clinic && (
                <div className="cw-doc-meta-item">
                  <strong>Clinic:</strong> {ext.doctor.clinic}
                </div>
              )}
              {ext.reportId && (
                <div className="cw-doc-meta-item">
                  <strong>Report ID:</strong> <code>{ext.reportId}</code>
                </div>
              )}
              <div className="cw-doc-meta-item">
                <strong>Status:</strong> <span className="cw-doc-status-tag">{document.processingStatus || 'READY'}</span>
              </div>
              <div className="cw-doc-meta-item">
                <strong>Document ID:</strong> <code>{document.id}</code>
              </div>
            </div>
          </div>

          {/* Tests Section */}
          {tests.length > 0 && (
            <div className="cw-doc-section">
              <h3 className="cw-doc-section-title">Tests ({tests.length})</h3>
              <div className="cw-doc-tests-table-wrap">
                <table className="cw-doc-tests-table">
                  <thead>
                    <tr>
                      <th>Test Name</th>
                      <th>Result</th>
                      <th>Reference Range</th>
                      <th>Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.map((t, idx) => (
                      <tr key={idx}>
                        <td className="cw-test-name">{t.name}</td>
                        <td className="cw-test-value">{t.value} {t.unit || ''}</td>
                        <td className="cw-test-range">{t.referenceRange || '—'}</td>
                        <td>
                          {t.documentFlag ? (
                            <span className="cw-test-flag">{t.documentFlag}</span>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Medications Section */}
          {medications.length > 0 && (
            <div className="cw-doc-section">
              <h3 className="cw-doc-section-title">Medications ({medications.length})</h3>
              <div className="cw-doc-meds-list">
                {medications.map((m, idx) => (
                  <div key={idx} className="cw-doc-med-card">
                    <span className="cw-doc-med-name">{m.name}</span>
                    <div className="cw-doc-med-meta">
                      {m.dose && <span>{m.dose} {m.unit}</span>}
                      {m.frequency && <span>• {m.frequency}</span>}
                      {m.route && <span>• {m.route}</span>}
                      {m.duration && <span>• {m.duration}</span>}
                    </div>
                    {m.instructions && (
                      <p className="cw-doc-med-inst">{m.instructions}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations Section */}
          {recommendations.length > 0 && (
            <div className="cw-doc-section">
              <h3 className="cw-doc-section-title">Recommendations</h3>
              <ul className="cw-doc-bullets">
                {recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Follow-up Section */}
          {followUp.length > 0 && (
            <div className="cw-doc-section">
              <h3 className="cw-doc-section-title">Follow-up</h3>
              <ul className="cw-doc-bullets">
                {followUp.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Provenance note */}
          <div className="cw-doc-provenance-footer">
            ℹ️ Source-grounded document data. No clinical status or health scores are inferred.
          </div>
        </div>

        {/* Footer */}
        <div className="cw-doc-detail-footer">
          <button type="button" className="cw-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
