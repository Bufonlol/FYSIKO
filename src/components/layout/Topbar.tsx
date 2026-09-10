import { useState, useEffect, useRef } from 'react'
import { useStore } from '../../store/useStore'
import { Icon } from '../ui/Icon'
import { supabase } from '../../lib/supabase'

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard', agenda: 'Agenda', patients: 'Pacientes',
  clinics: 'Consultorios', doctors: 'Fisioterapeutas',
  reports: 'Reportes', sales: 'Ventas / Facturación', treatments: 'Plan de Tratamientos',
  inventory: 'Inventario', users: 'Gestión de Usuarios', notifications: 'Notificaciones',
  mensajes: 'Mensajes WhatsApp',
  proveedores: 'Proveedores', convenios: 'Convenios y Seguros', planpagos: 'Plan de Pagos',
}

function formatDate() {
  return new Date().toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

const NOTIF_TYPE: Record<string, { color: string; bg: string; icon: string }> = {
  cita:         { color: '#5b84b1', bg: '#e8f0f8', icon: 'agenda'        },
  alerta:       { color: '#e74c3c', bg: '#fef2f2', icon: 'alertTriangle' },
  pago:         { color: '#7aa33d', bg: '#f0f7e6', icon: 'dollar'        },
  recordatorio: { color: '#c9920a', bg: '#fff8e6', icon: 'clock'         },
  sistema:      { color: '#e07b54', bg: '#fef0e8', icon: 'settings'      },
}

const searchPlaceholders: Record<string, string> = {
  patients: 'Buscar paciente...', doctors: 'Buscar fisioterapeuta...',
}

const searchablePages = new Set(['patients', 'doctors'])

export function Topbar() {
  const { currentPage, toggleSidebar, notifications, markNotifRead, markAllRead, deleteNotif, notifPanelOpen, toggleNotifPanel, loadNotifications, searchQuery, setSearchQuery, currentUser, logout, navigate } = useStore()
  const unread = notifications.filter(n => !n.read).length
  const [profileOpen, setProfileOpen] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [panelHoveredId, setPanelHoveredId] = useState<number | null>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadNotifications() }, [])

  useEffect(() => {
    if (!profileOpen) return
    const close = (e: MouseEvent) => {
      if (!profileRef.current?.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [profileOpen])

  return (
    <header className="topbar" style={{
      height: 60, background: '#fff', borderBottom: '1px solid rgba(91,132,177,0.08)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px',
      position: 'sticky', top: 0, zIndex: 50, flexShrink: 0,
    }}>
      {/* Hamburger — visible mobile only */}
      <button className="hamburger-btn" onClick={toggleSidebar}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f5f7fa' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        <Icon name="menu" size={22} />
      </button>

      {/* Title + date */}
      <div className="topbar-title" style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: 17, fontWeight: 700, color: '#1a2535', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {pageTitles[currentPage] || currentPage}
        </h1>
        <p style={{ fontSize: 11, color: '#8a9ab0', marginTop: 1, textTransform: 'capitalize', display: 'none' }} className="topbar-date">
          {formatDate()}
        </p>
      </div>

      {/* Search — only shown where it filters the current view */}
      {searchablePages.has(currentPage) && (
        <div style={{ position: 'relative' }} className="topbar-search">
          <Icon name="search" size={15} color="#8a9ab0" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholders[currentPage]}
            aria-label={searchPlaceholders[currentPage]}
            style={{
              paddingLeft: 32, paddingRight: 10, height: 36, borderRadius: 8,
              border: '1.5px solid #e2e8f0', fontSize: 13, color: '#1a2535',
              background: '#f5f7fa', width: 180, transition: 'all 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = '#5b84b1'; e.target.style.background = '#fff' }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f5f7fa' }}
          />
        </div>
      )}

      {/* Notifications bell */}
      <div style={{ position: 'relative', flexShrink: 0 }} data-notif-panel>
        <button onClick={toggleNotifPanel} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          padding: 8, borderRadius: 8, color: '#4a5568', position: 'relative', display: 'flex',
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f5f7fa' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
          <Icon name="notifications" size={22} />
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: 5, right: 5, width: 8, height: 8,
              background: '#8db84a', borderRadius: '50%', border: '2px solid #fff',
            }} />
          )}
        </button>

        {/* Notification panel */}
        {notifPanelOpen && (
          <div style={{
            position: 'fixed', right: 12, top: 68,
            width: 'min(380px, calc(100vw - 24px))',
            background: '#fff', borderRadius: 14,
            boxShadow: '0 16px 48px rgba(0,0,0,0.16), 0 4px 16px rgba(0,0,0,0.06)',
            border: '1px solid rgba(91,132,177,0.1)', zIndex: 200, overflow: 'hidden',
          }}>
            {/* Panel header */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: '#1a2535' }}>Notificaciones</span>
                {unread > 0 && (
                  <span style={{ background: '#e74c3c', color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 7px', borderRadius: 10 }}>{unread}</span>
                )}
              </div>
              {unread > 0 && (
                <button onClick={markAllRead} style={{ fontSize: 11, fontWeight: 600, color: '#5b84b1', background: 'transparent', border: 'none', cursor: 'pointer', padding: '3px 6px', borderRadius: 6 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#e8f0f8' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  Marcar leídas
                </button>
              )}
            </div>

            {/* Notifications list */}
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '36px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                  <p style={{ fontSize: 13, color: '#8a9ab0', fontWeight: 600 }}>Sin notificaciones</p>
                </div>
              ) : notifications.slice(0, 8).map((n, i) => {
                const cfg = NOTIF_TYPE[n.type] ?? NOTIF_TYPE.sistema
                const isPanelHovered = panelHoveredId === n.id
                return (
                  <div key={n.id}
                    onClick={() => { if (!n.read) markNotifRead(n.id) }}
                    onMouseEnter={() => setPanelHoveredId(n.id)}
                    onMouseLeave={() => setPanelHoveredId(null)}
                    style={{
                      padding: '11px 16px', cursor: n.read ? 'default' : 'pointer',
                      background: isPanelHovered ? '#f5f7fa' : n.read ? '#fff' : cfg.bg + '55',
                      borderBottom: i < Math.min(notifications.length, 8) - 1 ? '1px solid #f5f7fa' : 'none',
                      boxShadow: n.read ? 'none' : `inset 0 0 0 1px ${cfg.color}22`,
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                      transition: 'background 0.12s',
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: cfg.bg, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name={cfg.icon as any} size={14} color={cfg.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: cfg.color, letterSpacing: '0.3px' }}>
                          {cfg.icon === 'agenda' ? 'CITA' : cfg.icon === 'alertTriangle' ? 'ALERTA' : cfg.icon === 'dollar' ? 'PAGO' : cfg.icon === 'clock' ? 'RECORDATORIO' : 'SISTEMA'}
                        </span>
                        {n.urgent && <span style={{ fontSize: 9, fontWeight: 700, color: '#e74c3c' }}>⚡ URGENTE</span>}
                      </div>
                      <p style={{ fontSize: 12, color: '#1a2535', fontWeight: n.read ? 400 : 600, lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{n.message}</p>
                      <p style={{ fontSize: 10, color: '#8a9ab0', marginTop: 3 }}>{n.time}</p>
                    </div>
                    {/* Right: delete + status */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={e => { e.stopPropagation(); deleteNotif(n.id) }}
                        title="Eliminar"
                        style={{
                          width: 22, height: 22, borderRadius: 5, border: 'none',
                          background: isPanelHovered ? '#fef2f2' : 'transparent',
                          color: isPanelHovered ? '#e74c3c' : '#d1d5db',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s', flexShrink: 0,
                        }}
                        onMouseEnter={e => { e.stopPropagation(); const el = e.currentTarget as HTMLElement; el.style.background = '#fee2e2'; el.style.color = '#dc2626' }}
                        onMouseLeave={e => { e.stopPropagation(); const el = e.currentTarget as HTMLElement; el.style.background = isPanelHovered ? '#fef2f2' : 'transparent'; el.style.color = isPanelHovered ? '#e74c3c' : '#d1d5db' }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                      {!n.read && (
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div style={{ padding: '10px 16px', borderTop: '1px solid #f0f2f5', display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => { toggleNotifPanel(); navigate('notifications') }} style={{
                width: '100%', padding: '8px', borderRadius: 8,
                border: '1.5px solid #e2e8f0', background: '#f8fafc',
                color: '#5b84b1', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#e8f0f8'; (e.currentTarget as HTMLElement).style.borderColor = '#5b84b1' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0' }}
              >
                Ver todas las notificaciones →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User avatar + logout — visible mobile only */}
      <div ref={profileRef} className="topbar-profile" style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => setProfileOpen(p => !p)}
          style={{
            width: 34, height: 34, borderRadius: '50%',
            background: profileOpen ? '#5b84b1' : '#e8f0f8',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700,
            color: profileOpen ? '#fff' : '#5b84b1',
            transition: 'all 0.2s',
          }}
        >
          {currentUser?.avatar ?? '?'}
        </button>

        {profileOpen && (
          <div style={{
            position: 'fixed', right: 12, top: 68,
            width: 220, background: '#fff', borderRadius: 12,
            boxShadow: '0 12px 40px rgba(0,0,0,0.14)',
            border: '1px solid rgba(91,132,177,0.1)',
            zIndex: 200, overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f2f5' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a2535' }}>{currentUser?.name}</div>
              <div style={{ fontSize: 11, color: '#8a9ab0', marginTop: 2 }}>@{currentUser?.username}</div>
            </div>
            <button
              onClick={() => { setProfileOpen(false); setConfirmLogout(true) }}
              style={{
                width: '100%', padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, color: '#e74c3c',
                transition: 'background 0.15s', textAlign: 'left',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fef2f2' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <Icon name="logout" size={16} />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 640px) { .topbar-date { display: block !important; } }
        .topbar-profile { display: none; }
        @media (max-width: 768px) { .topbar-profile { display: block; } }
      `}</style>

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
    </header>
  )
}
