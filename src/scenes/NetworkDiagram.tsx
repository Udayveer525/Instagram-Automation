import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { NetworkDiagramScene } from "../types";
import { THEME } from "../theme";
import { BrandBar } from "../components/BrandBar";
import { Node } from "../components/Node";
import { AnimatedArrow } from "../components/AnimatedArrow";
import { useSlideUp } from "../hooks/useAnimatedValue";

const FRAMES_PER_NODE = 12;
const TITLE_FRAMES = 40;

export const NetworkDiagram: React.FC<{ scene: NetworkDiagramScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = useSlideUp(10, 24);

  const totalSceneFrames = Math.round(scene.durationInSeconds * fps);

  // Nodes appear sequentially
  const nodeStartFrames = scene.nodes.map((_, i) => TITLE_FRAMES + i * FRAMES_PER_NODE);
  const allNodesInBy = TITLE_FRAMES + scene.nodes.length * FRAMES_PER_NODE + 10;

  // FIX: Dynamically scale arrows to fill the scene duration
  // Reserve 10% of scene for title+nodes, 10% for idle at end, 80% for arrows
  const arrowBudgetFrames = totalSceneFrames - allNodesInBy - 20;
  const totalArrows = scene.arrows.length;

  // Calculate how long each arrow takes based on its delay + duration,
  // then scale to fill the available budget
  const rawArrowDuration = scene.defaultArrowDurationFrames ?? 35;
  const rawDelaySum = scene.arrows.reduce((s, a) => s + (a.delay ?? 20), 0);
  const rawTotalTime = rawDelaySum + rawArrowDuration;
  const scaleFactor = totalArrows > 0 && rawTotalTime > 0
    ? Math.max(1, arrowBudgetFrames / rawTotalTime)
    : 1;

  // Build node position lookup
  const nodePos: Record<string, { x: number; y: number }> = {};
  scene.nodes.forEach((n) => { nodePos[n.id] = { x: n.x, y: n.y }; });

  // Compute scaled arrow start frames
  let cumulativeOffset = 0;
  const arrowTimings = scene.arrows.map((arrow) => {
    const delay = Math.round((arrow.delay ?? 20) * scaleFactor);
    const duration = Math.round((arrow.durationFrames ?? rawArrowDuration) * scaleFactor);
    const startFrame = allNodesInBy + cumulativeOffset + delay;
    cumulativeOffset += delay + duration;
    return { startFrame, duration };
  });

  // After all arrows done — idle loop: pulse nodes gently
  const allArrowsDoneBy = totalArrows > 0
    ? arrowTimings[totalArrows - 1].startFrame + arrowTimings[totalArrows - 1].duration
    : allNodesInBy;

  // Subtle idle pulse after animations finish — keeps the scene alive
  const idleProgress = interpolate(frame, [allArrowsDoneBy, allArrowsDoneBy + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{
      width: THEME.W,
      height: THEME.H,
      background: 'transparent',
      position: "relative",
      overflow: "hidden",
    }}>
      <BrandBar />

      {/* Title */}
      <div style={{
        position: "absolute",
        top: 200,
        left: 72,
        right: 72,
        opacity: title.opacity,
        transform: `translateY(${title.translateY}px)`,
      }}>
        <div style={{
          fontFamily: THEME.fontSans,
          fontSize: 52,
          fontWeight: 800,
          color: THEME.textPrimary,
          lineHeight: 1.2,
          marginBottom: 12,
        }}>
          {scene.title}
        </div>
        <div style={{ width: 60, height: 3, borderRadius: 2, background: THEME.purple }} />
      </div>

      {/* SVG arrows */}
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
          const { startFrame, duration } = arrowTimings[i];

          return (
            <AnimatedArrow
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              label={arrow.label}
              color={arrow.color ?? THEME.purple}
              startFrame={startFrame}
              durationFrames={duration}
              curved={true}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {scene.nodes.map((node, i) => (
        <svg
          key={node.id}
          width={THEME.W}
          height={THEME.H}
          viewBox={`0 0 ${THEME.W} ${THEME.H}`}
          style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
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

      {/* Idle state label: appears when all animations done, keeps scene feeling alive */}
      {idleProgress > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 160,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: idleProgress * 0.7,
        }}>
          <div style={{
            fontFamily: THEME.fontSans,
            fontSize: 26,
            color: THEME.textMuted,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: THEME.teal,
              // Animate: subtle breathing dot
              opacity: 0.5 + 0.5 * Math.sin(frame * 0.15),
            }} />
            live
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: THEME.teal,
              opacity: 0.5 + 0.5 * Math.sin(frame * 0.15 + 1),
            }} />
          </div>
        </div>
      )}
    </div>
  );
};