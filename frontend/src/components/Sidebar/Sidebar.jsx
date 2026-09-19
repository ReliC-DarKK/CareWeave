import React, { useState } from 'react';
import './Sidebar.css';

function CareWeaveLogo() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 38 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="cw-brand-logo-svg"
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
      width="100%"
      height="100%"
      viewBox="0 0 210 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="cw-promo-illustration-svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hillGrad1" x1="0" y1="65" x2="210" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="hillGrad2" x1="0" y1="88" x2="210" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id="hillGrad3" x1="0" y1="106" x2="210" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EDE9FE" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#DDD6FE" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="charHair" x1="15" y1="12" x2="33" y2="35" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4338CA" />
          <stop offset="100%" stopColor="#312E81" />
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

      {/* Illustrated Patient Character */}
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

export function PatientAvatar() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="cw-avatar-svg"
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

export default function Sidebar({ navigationItems = [], patientProfile }) {
  const [activeItem, setActiveItem] = useState('home');

  const renderNavIcon = (icon, isActive) => {
    switch (icon) {
      case 'home':
        return (
          <svg width="19" height="19" viewBox="0 0 24 24" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10.5L12 3L21 10.5V20A1 1 0 0 1 20 21H15V15H9V21H4A1 1 0 0 1 3 20V10.5Z" />
          </svg>
        );
      case 'journey':
        return (
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 17L8.5 11.5L13.5 16.5L20 8"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="20" cy="8" r="2.5" fill="currentColor" />
          </svg>
        );
      case 'records':
        return (
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8L14 2Z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        );
      case 'medications':
        return (
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.5 20.5L20.5 10.5A5 5 0 0 0 13.5 3.5L3.5 13.5A5 5 0 0 0 10.5 20.5Z" />
            <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
          </svg>
        );
      case 'appointments':
        return (
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <circle cx="8" cy="15" r="1" fill="currentColor" />
            <circle cx="12" cy="15" r="1" fill="currentColor" />
            <circle cx="16" cy="15" r="1" fill="currentColor" />
          </svg>
        );
      case 'team':
        return (
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21V19A4 4 0 0 0 12 15H6A4 4 0 0 0 2 19V21" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21V19A4 4 0 0 0 19 15.3" />
            <path d="M16 3.13A4 4 0 0 1 16 10.87" />
          </svg>
        );
      case 'messages':
        return (
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12A9 9 0 0 1 9 20.9L3 21L4.8 15.6A9 9 0 1 1 21 12Z" />
            <circle cx="9" cy="12" r="1" fill="currentColor" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
            <circle cx="15" cy="12" r="1" fill="currentColor" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <aside className="cw-sidebar" aria-label="Main Navigation">
      {/* 1. CareWeave Brand Header (1.0 exact) */}
      <div className="cw-sidebar-brand">
        <div className="cw-brand-header">
          <div className="cw-brand-logo-wrap">
            <CareWeaveLogo />
          </div>
          <div className="cw-brand-text-group">
            <h1 className="cw-brand-name">CareWeave</h1>
            <p className="cw-brand-tagline">One person. One care journey.</p>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Links (1.0 exact) */}
      <nav className="cw-sidebar-nav">
        <ul className="cw-sidebar-nav-list">
          {navigationItems.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <li key={item.id} className="cw-sidebar-nav-item">
                <button
                  type="button"
                  className={`cw-sidebar-nav-link ${isActive ? 'cw-sidebar-nav-active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setActiveItem(item.id)}
                >
                  <span className="cw-sidebar-nav-icon">
                    {renderNavIcon(item.icon, isActive)}
                  </span>
                  <span className="cw-sidebar-nav-label">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 3. Promo Card: "Tracking more than conditions. Tracking you." (1.0 exact) */}
      <div className="cw-sidebar-promo-card">
        <div className="cw-sidebar-promo-text">
          <p className="cw-promo-line">Tracking more</p>
          <p className="cw-promo-line">than conditions.</p>
          <p className="cw-promo-line cw-promo-bold">Tracking you.</p>
        </div>
        <div className="cw-sidebar-promo-illustration">
          <PromoCardIllustration />
        </div>
      </div>

      {/* 4. Patient Profile Footer (1.0 exact) */}
      <div className="cw-sidebar-footer">
        <div className="cw-patient-profile">
          <div className="cw-patient-identity">
            <div className="cw-avatar-wrapper">
              <PatientAvatar />
            </div>
            <div className="cw-patient-meta">
              <span className="cw-patient-name">
                {patientProfile?.name || 'Aditi Sharma'}
              </span>
              <span className="cw-patient-role">Patient</span>
            </div>
          </div>
          <svg className="cw-profile-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </aside>
  );
}
