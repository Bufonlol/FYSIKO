import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { colors, fontFamily, sectionMeta } from './theme'
import type { SectionKey } from './theme'
import { DesktopFrame, PhoneFrame } from './DeviceFrames'

export function SectionScene({
  section,
  index,
  total,
  Desktop,
  Mobile,
}: {
  section: SectionKey
  index: number
  total: number
  Desktop: React.ComponentType
  Mobile: React.ComponentType
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const meta = sectionMeta[section]

  const headerP = spring({ frame, fps, config: { damping: 200, stiffness: 130 } })
  const desktopP = spring({ frame: frame - 6, fps, config: { damping: 18, mass: 0.7, stiffness: 90 } })
  const mobileP = spring({ frame: frame - 14, fps, config: { damping: 18, mass: 0.7, stiffness: 95 } })

  return (
    <AbsoluteFill style={{ background: colors.bg, fontFamily }}>
      {/* Header */}
      <div
        style={{
          position: 'absolute',
          top: 64,
          left: 90,
          right: 90,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: headerP,
          transform: `translateY(${interpolate(headerP, [0, 1], [-16, 0])}px)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: meta.pale,
              color: meta.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 800,
            }}
          >
            {meta.label[0]}
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 800, color: colors.text, letterSpacing: -0.5 }}>{meta.label}</div>
            <div style={{ fontSize: 15, color: colors.text3, fontWeight: 500, marginTop: 2 }}>{meta.subtitle}</div>
          </div>
        </div>
        <div
          style={{
            padding: '8px 18px',
            borderRadius: 20,
            background: colors.white,
            border: `1px solid ${colors.border}`,
            fontSize: 13,
            fontWeight: 700,
            color: colors.text3,
            letterSpacing: 0.4,
          }}
        >
          SECCIÓN {index + 1} / {total}
        </div>
      </div>

      {/* Device frames */}
      <div
        style={{
          position: 'absolute',
          top: 210,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 60,
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
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, fontWeight: 700, color: colors.text3, letterSpacing: 1 }}>ESCRITORIO</div>
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
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, fontWeight: 700, color: colors.text3, letterSpacing: 1 }}>MÓVIL</div>
        </div>
      </div>
    </AbsoluteFill>
  )
}
