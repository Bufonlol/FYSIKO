import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { colors, fontFamily } from './theme'
import { Logo } from './MockUI'

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
        background: `linear-gradient(135deg, ${colors.blue}, ${colors.green})`,
        fontFamily,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{ opacity: logoP, transform: `scale(${logoP})` }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 22,
              background: 'rgba(255,255,255,0.16)',
              border: '1px solid rgba(255,255,255,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: 40,
              backdropFilter: 'blur(6px)',
            }}
          >
            F
          </div>
        </div>
        <div
          style={{
            fontSize: 50,
            fontWeight: 800,
            color: '#fff',
            letterSpacing: -1,
            opacity: titleP,
            transform: `translateY(${interpolate(titleP, [0, 1], [18, 0])}px)`,
          }}
        >
          FYSIKO
        </div>
        <div
          style={{
            fontSize: 19,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.92)',
            opacity: ctaP,
            transform: `translateY(${interpolate(ctaP, [0, 1], [14, 0])}px)`,
          }}
        >
          Disponible en escritorio, tablet y móvil
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 6, opacity: chipsP, transform: `translateY(${interpolate(chipsP, [0, 1], [12, 0])}px)` }}>
          {['Agenda', 'Pacientes', 'Reportes', 'Notificaciones'].map((c) => (
            <div
              key={c}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                background: 'rgba(255,255,255,0.16)',
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
