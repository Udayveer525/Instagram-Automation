import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { TextOnlyScene } from '../types';
import { THEME } from '../theme';
import { BrandBar } from '../components/BrandBar';

export const TextOnly: React.FC<{ scene: TextOnlyScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = scene.text.split(' ');
  const subwords = scene.subtext?.split(' ') ?? [];

  const isHook = scene.style === 'hook';
  const isCta = scene.style === 'cta';

  const framesPerWord = 6;
  const accentColor = isCta ? THEME.coral : isHook ? THEME.purple : THEME.teal;

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
      padding: '0 88px',
    }}>
      <BrandBar />

      {/* Subtle background accent */}
      <div style={{
        position: 'absolute',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: accentColor,
        opacity: 0.04,
        filter: 'blur(120px)',
        pointerEvents: 'none',
      }} />

      {/* Top accent line */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: 88,
        right: 88,
        height: 1,
        background: `linear-gradient(90deg, transparent, ${accentColor}44, transparent)`,
        transform: 'translateY(-160px)',
        opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
      }} />

      {/* Main text — word by word */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0 18px',
        justifyContent: 'center',
        marginBottom: 48,
      }}>
        {words.map((word, i) => {
          const wordStart = i * framesPerWord;
          const wordProgress = spring({
            frame: frame - wordStart,
            fps,
            config: { damping: 20, stiffness: 200, mass: 0.7 },
          });
          const opacity = interpolate(wordProgress, [0, 1], [0, 1]);
          const translateY = interpolate(wordProgress, [0, 1], [20, 0]);

          return (
            <span
              key={i}
              style={{
                fontFamily: THEME.fontSans,
                fontSize: isHook ? 88 : 80,
                fontWeight: 800,
                color: THEME.textPrimary,
                lineHeight: 1.15,
                opacity,
                transform: `translateY(${translateY}px)`,
                display: 'inline-block',
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Subtext */}
      {scene.subtext && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0 12px',
          justifyContent: 'center',
          opacity: interpolate(
            frame,
            [words.length * framesPerWord, words.length * framesPerWord + 20],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          ),
        }}>
          {subwords.map((word, i) => (
            <span
              key={i}
              style={{
                fontFamily: THEME.fontSans,
                fontSize: 38,
                fontWeight: 400,
                color: THEME.textSecondary,
                lineHeight: 1.5,
              }}
            >
              {word}
            </span>
          ))}
        </div>
      )}

      {/* Bottom accent bar for CTA */}
      {isCta && (
        <div style={{
          position: 'absolute',
          bottom: 180,
          left: 88,
          right: 88,
          height: 3,
          borderRadius: 2,
          background: accentColor,
          opacity: interpolate(frame, [20, 40], [0, 0.6], { extrapolateRight: 'clamp' }),
        }} />
      )}
    </div>
  );
};