import React from 'react';
import { AbsoluteFill, Series, Audio, staticFile, useVideoConfig } from 'remotion';
import { ReelProps, Scene } from './types';
import { TextOnly } from './scenes/TextOnly';
import { NetworkDiagram } from './scenes/NetworkDiagram';
import { LayerStack } from './scenes/LayerStack';
import { CodeReveal } from './scenes/CodeReveal';
import { StatReveal } from './scenes/StatReveal';
import { Comparison } from './scenes/Comparison';
import { THEME } from './theme';

const SceneRenderer: React.FC<{ scene: Scene }> = ({ scene }) => {
  switch (scene.type) {
    case 'text_only':       return <TextOnly scene={scene} />;
    case 'network_diagram': return <NetworkDiagram scene={scene} />;
    case 'layer_stack':     return <LayerStack scene={scene} />;
    case 'code_reveal':     return <CodeReveal scene={scene} />;
    case 'stat_reveal':     return <StatReveal scene={scene} />;
    case 'comparison':      return <Comparison scene={scene} />;
    default:
      return (
        <div style={{
          width: THEME.W, height: THEME.H, background: THEME.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: THEME.textMuted, fontFamily: THEME.fontSans, fontSize: 40,
        }}>
          Unknown scene type: {(scene as Scene).type}
        </div>
      );
  }
};

export const Reel: React.FC<ReelProps> = ({ scenes, voiceoverFile }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: THEME.bg }}>
      <Series>
        {scenes.map((scene, i) => (
          <Series.Sequence
            key={i}
            durationInFrames={Math.max(1, Math.round(scene.durationInSeconds * fps))}
          >
            {scene.audioFile && (
              <Audio src={staticFile(scene.audioFile)} volume={1} muted={false} startFrom={0} />
            )}
            {!scene.audioFile && scene.narration && (
              <Audio
                src={staticFile(`audio/scene_${i}.mp3`)}
                volume={1}
                muted={false}
                startFrom={0}
              />
            )}
            <SceneRenderer scene={scene} />
          </Series.Sequence>
        ))}
      </Series>
      {scenes.every((scene) => !scene.audioFile && !scene.narration) && voiceoverFile && (
        <Audio src={staticFile(`audio/${voiceoverFile}`)} volume={1} muted={false} />
      )}
    </AbsoluteFill>
  );
};