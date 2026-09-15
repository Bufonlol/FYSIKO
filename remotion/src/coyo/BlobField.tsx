import React from 'react'
import { useCurrentFrame } from 'remotion'
import { c } from './theme'

function wobbleRadius(frame: number, seed: number) {
  const a = 50 + 18 * Math.sin((frame + seed * 40) / 70)
  const b = 50 + 18 * Math.sin((frame + seed * 55) / 60 + 1.4)
  const cc = 50 + 18 * Math.sin((frame + seed * 33) / 80 + 2.8)
  const d = 50 + 18 * Math.sin((frame + seed * 47) / 65 + 4.2)
  return `${a}% ${100 - a}% ${cc}% ${100 - cc}% / ${b}% ${d}% ${100 - d}% ${100 - b}%`
}

function Blob({
  size,
  x,
  y,
  color,
  seed,
  opacity = 1,
  driftX = 40,
  driftY = 30,
}: {
  size: number
  x: number
  y: number
  color: string
  seed: number
  opacity?: number
  driftX?: number
  driftY?: number
}) {
  const frame = useCurrentFrame()
  const dx = Math.sin((frame + seed * 90) / 140) * driftX
  const dy = Math.cos((frame + seed * 70) / 160) * driftY
  const rot = (frame + seed * 100) / 9

  return (
    <div
      style={{
        position: 'absolute',
        left: x + dx - size / 2,
        top: y + dy - size / 2,
        width: size,
        height: size,
        background: color,
        borderRadius: wobbleRadius(frame, seed),
        transform: `rotate(${rot}deg)`,
        opacity,
      }}
    />
  )
}

/** Soft, slow-morphing organic blob composition behind the whole film. */
export function BlobField({ width, height }: { width: number; height: number }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: c.cream }}>
      <div style={{ position: 'absolute', inset: 0, filter: 'blur(70px)' }}>
        <Blob size={width * 1.1} x={width * 0.18} y={height * 0.14} color={c.blue} seed={1} opacity={0.9} />
        <Blob size={width * 0.85} x={width * 0.9} y={height * 0.42} color={c.blueDeep} seed={2} opacity={0.5} />
        <Blob size={width * 0.95} x={width * 0.2} y={height * 0.86} color={c.navy} seed={3} opacity={0.35} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(238,245,248,0.15) 0%, rgba(238,245,248,0.55) 55%, rgba(238,245,248,0.85) 100%)' }} />
    </div>
  )
}
