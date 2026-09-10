import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { Icon } from '../ui/Icon'
import type { PageName } from '../../types'
import { supabase } from '../../lib/supabase'

type NavItem = { page: PageName; label: string; icon: keyof typeof import('../ui/Icon').Icons }

type NavSection = { label: string; items: NavItem[] }

const ALL_SECTIONS: NavSection[] = [
  {
    label: 'Principal',
    items: [
      { page: 'dashboard',  label: 'Dashboard',  icon: 'dashboard' },
      { page: 'agenda',     label: 'Agenda',     icon: 'agenda'    },
      { page: 'reports',    label: 'Reportes',   icon: 'reports'   },
      { page: 'patients',   label: 'Pacientes',  icon: 'patients'  },
    ],
  },
  {
    label: 'Clínica',
    items: [
      { page: 'doctors',    label: 'Fisioterapeutas', icon: 'doctors'  },
      { page: 'clinics',    label: 'Consultorios',  icon: 'clinics'    },
    ],
  },
  {
    label: 'Administración',
    items: [
      { page: 'users',         label: 'Usuarios',       icon: 'doctors'       },
      { page: 'notifications', label: 'Notificaciones', icon: 'notifications' },
    ],
  },
]

const ROLE_PAGES: Record<string, PageName[]> = {
  admin:        ['dashboard','agenda','reports','patients','clinics','doctors','users','notifications'],
  doctor:       ['dashboard','agenda','reports','patients','notifications'],
  recepcion:    ['dashboard','agenda','reports','patients','notifications'],
  agenda_admin: ['dashboard','agenda','reports','patients','clinics','doctors','users','notifications'],
}

export function Sidebar() {
  const { currentPage, navigate, logout, currentUser, sidebarOpen } = useStore()
  const unreadCount = useStore(s => s.notifications.filter(n => !n.read).length)
  const [confirmLogout, setConfirmLogout] = useState(false)

  const role = currentUser?.role ?? 'recepcion'
  const allowed = ROLE_PAGES[role] ?? ROLE_PAGES.recepcion

  const roleBadge: Record<string, { label: string; color: string; bg: string }> = {
    admin:        { label: 'Administrador',  color: '#5b84b1', bg: '#e8f0f8' },
    doctor:       { label: 'Fisioterapeuta', color: '#8db84a', bg: '#edf7e2' },
    recepcion:    { label: 'Recepcionista',  color: '#e07b54', bg: '#fdf0eb' },
    agenda_admin: { label: 'Módulo Agenda',  color: '#7c5cbf', bg: '#f0ebfb' },
  }
  const badge = roleBadge[role] ?? roleBadge.recepcion

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-brand" style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(91,132,177,0.08)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #5b84b1, #8db84a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 15,
          }}>F</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.3px' }}>
              <span style={{ color: '#5b84b1' }}>FYSIKO</span>
            </div>
            <div style={{ fontSize: 10, color: '#8a9ab0', fontWeight: 600, letterSpacing: '0.4px', marginTop: 1 }}>
              SISTEMA DE GESTIÓN
            </div>
          </div>
        </div>

      </div>

      {/* Nav */}
      <nav className="sidebar-nav" style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        {ALL_SECTIONS.map((section, si) => {
          const visibleItems = section.items.filter(item => allowed.includes(item.page))
          if (visibleItems.length === 0) return null
          return (
            <div key={section.label} style={{ marginBottom: 4 }}>
              {/* Section label */}
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.8px',
                color: '#b0bcc8', textTransform: 'uppercase',
                padding: '10px 10px 4px',
                marginTop: si === 0 ? 0 : 4,
              }}>
                {section.label}
              </div>
              {visibleItems.map(item => {
                const active = currentPage === item.page
                const badge = item.page === 'notifications' ? unreadCount : 0
                return (
                  <button className={`sidebar-link${active ? ' is-active' : ''}`} key={item.page} onClick={() => navigate(item.page)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 8, marginBottom: 1, cursor: 'pointer',
                    background: active ? '#e8f0f8' : 'transparent',
                    color: active ? '#5b84b1' : '#4a5568',
                    fontWeight: active ? 600 : 500, fontSize: 13,
                    border: 'none', textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                    onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = '#f5f7fa'; (e.currentTarget as HTMLElement).style.color = '#5b84b1' } }}
                    onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#4a5568' } }}
                  >
                    <Icon name={item.icon as any} size={17} color={active ? '#5b84b1' : 'currentColor'} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {badge > 0 && (
                      <span style={{
                        background: '#e74c3c', color: '#fff', borderRadius: 10,
                        fontSize: 10, fontWeight: 700, padding: '1px 6px', minWidth: 18, textAlign: 'center',
                      }}>{badge}</span>
                    )}
                  </button>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="sidebar-user" style={{ padding: '12px 16px', borderTop: '1px solid rgba(91,132,177,0.08)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#5b84b1', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, flexShrink: 0,
          }}>{currentUser?.avatar}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a2535', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser?.name}
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 8,
              background: badge.bg, color: badge.color,
            }}>{badge.label}</span>
          </div>
          <button onClick={() => setConfirmLogout(true)} title="Cerrar sesión" style={{
            background: 'transparent', border: 'none', padding: 6, borderRadius: 6, cursor: 'pointer', color: '#8a9ab0',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#e74c3c'; (e.currentTarget as HTMLElement).style.background = '#fef2f2' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#8a9ab0'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <Icon name="logout" size={16} />
          </button>
        </div>
      </div>

      {/* Logout confirmation modal */}
      {confirmLogout && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15,25,40,0.45)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }} onClick={() => setConfirmLogout(false)}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 340,
            boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            animation: 'fadeUp 0.2s ease',
          }} onClick={e => e.stopPropagation()}>
            {/* Icon */}
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Icon name="logout" size={24} color="#e74c3c" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1a2535', textAlign: 'center', marginBottom: 8 }}>
              Cerrar sesión
            </h3>
            <p style={{ fontSize: 13, color: '#8a9ab0', textAlign: 'center', marginBottom: 24, lineHeight: 1.5 }}>
              ¿Seguro que quieres cerrar sesión?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirmLogout(false)}
                style={{
                  flex: 1, height: 40, borderRadius: 8, border: '1.5px solid #e2e8f0',
                  background: '#fff', color: '#4a5568', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f5f7fa' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => { setConfirmLogout(false); supabase.auth.signOut().catch(() => {}); logout() }}
                style={{
                  flex: 1, height: 40, borderRadius: 8, border: 'none',
                  background: '#e74c3c', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#c0392b' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#e74c3c' }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
