import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export function useFadeIn(startFrame: number, durationFrames = 20) {
  const frame = useCurrentFrame();
  return interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

export function useSlideUp(startFrame: number, durationFrames = 24, distance = 40) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 18, stiffness: 120 },
  });
  const opacity = interpolate(frame, [startFrame, startFrame + durationFrames * 0.6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const translateY = interpolate(progress, [0, 1], [distance, 0]);
  return { opacity, translateY };
}

export function useCountUp(
  startFrame: number,
  endFrame: number,
  from: number,
  to: number
) {
  const frame = useCurrentFrame();
  return Math.round(
    interpolate(frame, [startFrame, endFrame], [from, to], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
}

export function useDrawPath(startFrame: number, durationFrames: number) {
  const frame = useCurrentFrame();
  return interpolate(frame, [startFrame, startFrame + durationFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

export function useSpring(startFrame: number, config = { damping: 18, stiffness: 120 }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - startFrame, fps, config });
}