import React, { useEffect } from 'react';
import './EventDetailModal.css';

export default function EventDetailModal({ isOpen, event, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const hasTests = Array.isArray(event.tests) && event.tests.length > 0;
  const hasMeds = Array.isArray(event.medications) && event.medications.length > 0;
  const hasRecs = Array.isArray(event.recommendations) && event.recommendations.length > 0;
  const hasFollowUp = Array.isArray(event.followUp) && event.followUp.length > 0;
  const hasFindings = Array.isArray(event.findings) && event.findings.length > 0;

  return (
    <div
      className="cw-detail-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-detail-title"
    >
      <div className="cw-detail-modal-card">
        {/* Modal Header */}
        <div className="cw-detail-modal-header">
          <div className="cw-detail-title-group">
            <span className="cw-detail-type-badge">{event.title || 'Medical Document'}</span>
            <h2 id="event-detail-title" className="cw-detail-modal-title">
              {event.originalName || 'Medical Report Details'}
            </h2>
            <div className="cw-detail-meta-row">
              <span className="cw-detail-date">
                <strong>Date:</strong> {event.date || 'Date not recorded'}
              </span>
              {event.provenance?.reportId && (
                <span className="cw-detail-report-id">
                  <strong>Report ID:</strong> {event.provenance.reportId}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            className="cw-detail-close-btn"
            onClick={onClose}
            aria-label="Close event details"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="cw-detail-modal-body">
          {/* Clinician Information */}
          {(event.doctor?.name || event.clinic) && (
            <div className="cw-detail-section">
              <h3 className="cw-detail-section-title">Clinician & Location</h3>
              <div className="cw-detail-clinician-box">
                {event.doctor?.name && (
                  <p className="cw-detail-clinician-name">
                    <strong>Doctor:</strong> {event.doctor.name}
                    {event.doctor.speciality && ` (${event.doctor.speciality})`}
                  </p>
                )}
                {event.clinic && (
                  <p className="cw-detail-clinic-name">
                    <strong>Clinic / Facility:</strong> {event.clinic}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Laboratory Tests */}
          {hasTests && (
            <div className="cw-detail-section">
              <h3 className="cw-detail-section-title">Recorded Tests ({event.tests.length})</h3>
              <div className="cw-detail-table-wrap">
                <table className="cw-detail-table">
                  <thead>
                    <tr>
                      <th>Test</th>
                      <th>Value</th>
                      <th>Unit</th>
                      <th>Reference Range</th>
                      <th>Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.tests.map((t, idx) => (
                      <tr key={idx}>
                        <td className="cw-test-name">{t.name}</td>
                        <td className="cw-test-value">{t.value}</td>
                        <td className="cw-test-unit">{t.unit || '—'}</td>
                        <td className="cw-test-range">{t.referenceRange || '—'}</td>
                        <td className="cw-test-flag">
                          {t.documentFlag ? (
                            <span className="cw-doc-flag-badge">{t.documentFlag}</span>
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

          {/* Medications */}
          {hasMeds && (
            <div className="cw-detail-section">
              <h3 className="cw-detail-section-title">Recorded Medications ({event.medications.length})</h3>
              <ul className="cw-detail-med-list">
                {event.medications.map((m, idx) => (
                  <li key={idx} className="cw-detail-med-item">
                    <strong>{m.name}</strong>
                    <div className="cw-detail-med-meta">
                      {m.dose && <span>{m.dose} {m.unit || ''}</span>}
                      {m.frequency && <span> · {m.frequency}</span>}
                      {m.route && <span> · {m.route}</span>}
                      {m.instructions && <span> · {m.instructions}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations & Follow-Up */}
          {(hasRecs || hasFollowUp) && (
            <div className="cw-detail-section">
              <h3 className="cw-detail-section-title">Recommendations & Follow-up</h3>
              {hasRecs && (
                <ul className="cw-detail-bullet-list">
                  {event.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              )}
              {hasFollowUp && (
                <div className="cw-detail-followup-box">
                  <strong>Follow-up Notes:</strong>
                  <ul>
                    {event.followUp.map((fu, idx) => (
                      <li key={idx}>{fu}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Clinical Findings */}
          {hasFindings && (
            <div className="cw-detail-section">
              <h3 className="cw-detail-section-title">Clinical Findings</h3>
              <div className="cw-detail-findings-box">
                {event.findings.map((f, idx) => (
                  <p key={idx}>{f}</p>
                ))}
              </div>
            </div>
          )}

          {/* Document Provenance */}
          <div className="cw-detail-section cw-detail-provenance-section">
            <h3 className="cw-detail-section-title">Document Provenance</h3>
            <p className="cw-detail-provenance-text">
              Source document ID: <code>{event.documentId}</code>
            </p>
            {event.provenance?.uploadedAt && (
              <p className="cw-detail-provenance-text">
                Uploaded: {new Date(event.provenance.uploadedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="cw-detail-modal-footer">
          <button
            type="button"
            className="cw-btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
