import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { THEME } from '../theme';

interface Props {
  x1: number; y1: number;
  x2: number; y2: number;
  label?: string;
  color?: string;
  startFrame: number;
  durationFrames?: number;
  curved?: boolean;
}

export const AnimatedArrow: React.FC<Props> = ({
  x1, y1, x2, y2, label, color = THEME.purple,
  startFrame, durationFrames = 30, curved = false,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const labelOpacity = interpolate(
    frame,
    [startFrame + durationFrames * 0.7, startFrame + durationFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);

  // Midpoint for curved path control
  const mx = (x1 + x2) / 2 + (curved ? -dy * 0.25 : 0);
  const my = (y1 + y2) / 2 + (curved ? dx * 0.25 : 0);

  const pathD = curved
    ? `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`
    : `M ${x1} ${y1} L ${x2} ${y2}`;

  // Arrowhead direction
  const angle = Math.atan2(y2 - (curved ? my : y1), x2 - (curved ? mx : x1));
  const arrowLen = 16;
  const arrowAngle = Math.PI / 7;

  const ax1 = x2 - arrowLen * Math.cos(angle - arrowAngle);
  const ay1 = y2 - arrowLen * Math.sin(angle - arrowAngle);
  const ax2 = x2 - arrowLen * Math.cos(angle + arrowAngle);
  const ay2 = y2 - arrowLen * Math.sin(angle + arrowAngle);

  const labelX = curved ? mx : (x1 + x2) / 2;
  const labelY = curved ? my : (y1 + y2) / 2;
  const labelOffsetX = curved ? 0 : (-dy / len) * 30;
  const labelOffsetY = curved ? -30 : (dx / len) * 30;

  return (
    <g>
      <path
        d={pathD}
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={len * 1.1}
        strokeDashoffset={(1 - progress) * len * 1.1}
        opacity={0.85}
      />
      {progress > 0.85 && (
        <g opacity={interpolate(progress, [0.85, 1], [0, 1], { extrapolateRight: 'clamp' })}>
          <line x1={x2} y1={y2} x2={ax1} y2={ay1}
            stroke={color} strokeWidth={2.5} strokeLinecap="round"/>
          <line x1={x2} y1={y2} x2={ax2} y2={ay2}
            stroke={color} strokeWidth={2.5} strokeLinecap="round"/>
        </g>
      )}
      {label && (
        <g opacity={labelOpacity}>
          <rect
            x={labelX + labelOffsetX - 70}
            y={labelY + labelOffsetY - 18}
            width={140} height={34}
            rx={8}
            fill={THEME.bg}
            stroke={color}
            strokeWidth={1}
            strokeOpacity={0.4}
          />
          <text
            x={labelX + labelOffsetX}
            y={labelY + labelOffsetY + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fill={color}
            fontSize={20}
            fontFamily={THEME.fontSans}
            fontWeight={500}
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
};