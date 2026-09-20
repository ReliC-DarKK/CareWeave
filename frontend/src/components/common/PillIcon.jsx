import React from 'react';

/**
 * Generic Purple & White Pharmaceutical Capsule Icon
 * Professional medical SVG replacing default emoji representation.
 */
export default function PillIcon({ size = 28, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`cw-pill-icon ${className}`}
      aria-label="Medication Pill"
      role="img"
    >
      <defs>
        {/* Purple gradient for active half */}
        <linearGradient
          id="cwPillPurpleGrad"
          x1="8"
          y1="8"
          x2="24"
          y2="24"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="40%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>

        {/* White / pearl gradient for complementary half */}
        <linearGradient
          id="cwPillWhiteGrad"
          x1="18"
          y1="18"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>

        {/* Subtle drop shadow */}
        <filter
          id="cwPillShadow"
          x="4"
          y="6"
          width="32"
          height="32"
          filterUnits="userSpaceOnUse"
        >
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="2"
            floodColor="#6366F1"
            floodOpacity="0.25"
          />
        </filter>
      </defs>

      <g filter="url(#cwPillShadow)" transform="rotate(-45 20 20)">
        {/* Entire capsule outer boundary for smooth antialiasing */}
        <rect
          x="11"
          y="6"
          width="18"
          height="28"
          rx="9"
          fill="#E2E8F0"
        />

        {/* Top Half (Purple) */}
        <path
          d="M11 15V15C11 10.0294 15.0294 6 20 6C24.9706 6 29 10.0294 29 15V20H11V15Z"
          fill="url(#cwPillPurpleGrad)"
        />

        {/* Bottom Half (White) */}
        <path
          d="M11 20H29V25C29 29.9706 24.9706 34 20 34C15.0294 34 11 29.9706 11 25V20Z"
          fill="url(#cwPillWhiteGrad)"
        />

        {/* Middle seam line */}
        <line
          x1="11"
          y1="20"
          x2="29"
          y2="20"
          stroke="#C4B5FD"
          strokeWidth="1.2"
        />

        {/* Pill Highlight / Gloss reflection */}
        <path
          d="M14 10C14 8.5 15.5 7.5 17 7.5"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M14 14V18"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.4"
        />
      </g>
    </svg>
  );
}
