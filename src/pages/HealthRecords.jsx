import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FlaskConical,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  UploadCloud,
  FileUp,
  X,
  ArrowRight,
  Pill,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useCareData } from '../context/CareDataContext';
import {
  validateFileUpload,
  sanitizeFileName,
  ALLOWED_FILE_TYPES,
  sanitizeTextInput,
} from '../utils/validation';
import styles from './HealthRecords.module.css';

const PRESET_DOCUMENTS = [
  {
    id: 'preset-statin',
    title: 'Cardiology Follow-up & Statin Prescription',
    type: 'Cardiology Consult',
    author: 'Dr. Singh (Cardiology)',
    description: 'Post-telemetry lipid evaluation, atherosclerotic cardiovascular risk review, and statin initiation.',
    content: 'Review of resting BP telemetry demonstrates stable mean arterial pressures (127/83 mmHg). Fasting lipid panel reveals LDL at 134 mg/dL. Initiating Atorvastatin 20mg PO once daily at bedtime for plaque stabilization and secondary cardiovascular prophylaxis. Concomitant Metformin and Amlodipine reviewed with no pharmacological interactions identified. Order routine LFT/lipid recheck in 8 weeks.',
    extractedMedication: {
      name: 'Atorvastatin',
      dosage: '20 mg',
      frequency: 'Once Daily (QHS)',
      timing: 'Nightly at bedtime (10:00 PM) with water',
      condition: 'Cardiovascular Risk / Hyperlipidemia',
      prescriber: 'Dr. Singh',
      refillsRemaining: 3,
      nextRefill: 'Oct 18, 2026',
      status: 'Active Regimen',
    },
  },
  {
    id: 'preset-pantoprazole',
    title: 'Gastroenterology Consultation Note',
    type: 'GI Specialty Summary',
    author: 'Dr. Alva (Gastroenterology)',
    description: 'Upper GI evaluation for steroid-associated dyspepsia and mucosal protection.',
    content: 'Evaluated patient for transient epigastric discomfort correlated with chemotherapy Dexamethasone pre-medication days. Prescribed Pantoprazole 40mg PO daily 30 minutes before breakfast to prevent steroid-induced gastric mucosal irritation. Monitored for drug absorption interactions with Metformin.',
    extractedMedication: {
      name: 'Pantoprazole',
      dosage: '40 mg',
      frequency: 'Once Daily',
      timing: 'Morning, 30 minutes before breakfast',
      condition: 'GI Mucosal Protection / Acid Reflux',
      prescriber: 'Dr. Alva',
      refillsRemaining: 2,
      nextRefill: 'Oct 20, 2026',
      status: 'Active Regimen',
    },
  },
  {
    id: 'preset-empagliflozin',
    title: 'Endocrine Co-Management Protocol',
    type: 'Endocrine Plan',
    author: 'Dr. Rao (Endocrinology)',
    description: 'Dual-agent glycemic control protocol adding SGLT2 inhibitor to existing Metformin.',
    content: 'Quarterly review indicated HbA1c at 7.2% with intermittent steroid-induced glycemic excursions up to 158 mg/dL. Adding Empagliflozin 10mg PO once daily in morning. Instructed patient on hydration and daily home capillary glucose monitoring. Coordinated with Dr. Kapoor for chemotherapy cycle compatibility.',
    extractedMedication: {
      name: 'Empagliflozin',
      dosage: '10 mg',
      frequency: 'Once Daily',
      timing: 'Morning with or without food',
      condition: 'Type 2 Diabetes Glycemic Control',
      prescriber: 'Dr. Rao',
      refillsRemaining: 3,
      nextRefill: 'Nov 01, 2026',
      status: 'Active Regimen',
    },
  },
];

