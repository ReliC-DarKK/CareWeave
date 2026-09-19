import React from 'react';
import styles from './LoadingIndicator.module.css';

export function LoadingIndicator({
  size = 'md',
  label,
  fullScreen = false,
  className = '',
}) {
  const sizeMap = {
    sm: 18,
    md: 28,
    lg: 40,
  };

  const pixelSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div
      className={`${styles.container} ${styles[size]} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label || 'Loading content...'}
    >
      <div className={styles.capsuleWrapper} style={{ width: pixelSize, height: pixelSize }}>
        <svg
          className={styles.capsuleSvg}
          viewBox="0 0 32 32"
          width={pixelSize}
          height={pixelSize}
          aria-hidden="true"
        >
          {/* Left half - Deep Clinical Navy */}
          <path
            d="M 16 11 L 10 11 A 5 5 0 0 0 10 21 L 16 21 Z"
            fill="#2C3E6B"
          />
          {/* Right half - Clinical Muted Teal */}
          <path
            d="M 16 11 L 22 11 A 5 5 0 0 1 22 21 L 16 21 Z"
            fill="#0D9488"
          />
          {/* Dividing seam */}
          <line
            x1="16"
            y1="10.5"
            x2="16"
            y2="21.5"
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeOpacity="0.9"
          />
          {/* Subtle top reflection */}
          <line
            x1="8"
            y1="13.5"
            x2="24"
            y2="13.5"
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeOpacity="0.25"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {label ? (
        <span className={styles.label}>{label}</span>
      ) : (
        <span className="visually-hidden">Loading...</span>
      )}
    </div>
  );

  if (fullScreen) {
    return <div className={styles.fullScreenOverlay}>{content}</div>;
  }

  return content;
}
