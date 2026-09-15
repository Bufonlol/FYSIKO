import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { colors, fontFamily, headlineFamily } from './theme'
import { DesktopFrame, PhoneFrame, DESKTOP_W, DESKTOP_H, PHONE_W, PHONE_H } from './DeviceFrames'

const DESKTOP_SCALE = 0.56
const MOBILE_SCALE = 1.42

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
  const mobileP = spring({ frame: frame - 16, fps, config: { damping: 16, mass: 0.7, stiffness: 95 } })

  return (
    <AbsoluteFill style={{ background: colors.soft, fontFamily, alignItems: 'center', paddingTop: 40 }}>
      {/* Header */}
      <div
        style={{
          width: '100%',
          textAlign: 'center',
          padding: '0 56px',
          opacity: headerP,
          transform: `translateY(${interpolate(headerP, [0, 1], [-16, 0])}px)`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 14px',
            borderRadius: 20,
            background: colors.white,
            border: `1px solid ${colors.line}`,
            fontSize: 14,
            fontWeight: 700,
            color: colors.text3,
            marginBottom: 14,
          }}
        >
          {index + 1} / {total}
        </div>
        <div style={{ color: colors.blue, textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 800, fontSize: 16 }}>{eyebrow}</div>
        <div style={{ fontFamily: headlineFamily, fontWeight: 800, textTransform: 'uppercase', fontSize: 44, lineHeight: 1.02, color: colors.ink, marginTop: 8 }}>
          {title}
        </div>
      </div>

      {/* Desktop preview */}
      <div
        style={{
          marginTop: 22,
          flexShrink: 0,
          opacity: desktopP,
          transform: `translateY(${interpolate(desktopP, [0, 1], [26, 0])}px)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ width: DESKTOP_W * DESKTOP_SCALE, height: DESKTOP_H * DESKTOP_SCALE, overflow: 'hidden' }}>
          <div style={{ width: DESKTOP_W, height: DESKTOP_H, transform: `scale(${DESKTOP_SCALE})`, transformOrigin: 'top left' }}>
            <DesktopFrame>
              <Desktop />
            </DesktopFrame>
          </div>
        </div>
        <div style={{ marginTop: 10, fontSize: 15, fontWeight: 700, color: colors.text3, letterSpacing: 1 }}>ESCRITORIO</div>
      </div>

      {/* Mobile preview */}
      <div
        style={{
          marginTop: 20,
          flexShrink: 0,
          opacity: mobileP,
          transform: `translateY(${interpolate(mobileP, [0, 1], [30, 0])}px)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ width: PHONE_W * MOBILE_SCALE, height: PHONE_H * MOBILE_SCALE, overflow: 'hidden' }}>
          <div style={{ width: PHONE_W, height: PHONE_H, transform: `scale(${MOBILE_SCALE})`, transformOrigin: 'top left' }}>
            <PhoneFrame>
              <Mobile />
            </PhoneFrame>
          </div>
        </div>
        <div style={{ marginTop: 10, fontSize: 15, fontWeight: 700, color: colors.text3, letterSpacing: 1 }}>MÓVIL</div>
      </div>

      {/* Explanatory captions */}
      <div
        style={{
          marginTop: 22,
          width: '100%',
          padding: '0 60px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {bullets.map((b, i) => {
          const p = spring({ frame: frame - (30 + i * 10), fps, config: { damping: 200, stiffness: 140 } })
          return (
            <div
              key={b}
              style={{
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [14, 0])}px)`,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: colors.white,
                border: `1px solid ${colors.line}`,
                borderRadius: 999,
                padding: '11px 20px',
                boxShadow: '0 4px 14px rgba(8,43,74,0.06)',
                maxWidth: '100%',
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: colors.navy,
                  color: colors.blueSoft,
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                ✓
              </span>
              <span style={{ fontSize: 17, fontWeight: 600, color: colors.ink }}>{b}</span>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}
