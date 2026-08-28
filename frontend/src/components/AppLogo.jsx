import React from 'react';

export function AppLogo({ size = 32, rounded = '12px', glow = false }) {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      className={`app-logo-frame ${glow ? 'has-glow' : ''}`}
      style={{
        width: pixelSize,
        height: pixelSize,
        borderRadius: rounded,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGradPrimary" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF9F43" />
            <stop offset="50%" stopColor="#F27D26" />
            <stop offset="100%" stopColor="#E05305" />
          </linearGradient>
          <linearGradient id="logoGradSecondary" x1="0" y1="48" x2="48" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <radialGradient id="logoGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F27D26" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F27D26" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Glow Disc */}
        {glow && <circle cx="24" cy="24" r="22" fill="url(#logoGlow)" opacity="0.6" />}

        {/* 3D Neural Diamond Base */}
        <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#logoGradPrimary)" />

        <text
          x="24"
          y="35"
          textAnchor="middle"
          fontFamily="Plus Jakarta Sans, sans-serif"
          fontSize="29"
          fontWeight="800"
          fill="#FFFFFF"
        >
          J
        </text>
      </svg>
    </div>
  );
}
