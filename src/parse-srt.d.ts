declare module 'parse-srt' {
  export default function parseSRT(srt: string): {
    id: number;
    start: number; // Start time in seconds
    end: number;   // End time in seconds
    text: string;  // The subtitle text
  }[];
}