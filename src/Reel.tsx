import React from 'react';
import { AbsoluteFill, Series, Audio, staticFile, useVideoConfig, useCurrentFrame, interpolate } from 'remotion';
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

const SceneRenderer: React.FC<{ scene: Scene }> = ({ scene }) => {
  // ... Keep your existing switch statement here exactly as it is ...
  switch (scene.type) {
    case 'text_only':       return <TextOnly scene={scene} />;
    case 'network_diagram': return <NetworkDiagram scene={scene} />;
    case 'layer_stack':     return <LayerStack scene={scene} />;
    case 'code_reveal':     return <CodeReveal scene={scene} />;
    case 'stat_reveal':     return <StatReveal scene={scene} />;
    case 'comparison':      return <Comparison scene={scene} />;
    default: return null;
  }
};

export const Reel: React.FC<ReelProps> = ({ scenes, voiceoverFile }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: THEME.bg }}>
      
      {/* 1. The Background sits at the bottom layer, outside the Series so it loops continuously */}
      <LiquidBackground />

      <Series>
        {scenes.map((scene, i) => (
          <Series.Sequence
            key={i}
            durationInFrames={Math.max(1, Math.round((scene.durationInSeconds || 4) * fps))}
          >
            {/* Audio */}
            {scene.audioFile && <Audio src={staticFile(scene.audioFile)} />}
            {!scene.audioFile && scene.narration && <Audio src={staticFile(`audio/scene_${i}.mp3`)} />}
            
            {/* 2. THE MISSING VISUALS! Render the nodes/diagrams for this scene */}
            <SceneRenderer scene={scene} />

            {/* 3. The Captions sit on the very top layer */}
            {scene.subtitleFile && <Captions srtFile={scene.subtitleFile} />}

          </Series.Sequence>
        ))}
      </Series>
      
      {scenes.every((scene) => !scene.audioFile && !scene.narration) && voiceoverFile && (
        <Audio src={staticFile(`audio/${voiceoverFile}`)} />
      )}
    </AbsoluteFill>
  );
};