export function HealthRecords() {
  const { healthRecords, addUploadedRecordAndMedication } = useCareData();
  const { recentLabReports, healthDocuments } = healthRecords;

  const [expandedLab, setExpandedLab] = useState('lab-01'); // CBC open by default
  const [expandedDoc, setExpandedDoc] = useState('doc-01'); // Oncology open by default

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState('preset-statin');
  const [customFileName, setCustomFileName] = useState('');
  const [uploadSuccessInfo, setUploadSuccessInfo] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setUploadError(null);
  };

  const toggleLab = (id) => {
    setExpandedLab((prev) => (prev === id ? null : id));
  };

  const toggleDoc = (id) => {
    setExpandedDoc((prev) => (prev === id ? null : id));
  };

  const currentPreset =
    PRESET_DOCUMENTS.find((p) => p.id === selectedPresetId) || PRESET_DOCUMENTS[0];

  const activeDocDetails =
    selectedPresetId === 'custom' && customFileName
      ? {
          title: sanitizeTextInput(customFileName.replace(/\.[^/.]+$/, '') || 'Uploaded Clinical Document'),
          type: 'External Health Document',
          author: 'Attending Physician',
          description: sanitizeTextInput(`Uploaded health record document: ${customFileName}. Reconciled clinical prescriptions.`),
          content: sanitizeTextInput(`Document processed: ${customFileName}. Extracted prescription verified against multi-condition care plan. Cross-specialty clearance indicated for current longitudinal regimen.`),
          extractedMedication: {
            name: 'Atorvastatin',
            dosage: '20 mg',
            frequency: 'Once Daily (QHS)',
            timing: 'Nightly at bedtime (10:00 PM)',
            condition: 'Cardiovascular Risk / Hyperlipidemia',
            prescriber: 'Dr. Singh (Cardiology)',
            refillsRemaining: 3,
            nextRefill: 'Oct 18, 2026',
            status: 'Active Regimen',
          },
        }
      : currentPreset;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFileUpload(file);
    if (!validation.isValid) {
      setUploadError(validation.error);
      e.target.value = ''; // Reset the file input
      return;
    }

    // Clear any previous error and sanitize file name
    setUploadError(null);
    const sanitized = sanitizeFileName(file.name);
    setCustomFileName(sanitized);
    setSelectedPresetId('custom');
  };

  const handleConfirmUpload = () => {
    const docId = `doc-upload-${Date.now()}`;
    const medId = `med-upload-${Date.now()}`;

    const newDoc = {
      id: docId,
      title: sanitizeTextInput(activeDocDetails.title),
      date: 'Today, Sep 18, 2026',
      type: sanitizeTextInput(activeDocDetails.type),
      author: sanitizeTextInput(activeDocDetails.author),
      description: sanitizeTextInput(activeDocDetails.description),
      content: sanitizeTextInput(activeDocDetails.content),
      isUploaded: true,
      extractedMedication: sanitizeTextInput(
        `${activeDocDetails.extractedMedication.name} ${activeDocDetails.extractedMedication.dosage}`
      ),
    };

    const newMed = {
      id: medId,
      name: sanitizeTextInput(activeDocDetails.extractedMedication.name),
      dosage: sanitizeTextInput(activeDocDetails.extractedMedication.dosage),
      frequency: sanitizeTextInput(activeDocDetails.extractedMedication.frequency),
      timing: sanitizeTextInput(activeDocDetails.extractedMedication.timing),
      condition: sanitizeTextInput(activeDocDetails.extractedMedication.condition),
      prescriber: sanitizeTextInput(activeDocDetails.extractedMedication.prescriber),
      refillsRemaining: activeDocDetails.extractedMedication.refillsRemaining,
      nextRefill: sanitizeTextInput(activeDocDetails.extractedMedication.nextRefill),
      status: sanitizeTextInput(activeDocDetails.extractedMedication.status),
      isUploaded: true,
      sourceDocument: sanitizeTextInput(activeDocDetails.title),
    };

    addUploadedRecordAndMedication(newDoc, newMed);
    setUploadSuccessInfo({
      docTitle: newDoc.title,
      medName: newMed.name,
      medDosage: newMed.dosage,
    });
    setExpandedDoc(docId); // Automatically expand the new document
    closeUploadModal();
  };

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div className={styles.headerTitleRow}>
          <div className={styles.headerLeft}>
            <div className={styles.visualAnchor} aria-hidden="true" />
            <div>
              <h1 className={styles.pageTitle}>Health Records & Diagnostics</h1>
              <p className={styles.pageSubtitle}>
                Recent laboratory panels, metabolic reports, histology documents, and clinical summaries
              </p>
            </div>
          </div>

          <button
            type="button"
            className={styles.uploadTriggerBtn}
            onClick={() => setIsUploadModalOpen(true)}
            id="upload-health-record-btn"
          >
            <UploadCloud size={16} aria-hidden="true" />
            <span>Upload Document</span>
          </button>
        </div>
      </header>

      {/* Success Notification Banner */}
      {uploadSuccessInfo && (
        <div className={styles.successBanner} role="status" aria-live="polite">
          <div className={styles.successBannerContent}>
            <CheckCircle size={18} className={styles.successIcon} aria-hidden="true" />
            <div>
              <strong>Record Processed & Reconciled:</strong> "{uploadSuccessInfo.docTitle}" was added to Health Documents. Extracted medication{' '}
              <strong>
                {uploadSuccessInfo.medName} ({uploadSuccessInfo.medDosage})
              </strong>{' '}
              has been added directly to your Medications section.
            </div>
          </div>
          <Link to="/medications" className={styles.viewInMedsLink}>
            <span>View in Medications</span>
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* Section 1: Recent Lab Reports */}
      <section className={styles.sectionBlock} aria-labelledby="lab-reports-heading">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIconBox}>
            <FlaskConical size={16} aria-hidden="true" />
          </div>
          <div>
            <h2 id="lab-reports-heading" className={styles.sectionTitle}>Recent Lab Reports</h2>
            <p className={styles.sectionSubtitle}>Diagnostic panels verified across attending care units</p>
          </div>
        </div>

        <div className={styles.recordsList}>
          {recentLabReports.map((lab) => {
            const isExpanded = expandedLab === lab.id;

            return (
              <article key={lab.id} className={styles.recordCard}>
                <div className={styles.cardMainRow}>
                  <div className={styles.recordInfo}>
                    <div className={styles.titleRow}>
                      <h3 className={styles.recordTitle}>{lab.title}</h3>
                      <span className={styles.typeBadge}>{lab.type}</span>
                    </div>

                    <p className={styles.recordDesc}>{lab.description}</p>

                    <div className={styles.metaRow}>
                      <span>{lab.date}</span>
                      <span className={styles.bulletSeparator} aria-hidden="true">•</span>
                      <span>Ordered by {lab.orderingDoctor}</span>
                      <span className={styles.bulletSeparator} aria-hidden="true">•</span>
                      <span>{lab.laboratory}</span>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <span className={styles.statusTag}>{lab.status}</span>
                    <button
                      type="button"
                      className={styles.viewButton}
                      onClick={() => toggleLab(lab.id)}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? (
                        <>
                          <span>Hide Report</span>
                          <ChevronUp size={14} aria-hidden="true" />
                        </>
                      ) : (
                        <>
                          <span>View Report</span>
                          <ChevronDown size={14} aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className={styles.expandedContent}>
                    <div className={styles.findingsHeader}>
                      <strong>Measured Findings & Reference Ranges</strong>
                    </div>
                    <div className={styles.tableWrapper}>
                      <table className={styles.findingsTable}>
                        <thead>
                          <tr>
                            <th>Clinical Parameter</th>
                            <th>Measured Result</th>
                            <th>Reference Range</th>
                            <th>Evaluation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lab.findings.map((f, idx) => (
                            <tr key={idx}>
                              <td className={styles.markerCell}>{f.marker}</td>
                              <td className={styles.valueCell}>{f.value}</td>
                              <td className={styles.refCell}>{f.reference}</td>
                              <td>
                                <span
                                  className={`${styles.flagTag} ${
                                    f.flag.toLowerCase().includes('normal') || f.flag.toLowerCase().includes('adequate')
                                      ? styles.flagNormal
                                      : styles.flagAlert
                                  }`}
                                >
                                  {f.flag}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* Section 2: Health Documents */}
      <section className={styles.sectionBlock} aria-labelledby="documents-heading">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIconBoxBlue}>
            <FileText size={16} aria-hidden="true" />
          </div>
          <div>
            <h2 id="documents-heading" className={styles.sectionTitle}>Health Documents & Summaries</h2>
            <p className={styles.sectionSubtitle}>Cross-specialty clinical summaries, treatment plans, and monitoring reports</p>
          </div>
        </div>

        <div className={styles.recordsList}>
          {healthDocuments.map((doc) => {
            const isExpanded = expandedDoc === doc.id;

            return (
              <article key={doc.id} className={styles.recordCard}>
                <div className={styles.cardMainRow}>
                  <div className={styles.recordInfo}>
                    <div className={styles.titleRow}>
                      <h3 className={styles.recordTitle}>{doc.title}</h3>
                      <span className={styles.typeBadgeBlue}>{doc.type}</span>
                      {doc.extractedMedication && (
                        <span className={styles.extractedMedBadge}>
                          Medication Extracted: {doc.extractedMedication}
                        </span>
                      )}
                    </div>

                    <p className={styles.recordDesc}>{doc.description}</p>

                    <div className={styles.metaRow}>
                      <span>{doc.date}</span>
                      <span className={styles.bulletSeparator} aria-hidden="true">•</span>
                      <span>Author: {doc.author}</span>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.viewButton}
                      onClick={() => toggleDoc(doc.id)}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? (
                        <>
                          <span>Hide Details</span>
                          <ChevronUp size={14} aria-hidden="true" />
                        </>
                      ) : (
                        <>
                          <span>View Details</span>
                          <ChevronDown size={14} aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className={styles.expandedContent}>
                    <div className={styles.documentBody}>
                      <span className={styles.docSummaryLabel}>Clinical Summary Notes:</span>
                      <p className={styles.docSummaryText}>{doc.content}</p>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* Upload Health Record Modal */}
      {isUploadModalOpen && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeUploadModal();
          }}
        >
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <div className={styles.modalIconBox}>
                  <FileUp size={18} aria-hidden="true" />
                </div>
                <h3 id="upload-modal-title" className={styles.modalTitle}>
                  Upload Health Record
                </h3>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={closeUploadModal}
                aria-label="Close upload dialog"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Validation Error Alert Banner */}
              {uploadError && (
                <div className={styles.uploadErrorBanner} role="alert" aria-live="assertive">
                  <AlertCircle size={16} className={styles.uploadErrorIcon} aria-hidden="true" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* File Dropzone */}
              <div className={styles.fileDropzone}>
                <input
                  type="file"
                  className={styles.fileInputHidden}
                  onChange={handleFileUpload}
                  accept=".pdf,.png,.jpg,.jpeg"
                  id="health-record-file-input"
                />
                <UploadCloud size={28} color="var(--color-accent-primary)" aria-hidden="true" />
                <p className={styles.dropzoneText}>
                  {customFileName ? (
                    <>
                      Selected: <strong>{customFileName}</strong>
                    </>
                  ) : (
                    <>
                      <strong>Click to browse</strong> or drag and drop your clinical document
                    </>
                  )}
                </p>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                  Supports PDF, PNG, and JPEG documents up to 5 MB
                </span>
              </div>

              {/* Sample Preset Selector */}
              <div className={styles.formGroup}>
                <label htmlFor="record-preset-select" className={styles.inputLabel}>
                  Or Select Clinical Document Sample:
                </label>
                <select
                  id="record-preset-select"
                  className={styles.presetSelect}
                  value={selectedPresetId}
                  onChange={(e) => {
                    setSelectedPresetId(e.target.value);
                    setCustomFileName('');
                    setUploadError(null);
                  }}
                >
                  {PRESET_DOCUMENTS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.title} ({preset.extractedMedication.name} {preset.extractedMedication.dosage})
                    </option>
                  ))}
                  {customFileName && <option value="custom">Uploaded File: {customFileName}</option>}
                </select>
              </div>

              {/* Extracted Medication Detected Section */}
              <div className={styles.extractedSection}>
                <div className={styles.extractedHeader}>
                  <Pill size={15} aria-hidden="true" />
                  <span>Detected Medication in Document:</span>
                </div>

                <div className={styles.extractedPillCard}>
                  <div className={styles.extractedMedName}>
                    {activeDocDetails.extractedMedication.name}{' '}
                    <span style={{ color: 'var(--color-accent-primary)', fontWeight: 600 }}>
                      {activeDocDetails.extractedMedication.dosage}
                    </span>
                  </div>
                  <div className={styles.extractedMedMeta}>
                    <span>Frequency: {activeDocDetails.extractedMedication.frequency}</span> •{' '}
                    <span>Prescriber: {activeDocDetails.extractedMedication.prescriber}</span>
                  </div>
                  <div className={styles.extractedMedMeta}>
                    <span>Timing: {activeDocDetails.extractedMedication.timing}</span>
                  </div>
                </div>

                <p className={styles.extractedSyncNotice}>
                  ✓ This medication will be parsed directly from the document and added to your "Medications" section.
                </p>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelModalBtn}
                onClick={closeUploadModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmModalBtn}
                onClick={handleConfirmUpload}
                id="confirm-upload-btn"
              >
                <CheckCircle2 size={14} aria-hidden="true" />
                <span>Upload & Add Medication</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
