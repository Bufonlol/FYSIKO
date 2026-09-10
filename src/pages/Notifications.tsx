import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { Icon } from '../components/ui/Icon'
import type { IconName } from '../components/ui/Icon'

const TYPE_CONFIG: Record<string, { color: string; bg: string; icon: IconName; label: string }> = {
  cita:          { color: '#5b84b1', bg: '#e8f0f8', icon: 'agenda',         label: 'Cita'          },
  alerta:        { color: '#e74c3c', bg: '#fef2f2', icon: 'alertTriangle',   label: 'Alerta'        },
  pago:          { color: '#7aa33d', bg: '#f0f7e6', icon: 'dollar',          label: 'Pago'          },
  recordatorio:  { color: '#c9920a', bg: '#fff8e6', icon: 'clock',           label: 'Recordatorio'  },
  sistema:       { color: '#e07b54', bg: '#fef0e8', icon: 'settings',        label: 'Sistema'       },
}

const FILTER_LIST = [
  { key: 'todas',        label: 'Todas' },
  { key: 'cita',        label: 'Citas' },
  { key: 'alerta',      label: 'Alertas' },
  { key: 'pago',        label: 'Pagos' },
  { key: 'recordatorio',label: 'Recordatorios' },
  { key: 'sistema',     label: 'Sistema' },
] as const

type FilterKey = typeof FILTER_LIST[number]['key']

