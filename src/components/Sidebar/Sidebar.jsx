import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GitBranch,
  FileText,
  Pill,
  Calendar,
  Users,
  MessageSquare,
  ShieldCheck,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/journey', label: 'Care Journey', icon: GitBranch },
  { to: '/records', label: 'Health Records', icon: FileText },
  { to: '/medications', label: 'Medications', icon: Pill },
  { to: '/appointments', label: 'Appointments', icon: Calendar },
  { to: '/care-team', label: 'Care Team', icon: Users },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
];

export function Sidebar({ patient }) {
  const { user, logout } = useAuth();

  const displayName = user?.name || (patient ? `${patient.firstName} ${patient.lastName}` : 'User');
  const displayRole = user?.role ? `Role: ${user.role}` : (patient?.recordNumber || '');

  return (
    <aside className={styles.sidebar} aria-label="Main Navigation">
      <div className={styles.brand}>
        <div className={styles.brandHeader}>
          <div className={styles.brandLogo}>
            <span className={styles.brandIcon}>CW</span>
          </div>
          <div>
            <h1 className={styles.brandName}>CareWeave</h1>
            <p className={styles.brandTagline}>Connected Care Journey</p>
          </div>
        </div>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to} className={styles.navItem}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink
                  }
                >
                  <Icon className={styles.navIcon} size={18} aria-hidden="true" />
                  <span className={styles.navLabel}>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.footer}>
        <div className={styles.patientProfile}>
          <div className={styles.patientAvatar} aria-hidden="true">
            <UserCheck size={18} className={styles.userIcon} />
          </div>
          <div className={styles.patientMeta}>
            <span className={styles.patientName}>{displayName}</span>
            <span className={styles.patientId}>{displayRole}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className={styles.signOutButton}
          title="Sign out of CareWeave"
          aria-label="Sign out of CareWeave"
        >
          <LogOut size={14} aria-hidden="true" />
          <span>Sign Out</span>
        </button>

        <div className={styles.complianceNotice}>
          <ShieldCheck size={14} className={styles.complianceIcon} aria-hidden="true" />
          <span>Fictional Demo Environment</span>
        </div>
      </div>
    </aside>
  );
}

