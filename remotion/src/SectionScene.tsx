import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { colors, fontFamily, headlineFamily } from './theme'
import { DesktopFrame, PhoneFrame } from './DeviceFrames'

export function SectionScene({
  eyebrow,
  title,
  index,
  total,
  bullets,
  Desktop,
  Mobile,
}: {
  eyebrow: string
  title: string
  index: number
  total: number
  bullets: string[]
  Desktop: React.ComponentType
  Mobile: React.ComponentType
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const headerP = spring({ frame, fps, config: { damping: 200, stiffness: 130 } })
  const desktopP = spring({ frame: frame - 6, fps, config: { damping: 18, mass: 0.7, stiffness: 90 } })
  const mobileP = spring({ frame: frame - 14, fps, config: { damping: 18, mass: 0.7, stiffness: 95 } })

  return (
    <AbsoluteFill style={{ background: colors.soft, fontFamily }}>
      {/* Header */}
      <div
        style={{
          position: 'absolute',
          top: 46,
          left: 90,
          right: 90,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          opacity: headerP,
          transform: `translateY(${interpolate(headerP, [0, 1], [-16, 0])}px)`,
        }}
      >
        <div>
          <div style={{ color: colors.blue, textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 800, fontSize: 13 }}>{eyebrow}</div>
          <div style={{ fontFamily: headlineFamily, fontWeight: 800, textTransform: 'uppercase', fontSize: 46, lineHeight: 0.92, color: colors.ink, marginTop: 6 }}>{title}</div>
        </div>
        <div
          style={{
            padding: '8px 18px',
            borderRadius: 20,
            background: colors.white,
            border: `1px solid ${colors.line}`,
            fontSize: 13,
            fontWeight: 700,
            color: colors.text3,
            letterSpacing: 0.4,
            marginBottom: 6,
          }}
        >
          {index + 1} / {total}
        </div>
      </div>

      {/* Device frames */}
      <div
        style={{
          position: 'absolute',
          top: 176,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 56,
        }}
      >
        <div
          style={{
            opacity: desktopP,
            transform: `translateX(${interpolate(desktopP, [0, 1], [-70, 0])}px) scale(${interpolate(desktopP, [0, 1], [0.96, 1])})`,
          }}
        >
          <DesktopFrame>
            <Desktop />
          </DesktopFrame>
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, fontWeight: 700, color: colors.text3, letterSpacing: 1 }}>ESCRITORIO</div>
        </div>
        <div
          style={{
            opacity: mobileP,
            transform: `translateX(${interpolate(mobileP, [0, 1], [70, 0])}px) scale(${interpolate(mobileP, [0, 1], [0.96, 1])})`,
          }}
        >
          <PhoneFrame>
            <Mobile />
          </PhoneFrame>
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, fontWeight: 700, color: colors.text3, letterSpacing: 1 }}>MÓVIL</div>
        </div>
      </div>

      {/* Explanatory captions */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          left: 90,
          right: 90,
          display: 'flex',
          justifyContent: 'center',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        {bullets.map((b, i) => {
          const p = spring({ frame: frame - (24 + i * 8), fps, config: { damping: 200, stiffness: 140 } })
          return (
            <div
              key={b}
              style={{
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [14, 0])}px)`,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: colors.white,
                border: `1px solid ${colors.line}`,
                borderRadius: 999,
                padding: '9px 16px',
                boxShadow: '0 4px 14px rgba(8,43,74,0.06)',
              }}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: colors.navy,
                  color: colors.blueSoft,
                  fontSize: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                ✓
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: colors.ink }}>{b}</span>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}
