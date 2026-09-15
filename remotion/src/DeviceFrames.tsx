import React from 'react'
import { colors, shadowLg } from './theme'

export const DESKTOP_W = 1180
export const DESKTOP_H = 700
export const PHONE_W = 320
export const PHONE_H = 700

export function DesktopFrame({
  children,
  style,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        width: DESKTOP_W,
        height: DESKTOP_H,
        borderRadius: 16,
        background: colors.white,
        boxShadow: shadowLg,
        overflow: 'hidden',
        border: `1px solid ${colors.line}`,
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      <div
        style={{
          height: 40,
          flexShrink: 0,
          background: '#eef2f6',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 14px',
          borderBottom: `1px solid ${colors.line}`,
        }}
      >
        <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#f0605a' }} />
        <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#f6bd51' }} />
        <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#5fc95c' }} />
        <div
          style={{
            marginLeft: 14,
            height: 22,
            flex: 1,
            maxWidth: 420,
            borderRadius: 6,
            background: '#fff',
            border: `1px solid ${colors.line}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            fontSize: 11,
            color: colors.text3,
            fontWeight: 600,
            letterSpacing: 0.2,
          }}
        >
          fysiko.mx
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>{children}</div>
    </div>
  )
}

export function PhoneFrame({
  children,
  style,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        width: PHONE_W,
        height: PHONE_H,
        borderRadius: 40,
        background: '#0f172a',
        boxShadow: shadowLg,
        padding: 10,
        ...style,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 30,
          background: colors.white,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 110,
            height: 22,
            borderRadius: 12,
            background: '#0f172a',
            zIndex: 5,
          }}
        />
        <div
          style={{
            height: 40,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 22px',
            fontSize: 12,
            fontWeight: 700,
            color: colors.ink,
          }}
        >
          <span>9:41</span>
          <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span>••••</span>
            <span>Wi-Fi</span>
            <span>100%</span>
          </span>
        </div>
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>{children}</div>
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 120,
            height: 4,
            borderRadius: 3,
            background: '#c7d2dd',
          }}
        />
      </div>
    </div>
  )
}
