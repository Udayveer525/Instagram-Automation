import React from 'react';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { THEME, ACCENT_COLORS } from '../theme';

interface Props {
  x: number;
  y: number;
  label: string;
  icon: string;
  color?: string;
  startFrame: number;
  size?: number;
  active?: boolean;
}

export const Node: React.FC<Props> = ({
  x, y, label, icon,
  color = 'purple',
  startFrame,
  size = 120,
  active = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const accent = ACCENT_COLORS[color] ?? THEME.purple;

  const appear = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 16, stiffness: 140 },
  });

  const scale = interpolate(appear, [0, 1], [0.3, 1]);
  const opacity = interpolate(appear, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });

  const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[icon] as LucideIcon | undefined;

  const iconSize = Math.round(size * 0.75);
  const labelLines = label.split(' ');
  const lineHeight = 30;
  const labelStartY = size * 0.5 + 24;

  return (
    <g
      opacity={opacity}
      transform={`translate(${x}, ${y}) scale(${scale})`}
      style={{ transformOrigin: `${x}px ${y}px` }}
    >
      {/* Active glow dot underneath icon */}
      {active && (
        <circle
          cx={0} cy={0} r={size * 0.45}
          fill={accent}
          opacity={0.08}
        />
      )}

      {/* Icon via foreignObject */}
      {IconComponent && (
        <foreignObject
          x={-iconSize / 2}
          y={-iconSize / 2}
          width={iconSize}
          height={iconSize}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconComponent
              size={iconSize * 0.8}
              color={accent}
              strokeWidth={1.4}
            />
          </div>
        </foreignObject>
      )}

      {/* Label lines below icon */}
      {labelLines.map((line, i) => (
        <text
          key={i}
          x={0}
          y={labelStartY + i * lineHeight}
          textAnchor="middle"
          dominantBaseline="central"
          fill={THEME.textPrimary}
          fontSize={26}
          fontFamily={THEME.fontSans}
          fontWeight={600}
          letterSpacing="0.01em"
        >
          {line}
        </text>
      ))}

      {/* Subtle underline accent when active */}
      {active && (
        <rect
          x={-40} y={labelStartY + labelLines.length * lineHeight + 8}
          width={80} height={2}
          rx={1}
          fill={accent}
          opacity={0.7}
        />
      )}
    </g>
  );
};