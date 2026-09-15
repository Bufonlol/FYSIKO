import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { colors, fontFamily, headlineFamily } from './theme'
import logo from './art/logo'

export function Intro() {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()

  const logoP = spring({ frame, fps, config: { damping: 13, mass: 0.7, stiffness: 120 } })
  const titleP = spring({ frame: frame - 14, fps, config: { damping: 200, stiffness: 130 } })
  const subP = spring({ frame: frame - 26, fps, config: { damping: 200, stiffness: 130 } })

  return (
    <AbsoluteFill
      style={{
        background: colors.navy,
        fontFamily,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AbsoluteFill style={{ opacity: 0.35 }}>
        {Array.from({ length: 7 }).map((_, i) => {
          const x = (width / 7) * i + 60
          const p = interpolate(frame, [0, 60], [0, 1], { extrapolateRight: 'clamp' })
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: height * 0.2 + Math.sin(i) * 50,
                width: 3,
                height: 3,
                borderRadius: '50%',
                background: colors.blueSoft,
                opacity: p * 0.6,
              }}
            />
          )
        })}
      </AbsoluteFill>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div
          style={{
            opacity: logoP,
            transform: `scale(${interpolate(logoP, [0, 1], [0.7, 1])})`,
          }}
        >
          <img src={logo} alt="FYSIKO" style={{ height: 74, filter: 'brightness(0) invert(1)' }} />
        </div>
        <div
          style={{
            fontFamily: headlineFamily,
            fontWeight: 900,
            textTransform: 'uppercase',
            fontSize: 30,
            letterSpacing: 1,
            color: colors.blueSoft,
            opacity: titleP,
            transform: `translateY(${interpolate(titleP, [0, 1], [18, 0])}px)`,
          }}
        >
          Movimiento real. Vida sin límites.
        </div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#b8c7d2',
            opacity: subP,
            transform: `translateY(${interpolate(subP, [0, 1], [14, 0])}px)`,
          }}
        >
          Así se ve la landing page de FYSIKO en escritorio y móvil
        </div>
      </div>
    </AbsoluteFill>
  )
}
