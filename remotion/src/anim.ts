import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

export function useSpringIn(delay = 0, config?: Parameters<typeof spring>[0]['config']) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  return spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, mass: 0.6, stiffness: 120, ...config },
  })
}

export function clamp01(v: number) {
  return Math.max(0, Math.min(1, v))
}

export function riseIn(delay = 0, distance = 28) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const p = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.6, stiffness: 130 } })
  return {
    opacity: p,
    transform: `translateY(${interpolate(p, [0, 1], [distance, 0])}px)`,
  }
}

export function popIn(delay = 0, fromScale = 0.9) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const p = spring({ frame: frame - delay, fps, config: { damping: 16, mass: 0.5, stiffness: 140 } })
  return {
    opacity: clamp01(p),
    transform: `scale(${interpolate(p, [0, 1], [fromScale, 1])})`,
  }
}

export function countUp(target: number, delay = 0, duration = 26) {
  const frame = useCurrentFrame()
  const t = clamp01((frame - delay) / duration)
  const eased = 1 - Math.pow(1 - t, 3)
  return Math.round(target * eased)
}

export function barGrow(delay = 0, duration = 20) {
  const frame = useCurrentFrame()
  return clamp01((frame - delay) / duration)
}
