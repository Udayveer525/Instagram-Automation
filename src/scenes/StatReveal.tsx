import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { StatRevealScene } from '../types';
import { THEME } from '../theme';
import { BrandBar } from '../components/BrandBar';
import { useCountUp } from '../hooks/useAnimatedValue';

export const StatReveal: React.FC<{ scene: StatRevealScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Parse the stat — supports "73%", "4.2B", "400ms", plain numbers
  const match = scene.stat.match(/^([\d.]+)(.*)$/);
  const numericPart = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : '';
  const isDecimal = scene.stat.includes('.');
  const decimals = isDecimal ? (match?.[1].split('.')[1]?.length ?? 1) : 0;

  const countedNum = useCountUp(20, 80, 0, numericPart);
  const displayNum = isDecimal
    ? countedNum.toFixed(decimals)
    : countedNum.toString();

  const statAppear = spring({ frame: frame - 10, fps, config: { damping: 14, stiffness: 100 } });
  const labelAppear = spring({ frame: frame - 55, fps, config: { damping: 18, stiffness: 120 } });
  const contextAppear = spring({ frame: frame - 80, fps, config: { damping: 18, stiffness: 120 } });

  const statScale = interpolate(statAppear, [0, 1], [0.6, 1]);
  const statOpacity = interpolate(statAppear, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });
  const labelOpacity = interpolate(labelAppear, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });
  const labelY = interpolate(labelAppear, [0, 1], [20, 0]);
  const contextOpacity = interpolate(contextAppear, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });
  const contextY = interpolate(contextAppear, [0, 1], [20, 0]);

  return (
    <div style={{
      width: THEME.W,
      height: THEME.H,
      background: THEME.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      <BrandBar />

      {/* Background glow */}
      <div style={{
        position: 'absolute',
        width: 700,
        height: 700,
        borderRadius: '50%',
        background: THEME.coral,
        opacity: 0.05,
        filter: 'blur(100px)',
        pointerEvents: 'none',
      }} />

      {/* Stat number */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        opacity: statOpacity,
        transform: `scale(${statScale})`,
        marginBottom: 32,
      }}>
        <span style={{
          fontFamily: THEME.fontSans,
          fontSize: 200,
          fontWeight: 900,
          color: THEME.coral,
          lineHeight: 1,
          letterSpacing: '-0.04em',
        }}>
          {displayNum}
        </span>
        {suffix && (
          <span style={{
            fontFamily: THEME.fontSans,
            fontSize: 90,
            fontWeight: 800,
            color: THEME.coral,
            marginTop: 24,
            opacity: 0.85,
          }}>
            {suffix}
          </span>
        )}
      </div>

      {/* Divider */}
      <div style={{
        width: 120,
        height: 3,
        borderRadius: 2,
        background: THEME.coral,
        opacity: statOpacity * 0.5,
        marginBottom: 40,
      }} />

      {/* Label */}
      <div style={{
        fontFamily: THEME.fontSans,
        fontSize: 52,
        fontWeight: 700,
        color: THEME.textPrimary,
        textAlign: 'center',
        maxWidth: 800,
        lineHeight: 1.25,
        opacity: labelOpacity,
        transform: `translateY(${labelY}px)`,
        marginBottom: 28,
        padding: '0 80px',
      }}>
        {scene.label}
      </div>

      {/* Context */}
      <div style={{
        fontFamily: THEME.fontSans,
        fontSize: 34,
        fontWeight: 400,
        color: THEME.textSecondary,
        textAlign: 'center',
        maxWidth: 760,
        lineHeight: 1.55,
        opacity: contextOpacity,
        transform: `translateY(${contextY}px)`,
        padding: '0 80px',
      }}>
        {scene.context}
      </div>
    </div>
  );
};