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
      durationInFrames={defaultProps.scenes.reduce(
        (sum, s) => sum + Math.round(s.durationInSeconds * 30),
        0,
      )}
      fps={30}
      width={THEME.W}
      height={THEME.H}
      defaultProps={defaultProps}
    />
  );
};
