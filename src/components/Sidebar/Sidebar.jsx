import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  TrendingUp,
  FileText,
  Pill,
  Calendar,
  Users,
  MessageCircleMore,
  ChevronDown,
} from 'lucide-react';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true, fillWhenActive: true },
  { to: '/journey', label: 'Care Journey', icon: TrendingUp },
  { to: '/records', label: 'Health Records', icon: FileText },
  { to: '/medications', label: 'Medications', icon: Pill },
  { to: '/appointments', label: 'Appointments', icon: Calendar },
  { to: '/care-team', label: 'Care Team', icon: Users },
  { to: '/messages', label: 'Messages', icon: MessageCircleMore },
];

function CareWeaveLogo() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 38 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.brandIconSvg}
      aria-label="CareWeave Logo"
    >
      <defs>
        <linearGradient id="cwHeartGrad" x1="4" y1="4" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="45%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
        <filter id="cwShadow" x="0" y="0" width="38" height="38" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#4338CA" floodOpacity="0.12" />
        </filter>
      </defs>
      {/* Heart Outer Body */}
      <path
        d="M19 32.5C18.4 32.5 7.5 24 4.5 17C1.5 10 5.5 4.5 12 4.5C15.8 4.5 18 7.2 19 8.8C20 7.2 22.2 4.5 26 4.5C32.5 4.5 36.5 10 33.5 17C30.5 24 19.6 32.5 19 32.5Z"
        fill="url(#cwHeartGrad)"
        filter="url(#cwShadow)"
      />
      {/* Woven Loop Cutout */}
      <path
        d="M19 12C16.8 9.5 14 7.8 12 7.8C8 7.8 6 11.5 8 16C10 20.5 16.5 25.5 19 27.5C21.5 25.5 28 20.5 30 16C32 11.5 30 7.8 26 7.8C24 7.8 21.2 9.5 19 12Z"
        fill="#FFFFFF"
        opacity="0.95"
      />
      {/* Center Heart Ribbon */}
      <path
        d="M19 16.5C18.2 15.2 16.8 14 15.5 14C13.5 14 12.5 15.8 13.5 18C14.5 20.2 18 22.8 19 23.8C20 22.8 23.5 20.2 24.5 18C25.5 15.8 24.5 14 22.5 14C21.2 14 19.8 15.2 19 16.5Z"
        fill="url(#cwHeartGrad)"
      />
      {/* Ribbon Knot Stitch */}
      <circle cx="19" cy="18.5" r="1.5" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}

function PromoCardIllustration() {
  return (
    <svg
      viewBox="0 0 210 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.promoIllustrationSvg}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hillGrad1" x1="0" y1="50" x2="210" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EBF0FD" />
          <stop offset="100%" stopColor="#DDE6FD" />
        </linearGradient>
        <linearGradient id="hillGrad2" x1="0" y1="70" x2="210" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#DDE6FD" />
          <stop offset="100%" stopColor="#CBD7FE" />
        </linearGradient>
        <linearGradient id="hillGrad3" x1="0" y1="90" x2="210" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#CBD7FE" />
          <stop offset="100%" stopColor="#BAC9FD" />
        </linearGradient>
        <linearGradient id="charHair" x1="130" y1="20" x2="185" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>

      {/* Layer 1: Distant soft purple hills */}
      <path
        d="M0 80C35 65 70 72 110 84C150 96 180 88 210 78V150H0V80Z"
        fill="url(#hillGrad1)"
      />

      {/* Layer 2: Midground rolling curves */}
      <path
        d="M0 100C45 88 90 104 135 96C170 90 190 100 210 94V150H0V100Z"
        fill="url(#hillGrad2)"
      />

      {/* Illustrated Patient Character (Right-aligned, serene pose with arms crossed) */}
      <g id="patientFigure" transform="translate(132, 34)">
        {/* Back Hair Mass */}
        <path
          d="M20 22C14 22 9 30 9 43C9 54 13 60 13 60C13 60 16 46 19 43C21 43 27 43 31 46C31 46 34 36 34 23C34 14 27 11 20 22Z"
          fill="#4338CA"
        />

        {/* Neck */}
        <path d="M24 35L24 43L28 43L28 35Z" fill="#F8D3B8" />

        {/* Head & Face */}
        <path
          d="M21 18C17 18 15 22 15 27C15 32 18 36 22 36C26 36 29 32 29 27C29 22 26 18 21 18Z"
          fill="#FDEEE3"
          stroke="#4F46E5"
          strokeWidth="1.2"
        />

        {/* Eyes & Smile */}
        <path d="M23 25C24 24.5 25.5 24.5 26.5 25" stroke="#4F46E5" strokeWidth="0.9" strokeLinecap="round" />
        <circle cx="25" cy="27" r="0.8" fill="#4F46E5" />
        <path d="M24 31C25 32 26.5 32 27.5 31" stroke="#4F46E5" strokeWidth="0.9" strokeLinecap="round" />

        {/* Violet/Purple Hair Volume */}
        <path
          d="M15 23C13 20 15 13 22 12C29 11 34 16 33 23C32 22 29 19 24 20C20 21 17 23 15 23Z"
          fill="url(#charHair)"
        />
        <path
          d="M14 24C13 30 11 38 11 48C11 54 14 59 15 61C16 57 17 49 17 42C17 34 16 28 14 24Z"
          fill="url(#charHair)"
        />

        {/* Shoulders & Lavender Shirt */}
        <path
          d="M14 45C10 49 5 58 5 72H46C46 58 41 49 37 45C33 43 29 43 25 43C21 43 18 43 14 45Z"
          fill="#DDD6FE"
          stroke="#4F46E5"
          strokeWidth="1.2"
        />

        {/* Crossed Arms */}
        <path
          d="M9 62C12 59 18 59 24 61C28 62 35 60 42 63C41 69 35 72 27 72C20 72 12 69 9 62Z"
          fill="#DDD6FE"
          stroke="#4F46E5"
          strokeWidth="1.2"
        />
        <path d="M13 60C18 63 24 63 29 61" stroke="#4F46E5" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M26 62C31 65 37 64 40 62" stroke="#4F46E5" strokeWidth="1.1" strokeLinecap="round" />
        {/* Hand resting */}
        <path d="M12 61C14 64 16 66 18 65" stroke="#4F46E5" strokeWidth="1.1" strokeLinecap="round" fill="#FDEEE3" />
      </g>

      {/* Layer 3: Foreground lavender hill overlapping bottom of figure */}
      <path
        d="M0 118C45 106 95 120 148 110C176 105 194 112 210 108V150H0V118Z"
        fill="url(#hillGrad3)"
      />
    </svg>
  );
}

