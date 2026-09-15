import React from 'react'
import { colors } from './theme'
import type { SectionKey } from './theme'

const NAV: { key: SectionKey; label: string; glyph: string }[] = [
  { key: 'dashboard', label: 'Dashboard', glyph: '◱' },
  { key: 'agenda', label: 'Agenda', glyph: '▤' },
  { key: 'reports', label: 'Reportes', glyph: '▲' },
  { key: 'patients', label: 'Pacientes', glyph: '◍' },
  { key: 'doctors', label: 'Fisioterapeutas', glyph: '✚' },
  { key: 'clinics', label: 'Consultorios', glyph: '▣' },
  { key: 'users', label: 'Usuarios', glyph: '◐' },
  { key: 'notifications', label: 'Notificaciones', glyph: '◔' },
]

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        flexShrink: 0,
        background: 'linear-gradient(135deg, #5b84b1, #8db84a)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 800,
        fontSize: size * 0.5,
      }}
    >
      F
    </div>
  )
}

export function MiniSidebar({ active }: { active: SectionKey }) {
  return (
    <div
      style={{
        width: 190,
        flexShrink: 0,
        background: '#fff',
        borderRight: `1px solid ${colors.borderSoft}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 12px',
        gap: 2,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 6px 16px' }}>
        <Logo size={26} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: colors.blue, letterSpacing: -0.2 }}>FYSIKO</div>
          <div style={{ fontSize: 7, fontWeight: 700, color: colors.muted, letterSpacing: 0.4 }}>SISTEMA DE GESTIÓN</div>
        </div>
      </div>
      {NAV.map((item) => {
        const isActive = item.key === active
        return (
          <div
            key={item.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 8px',
              borderRadius: 7,
              background: isActive ? colors.bluePale : 'transparent',
              color: isActive ? colors.blueDark : colors.text2,
              fontSize: 11,
              fontWeight: isActive ? 700 : 500,
            }}
          >
            <span style={{ width: 14, textAlign: 'center', fontSize: 12 }}>{item.glyph}</span>
            <span>{item.label}</span>
          </div>
        )
      })}
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 6px 0', borderTop: `1px solid ${colors.borderSoft}` }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: colors.blue,
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          MA
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: colors.text }}>María Alcántara</div>
      </div>
    </div>
  )
}

export function MiniTopbar({ title }: { title: string }) {
  return (
    <div
      style={{
        height: 52,
        flexShrink: 0,
        borderBottom: `1px solid ${colors.borderSoft}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 22px',
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 800, color: colors.text, letterSpacing: -0.2 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 170,
            height: 26,
            borderRadius: 7,
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            fontSize: 10,
            color: colors.muted,
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
          }}
        >
          Buscar…
        </div>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: colors.bluePale, color: colors.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
          ◔
        </div>
      </div>
    </div>
  )
}

export function MobileTopbar({ title, accent }: { title: string; accent: string }) {
  return (
    <div
      style={{
        height: 54,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 18px',
        background: '#fff',
        borderBottom: `1px solid ${colors.borderSoft}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 24, height: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <span style={{ height: 2, background: colors.text2, borderRadius: 1 }} />
          <span style={{ height: 2, background: colors.text2, borderRadius: 1 }} />
          <span style={{ height: 2, background: colors.text2, borderRadius: 1 }} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: colors.text }}>{title}</div>
      </div>
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: accent, color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        MA
      </div>
    </div>
  )
}

export function MobileBottomNav({ active }: { active: SectionKey }) {
  const items = NAV.slice(0, 5)
  return (
    <div
      style={{
        height: 60,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        background: '#fff',
        borderTop: `1px solid ${colors.borderSoft}`,
      }}
    >
      {items.map((item) => {
        const isActive = item.key === active
        return (
          <div key={item.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: isActive ? colors.blue : colors.muted }}>
            <span style={{ fontSize: 15 }}>{item.glyph}</span>
            <span style={{ fontSize: 8, fontWeight: 700 }}>{item.label.split(' ')[0]}</span>
          </div>
        )
      })}
    </div>
  )
}

export function Badge({ label, color, pale }: { label: string; color: string; pale: string }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: '3px 9px',
        borderRadius: 20,
        background: pale,
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 4px 16px rgba(20,30,50,0.08), 0 1px 4px rgba(20,30,50,0.05)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function KpiCard({
  label,
  value,
  glyph,
  color,
  pale,
  change,
  compact,
}: {
  label: string
  value: string | number
  glyph: string
  color: string
  pale: string
  change?: string
  compact?: boolean
}) {
  return (
    <Card style={{ padding: compact ? 14 : 18, flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ width: compact ? 30 : 36, height: compact ? 30 : 36, borderRadius: 9, background: pale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: compact ? 14 : 16, color }}>
          {glyph}
        </div>
        {change && <Badge label={change} color={colors.greenDark} pale={colors.greenPale} />}
      </div>
      <div style={{ fontSize: compact ? 20 : 24, fontWeight: 800, color: colors.text, letterSpacing: -0.4 }}>{value}</div>
      <div style={{ fontSize: compact ? 10 : 12, color: colors.muted, fontWeight: 600, marginTop: 3 }}>{label}</div>
    </Card>
  )
}

export function MiniBarChart({ values, progress, accent }: { values: number[]; progress: number; accent: string }) {
  const max = Math.max(...values, 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 90, width: '100%' }}>
      {values.map((v, i) => {
        const target = (v / max) * 100
        const h = Math.max(target * progress, v > 0 ? 4 : 0)
        return (
          <div key={i} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ width: '100%', height: `${h}%`, borderRadius: '4px 4px 0 0', background: i === values.length - 3 ? accent : `${accent}33` }} />
          </div>
        )
      })}
    </div>
  )
}

export function MiniDonut({ segments, progress, size = 96 }: { segments: { value: number; color: string }[]; progress: number; size?: number }) {
  const r = size / 2 - 9
  const cx = size / 2
  const cy = size / 2
  const circ = 2 * Math.PI * r
  const total = segments.reduce((s, d) => s + d.value, 0)
  let offset = 0
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f2f5" strokeWidth={16} />
      {segments.map((d, i) => {
        const portion = total > 0 ? (d.value / total) * circ * progress : 0
        const seg = (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={d.color}
            strokeWidth={16}
            strokeDasharray={`${portion} ${circ - portion}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
          />
        )
        offset += portion
        return seg
      })}
    </svg>
  )
}

export function Row({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 16px',
        borderBottom: `1px solid ${colors.borderSoft}`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function Avatar({ initials, color, size = 32 }: { initials: string; color: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `${color}1f`,
        color,
        fontSize: size * 0.36,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}
