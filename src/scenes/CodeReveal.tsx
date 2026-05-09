import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { CodeRevealScene } from '../types';
import { THEME } from '../theme';
import { BrandBar } from '../components/BrandBar';
import { useSlideUp } from '../hooks/useAnimatedValue';

const TITLE_FRAMES = 35;
const FRAMES_PER_LINE = 14;

function tokenize(code: string, language: string): React.ReactNode {
  const keywords: Record<string, string[]> = {
    python: ['def', 'return', 'if', 'else', 'for', 'in', 'import', 'from', 'class', 'self', 'True', 'False', 'None', 'and', 'or', 'not', 'with', 'as', 'yield', 'lambda', 'pass', 'raise', 'async', 'await'],
    javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'of', 'in', 'class', 'new', 'this', 'import', 'export', 'default', 'async', 'await', 'true', 'false', 'null', 'undefined', 'typeof'],
    typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'of', 'in', 'class', 'new', 'this', 'import', 'export', 'type', 'interface', 'extends', 'implements', 'async', 'await', 'true', 'false', 'null', 'undefined'],
    bash: ['echo', 'if', 'then', 'fi', 'for', 'do', 'done', 'export', 'source', 'cd', 'ls', 'mkdir', 'rm', 'cp', 'mv'],
  };

  const kws = keywords[language.toLowerCase()] ?? keywords['javascript'];
  const parts = code.split(/(\s+|[{}()[\],;.]|"[^"]*"|'[^']*'|`[^`]*`|\/\/.*$|#.*$)/);

  return (
    <>
      {parts.map((part, i) => {
        if (kws.includes(part)) return <span key={i} style={{ color: THEME.purple }}>{part}</span>;
        if (/^["'`]/.test(part)) return <span key={i} style={{ color: THEME.teal }}>{part}</span>;
        if (/^(\/\/|#)/.test(part)) return <span key={i} style={{ color: THEME.textMuted, fontStyle: 'italic' }}>{part}</span>;
        if (/^\d+$/.test(part)) return <span key={i} style={{ color: THEME.coral }}>{part}</span>;
        return <span key={i} style={{ color: THEME.textSecondary }}>{part}</span>;
      })}
    </>
  );
}

export const CodeReveal: React.FC<{ scene: CodeRevealScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = useSlideUp(10, 24);

  const totalLines = scene.lines.length;
  const fontSize = totalLines > 12 ? 25 : 29;
  // BUG FIX: use paddingY instead of fixed height so highlight bg fits the text
  const paddingY = totalLines > 12 ? 10 : 13;
  const lineGap = 6;

  // Blinking cursor on the last revealed line
  const lastRevealedLine = Math.min(
    Math.floor((frame - TITLE_FRAMES) / FRAMES_PER_LINE),
    totalLines - 1
  );
  const cursorBlink = Math.floor(frame / 15) % 2 === 0;

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
        {/* macOS window dots */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '20px 28px',
          borderBottom: `1px solid ${THEME.border}`,
          background: `${THEME.surfaceAlt}`,
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
        <div style={{ padding: '24px 32px 28px' }}>
          {scene.lines.map((line, i) => {
            const lineStart = TITLE_FRAMES + i * FRAMES_PER_LINE;
            const lineAppear = spring({
              frame: frame - lineStart,
              fps,
              config: { damping: 22, stiffness: 180, mass: 0.8 },
            });
            const opacity = interpolate(lineAppear, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
            const translateX = interpolate(lineAppear, [0, 1], [-16, 0], { extrapolateRight: 'clamp' });

            const isCurrentLine = i === lastRevealedLine && frame > lineStart;

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',   // FIX: was 'baseline' → text was stuck top
                  gap: 24,
                  opacity,
                  transform: `translateX(${translateX}px)`,
                  // FIX: padding instead of fixed height so highlight wraps text properly
                  paddingTop: paddingY,
                  paddingBottom: paddingY,
                  marginBottom: lineGap,
                  paddingLeft: line.highlight ? 14 : 0,
                  paddingRight: line.highlight ? 14 : 0,
                  marginLeft: line.highlight ? -14 : 0,
                  background: line.highlight ? `${THEME.purple}20` : 'transparent',
                  borderRadius: line.highlight ? 10 : 0,
                  // FIX: richer highlight border — was barely visible
                  borderLeft: line.highlight ? `3px solid ${THEME.purple}` : '3px solid transparent',
                  transition: 'background 0.2s',
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
                  flexShrink: 0,
                }}>
                  {i + 1}
                </span>

                {/* Code content */}
                <span style={{
                  fontFamily: THEME.fontMono,
                  fontSize,
                  lineHeight: 1.5,
                  whiteSpace: 'pre',
                  flex: 1,
                }}>
                  {tokenize(line.code, scene.language)}
                  {/* Blinking cursor on active line */}
                  {isCurrentLine && (
                    <span style={{
                      display: 'inline-block',
                      width: 3,
                      height: fontSize * 1.2,
                      background: THEME.teal,
                      marginLeft: 2,
                      verticalAlign: 'middle',
                      opacity: cursorBlink ? 1 : 0,
                      borderRadius: 1,
                    }} />
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};