function PatientAvatar() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.avatarSvg}
      aria-label="Aditi Sharma Avatar"
    >
      <defs>
        <clipPath id="avatarCircle">
          <circle cx="18" cy="18" r="18" />
        </clipPath>
        <linearGradient id="avatarBg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#BAE6FD" />
          <stop offset="100%" stopColor="#7DD3FC" />
        </linearGradient>
        <linearGradient id="hairGrad" x1="10" y1="4" x2="26" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
      </defs>
      <g clipPath="url(#avatarCircle)">
        {/* Soft Blue Background */}
        <rect width="36" height="36" fill="url(#avatarBg)" />

        {/* Dark Hair Behind */}
        <path d="M10 18C10 10 13 6 18 6C23 6 26 10 26 18C26 24 24 28 24 28H12C12 28 10 24 10 18Z" fill="url(#hairGrad)" />

        {/* Medical Blue Collar & Shoulders */}
        <path d="M6 36C6 29 11 25 18 25C25 25 30 29 30 36H6Z" fill="#3B82F6" />
        <path d="M14 26L18 31L22 26" fill="#60A5FA" />
        <path d="M18 25L18 32" stroke="#2563EB" strokeWidth="0.8" />

        {/* Neck */}
        <rect x="16" y="20" width="4" height="6" fill="#F3C6A5" />

        {/* Face */}
        <ellipse cx="18" cy="16.5" rx="5.5" ry="6.5" fill="#F8D3B8" />

        {/* Hair Front Parted Style */}
        <path d="M12.5 14C12.5 10 14.5 8 18 8C21.5 8 23.5 10 23.5 14C23.5 12 22 9.5 18 9.5C14 9.5 12.5 12 12.5 14Z" fill="url(#hairGrad)" />
        <path d="M12.5 13C13 16 14 18 14 18C13 16 12.5 14.5 12.5 13Z" fill="url(#hairGrad)" />
        <path d="M23.5 13C23 16 22 18 22 18C23 16 23.5 14.5 23.5 13Z" fill="url(#hairGrad)" />

        {/* Eyebrows & Eyes */}
        <path d="M14.5 14C15 13.5 16 13.5 16.5 14" stroke="#1E293B" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M19.5 14C20 13.5 21 13.5 21.5 14" stroke="#1E293B" strokeWidth="0.8" strokeLinecap="round" />
        <circle cx="15.5" cy="15.5" r="0.8" fill="#1E293B" />
        <circle cx="20.5" cy="15.5" r="0.8" fill="#1E293B" />

        {/* Subtle Bindi */}
        <circle cx="18" cy="13.2" r="0.6" fill="#DC2626" />

        {/* Warm Smile */}
        <path d="M16.5 19C17 20 19 20 19.5 19" stroke="#9A3412" strokeWidth="0.9" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function Sidebar({ patient }) {
  return (
    <aside className={styles.sidebar} aria-label="Main Navigation">
      {/* Brand Header */}
      <div className={styles.brand}>
        <div className={styles.brandHeader}>
          <div className={styles.brandLogo}>
            <CareWeaveLogo />
          </div>
          <div className={styles.brandTextGroup}>
            <h1 className={styles.brandName}>CareWeave</h1>
            <p className={styles.brandTagline}>One person. One care journey.</p>
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
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
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`${styles.navIcon} ${isActive && item.fillWhenActive ? styles.navIconFilled : ''}`}
                        size={19}
                        aria-hidden="true"
                      />
                      <span className={styles.navLabel}>{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Promo Card */}
      <div className={styles.promoCard}>
        <div className={styles.promoTextGroup}>
          <p className={styles.promoLine}>Tracking more</p>
          <p className={styles.promoLine}>than conditions.</p>
          <p className={`${styles.promoLine} ${styles.promoBoldLine}`}>Tracking you.</p>
        </div>
        <div className={styles.promoIllustrationWrapper}>
          <PromoCardIllustration />
        </div>
      </div>

      {/* Patient Profile Row */}
      <div className={styles.footer}>
        <div className={styles.patientProfile}>
          <div className={styles.patientIdentity}>
            <div className={styles.avatarWrapper}>
              <PatientAvatar />
            </div>
            <div className={styles.patientMeta}>
              <span className={styles.patientName}>
                {patient?.firstName ? `${patient.firstName} ${patient.lastName}` : 'Aditi Sharma'}
              </span>
              <span className={styles.patientRole}>Patient</span>
            </div>
          </div>
          <ChevronDown size={16} className={styles.profileChevron} aria-hidden="true" />
        </div>
      </div>
    </aside>
  );
}
