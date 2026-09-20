import React, { useState, useEffect, useCallback } from 'react';
import GreetingHeader from '../../components/GreetingHeader/GreetingHeader';
import EmptyState from '../../components/EmptyState/EmptyState';
import DocumentUploadModal from '../../components/DocumentUploadModal/DocumentUploadModal';
import DocumentDetailModal from '../../components/DocumentDetailModal/DocumentDetailModal';
import documentService from '../../services/documentService';
import '../Appointments/AppointmentsPage.css';
import './HealthRecordsPage.css';

export default function HealthRecordsPage({
  activePatient,
  patientProfile,
  theme,
  onToggleTheme,
  onLogout,
  user,
  onPatientAssociated,
}) {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocData, setSelectedDocData] = useState(null);
  const [loadingDocId, setLoadingDocId] = useState(null);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await documentService.getDocuments(activePatient?.id || null);
      const rawDocs = res?.documents || [];

      // Deduplicate to guarantee clean display without repeated uploads
      const seen = new Set();
      const deduped = [];
      for (const d of rawDocs) {
        const key = `${d.originalName || ''}|${d.documentDate || ''}|${d.doctor?.name || ''}`;
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(d);
        }
      }
      setDocuments(deduped);
    } catch (err) {
      console.error('Error loading health records:', err);
      setError(err.message || 'Failed to load health records.');
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, [activePatient?.id]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleDocumentClick = async (doc) => {
    setLoadingDocId(doc.id);
    try {
      const fullDoc = await documentService.getDocument(doc.id);
      setSelectedDocData({
        document: fullDoc?.document || doc,
        extraction: fullDoc?.extraction || null,
      });
    } catch (err) {
      console.error('Error fetching document details:', err);
      setSelectedDocData({
        document: doc,
        extraction: null,
      });
    } finally {
      setLoadingDocId(null);
    }
  };

  return (
    <main className="cw-page-container cw-health-records-page" id="main-content">
      <GreetingHeader
        patientProfile={activePatient ? { ...patientProfile, name: activePatient.name } : patientProfile}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
        user={user}
      />

      <section className="cw-page-content-wrapper" aria-labelledby="health-records-title">
        <div className="cw-records-header">
          <div>
            <h2 id="health-records-title" className="cw-records-title">Health Records</h2>
            <p className="cw-records-subtitle">Persisted medical records and clinical documents.</p>
          </div>
          <button
            type="button"
            className="cw-records-upload-btn"
            onClick={() => setIsUploadModalOpen(true)}
          >
            + Upload Document
          </button>
        </div>

        {isLoading ? (
          <div className="cw-records-loading">
            <div className="cw-spinner"></div>
            <p>Loading records...</p>
          </div>
        ) : error ? (
          <div className="cw-records-error">
            <p>{error}</p>
          </div>
        ) : documents.length === 0 ? (
          <EmptyState
            icon={
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8L14 2Z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            }
            title="No medical records available yet."
            description="Upload your medical reports, test results, or discharge summaries to start building your records."
            actionText="+ Upload Document"
            onAction={() => setIsUploadModalOpen(true)}
          />
        ) : (
          <div className="cw-records-grid">
            {documents.map((doc) => {
              const testsCount = doc.counts?.tests || 0;
              const medsCount = doc.counts?.medications || 0;
              const doctorText = [doc.doctor?.name, doc.doctor?.clinic].filter(Boolean).join(' · ');

              return (
                <button
                  type="button"
                  key={doc.id}
                  className="cw-record-card-btn"
                  onClick={() => handleDocumentClick(doc)}
                  disabled={loadingDocId === doc.id}
                  aria-label={`View record details for ${doc.originalName}`}
                >
                  <div className="cw-record-card-header">
                    <div className="cw-record-icon-box" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cw-primary, #5B4DF5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8L14 2Z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    </div>
                    <div className="cw-record-title-box">
                      <h3 className="cw-record-title">
                        {doc.documentType ? doc.documentType.replace(/_/g, ' ') : doc.originalName}
                      </h3>
                      <span className="cw-record-filename">{doc.originalName}</span>
                    </div>
                    <span className="cw-record-badge">{doc.processingStatus || 'READY'}</span>
                  </div>

                  <div className="cw-record-card-body">
                    {doc.documentDate && (
                      <div className="cw-record-date-line">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>{doc.documentDate}</span>
                      </div>
                    )}
                    {doctorText && (
                      <div className="cw-record-doctor-line">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>{doctorText}</span>
                      </div>
                    )}
                  </div>

                  <div className="cw-record-card-footer">
                    <div className="cw-record-counts">
                      {testsCount > 0 && <span>{testsCount} test{testsCount === 1 ? '' : 's'}</span>}
                      {testsCount > 0 && medsCount > 0 && <span>·</span>}
                      {medsCount > 0 && <span>{medsCount} medication{medsCount === 1 ? '' : 's'}</span>}
                      {testsCount === 0 && medsCount === 0 && <span>Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</span>}
                    </div>
                    <span className="cw-record-arrow">View details →</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Document Detail Modal */}
      {selectedDocData && (
        <DocumentDetailModal
          document={selectedDocData.document}
          extraction={selectedDocData.extraction}
          onClose={() => setSelectedDocData(null)}
        />
      )}

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        patientId={activePatient?.id}
        onClose={() => {
          setIsUploadModalOpen(false);
          loadDocuments();
        }}
        onUploadSuccess={() => {}}
        onExtractionComplete={(extractionResult) => {
          const associatedPatientId = extractionResult?.document?.patientId;
          if (associatedPatientId && onPatientAssociated) {
            onPatientAssociated(associatedPatientId);
          }
          loadDocuments();
        }}
      />
    </main>
  );
}
