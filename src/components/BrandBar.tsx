import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { THEME } from '../theme';

export const BrandBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({
    frame: frame - 0,
    fps,
    config: { damping: 20, stiffness: 160 },
  });
  const opacity = interpolate(appear, [0, 1], [0, 1]);
  const translateY = interpolate(appear, [0, 1], [-20, 0]);

  // Subtle shimmer on the logo diamond
  const shimmer = 0.7 + 0.3 * Math.sin(frame * 0.1);

  return (
    <div style={{
      position: 'absolute',
      top: 64,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: 72,
      paddingRight: 72,
      opacity,
      transform: `translateY(${translateY}px)`,
      zIndex: 100,
    }}>
      {/* Logo + Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 11,
          background: `${THEME.purpleDim}`,
          border: `1.5px solid ${THEME.purple}${Math.round(shimmer * 99).toString(16).padStart(2,'0')}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path
              d="M11 2L20 7.5V14.5L11 20L2 14.5V7.5L11 2Z"
              stroke={THEME.purple}
              strokeWidth="1.5"
              strokeLinejoin="round"
              fill="none"
              opacity={shimmer}
            />
            <path
              d="M11 2V20M2 7.5L20 7.5M2 14.5L20 14.5"
              stroke={THEME.purple}
              strokeWidth="1"
              strokeOpacity={0.35}
            />
          </svg>
        </div>
        {/* FIX: was opacity 0.28 — now clearly readable */}
        <span style={{
          fontFamily: THEME.fontSans,
          fontSize: 28,
          fontWeight: 700,
          color: THEME.textPrimary,
          letterSpacing: '0.02em',
          opacity: 0.9,
        }}>
          DevDecoded
        </span>
      </div>

      {/* Handle */}
      <span style={{
        fontFamily: THEME.fontSans,
        fontSize: 22,
        color: THEME.textMuted,
        letterSpacing: '0.04em',
        opacity: 0.7,
      }}>
        @dev_de.coded
      </span>
    </div>
  );
};