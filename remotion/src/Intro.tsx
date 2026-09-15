import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { colors, fontFamily } from './theme'
import { Logo } from './MockUI'

export function Intro() {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()

  const logoP = spring({ frame, fps, config: { damping: 12, mass: 0.7, stiffness: 120 } })
  const titleP = spring({ frame: frame - 12, fps, config: { damping: 200, stiffness: 130 } })
  const subP = spring({ frame: frame - 22, fps, config: { damping: 200, stiffness: 130 } })
  const bgP = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(1200px 700px at ${30 + bgP * 10}% 30%, #eef4fa 0%, ${colors.bg} 60%)`,
        fontFamily,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AbsoluteFill style={{ opacity: 0.5 }}>
        {Array.from({ length: 6 }).map((_, i) => {
          const x = (width / 6) * i + 60
          const p = interpolate(frame, [0, 60], [0, 1], { extrapolateRight: 'clamp' })
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: height * 0.15 + Math.sin(i) * 40,
                width: 3,
                height: 3,
                borderRadius: '50%',
                background: colors.blueLight,
                opacity: p * 0.5,
              }}
            />
          )
        })}
      </AbsoluteFill>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
        <div
          style={{
            transform: `scale(${logoP}) rotate(${interpolate(logoP, [0, 1], [-16, 0])}deg)`,
            opacity: logoP,
          }}
        >
          <Logo size={110} />
        </div>
        <div
          style={{
            fontSize: 66,
            fontWeight: 800,
            letterSpacing: -1.5,
            color: colors.text,
            opacity: titleP,
            transform: `translateY(${interpolate(titleP, [0, 1], [24, 0])}px)`,
          }}
        >
          FY<span style={{ color: colors.blue }}>SI</span>
          <span style={{ color: colors.green }}>KO</span>
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: colors.text3,
            opacity: subP,
            transform: `translateY(${interpolate(subP, [0, 1], [16, 0])}px)`,
            letterSpacing: 0.3,
          }}
        >
          Sistema de gestión para clínicas de fisioterapia
        </div>
      </div>
    </AbsoluteFill>
  )
}
