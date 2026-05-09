import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from '../theme';

export const LiquidBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // FIX: Much faster movement frequencies so motion is visible within a 5-20s scene
  const t = frame / fps;

  const orb1X = Math.sin(t * 0.6) * 320;
  const orb1Y = Math.cos(t * 0.45) * 500;

  const orb2X = Math.sin(t * 0.5 + 2) * -380;
  const orb2Y = Math.cos(t * 0.7 + 1) * 420;

  const orb3X = Math.cos(t * 0.55 + 4) * 280;
  const orb3Y = Math.sin(t * 0.4 + 3) * -460;

  // Fourth orb — adds depth, rotates opposite direction
  const orb4X = Math.cos(t * 0.35 + 1.5) * 450;
  const orb4Y = Math.sin(t * 0.6 + 2.5) * 300;

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bg, overflow: 'hidden' }}>

      {/* Orb 1: Purple — dominant, large */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: '900px', height: '900px',
        background: `radial-gradient(circle, ${THEME.purple}88 0%, transparent 65%)`,
        borderRadius: '50%',
        opacity: 0.35,
        transform: `translate(calc(-50% + ${orb1X}px), calc(-50% + ${orb1Y}px))`,
      }} />

      {/* Orb 2: Teal — contrasting corner presence */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: '800px', height: '800px',
        background: `radial-gradient(circle, ${THEME.teal}77 0%, transparent 65%)`,
        borderRadius: '50%',
        opacity: 0.28,
        transform: `translate(calc(-50% + ${orb2X}px), calc(-50% + ${orb2Y}px))`,
      }} />

      {/* Orb 3: Blue — subtle background depth */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: '1100px', height: '1100px',
        background: `radial-gradient(circle, ${THEME.blue}55 0%, transparent 65%)`,
        borderRadius: '50%',
        opacity: 0.18,
        transform: `translate(calc(-50% + ${orb3X}px), calc(-50% + ${orb3Y}px))`,
      }} />

      {/* Orb 4: Coral — warm accent, small */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: '600px', height: '600px',
        background: `radial-gradient(circle, ${THEME.coral}66 0%, transparent 65%)`,
        borderRadius: '50%',
        opacity: 0.15,
        transform: `translate(calc(-50% + ${orb4X}px), calc(-50% + ${orb4Y}px))`,
      }} />

      {/* Vignette — darkens edges, focuses viewer on center content */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: `radial-gradient(ellipse at center, transparent 40%, ${THEME.bg}cc 100%)`,
        pointerEvents: 'none',
      }} />

      {/* Film grain noise overlay */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity: 0.04,
        mixBlendMode: 'overlay',
      }} />
    </AbsoluteFill>
  );
};