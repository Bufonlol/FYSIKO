import { ReactNode, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useStore } from '../../store/useStore'
import { Icon } from '../ui/Icon'
import type { PageName } from '../../types'

type NavItem = { page: PageName; icon: string; label: string }

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  admin: [
    { page: 'dashboard',     icon: 'dashboard',     label: 'Inicio'     },
    { page: 'agenda',        icon: 'agenda',        label: 'Agenda'     },
    { page: 'reports',       icon: 'reports',       label: 'Reportes'   },
    { page: 'patients',      icon: 'patients',      label: 'Pacientes'  },
    { page: 'notifications', icon: 'notifications', label: 'Alertas'    },
  ],
  doctor: [
    { page: 'dashboard',     icon: 'dashboard',     label: 'Inicio'     },
    { page: 'agenda',        icon: 'agenda',        label: 'Agenda'     },
    { page: 'reports',       icon: 'reports',       label: 'Reportes'   },
    { page: 'patients',      icon: 'patients',      label: 'Pacientes'  },
    { page: 'notifications', icon: 'notifications', label: 'Alertas'    },
  ],
  recepcion: [
    { page: 'dashboard',     icon: 'dashboard',     label: 'Inicio'     },
    { page: 'agenda',        icon: 'agenda',        label: 'Agenda'     },
    { page: 'reports',       icon: 'reports',       label: 'Reportes'   },
    { page: 'patients',      icon: 'patients',      label: 'Pacientes'  },
    { page: 'notifications', icon: 'notifications', label: 'Alertas'    },
  ],
  agenda_admin: [
    { page: 'dashboard',     icon: 'dashboard',     label: 'Inicio'     },
    { page: 'agenda',        icon: 'agenda',        label: 'Agenda'     },
    { page: 'reports',       icon: 'reports',       label: 'Reportes'   },
    { page: 'patients',      icon: 'patients',      label: 'Pacientes'  },
    { page: 'notifications', icon: 'notifications', label: 'Alertas'    },
  ],
}

const TOAST_STYLES = {
  success: { bg: '#f0f7e6', border: '#8db84a', color: '#4a7c1f' },
  error:   { bg: '#fef2f2', border: '#e74c3c', color: '#c0392b' },
  info:    { bg: '#e8f0f8', border: '#5b84b1', color: '#2c4f7a' },
}

export function Layout({ children }: { children: ReactNode }) {
  const { notifPanelOpen, toggleNotifPanel, sidebarOpen, setSidebarOpen, currentUser, subscribeNotifications } = useStore()
  const navigate = useStore(s => s.navigate)
  const currentPage = useStore(s => s.currentPage)
  const unreadCount = useStore(s => s.notifications.filter(n => !n.read).length)
  const mobileNavItems = NAV_BY_ROLE[currentUser?.role ?? 'recepcion'] ?? NAV_BY_ROLE.recepcion
  const toasts = useStore(s => s.toasts)
  const dismissToast = useStore(s => s.dismissToast)

  useEffect(() => {
    return subscribeNotifications()
  }, [])

  useEffect(() => {
    if (!notifPanelOpen) return
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-notif-panel]')) toggleNotifPanel()
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [notifPanelOpen])

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      <div
        className={`mobile-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar />

      <div className="main-wrapper">
        <div data-notif-panel>
          <Topbar />
        </div>
        <main className="main-content">
          {children}
        </main>
      </div>

      {/* Toast container */}
      {toasts.length > 0 && (
        <div style={{ position: 'fixed', bottom: 80, right: 16, zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, maxWidth: 360 }}>
          {toasts.map(t => {
            const s = TOAST_STYLES[t.type]
            return (
              <div key={t.id} style={{
                background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 12,
                padding: '12px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                animation: 'fadeUp 0.3s ease', display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: s.color, flex: 1, lineHeight: 1.4 }}>{t.msg}</span>
                <button onClick={() => dismissToast(t.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 16, color: s.color, opacity: 0.6, padding: 0, flexShrink: 0,
                }}>×</button>
              </div>
            )
          })}
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="bottom-nav" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {mobileNavItems.map(item => {
          const active = currentPage === item.page
          const isNotif = item.page === 'notifications'
          return (
            <button key={item.page} onClick={() => navigate(item.page)} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 2, background: 'transparent', border: 'none',
              cursor: 'pointer', transition: 'color 0.2s', position: 'relative',
              color: active ? '#5b84b1' : '#8a9ab0',
            }}>
              {/* Active indicator */}
              {active && (
                <div style={{ position: 'absolute', top: 6, width: 24, height: 3, borderRadius: 2, background: '#5b84b1' }} />
              )}
              <div style={{ position: 'relative' }}>
                <Icon name={item.icon as any} size={22} />
                {isNotif && unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -6,
                    background: '#e74c3c', color: '#fff',
                    borderRadius: 10, fontSize: 9, fontWeight: 700,
                    padding: '1px 4px', minWidth: 14, textAlign: 'center',
                    border: '1.5px solid #fff',
                  }}>{unreadCount}</span>
                )}
              </div>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 600 }}>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
