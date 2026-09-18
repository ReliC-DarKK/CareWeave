import React, { useState } from 'react';
import { FlaskConical, FileText, ChevronDown, ChevronUp, CheckCircle, ExternalLink } from 'lucide-react';
import { DEMO_HEALTH_RECORDS_DATA } from '../data/mockData';
import styles from './HealthRecords.module.css';

export function HealthRecords() {
  const { recentLabReports, healthDocuments } = DEMO_HEALTH_RECORDS_DATA;
  const [expandedLab, setExpandedLab] = useState('lab-01'); // CBC open by default
  const [expandedDoc, setExpandedDoc] = useState('doc-01'); // Oncology open by default

  const toggleLab = (id) => {
    setExpandedLab((prev) => (prev === id ? null : id));
  };

  const toggleDoc = (id) => {
    setExpandedDoc((prev) => (prev === id ? null : id));
  };

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div className={styles.headerTitleRow}>
          <div className={styles.visualAnchor} aria-hidden="true" />
          <div>
            <h1 className={styles.pageTitle}>Health Records & Diagnostics</h1>
            <p className={styles.pageSubtitle}>
              Recent laboratory panels, metabolic reports, histology documents, and clinical summaries
            </p>
          </div>
        </div>
      </header>

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
    </div>
  );
}
