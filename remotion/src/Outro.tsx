import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { colors, fontFamily, headlineFamily } from './theme'
import logo from './art/logo'

export function Outro() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const logoP = spring({ frame, fps, config: { damping: 200, stiffness: 130 } })
  const titleP = spring({ frame: frame - 8, fps, config: { damping: 200, stiffness: 130 } })
  const ctaP = spring({ frame: frame - 18, fps, config: { damping: 200, stiffness: 130 } })
  const chipsP = spring({ frame: frame - 26, fps, config: { damping: 200, stiffness: 130 } })

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(120deg, ${colors.navy}, #075f98)`,
        fontFamily,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{ opacity: logoP, transform: `scale(${logoP})` }}>
          <img src={logo} alt="FYSIKO" style={{ height: 60, filter: 'brightness(0) invert(1)' }} />
        </div>
        <div
          style={{
            fontFamily: headlineFamily,
            fontWeight: 900,
            textTransform: 'uppercase',
            fontSize: 40,
            lineHeight: 0.95,
            color: '#fff',
            textAlign: 'center',
            opacity: titleP,
            transform: `translateY(${interpolate(titleP, [0, 1], [18, 0])}px)`,
          }}
        >
          No esperes a que el dolor te detenga.
        </div>
        <div
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.92)',
            opacity: ctaP,
            transform: `translateY(${interpolate(ctaP, [0, 1], [14, 0])}px)`,
          }}
        >
          Web responsive · Escritorio, tablet y móvil
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 6, opacity: chipsP, transform: `translateY(${interpolate(chipsP, [0, 1], [12, 0])}px)` }}>
          {['fysiko.mx', 'Orizaba, Veracruz', '272 356 5429'].map((c) => (
            <div
              key={c}
              style={{
                padding: '9px 18px',
                borderRadius: 20,
                background: 'rgba(255,255,255,0.14)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  )
}