export function Notifications() {
  const { notifications, loadNotifications, markNotifRead, markAllRead, deleteNotif, deleteAllRead, showToast } = useStore()
  const [filter, setFilter] = useState<FilterKey>('todas')
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => { loadNotifications() }, [])

  const unread = notifications.filter(n => !n.read).length
  const readCount = notifications.filter(n => n.read).length
  const filtered = filter === 'todas'
    ? notifications
    : notifications.filter(n => n.type === filter)

  const unreadByType = Object.fromEntries(
    ['cita','alerta','pago','recordatorio','sistema'].map(t => [
      t, notifications.filter(n => n.type === t && !n.read).length,
    ])
  )

  function handleDelete(e: React.MouseEvent, id: number) {
    e.stopPropagation()
    deleteNotif(id)
    showToast('Notificación eliminada', 'info')
  }

  function handleDeleteAllRead() {
    if (!confirmClear) { setConfirmClear(true); return }
    deleteAllRead()
    showToast('Notificaciones leídas eliminadas', 'success')
    setConfirmClear(false)
  }

  return (
    <div className="app-page notifications-page" style={{ maxWidth: 860, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a2535', letterSpacing: '-0.3px' }}>
              Centro de notificaciones
            </h2>
            {unread > 0 && (
              <span style={{
                background: '#e74c3c', color: '#fff',
                fontSize: 11, fontWeight: 800, padding: '2px 9px',
                borderRadius: 12, letterSpacing: '0.2px',
              }}>
                {unread} nueva{unread !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: '#8a9ab0' }}>
            {unread > 0
              ? `Tienes ${unread} notificación${unread !== 1 ? 'es' : ''} sin leer`
              : 'Todo al día — no tienes notificaciones pendientes'}
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {unread > 0 && (
            <button onClick={markAllRead} style={{
              padding: '9px 16px', borderRadius: 8,
              border: '1.5px solid #e2e8f0', background: '#fff',
              color: '#4a5568', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f5f7fa' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff' }}
            >
              <Icon name="check" size={13} color="#8a9ab0" />
              Marcar todo leído
            </button>
          )}
          {readCount > 0 && (
            <button
              onClick={handleDeleteAllRead}
              onBlur={() => setConfirmClear(false)}
              style={{
                padding: '9px 16px', borderRadius: 8,
                border: `1.5px solid ${confirmClear ? '#e74c3c' : '#e2e8f0'}`,
                background: confirmClear ? '#fef2f2' : '#fff',
                color: confirmClear ? '#e74c3c' : '#4a5568',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!confirmClear) (e.currentTarget as HTMLElement).style.background = '#fef2f2' }}
              onMouseLeave={e => { if (!confirmClear) (e.currentTarget as HTMLElement).style.background = '#fff' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
              {confirmClear ? '¿Confirmar?' : `Limpiar leídas (${readCount})`}
            </button>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      {notifications.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
          {/* Total */}
          <div style={{
            background: '#fff', borderRadius: 12, padding: '14px 16px',
            border: '1.5px solid #e8ecf2',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9, background: '#f5f7fa',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon name="notifications" size={16} color="#8a9ab0" />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1a2535', lineHeight: 1.1 }}>
                {notifications.length}
              </div>
              <div style={{ fontSize: 10, color: '#8a9ab0', fontWeight: 700, letterSpacing: '0.3px', marginTop: 1 }}>
                TOTAL
              </div>
            </div>
          </div>

          {/* Per-type unread */}
          {Object.entries(unreadByType).filter(([, c]) => c > 0).map(([type, count]) => {
            const cfg = TYPE_CONFIG[type]
            const isActive = filter === type
            return (
              <button key={type} onClick={() => setFilter(type as FilterKey)} style={{
                background: isActive ? cfg.color : '#fff',
                borderRadius: 12, padding: '14px 16px',
                border: `1.5px solid ${isActive ? cfg.color : cfg.bg}`,
                display: 'flex', alignItems: 'center', gap: 10,
                cursor: 'pointer', transition: 'all 0.15s',
                textAlign: 'left',
              }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = cfg.bg }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#fff' }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: isActive ? 'rgba(255,255,255,0.2)' : cfg.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon name={cfg.icon} size={16} color={isActive ? '#fff' : cfg.color} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: isActive ? '#fff' : cfg.color, lineHeight: 1.1 }}>
                    {count}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.3px', color: isActive ? 'rgba(255,255,255,0.8)' : '#8a9ab0', marginTop: 1 }}>
                    {cfg.label.toUpperCase()}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Filter tabs ── */}
      {notifications.length > 0 && (
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {FILTER_LIST.map(({ key, label }) => {
            const isActive = filter === key
            const cfg = key !== 'todas' ? TYPE_CONFIG[key] : null
            const cnt = key === 'todas' ? unread : (unreadByType[key] ?? 0)
            return (
              <button key={key} onClick={() => setFilter(key)} style={{
                padding: '7px 14px', borderRadius: 20,
                border: isActive ? 'none' : '1.5px solid #e2e8f0',
                background: isActive ? (cfg ? cfg.color : '#1a2535') : '#fff',
                color: isActive ? '#fff' : '#4a5568',
                fontSize: 12, fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 5,
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#f5f7fa' }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#fff' }}
              >
                {label}
                {cnt > 0 && (
                  <span style={{
                    background: isActive ? 'rgba(255,255,255,0.25)' : (cfg?.bg ?? '#f0f2f5'),
                    color: isActive ? '#fff' : (cfg?.color ?? '#4a5568'),
                    fontSize: 10, fontWeight: 800,
                    padding: '1px 6px', borderRadius: 10, minWidth: 18, textAlign: 'center',
                  }}>
                    {cnt}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* ── List ── */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 24px',
          background: '#fff', borderRadius: 16,
          border: '1.5px solid #e8ecf2',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#f5f7fa',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Icon name="notifications" size={28} color="#cbd5e1" />
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#4a5568', marginBottom: 6 }}>
            {filter === 'todas' ? 'Sin notificaciones' : `Sin notificaciones de ${FILTER_LIST.find(f => f.key === filter)?.label ?? filter}`}
          </p>
          <p style={{ fontSize: 12, color: '#b0bcc8' }}>Todo está al día por aquí ✓</p>
          {filter !== 'todas' && (
            <button onClick={() => setFilter('todas')} style={{
              marginTop: 16, padding: '7px 16px', borderRadius: 8,
              border: '1.5px solid #e2e8f0', background: '#fff',
              color: '#5b84b1', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              Ver todas
            </button>
          )}
        </div>
      ) : (
        <div style={{
          background: '#fff', borderRadius: 16,
          border: '1.5px solid #e8ecf2', overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}>
          {filtered.map((n, i) => {
            const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.sistema
            const isHovered = hoveredId === n.id
            const isLast = i === filtered.length - 1
            return (
              <div key={n.id}
                onClick={() => { if (!n.read) markNotifRead(n.id) }}
                onMouseEnter={() => setHoveredId(n.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  padding: '16px 20px',
                  background: isHovered ? '#f8fafc' : n.read ? '#fff' : cfg.bg + '44',
                  borderBottom: !isLast ? '1px solid #f0f2f5' : 'none',
                  cursor: n.read ? 'default' : 'pointer',
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  transition: 'background 0.15s',
                  position: 'relative',
                }}
              >
                {/* Type icon */}
                <div style={{
                  width: 42, height: 42, borderRadius: 11,
                  background: cfg.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `0 0 0 1px ${cfg.bg}`,
                }}>
                  <Icon name={cfg.icon} size={18} color={cfg.color} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.4px',
                      padding: '2px 8px', borderRadius: 20,
                      background: cfg.bg, color: cfg.color,
                    }}>
                      {cfg.label.toUpperCase()}
                    </span>
                    {n.urgent && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.3px',
                        padding: '2px 8px', borderRadius: 20,
                        background: '#fef2f2', color: '#e74c3c',
                      }}>
                        ⚡ URGENTE
                      </span>
                    )}
                  </div>
                  <p style={{
                    fontSize: 13, color: '#1a2535', lineHeight: 1.55,
                    fontWeight: n.read ? 400 : 600, marginBottom: 6,
                  }}>
                    {n.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="clock" size={11} color="#b0bcc8" />
                    <span style={{ fontSize: 11, color: '#8a9ab0' }}>{n.time}</span>
                  </div>
                </div>

                {/* Right side: delete button + status */}
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingTop: 2 }}>
                  {/* Delete button — always visible but subtle, prominent on hover */}
                  <button
                    onClick={(e) => handleDelete(e, n.id)}
                    title="Eliminar notificación"
                    style={{
                      width: 26, height: 26, borderRadius: 6,
                      border: '1.5px solid transparent',
                      background: isHovered ? '#fef2f2' : 'transparent',
                      borderColor: isHovered ? '#fecaca' : 'transparent',
                      color: isHovered ? '#e74c3c' : '#cbd5e1',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => {
                      e.stopPropagation()
                      const el = e.currentTarget as HTMLElement
                      el.style.background = '#fee2e2'
                      el.style.borderColor = '#fca5a5'
                      el.style.color = '#dc2626'
                      el.style.transform = 'scale(1.1)'
                    }}
                    onMouseLeave={e => {
                      e.stopPropagation()
                      const el = e.currentTarget as HTMLElement
                      el.style.background = isHovered ? '#fef2f2' : 'transparent'
                      el.style.borderColor = isHovered ? '#fecaca' : 'transparent'
                      el.style.color = isHovered ? '#e74c3c' : '#cbd5e1'
                      el.style.transform = 'scale(1)'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>

                  {/* Status dot / read indicator */}
                  {!n.read ? (
                    <div style={{
                      width: 9, height: 9, borderRadius: '50%',
                      background: cfg.color,
                      boxShadow: `0 0 0 2px ${cfg.bg}`,
                    }} />
                  ) : (
                    <Icon name="check" size={13} color="#cbd5e1" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
