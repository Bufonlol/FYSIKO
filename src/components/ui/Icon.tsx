interface IconProps { size?: number; color?: string; style?: React.CSSProperties }

export const Icons = {
  dashboard: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  ),
  agenda: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  patients: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  clinics: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  ),
  odontogram: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="M12 2C8 2 5 5 5 8c0 2 .5 3.5 1 5l1 7c.5 1.5 1.5 2 2 2s1-.5 1.5-2L12 15l1.5 5c.5 1.5 1 2 1.5 2s1.5-.5 2-2l1-7c.5-1.5 1-3 1-5 0-3-3-6-7-6z"/>
    </svg>
  ),
  doctors: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="12" y1="14" x2="12" y2="20"/><line x1="9" y1="17" x2="15" y2="17"/>
    </svg>
  ),
  reports: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  sales: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  treatments: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  inventory: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  notifications: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  logout: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  search: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  menu: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  chevronDown: (p: IconProps) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <polyline points="6,9 12,15 18,9"/>
    </svg>
  ),
  chevronRight: (p: IconProps) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <polyline points="9,18 15,12 9,6"/>
    </svg>
  ),
  plus: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  check: (p: IconProps) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  ),
  x: (p: IconProps) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  eye: (p: IconProps) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  eyeOff: (p: IconProps) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  star: (p: IconProps) => (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill={p.color||'currentColor'} stroke="none" style={p.style}>
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  ),
  alertTriangle: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  dollar: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  ),
  smile: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
  ),
  user: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  clock: (p: IconProps) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
    </svg>
  ),
  filter: (p: IconProps) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
    </svg>
  ),
  key: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3L22 7l-3-3"/>
    </svg>
  ),
  trophy: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/>
    </svg>
  ),
  building: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18Z"/><path d="M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2"/><path d="M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
    </svg>
  ),
  hospital: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M12 7v6"/><path d="M9 10h6"/>
    </svg>
  ),
  pill: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="M10.5 20H4a2 2 0 01-2-2V6a2 2 0 012-2h6.5"/><path d="M13.5 4H20a2 2 0 012 2v12a2 2 0 01-2 2h-6.5"/><line x1="12" y1="2" x2="12" y2="22"/>
    </svg>
  ),
  printer: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
    </svg>
  ),
  clipboard: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>
    </svg>
  ),
  settings: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  package: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  mensajes: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  ),
  send: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  users: (p: IconProps) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
}

export type IconName = keyof typeof Icons

interface IconComponentProps {
  name: IconName
  size?: number
  color?: string
  style?: React.CSSProperties
}
export function Icon({ name, size, color, style }: IconComponentProps) {
  const Comp = Icons[name]
  return <Comp size={size} color={color} style={style} />
}
