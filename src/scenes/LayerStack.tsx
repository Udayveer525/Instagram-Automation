import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { LayerStackScene } from '../types';
import { THEME, ACCENT_COLORS } from '../theme';
import { BrandBar } from '../components/BrandBar';
import { useSlideUp } from '../hooks/useAnimatedValue';

const TITLE_FRAMES = 35;
const FRAMES_PER_LAYER = 18;

export const LayerStack: React.FC<{ scene: LayerStackScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = useSlideUp(10, 24);

  const totalLayers = scene.layers.length;
  const layerHeight = 110;
  const layerGap = 18;
  const stackWidth = 860;
  const stackLeft = (THEME.W - stackWidth) / 2;
  const totalStackHeight = totalLayers * (layerHeight + layerGap) - layerGap;
  const stackTop = (THEME.H - totalStackHeight) / 2 + 60;

  return (
    <div style={{
      width: THEME.W,
      height: THEME.H,
      background: THEME.bg,
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
        <div style={{
          fontFamily: THEME.fontSans,
          fontSize: 52,
          fontWeight: 800,
          color: THEME.textPrimary,
          lineHeight: 1.2,
          marginBottom: 14,
        }}>
          {scene.title}
        </div>
        <div style={{ width: 60, height: 3, borderRadius: 2, background: THEME.purple }} />
      </div>

      {/* Layers */}
      {scene.layers.map((layer, i) => {
        const layerStart = TITLE_FRAMES + i * FRAMES_PER_LAYER;
        const isHighlighted = scene.highlightIndex === i;

        const appear = spring({
          frame: frame - layerStart,
          fps,
          config: { damping: 18, stiffness: 130 },
        });

        const opacity = interpolate(appear, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });
        const translateX = interpolate(appear, [0, 1], [-60, 0]);

        const accent = layer.color
          ? ACCENT_COLORS[layer.color] ?? THEME.purple
          : THEME.purple;

        const layerY = stackTop + i * (layerHeight + layerGap);

        // Label appears after layer slides in
        const labelOpacity = interpolate(
          frame,
          [layerStart + 8, layerStart + 20],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: stackLeft,
              top: layerY,
              width: stackWidth,
              height: layerHeight,
              opacity,
              transform: `translateX(${translateX}px)`,
            }}
          >
            {/* Layer bar */}
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: 16,
              background: isHighlighted
                ? `${accent}22`
                : THEME.surfaceAlt,
              border: `1.5px solid ${isHighlighted ? accent : THEME.border}`,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 40,
              paddingRight: 40,
              gap: 24,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Left accent stripe */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 5,
                borderRadius: '16px 0 0 16px',
                background: accent,
                opacity: isHighlighted ? 1 : 0.4,
              }} />

              {/* Layer number */}
              <div style={{
                fontFamily: THEME.fontMono,
                fontSize: 22,
                color: accent,
                minWidth: 36,
                opacity: labelOpacity,
              }}>
                {String(totalLayers - i).padStart(2, '0')}
              </div>

              {/* Label */}
              <div style={{ flex: 1, opacity: labelOpacity }}>
                <div style={{
                  fontFamily: THEME.fontSans,
                  fontSize: 34,
                  fontWeight: 700,
                  color: isHighlighted ? accent : THEME.textPrimary,
                  marginBottom: layer.sublabel ? 6 : 0,
                }}>
                  {layer.label}
                </div>
                {layer.sublabel && (
                  <div style={{
                    fontFamily: THEME.fontSans,
                    fontSize: 24,
                    color: THEME.textSecondary,
                    fontWeight: 400,
                  }}>
                    {layer.sublabel}
                  </div>
                )}
              </div>

              {/* Highlighted badge */}
              {isHighlighted && (
                <div style={{
                  opacity: labelOpacity,
                  background: `${accent}22`,
                  border: `1px solid ${accent}55`,
                  borderRadius: 8,
                  padding: '6px 16px',
                  fontFamily: THEME.fontSans,
                  fontSize: 20,
                  color: accent,
                  fontWeight: 600,
                }}>
                  key layer
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};