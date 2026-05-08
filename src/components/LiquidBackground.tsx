import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from '../theme';

export const LiquidBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t = frame / fps;

  const orb1X = Math.sin(t * 0.15) * 600;
  const orb1Y = Math.cos(t * 0.2) * 1000;
  
  const orb2X = Math.sin(t * 0.25 + 2) * -700;
  const orb2Y = Math.cos(t * 0.15 + 1) * 800;

  const orb3X = Math.cos(t * 0.2 + 4) * 800;
  const orb3Y = Math.sin(t * 0.25 + 3) * -1100;

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bg, overflow: 'hidden' }}>
        
        {/* Orb 1: Purple */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: '1200px', height: '1200px',
          /* OPTIMIZATION: Used radial-gradient instead of CSS blur() */
          background: `radial-gradient(circle, ${THEME.purple} 0%, transparent 60%)`,
          borderRadius: '50%',
          opacity: 0.4,
          transform: `translate(calc(-50% + ${orb1X}px), calc(-50% + ${orb1Y}px))`
        }} />

        {/* Orb 2: Teal */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: '1100px', height: '1100px',
          background: `radial-gradient(circle, ${THEME.teal} 0%, transparent 60%)`,
          borderRadius: '50%',
          opacity: 0.3,
          transform: `translate(calc(-50% + ${orb2X}px), calc(-50% + ${orb2Y}px))`
        }} />

        {/* Orb 3: Blue */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: '1600px', height: '1600px',
          background: `radial-gradient(circle, ${THEME.blue} 0%, transparent 60%)`,
          borderRadius: '50%',
          opacity: 0.2,
          transform: `translate(calc(-50% + ${orb3X}px), calc(-50% + ${orb3Y}px))`
        }} />

      {/* Kept the noise overlay, but if it's still slow, we can remove this too! */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        opacity: 0.05,
        mixBlendMode: 'overlay'
      }} />
    </AbsoluteFill>
  );
};