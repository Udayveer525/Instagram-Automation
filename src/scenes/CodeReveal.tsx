import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { CodeRevealScene } from '../types';
import { THEME } from '../theme';
import { BrandBar } from '../components/BrandBar';
import { useSlideUp } from '../hooks/useAnimatedValue';

const TITLE_FRAMES = 35;
const FRAMES_PER_LINE = 14;

// Minimal token colorizer — covers the common cases
function tokenize(code: string, language: string): React.ReactNode {
  const keywords: Record<string, string[]> = {
    python: ['def', 'return', 'if', 'else', 'for', 'in', 'import', 'from', 'class', 'self', 'True', 'False', 'None', 'and', 'or', 'not', 'with', 'as', 'yield', 'lambda', 'pass', 'raise'],
    javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'of', 'in', 'class', 'new', 'this', 'import', 'export', 'default', 'async', 'await', 'true', 'false', 'null', 'undefined', 'typeof'],
    typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'of', 'in', 'class', 'new', 'this', 'import', 'export', 'type', 'interface', 'extends', 'implements', 'async', 'await', 'true', 'false', 'null', 'undefined'],
  };

  const kws = keywords[language.toLowerCase()] ?? keywords['javascript'];
  const parts = code.split(/(\s+|[{}()[\],;.]|"[^"]*"|'[^']*'|`[^`]*`|\/\/.*$|#.*$)/);

  return (
    <>
      {parts.map((part, i) => {
        if (kws.includes(part)) {
          return <span key={i} style={{ color: THEME.purple }}>{part}</span>;
        }
        if (/^["'`]/.test(part)) {
          return <span key={i} style={{ color: THEME.teal }}>{part}</span>;
        }
        if (/^(\/\/|#)/.test(part)) {
          return <span key={i} style={{ color: THEME.textMuted, fontStyle: 'italic' }}>{part}</span>;
        }
        if (/^\d+$/.test(part)) {
          return <span key={i} style={{ color: THEME.coral }}>{part}</span>;
        }
        return <span key={i} style={{ color: THEME.textSecondary }}>{part}</span>;
      })}
    </>
  );
}

export const CodeReveal: React.FC<{ scene: CodeRevealScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const title = useSlideUp(10, 24);

  const fontSize = scene.lines.length > 12 ? 26 : 30;
  const lineHeight = scene.lines.length > 12 ? 48 : 54;

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
        <div style={{
          fontFamily: THEME.fontSans,
          fontSize: 48,
          fontWeight: 800,
          color: THEME.textPrimary,
          marginBottom: 14,
        }}>
          {scene.title}
        </div>
        <div style={{ width: 60, height: 3, borderRadius: 2, background: THEME.teal }} />
      </div>

      {/* Code block */}
      <div style={{
        position: 'absolute',
        top: 370,
        left: 60,
        right: 60,
        background: THEME.surface,
        borderRadius: 20,
        border: `1px solid ${THEME.border}`,
        overflow: 'hidden',
      }}>
        {/* Window bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '20px 28px',
          borderBottom: `1px solid ${THEME.border}`,
        }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: c }} />
          ))}
          <span style={{
            fontFamily: THEME.fontMono,
            fontSize: 22,
            color: THEME.textMuted,
            marginLeft: 16,
          }}>
            {scene.language}
          </span>
        </div>

        {/* Lines */}
        <div style={{ padding: '28px 36px' }}>
          {scene.lines.map((line, i) => {
            const lineStart = TITLE_FRAMES + i * FRAMES_PER_LINE;
            const opacity = interpolate(
              frame,
              [lineStart, lineStart + 10],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );
            const translateX = interpolate(
              frame,
              [lineStart, lineStart + 12],
              [-20, 0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 24,
                  height: lineHeight,
                  opacity,
                  transform: `translateX(${translateX}px)`,
                  background: line.highlight ? `${THEME.purple}14` : 'transparent',
                  borderRadius: line.highlight ? 8 : 0,
                  paddingLeft: line.highlight ? 12 : 0,
                  paddingRight: line.highlight ? 12 : 0,
                  marginLeft: line.highlight ? -12 : 0,
                  borderLeft: line.highlight ? `3px solid ${THEME.purple}` : 'none',
                }}
              >
                {/* Line number */}
                <span style={{
                  fontFamily: THEME.fontMono,
                  fontSize: fontSize - 4,
                  color: THEME.textMuted,
                  minWidth: 36,
                  textAlign: 'right',
                  userSelect: 'none',
                }}>
                  {i + 1}
                </span>

                {/* Code content */}
                <span style={{
                  fontFamily: THEME.fontMono,
                  fontSize,
                  lineHeight: 1,
                  whiteSpace: 'pre',
                }}>
                  {tokenize(line.code, scene.language)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};