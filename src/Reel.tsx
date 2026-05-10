import React from 'react';
import {
  AbsoluteFill, Series, Audio, staticFile,
  useVideoConfig, useCurrentFrame, interpolate, spring
} from 'remotion';
import { ReelProps, Scene } from './types';
import { TextOnly } from './scenes/TextOnly';
import { NetworkDiagram } from './scenes/NetworkDiagram';
import { LayerStack } from './scenes/LayerStack';
import { CodeReveal } from './scenes/CodeReveal';
import { StatReveal } from './scenes/StatReveal';
import { Comparison } from './scenes/Comparison';
import { THEME } from './theme';
import { LiquidBackground } from './components/LiquidBackground';
import { Captions } from './components/Captions';

// ─── Scene renderer ────────────────────────────────────────────────────────────

const SceneRenderer: React.FC<{ scene: Scene }> = ({ scene }) => {
  switch (scene.type) {
    case 'text_only':        return <TextOnly scene={scene} />;
    case 'network_diagram':  return <NetworkDiagram scene={scene} />;
    case 'layer_stack':      return <LayerStack scene={scene} />;
    case 'code_reveal':      return <CodeReveal scene={scene} />;
    case 'stat_reveal':      return <StatReveal scene={scene} />;
    case 'comparison':       return <Comparison scene={scene} />;
    default:                 return null;
  }
};

// ─── Transition wrapper ────────────────────────────────────────────────────────
// Each scene fades in over FADE_FRAMES at start, fades out over FADE_FRAMES at end.
// This sits AROUND SceneRenderer so the background (LiquidBackground) is unaffected
// and continues flowing through scene cuts.

const FADE_FRAMES = 12;

const FadingScene: React.FC<{
  scene: Scene;
  totalFrames: number;
}> = ({ scene, totalFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in
  const fadeIn = interpolate(frame, [0, FADE_FRAMES], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fade out — starts FADE_FRAMES before scene ends
  const fadeOut = interpolate(
    frame,
    [totalFrames - FADE_FRAMES, totalFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const opacity = Math.min(fadeIn, fadeOut);

  // Subtle upward drift on enter — 8px over FADE_FRAMES, feels cinematic not bouncy
  const enterY = interpolate(frame, [0, FADE_FRAMES], [8, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{
      opacity,
      transform: `translateY(${enterY}px)`,
    }}>
      <SceneRenderer scene={scene} />
    </AbsoluteFill>
  );
};

// ─── Main Reel ─────────────────────────────────────────────────────────────────

export const Reel: React.FC<ReelProps> = ({ scenes, voiceoverFile }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: THEME.bg }}>
      {/* LiquidBackground lives OUTSIDE Series — flows continuously, unaffected by transitions */}
      <LiquidBackground />

      <Series>
        {scenes.map((scene, i) => {
          const totalFrames = Math.max(1, Math.round((scene.durationInSeconds || 4) * fps));

          return (
            <Series.Sequence key={i} durationInFrames={totalFrames}>
              {/* Audio */}
              {scene.audioFile && (
                <Audio src={staticFile(scene.audioFile)} volume={1} startFrom={0} />
              )}
              {!scene.audioFile && scene.narration && (
                <Audio src={staticFile(`audio/scene_${i}.mp3`)} volume={1} startFrom={0} />
              )}

              {/* Scene content with fade transition */}
              <FadingScene scene={scene} totalFrames={totalFrames} />

              {/* Captions — always on top, always full opacity (no fade) */}
              {scene.subtitleFile && (
                <Captions wordTimingsFile={scene.subtitleFile.replace('.srt', '.words.json')} />
              )}
            </Series.Sequence>
          );
        })}
      </Series>

      {/* Legacy single-file voiceover fallback */}
      {scenes.every(s => !s.audioFile && !s.narration) && voiceoverFile && (
        <Audio src={staticFile(`audio/${voiceoverFile}`)} volume={1} />
      )}
    </AbsoluteFill>
  );
};