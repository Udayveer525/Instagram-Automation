import React from "react";
import { NetworkDiagramScene } from "../types";
import { THEME } from "../theme";
import { BrandBar } from "../components/BrandBar";
import { Node } from "../components/Node";
import { AnimatedArrow } from "../components/AnimatedArrow";
import { useSlideUp } from "../hooks/useAnimatedValue";

const FRAMES_PER_NODE = 12;
const TITLE_FRAMES = 40;

export const NetworkDiagram: React.FC<{ scene: NetworkDiagramScene }> = ({
  scene,
}) => {
  const title = useSlideUp(10, 24);

  // Nodes appear sequentially
  const nodeStartFrames = scene.nodes.map(
    (_, i) => TITLE_FRAMES + i * FRAMES_PER_NODE,
  );

  // Arrows start after all nodes are in
  const allNodesInBy = TITLE_FRAMES + scene.nodes.length * FRAMES_PER_NODE + 10;

  // Build node position lookup for arrows
  const nodePos: Record<string, { x: number; y: number }> = {};
  scene.nodes.forEach((n) => {
    nodePos[n.id] = { x: n.x, y: n.y };
  });

  return (
    <div
      style={{
        width: THEME.W,
        height: THEME.H,
        background: THEME.bg,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <BrandBar />

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: 72,
          right: 72,
          opacity: title.opacity,
          transform: `translateY(${title.translateY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: THEME.fontSans,
            fontSize: 52,
            fontWeight: 800,
            color: THEME.textPrimary,
            lineHeight: 1.2,
            marginBottom: 12,
          }}
        >
          {scene.title}
        </div>
        <div
          style={{
            width: 60,
            height: 3,
            borderRadius: 2,
            background: THEME.purple,
          }}
        />
      </div>

      {/* SVG layer for arrows */}
      <svg
        width={THEME.W}
        height={THEME.H}
        viewBox={`0 0 ${THEME.W} ${THEME.H}`}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        {scene.arrows.map((arrow, i) => {
          const from = nodePos[arrow.from];
          const to = nodePos[arrow.to];
          if (!from || !to) return null;

          const durationFrames = arrow.durationFrames ?? scene.defaultArrowDurationFrames ?? 35;
          const isRelative = scene.arrowTimingMode === "relative";
          const delay = arrow.delay ?? (isRelative ? 0 : i * 20);
          const previousDurations = scene.arrows
            .slice(0, i)
            .reduce(
              (sum, a) => sum + (a.durationFrames ?? scene.defaultArrowDurationFrames ?? 35),
              0,
            );
          const previousDelays = scene.arrows
            .slice(0, i + 1)
            .reduce((sum, a, idx) => sum + (idx === i ? delay : (a.delay ?? 0)), 0);
          const arrowStart = isRelative
            ? allNodesInBy + previousDurations + previousDelays
            : allNodesInBy + delay;

          return (
            <AnimatedArrow
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              label={arrow.label}
              color={arrow.color ?? THEME.purple}
              startFrame={arrowStart}
              durationFrames={durationFrames}
              curved={true}
            />
          );
        })}
      </svg>

      {/* Nodes layer */}
      {scene.nodes.map((node, i) => (
        <svg
          key={node.id}
          width={THEME.W}
          height={THEME.H}
          viewBox={`0 0 ${THEME.W} ${THEME.H}`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
          }}
        >
          <Node
            x={node.x}
            y={node.y}
            label={node.label}
            icon={node.icon}
            color="purple"
            startFrame={nodeStartFrames[i]}
            size={120}
          />
        </svg>
      ))}
    </div>
  );
};
