import React from 'react'
import { staticFile } from 'remotion'
import { EASE } from './timeline'
import { interpolate } from 'remotion'

/** A tall column of real captures, scrolled by translateY (px, positive = scroll down). */
export function ScrollReel({ images, scrollY, width = 588 }: { images: string[]; scrollY: number; width?: number }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#eef5f8' }}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          width,
          transform: `translate(-50%, ${-scrollY}px)`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {images.map((src) => (
          <img key={src} src={staticFile(`captures/${src}.png`)} style={{ width: '100%', display: 'block' }} />
        ))}
      </div>
    </div>
  )
}

/** Full-bleed single capture, optionally panned/zoomed (for macro / hero shots). */
export function ScreenImage({ src, pan = 0, zoom = 1 }: { src: string; pan?: number; zoom?: number }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#eef5f8' }}>
      <img
        src={staticFile(`captures/${src}.png`)}
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          width: '100%',
          transform: `translate(-50%, ${-pan}px) scale(${zoom})`,
          transformOrigin: 'top center',
        }}
      />
    </div>
  )
}

type Page = { src: string; from: number; to: number }

/**
 * Swaps between full-bleed captures with a vertical exit/enter (page swap),
 * synced to a switch window [from, to] per page.
 */
export function PagedScreen({ pages, frame, switchDur = 16 }: { pages: Page[]; frame: number; switchDur?: number }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#eef5f8' }}>
      {pages.map((p, i) => {
        const isLast = i === pages.length - 1
        const enterStart = p.from
        const enterEnd = p.from + switchDur
        const exitStart = p.to - switchDur
        const exitEnd = p.to

        let ty = 0
        let opacity = 1
        let scale = 1

        if (frame < enterStart) {
          opacity = 0
          ty = 46
          scale = 0.97
        } else if (frame < enterEnd) {
          const e = interpolate(frame, [enterStart, enterEnd], [0, 1], { easing: EASE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          opacity = e
          ty = interpolate(e, [0, 1], [46, 0])
          scale = interpolate(e, [0, 1], [0.97, 1])
        } else if (!isLast && frame > exitStart) {
          const e = interpolate(frame, [exitStart, exitEnd], [0, 1], { easing: EASE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          opacity = 1 - e
          ty = interpolate(e, [0, 1], [0, -46])
          scale = interpolate(e, [0, 1], [1, 1.03])
        }

        if (opacity <= 0.002) return null

        return (
          <img
            key={p.src}
            src={staticFile(`captures/${p.src}.png`)}
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              width: '100%',
              opacity,
              transform: `translate(-50%, ${ty}px) scale(${scale})`,
              transformOrigin: 'top center',
            }}
          />
        )
      })}
    </div>
  )
}
