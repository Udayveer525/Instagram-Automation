export interface TextOnlyScene {
  type: 'text_only';
  text: string;
  subtext?: string;
  style?: 'hook' | 'cta' | 'transition';
  durationInSeconds: number;
  narration?: string;
  audioFile?: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  icon: string;
  x: number;
  y: number;
}

export interface NetworkArrow {
  from: string;
  to: string;
  label?: string;
  delay?: number;
  color?: string;
  durationFrames?: number;
}

export interface NetworkDiagramScene {
  type: 'network_diagram';
  title: string;
  nodes: NetworkNode[];
  arrows: NetworkArrow[];
  durationInSeconds: number;
  narration?: string;
  audioFile?: string;
  arrowTimingMode?: 'absolute' | 'relative';
  defaultArrowDurationFrames?: number;
}

export interface LayerItem {
  label: string;
  sublabel?: string;
  color?: string;
}

export interface LayerStackScene {
  type: 'layer_stack';
  title: string;
  layers: LayerItem[];
  highlightIndex?: number;
  durationInSeconds: number;
  narration?: string;
  audioFile?: string;
}

export interface CodeLine {
  code: string;
  highlight?: boolean;
}

export interface CodeRevealScene {
  type: 'code_reveal';
  title: string;
  language: string;
  lines: CodeLine[];
  durationInSeconds: number;
  narration?: string;
  audioFile?: string;
}

export interface StatRevealScene {
  type: 'stat_reveal';
  stat: string;
  label: string;
  context: string;
  durationInSeconds: number;
  narration?: string;
  audioFile?: string;
}

export interface ComparisonColumn {
  title: string;
  color?: string;
  items: string[];
}

export interface ComparisonScene {
  type: 'comparison';
  title: string;
  left: ComparisonColumn;
  right: ComparisonColumn;
  durationInSeconds: number;
  narration?: string;
  audioFile?: string;
}

export type Scene =
  | TextOnlyScene
  | NetworkDiagramScene
  | LayerStackScene
  | CodeRevealScene
  | StatRevealScene
  | ComparisonScene;

export interface ReelProps {
  topic: string;
  scenes: Scene[];
  voiceoverFile?: string;
  [key: string]: unknown;
}