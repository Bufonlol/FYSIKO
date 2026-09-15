export const colors = {
  blue: '#5b84b1',
  blueDark: '#4a72a0',
  blueLight: '#7aa3c9',
  bluePale: '#e8f0f8',
  green: '#8db84a',
  greenDark: '#7aa33d',
  greenPale: '#f0f7e6',
  purple: '#7c5cbf',
  purplePale: '#f0ebfb',
  orange: '#e07b54',
  orangePale: '#fdf0eb',
  amber: '#e9c46a',
  red: '#e74c3c',
  text: '#1a2535',
  text2: '#425168',
  text3: '#66758a',
  muted: '#8a9ab0',
  bg: '#f3f6f9',
  bg2: '#eaf0f5',
  white: '#ffffff',
  border: '#dce5ed',
  borderSoft: '#eaf0f5',
}

export const fontFamily =
  "'Plus Jakarta Sans', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif"

export const shadowLg = '0 30px 70px rgba(20,30,50,0.28), 0 8px 20px rgba(20,30,50,0.12)'
export const shadowCard = '0 4px 16px rgba(20,30,50,0.08), 0 1px 4px rgba(20,30,50,0.05)'

export type SectionKey =
  | 'dashboard'
  | 'agenda'
  | 'patients'
  | 'doctors'
  | 'clinics'
  | 'reports'
  | 'users'
  | 'notifications'

export const sectionMeta: Record<SectionKey, { label: string; subtitle: string; color: string; pale: string }> = {
  dashboard: { label: 'Dashboard', subtitle: 'Resumen general de la clínica en tiempo real', color: colors.blue, pale: colors.bluePale },
  agenda: { label: 'Agenda', subtitle: 'Citas, horarios y disponibilidad de cada especialista', color: colors.green, pale: colors.greenPale },
  patients: { label: 'Pacientes', subtitle: 'Historial clínico y seguimiento de tratamientos', color: colors.purple, pale: colors.purplePale },
  doctors: { label: 'Fisioterapeutas', subtitle: 'Equipo clínico, especialidades y ocupación', color: colors.orange, pale: colors.orangePale },
  clinics: { label: 'Consultorios', subtitle: 'Salas, sedes y disponibilidad de espacios', color: colors.blueDark, pale: colors.bluePale },
  reports: { label: 'Reportes', subtitle: 'Indicadores financieros y de desempeño', color: colors.green, pale: colors.greenPale },
  users: { label: 'Usuarios', subtitle: 'Roles, permisos y accesos del equipo', color: colors.purple, pale: colors.purplePale },
  notifications: { label: 'Notificaciones', subtitle: 'Alertas, recordatorios y avisos del sistema', color: colors.orange, pale: colors.orangePale },
}
