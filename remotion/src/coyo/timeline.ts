import { Easing, interpolate } from 'remotion'

// power3/4.inOut-ish cubic-bezier curves
export const EASE = Easing.bezier(0.65, 0, 0.35, 1)
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1)
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0)

export type Key = { f: number; v: number; ease?: (n: number) => number }

/** Piecewise cubic-bezier keyframe interpolation across a master timeline. */
export function seg(frame: number, keys: Key[]): number {
  if (frame <= keys[0].f) return keys[0].v
  if (frame >= keys[keys.length - 1].f) return keys[keys.length - 1].v
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i]
    const b = keys[i + 1]
    if (frame >= a.f && frame <= b.f) {
      return interpolate(frame, [a.f, b.f], [a.v, b.v], {
        easing: b.ease ?? EASE,
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    }
  }
  return keys[keys.length - 1].v
}

/** 0->1->0 window with eased in/out, for opacity/reveal timing. */
export function windowP(frame: number, inStart: number, inEnd: number, outStart: number, outEnd: number): number {
  if (frame <= inStart || frame >= outEnd) return 0
  if (frame < inEnd) return seg(frame, [{ f: inStart, v: 0 }, { f: inEnd, v: 1, ease: EASE_OUT }])
  if (frame < outStart) return 1
  return seg(frame, [{ f: outStart, v: 1 }, { f: outEnd, v: 0, ease: EASE_IN }])
}

// Master scene boundaries (30fps)
export const SCENES = {
  hook: [0, 75],
  reveal: [75, 180],
  flow: [180, 300],
  services: [300, 420],
  detail: [420, 540],
  contact: [540, 645],
  signature: [645, 780],
} as const

export const TOTAL_FRAMES = 780
