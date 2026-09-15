import React from 'react'
import { colors, headlineFamily } from './theme'
import logo from './art/logo'

export function Eyebrow({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span
      style={{
        color: light ? colors.blueSoft : colors.blue,
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
        fontWeight: 800,
        fontSize: 10.5,
      }}
    >
      {children}
    </span>
  )
}

export function H({ children, size = 26, style }: { children: React.ReactNode; size?: number; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        fontFamily: headlineFamily,
        fontWeight: 800,
        textTransform: 'uppercase',
        lineHeight: 0.95,
        fontSize: size,
        color: colors.ink,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function Pill({
  children,
  outline,
  light,
  size = 'md',
}: {
  children: React.ReactNode
  outline?: boolean
  light?: boolean
  size?: 'sm' | 'md'
}) {
  const pad = size === 'sm' ? '7px 13px' : '9px 17px'
  const fs = size === 'sm' ? 10 : 11.5
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: pad,
        borderRadius: 7,
        fontWeight: 800,
        fontSize: fs,
        background: outline ? 'transparent' : colors.blue,
        color: outline ? (light ? '#fff' : colors.blue) : '#fff',
        border: outline ? `1.5px solid ${light ? '#fff' : colors.blue}` : 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
      <span style={{ fontSize: fs + 1 }}>→</span>
    </div>
  )
}

export function MiniHeaderDesktop({ active = 0 }: { active?: number }) {
  const items = ['Inicio', 'Servicios', 'Proceso', 'Nosotros', 'Blog', 'Contacto']
  return (
    <div
      style={{
        height: 58,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 26px',
        borderBottom: `1px solid ${colors.line}`,
        background: '#fff',
      }}
    >
      <img src={logo} alt="FYSIKO" style={{ height: 26, objectFit: 'contain' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {items.map((it, i) => (
          <span key={it} style={{ fontSize: 10.5, fontWeight: 700, color: i === active ? colors.blue : colors.ink }}>
            {it}
          </span>
        ))}
      </div>
      <Pill size="sm">Agendar</Pill>
    </div>
  )
}

export function MiniHeaderMobile() {
  return (
    <div
      style={{
        height: 52,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 18px',
        borderBottom: `1px solid ${colors.line}`,
        background: '#fff',
      }}
    >
      <img src={logo} alt="FYSIKO" style={{ height: 20, objectFit: 'contain' }} />
      <div style={{ width: 22, height: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <span style={{ height: 2, background: colors.ink, borderRadius: 1 }} />
        <span style={{ height: 2, background: colors.ink, borderRadius: 1 }} />
        <span style={{ height: 2, background: colors.ink, borderRadius: 1 }} />
      </div>
    </div>
  )
}

export function WaButton() {
  return (
    <div
      style={{
        position: 'absolute',
        right: 14,
        bottom: 14,
        width: 34,
        height: 34,
        borderRadius: '50%',
        background: colors.green,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 15,
        boxShadow: '0 6px 16px rgba(22,191,99,0.4)',
        zIndex: 6,
      }}
    >
      ●
    </div>
  )
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 9.5,
        fontWeight: 700,
        color: colors.ink,
      }}
    >
      <span style={{ color: colors.blue }}>✓</span>
      {children}
    </span>
  )
}
