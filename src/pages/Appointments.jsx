import React from 'react';
import { Calendar, Clock, MapPin, User, CheckSquare, History, AlertCircle } from 'lucide-react';
import { DEMO_APPOINTMENTS_DATA } from '../data/mockData';
import styles from './Appointments.module.css';

export function Appointments() {
  const { upcoming, past } = DEMO_APPOINTMENTS_DATA;

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div className={styles.headerTitleRow}>
          <div className={styles.visualAnchor} aria-hidden="true" />
          <div>
            <h1 className={styles.pageTitle}>Clinical Appointments & Encounters</h1>
            <p className={styles.pageSubtitle}>
              Multidisciplinary consultation schedule, upcoming clinical visits, and preparation guidance
            </p>
          </div>
        </div>
      </header>

      {/* Section 1: Upcoming Appointments */}
      <section className={styles.sectionBlock} aria-labelledby="upcoming-heading">
        <div className={styles.sectionHeader}>
          <Calendar size={16} className={styles.upcomingIcon} aria-hidden="true" />
          <div>
            <h2 id="upcoming-heading" className={styles.sectionTitle}>Upcoming Appointments</h2>
            <p className={styles.sectionSubtitle}>Scheduled consultations and clinical encounter details</p>
          </div>
        </div>

        <div className={styles.appointmentsList}>
          {upcoming.map((apt) => (
            <article key={apt.id} className={styles.appointmentCard}>
              <div className={styles.cardHeader}>
                <div className={styles.headerLeft}>
                  <div className={styles.dateBadge}>
                    <span className={styles.dateDay}>{apt.date.split(',')[0]}</span>
                    <span className={styles.dateTime}>{apt.time}</span>
                  </div>

                  <div className={styles.titleInfo}>
                    <div className={styles.specialtyRow}>
                      <span className={styles.specialtyTag}>{apt.specialty}</span>
                      <span className={styles.statusConfirmed}>{apt.status}</span>
                    </div>
                    <h3 className={styles.appointmentTitle}>{apt.title}</h3>
                    <div className={styles.metaRow}>
                      <span className={styles.metaItem}>
                        <User size={13} aria-hidden="true" />
                        {apt.provider}
                      </span>
                      <span className={styles.bulletSeparator} aria-hidden="true">•</span>
                      <span className={styles.metaItem}>
                        <MapPin size={13} aria-hidden="true" />
                        {apt.department}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calm, Non-Alarmist Preparation Area */}
              {apt.preparation && apt.preparation.length > 0 && (
                <div className={styles.prepContainer}>
                  <div className={styles.prepHeader}>
                    <CheckSquare size={14} className={styles.prepIcon} aria-hidden="true" />
                    <span className={styles.prepTitle}>PREPARATION — Before your appointment:</span>
                  </div>
                  <ul className={styles.prepList}>
                    {apt.preparation.map((item, idx) => (
                      <li key={idx} className={styles.prepItem}>
                        <span className={styles.prepBullet} aria-hidden="true">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Section 2: Past Appointments */}
      <section className={styles.sectionBlock} aria-labelledby="past-heading">
        <div className={styles.sectionHeader}>
          <History size={16} className={styles.pastIcon} aria-hidden="true" />
          <div>
            <h2 id="past-heading" className={styles.sectionTitle}>Past Clinical Encounters</h2>
            <p className={styles.sectionSubtitle}>Completed consultations and clinical post-visit summaries</p>
          </div>
        </div>

        <div className={styles.appointmentsList}>
          {past.map((apt) => (
            <article key={apt.id} className={styles.pastCard}>
              <div className={styles.cardHeader}>
                <div className={styles.headerLeft}>
                  <div className={styles.dateBadgePast}>
                    <span className={styles.dateDay}>{apt.date.split(',')[0]}</span>
                    <span className={styles.dateTime}>{apt.time}</span>
                  </div>

                  <div className={styles.titleInfo}>
                    <div className={styles.specialtyRow}>
                      <span className={styles.specialtyTag}>{apt.specialty}</span>
                      <span className={styles.statusCompleted}>{apt.status}</span>
                    </div>
                    <h3 className={styles.appointmentTitle}>{apt.title}</h3>
                    <div className={styles.metaRow}>
                      <span className={styles.metaItem}>
                        <User size={13} aria-hidden="true" />
                        {apt.provider}
                      </span>
                      <span className={styles.bulletSeparator} aria-hidden="true">•</span>
                      <span className={styles.metaItem}>
                        <MapPin size={13} aria-hidden="true" />
                        {apt.department}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {apt.summary && (
                <div className={styles.pastSummaryBox}>
                  <span className={styles.summaryLabel}>Visit Summary:</span>
                  <p className={styles.summaryText}>{apt.summary}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
