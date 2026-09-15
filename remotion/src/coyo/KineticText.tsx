import React from 'react'
import { interpolate } from 'remotion'
import { EASE_OUT, EASE_IN, EASE } from './timeline'

/**
 * A line of text that reveals with a clip-path wipe + slight rise (not a fade),
 * holds, then exits with a faster wipe. All windows are absolute frame numbers
 * on the master timeline.
 */
export function KineticLine({
  children,
  frame,
  in: inStart,
  hold,
  out,
  style,
  from = 'bottom',
}: {
  children: React.ReactNode
  frame: number
  in: number
  hold: number
  out: number
  style?: React.CSSProperties
  from?: 'bottom' | 'top' | 'left'
}) {
  if (frame < inStart - 2 || frame > out + 2) return null

  const inDur = Math.max(1, hold - inStart)
  const outDur = Math.max(1, out - hold)

  let p: number // 0 = hidden, 1 = fully shown
  if (frame < hold) {
    p = interpolate(frame, [inStart, hold], [0, 1], { easing: EASE_OUT, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  } else {
    p = interpolate(frame, [hold, out], [1, 0], { easing: EASE_IN, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  }

  const dist = from === 'left' ? 0 : 34
  const ty = from === 'top' ? -dist * (1 - p) : dist * (1 - p)
  const tx = from === 'left' ? -60 * (1 - p) : 0
  const clip = from === 'left' ? `inset(0 ${(1 - p) * 100}% 0 0)` : `inset(${(1 - p) * 100}% 0 0 0)`

  return (
    <div style={{ overflow: 'hidden', ...style }}>
      <div
        style={{
          transform: `translate(${tx}px, ${ty}px)`,
          clipPath: clip,
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  )
}

/** A thin accent rule that draws itself across the frame. */
export function AccentLine({ frame, in: inStart, hold, out, width, style }: { frame: number; in: number; hold: number; out: number; width: number; style?: React.CSSProperties }) {
  if (frame < inStart - 2 || frame > out + 2) return null
  let p: number
  if (frame < hold) {
    p = interpolate(frame, [inStart, hold], [0, 1], { easing: EASE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  } else {
    p = interpolate(frame, [hold, out], [1, 0], { easing: EASE_IN, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  }
  return (
    <div
      style={{
        width: width * p,
        height: 3,
        background: 'linear-gradient(90deg, transparent, #0e9aef, transparent)',
        ...style,
      }}
    />
  )
}
