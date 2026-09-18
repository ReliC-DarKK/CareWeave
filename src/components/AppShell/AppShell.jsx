import React from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import styles from './AppShell.module.css';

export function AppShell({ patient, children }) {
  return (
    <div className={styles.appContainer}>
      <Sidebar patient={patient} />
      <div className={styles.mainWrapper}>
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
