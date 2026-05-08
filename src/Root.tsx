import React from "react";
import { Composition } from "remotion";
import { Reel } from "./Reel";
import type { ReelProps } from "./types";
import { THEME } from "./theme";
import { z } from "zod";
import readyProps from "../props/dns_ready.json";

// Remotion needs a zod schema as the second type arg
// For now use a passthrough schema — you can make it strict later
const schema = z.object({
  topic: z.string(),
  scenes: z.array(z.any()),
  voiceoverFile: z.string().optional(),
});

const defaultProps = readyProps as unknown as ReelProps;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition<typeof schema, ReelProps>
      id="DevDecodedReel"
      component={Reel}
      schema={schema}
      fps={30}
      width={THEME.W}
      height={THEME.H}
      defaultProps={defaultProps}
      // 1. We deleted the hardcoded durationInFrames
      // 2. We added calculateMetadata to read the LIVE props coming from n8n/Python
      calculateMetadata={({ props }) => {
        // Fallback to 30 frames if empty to prevent crashes
        if (!props.scenes || props.scenes.length === 0) {
          return { durationInFrames: 30 };
        }

        // Run your exact same math, but on the LIVE incoming props
        const totalFrames = props.scenes.reduce(
          (sum, s) => sum + Math.round((s.durationInSeconds || 0) * 30),
          0,
        );

        return {
          durationInFrames: Math.max(1, totalFrames),
        };
      }}
    />
  );
};
