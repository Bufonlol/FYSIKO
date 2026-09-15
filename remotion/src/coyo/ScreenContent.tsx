import React from 'react'
import { staticFile } from 'remotion'

/** Full-bleed real capture, panned/zoomed by translateY (for scroll / macro shots). */
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
