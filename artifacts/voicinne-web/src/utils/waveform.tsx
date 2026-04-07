import React from 'react';

const N = 180;

export function buildFlatPoints(width: number, height: number): string {
  const mid = height / 2;
  return Array.from({ length: N }, (_, i) => {
    const x = (i / (N - 1)) * width;
    return `${x.toFixed(1)},${mid.toFixed(1)}`;
  }).join(' ');
}

export function buildSinePoints(phase: number, amp: number, width: number, height: number): string {
  const mid = height / 2;
  return Array.from({ length: N }, (_, i) => {
    const x = (i / (N - 1)) * width;
    const t = (i / N) * Math.PI * 10;
    const y =
      mid +
      Math.sin(t + phase) * amp * 0.55 +
      Math.sin(t * 1.8 + phase * 0.8) * amp * 0.28 +
      Math.sin(t * 3.5 + phase * 1.3) * amp * 0.12;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

export interface WaveformLineProps {
  points: string;
  color?: string;
  width: number;
  height: number;
  strokeWidth?: number;
}

export const WaveformLine = React.memo(function WaveformLine({
  points,
  color = '#ef4444',
  width,
  height,
  strokeWidth = 2,
}: WaveformLineProps) {
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline
        points={points}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});
