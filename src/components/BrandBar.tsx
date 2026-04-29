import React from 'react';
import { THEME } from '../theme';
import { useFadeIn } from '../hooks/useAnimatedValue';

export const BrandBar: React.FC = () => {
  const opacity = useFadeIn(0, 30);

  return (
    <div style={{
      position: 'absolute',
      top: 72,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: 72,
      paddingRight: 72,
      opacity,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: THEME.purpleDim,
          border: `1px solid ${THEME.purpleBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2L18 7V13L10 18L2 13V7L10 2Z"
              stroke={THEME.purple} strokeWidth="1.5"
              strokeLinejoin="round" fill="none"/>
            <path d="M10 2V18M2 7L18 7M2 13L18 13"
              stroke={THEME.purple} strokeWidth="1"
              strokeOpacity="0.5"/>
          </svg>
        </div>
        <span style={{
          fontFamily: THEME.fontSans,
          fontSize: 26,
          fontWeight: 700,
          color: THEME.textPrimary,
          letterSpacing: '0.04em',
        }}>
          DevDecoded
        </span>
      </div>
      <span style={{
        fontFamily: THEME.fontSans,
        fontSize: 22,
        color: THEME.textMuted,
        letterSpacing: '0.06em',
      }}>
        @dev_de.coded
      </span>
    </div>
  );
};