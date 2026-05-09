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

  const framesPerWord = 5;
  const accentColor = isCta ? THEME.coral : isHook ? THEME.purple : THEME.teal;

  // Adaptive font size: fewer words = bigger text
  const wordCount = words.length;
  const mainFontSize = wordCount <= 4 ? 112 : wordCount <= 6 ? 96 : wordCount <= 8 ? 82 : 70;

  // Breathing animation on the accent glow after all words are in
  const allWordsInFrame = words.length * framesPerWord + 10;
  const breathe = 0.03 + 0.02 * Math.sin(frame * 0.08);

  return (
    <div style={{
      width: THEME.W,
      height: THEME.H,
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: '0 72px',
    }}>
      <BrandBar />

      {/* Breathing radial accent glow */}
      <div style={{
        position: 'absolute',
        width: 800,
        height: 800,
        borderRadius: '50%',
        background: accentColor,
        opacity: breathe,
        filter: 'blur(80px)',
        pointerEvents: 'none',
        transform: `scale(${1 + breathe * 4})`,
      }} />

      {/* Horizontal gradient line above text */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: 72,
        right: 72,
        height: 1,
        background: `linear-gradient(90deg, transparent, ${accentColor}66, transparent)`,
        transform: 'translateY(-200px)',
        opacity: interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' }),
      }} />

      {/* Main text — word by word spring entrance */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: `0 ${mainFontSize * 0.22}px`,
        justifyContent: 'center',
        textAlign: 'center',
        marginBottom: 56,
      }}>
        {words.map((word, i) => {
          const wordStart = i * framesPerWord;
          const wordProgress = spring({
            frame: frame - wordStart,
            fps,
            config: { damping: 18, stiffness: 220, mass: 0.6 },
          });
          const opacity = interpolate(wordProgress, [0, 1], [0, 1]);
          const translateY = interpolate(wordProgress, [0, 1], [36, 0]);
          const scale = interpolate(wordProgress, [0, 1], [0.85, 1]);

          // Gradient highlight on last word of hook
          const isLastWord = i === words.length - 1;
          const textColor = isHook && isLastWord
            ? 'transparent'
            : THEME.textPrimary;
          const bgClip = isHook && isLastWord ? 'text' : undefined;
          const bgImage = isHook && isLastWord
            ? `linear-gradient(135deg, ${accentColor}, ${THEME.teal})`
            : undefined;

          return (
            <span
              key={i}
              style={{
                fontFamily: THEME.fontSans,
                fontSize: mainFontSize,
                fontWeight: 900,
                color: textColor,
                background: bgImage,
                WebkitBackgroundClip: bgClip,
                WebkitTextFillColor: isHook && isLastWord ? 'transparent' : undefined,
                lineHeight: 1.15,
                opacity,
                transform: `translateY(${translateY}px) scale(${scale})`,
                display: 'inline-block',
                letterSpacing: '-0.02em',
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Subtext — fades in after all words */}
      {scene.subtext && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0 14px',
          justifyContent: 'center',
          textAlign: 'center',
          opacity: interpolate(
            frame,
            [allWordsInFrame, allWordsInFrame + 18],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          ),
          transform: `translateY(${interpolate(
            frame,
            [allWordsInFrame, allWordsInFrame + 18],
            [16, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          )}px)`,
        }}>
          {subwords.map((word, i) => (
            <span
              key={i}
              style={{
                fontFamily: THEME.fontSans,
                fontSize: 40,
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

      {/* CTA bottom bar */}
      {isCta && (
        <div style={{
          position: 'absolute',
          bottom: 180,
          left: 72,
          right: 72,
          height: 2,
          borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          opacity: interpolate(frame, [15, 35], [0, 0.8], { extrapolateRight: 'clamp' }),
        }} />
      )}

      {/* Gradient line below text */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: 72,
        right: 72,
        height: 1,
        background: `linear-gradient(90deg, transparent, ${accentColor}33, transparent)`,
        transform: 'translateY(200px)',
        opacity: interpolate(frame, [allWordsInFrame, allWordsInFrame + 20], [0, 1], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        }),
      }} />
    </div>
  );
};