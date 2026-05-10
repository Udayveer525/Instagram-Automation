import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ComparisonScene } from '../types';
import { THEME, ACCENT_COLORS } from '../theme';
import { BrandBar } from '../components/BrandBar';
import { useSlideUp } from '../hooks/useAnimatedValue';

const TITLE_FRAMES = 35;
const HEADER_FRAMES = 20;
const FRAMES_PER_ITEM = 16;

export const Comparison: React.FC<{ scene: ComparisonScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = useSlideUp(10, 24);

  const leftAccent  = ACCENT_COLORS[scene.left.color  ?? 'purple'] ?? THEME.purple;
  const rightAccent = ACCENT_COLORS[scene.right.color ?? 'teal']   ?? THEME.teal;
  const maxItems    = Math.max(scene.left.items.length, scene.right.items.length);

  const columnWidth = 460;
  const columnGap   = 40;
  const totalWidth  = columnWidth * 2 + columnGap;
  const leftStart   = (THEME.W - totalWidth) / 2;
  const rightStart  = leftStart + columnWidth + columnGap;
  const columnsTop  = 430;

  const headerStart = TITLE_FRAMES;
  const itemsStart  = TITLE_FRAMES + HEADER_FRAMES;
  const allItemsInBy = itemsStart + maxItems * FRAMES_PER_ITEM + 20;

  const headerAppear = spring({ frame: frame - headerStart, fps, config: { damping: 18, stiffness: 140 } });
  const headerOpacity = interpolate(headerAppear, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });
  const headerY       = interpolate(headerAppear, [0, 1], [20, 0]);

  // MICRO-ANIMATION: after all items are in, column headers pulse alternately
  const leftPulse = frame > allItemsInBy
    ? 0.08 + 0.04 * Math.sin((frame - allItemsInBy) * 0.09)
    : 0.09;
  const rightPulse = frame > allItemsInBy
    ? 0.08 + 0.04 * Math.sin((frame - allItemsInBy) * 0.09 + Math.PI) // opposite phase
    : 0.09;

  return (
    <div style={{
      width: THEME.W,
      height: THEME.H,
      background: 'transparent',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <BrandBar />

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: 180,
        left: 80,
        right: 80,
        opacity: title.opacity,
        transform: `translateY(${title.translateY}px)`,
      }}>
        <div style={{ fontFamily: THEME.fontSans, fontSize: 52, fontWeight: 800, color: THEME.textPrimary, marginBottom: 14 }}>
          {scene.title}
        </div>
        <div style={{ width: 60, height: 3, borderRadius: 2, background: THEME.purple }} />
      </div>

      {/* Column headers */}
      {[
        { label: scene.left.title,  accent: leftAccent,  x: leftStart,  pulse: leftPulse  },
        { label: scene.right.title, accent: rightAccent, x: rightStart, pulse: rightPulse },
      ].map((col, ci) => (
        <div key={ci} style={{
          position: 'absolute',
          top: columnsTop,
          left: col.x,
          width: columnWidth,
          opacity: headerOpacity,
          transform: `translateY(${headerY}px)`,
        }}>
          <div style={{
            background: `${col.accent}${Math.round(col.pulse * 255).toString(16).padStart(2,'0')}`,
            border: `1.5px solid ${col.accent}66`,
            borderRadius: 14,
            padding: '18px 28px',
            fontFamily: THEME.fontSans,
            fontSize: 38,
            fontWeight: 700,
            color: col.accent,
            textAlign: 'center',
            // MICRO-ANIMATION: glow shifts between left and right columns
            boxShadow: frame > allItemsInBy
              ? `0 0 ${16 + 8 * Math.sin((frame - allItemsInBy) * 0.09 + ci * Math.PI)}px ${col.accent}44`
              : 'none',
            transition: 'box-shadow 0.1s',
          }}>
            {col.label}
          </div>
        </div>
      ))}

      {/* Items */}
      {Array.from({ length: maxItems }).map((_, i) => {
        const itemStart  = itemsStart + i * FRAMES_PER_ITEM;
        const itemAppear = spring({ frame: frame - itemStart, fps, config: { damping: 18, stiffness: 150 } });
        const itemOpacity = interpolate(itemAppear, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });
        const itemY       = interpolate(itemAppear, [0, 1], [16, 0]);
        const itemTop     = columnsTop + 100 + i * 98;

        return (
          <React.Fragment key={i}>
            {[
              { items: scene.left.items,  x: leftStart,  accent: leftAccent  },
              { items: scene.right.items, x: rightStart, accent: rightAccent },
            ].map((col, ci) => {
              const text = col.items[i];
              if (!text) return null;

              // MICRO-ANIMATION: each item gently bobs after it appears
              const bobOffset = frame > itemStart + 20
                ? 1.5 * Math.sin((frame - itemStart - 20) * 0.06 + i * 0.8 + ci * 1.2)
                : 0;

              return (
                <div key={ci} style={{
                  position: 'absolute',
                  top: itemTop,
                  left: col.x,
                  width: columnWidth,
                  opacity: itemOpacity,
                  transform: `translateY(${itemY + bobOffset}px)`,
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 18,
                    padding: '18px 24px',
                    background: THEME.surfaceAlt,
                    borderRadius: 12,
                    border: `1px solid ${THEME.border}`,
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.accent, flexShrink: 0 }} />
                    <span style={{ fontFamily: THEME.fontSans, fontSize: 28, fontWeight: 500, color: THEME.textPrimary, lineHeight: 1.3 }}>
                      {text}
                    </span>
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
};