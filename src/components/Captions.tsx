import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import parseSRT from 'parse-srt';
import { THEME } from '../theme';

interface CaptionsProps {
  srtFile: string;
}

export const Captions: React.FC<CaptionsProps> = ({ srtFile }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [handle] = useState(() => delayRender("Fetching Subtitles"));
  const [subtitles, setSubtitles] = useState<ReturnType<typeof parseSRT>>([]);

  useEffect(() => {
    fetch(staticFile(srtFile))
      .then((res) => res.text())
      .then((text) => {
        setSubtitles(parseSRT(text));
        continueRender(handle);
      })
      .catch((err) => {
        console.error("Failed to load SRT", err);
        continueRender(handle);
      });
  }, [srtFile, handle]);

  const currentTime = frame / fps;
  const activeSub = subtitles.find(
    (sub) => currentTime >= sub.start && currentTime <= sub.end
  );

  if (!activeSub) return null;

  // --- KARAOKE MATH ---
  // Split the sentence into an array of words
  const words = activeSub.text.split(' ');
  
  // Calculate how far we are through this specific subtitle block (0.0 to 1.0)
  const duration = activeSub.end - activeSub.start;
  const elapsed = currentTime - activeSub.start;
  const progress = Math.max(0, Math.min(1, elapsed / duration));
  
  // Determine which word is currently being spoken based on the time progress
  const activeWordIndex = Math.min(
    words.length - 1,
    Math.floor(progress * words.length)
  );

  return (
    // Pushed down to bottom: 120px, and brought forward with zIndex
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '450px', pointerEvents: 'none', zIndex: 100 }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '12px',
          backgroundColor: 'rgba(10, 10, 15, 0.85)',
          padding: '20px 35px',
          borderRadius: '20px',
          border: `1px solid ${THEME.border}`,
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          maxWidth: '85%',
        }}
      >
        {words.map((word, index) => {
          const isActive = index === activeWordIndex;
          const isPast = index < activeWordIndex;

          // Spring animation just for the currently spoken word
          const wordScale = spring({
            frame: isActive ? 10 : 0, // Forces the spring to pop when active
            fps,
            config: { damping: 12, stiffness: 200 },
          });

          return (
            <span
              key={index}
              style={{
                fontSize: '42px', // Shrunk down to a professional size
                fontWeight: 800,
                fontFamily: THEME.fontSans,
                textTransform: 'uppercase',
                transition: 'color 0.1s ease',
                // Future words are dim, past words are white, active is purple
                color: isActive ? THEME.purple : (isPast ? THEME.textPrimary : 'rgba(255,255,255,0.3)'),
                textShadow: isActive ? `0 0 15px ${THEME.purple}` : 'none',
                transform: isActive ? `scale(${1 + wordScale * 0.1})` : 'scale(1)',
                display: 'inline-block'
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};