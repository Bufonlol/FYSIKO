import { useState } from 'react'
import { useUsuarios } from '../lib/hooks'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'
import type { SystemUser } from '../types'
import { FadeContent } from '../components/animations'
import { Icon } from '../components/ui/Icon'
import { LoadingState } from '../components/ui/FeedbackState'

const ROLE_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  admin:       { color: '#5b84b1', bg: '#e8f0f8', label: 'Administrador'  },
  doctor:      { color: '#8db84a', bg: '#edf7e2', label: 'Fisioterapeuta' },
  recepcion:   { color: '#e07b54', bg: '#fdf0eb', label: 'Recepcionista'  },
  agenda_admin:{ color: '#9b6fce', bg: '#f3eefb', label: 'Agenda Admin'   },
}

type FormState = { username: string; password: string; name: string; role: 'admin' | 'doctor' | 'recepcion' | 'agenda_admin'; avatar: string; active: boolean; phone: string }
const emptyForm: FormState = { username: '', password: '', name: '', role: 'recepcion', avatar: '', active: true, phone: '' }

async function callEdgeFunction(action: string, payload: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  const res = await supabase.functions.invoke('manage-users', {
    body: { action, ...payload },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (res.error) throw new Error(res.error.message)
  if (res.data?.error) throw new Error(res.data.error)
  return res.data
}

export function Users() {
  const { data: users, setData, loading, refetch } = useUsuarios()
  const [modal, setModal] = useState<{ open: boolean; user: SystemUser | null }>({ open: false, user: null })
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [confirmDel, setConfirmDel] = useState<SystemUser | null>(null)
  const [mobileDetail, setMobileDetail] = useState<SystemUser | null>(null)
  const [showPass, setShowPass] = useState(false)
  const [pwModal, setPwModal] = useState<{ open: boolean; user: SystemUser | null }>({ open: false, user: null })
  const [newPw, setNewPw] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [copied, setCopied] = useState(false)
  const currentUser = useStore(s => s.currentUser)
  const showToast = useStore(s => s.showToast)

  function generateSecurePassword(): string {
    const upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
    const lower   = 'abcdefghjkmnpqrstuvwxyz'
    const numbers = '23456789'
    const symbols = '!@#$%&*'
    const all = upper + lower + numbers + symbols
    let pw = ''
    pw += upper[Math.floor(Math.random() * upper.length)]
    pw += lower[Math.floor(Math.random() * lower.length)]
    pw += numbers[Math.floor(Math.random() * numbers.length)]
    pw += symbols[Math.floor(Math.random() * symbols.length)]
    for (let i = 4; i < 12; i++) pw += all[Math.floor(Math.random() * all.length)]
    return pw.split('').sort(() => Math.random() - 0.5).join('')
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function openPwModal(u: SystemUser) {
    setNewPw('')
    setShowNewPw(false)
    setCopied(false)
    setPwModal({ open: true, user: u })
  }

  async function handleChangePw() {
    if (!newPw.trim() || !pwModal.user) return
    setSavingPw(true)
    try {
      await callEdgeFunction('update_password', {
        auth_user_id: pwModal.user.auth_user_id,
        password: newPw.trim(),
      })
      // Also update plain-text record
      await supabase.from('usuarios').update({ password: newPw.trim() }).eq('id', pwModal.user.id)
      showToast(`Contraseña de @${pwModal.user.username} actualizada`, 'success')
      setPwModal({ open: false, user: null })
    } catch (err: unknown) {
      showToast('Error: ' + (err instanceof Error ? err.message : String(err)), 'error')
    }
    setSavingPw(false)
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  )

  function openNew() {
    setForm(emptyForm)
    setShowPass(false)
    setModal({ open: true, user: null })
  }

  function openEdit(u: SystemUser) {
    setForm({ username: u.username, password: '', name: u.name, role: u.role, avatar: u.avatar, active: u.active, phone: u.phone ?? '' })
    setShowPass(false)
    setModal({ open: true, user: u })
  }

  function close() { setModal({ open: false, user: null }) }

  function genAvatar(name: string) {
    const parts = name.trim().split(' ').filter(Boolean)
    if (parts.length === 0) return ''
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  async function handleSave() {
    if (!form.username.trim() || !form.name.trim()) return
    if (!modal.user && !form.password.trim()) return
    setSaving(true)
    const avatar = form.avatar || genAvatar(form.name)

    try {
      if (modal.user) {
        // Update profile in usuarios table (name, role, avatar, active)
        await supabase.from('usuarios').update({
          username: form.username.trim(),
          name: form.name.trim(),
          role: form.role,
          avatar,
          active: form.active,
          phone: form.phone.trim() || null,
        }).eq('id', modal.user.id)

        // Update password via Edge Function only if a new password was typed
        if (form.password.trim()) {
          await callEdgeFunction('update_password', {
            auth_user_id: modal.user.auth_user_id,
            password: form.password.trim(),
          })
        }

        setData(prev => prev.map(u => u.id === modal.user!.id
          ? { ...u, username: form.username.trim(), name: form.name.trim(), role: form.role, avatar, active: form.active, phone: form.phone.trim() || undefined }
          : u
        ))
        showToast('Usuario actualizado', 'success')
      } else {
        // Create via Edge Function
        const result = await callEdgeFunction('create_user', {
          username: form.username.trim(),
          password: form.password.trim(),
          name: form.name.trim(),
          role: form.role,
          avatar,
        })
        await refetch()
        showToast(`Usuario @${form.username.trim()} creado`, 'success')
        console.log(result)
      }
      close()
    } catch (err: unknown) {
      showToast('Error: ' + (err instanceof Error ? err.message : String(err)), 'error')
    }
    setSaving(false)
  }

  async function toggleActive(u: SystemUser) {
    await supabase.from('usuarios').update({ active: !u.active }).eq('id', u.id)
    setData(prev => prev.map(x => x.id === u.id ? { ...x, active: !x.active } : x))
  }

  async function handleDelete(u: SystemUser) {
    try {
      await callEdgeFunction('delete_user', { auth_user_id: u.auth_user_id, usuario_id: u.id })
      setData(prev => prev.filter(x => x.id !== u.id))
      showToast('Usuario eliminado', 'success')
    } catch (err: unknown) {
      showToast('Error al eliminar: ' + (err instanceof Error ? err.message : String(err)), 'error')
    }
    setConfirmDel(null)
  }

  const iStyle: React.CSSProperties = {
    width: '100%', height: 40, padding: '0 12px', borderRadius: 8,
    border: '1.5px solid #e2e8f0', fontSize: 13, color: '#1a2535',
    background: '#fafafa', outline: 'none',
  }
  const lStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 5 }

  return (
    <FadeContent className="app-page users-page" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="page-toolbar" style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a2535', margin: 0 }}>Usuarios del sistema</h2>
          <p style={{ fontSize: 13, color: '#8a9ab0', margin: '2px 0 0' }}>{users.length} usuario{users.length !== 1 ? 's' : ''} registrados</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            placeholder="Buscar usuario…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ height: 36, padding: '0 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, width: 200, outline: 'none' }}
          />
          {currentUser?.role === 'admin' && (
            <button onClick={openNew} style={{
              background: '#5b84b1', color: '#fff', border: 'none', borderRadius: 8,
              padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>+ Nuevo usuario</button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="stat-grid-3" style={{ gap: 12 }}>
        {(['admin','doctor','recepcion'] as const).map(r => {
          const rc = ROLE_COLORS[r]
          const count = users.filter(u => u.role === r).length
          return (
            <div className="ui-stat" key={r} style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: `1px solid ${rc.color}38` }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: rc.color }}>{count}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: rc.color, marginTop: 2 }}>{rc.label}{count !== 1 ? 's' : ''}</div>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div className="ui-card ui-table-panel" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {loading ? (
          <LoadingState label="Cargando usuarios" />
        ) : (
          <>
            {/* ── Desktop table ── */}
            <div className="table-scroll hide-mobile">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                    {['Usuario', 'Nombre', 'Rol', 'Estado', 'Acciones'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#8a9ab0', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#8a9ab0', fontSize: 13 }}>
                      {users.length === 0 ? 'Sin usuarios registrados' : 'Sin resultados'}
                    </td></tr>
                  ) : filtered.map(u => {
                    const rc = ROLE_COLORS[u.role]
                    const isSelf = currentUser?.username === u.username
                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid #f0f2f5', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fafbff'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: rc.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{u.avatar}</div>
                            <div>
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#1a2535' }}>@{u.username}</span>
                              {isSelf && <span style={{ fontSize: 10, marginLeft: 6, padding: '1px 6px', borderRadius: 10, background: '#e8f0f8', color: '#5b84b1', fontWeight: 700 }}>Tú</span>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#4a5568' }}>{u.name}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: rc.bg, color: rc.color }}>{rc.label}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <button onClick={() => toggleActive(u)} disabled={isSelf} style={{
                            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, border: 'none', cursor: isSelf ? 'default' : 'pointer',
                            background: u.active ? '#edf7e2' : '#f5f5f5', color: u.active ? '#8db84a' : '#8a9ab0',
                            opacity: isSelf ? 0.6 : 1,
                          }}>
                            {u.active ? 'Activo' : 'Inactivo'}
                          </button>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => openEdit(u)} style={{ padding: '5px 12px', borderRadius: 7, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 12, fontWeight: 600, color: '#4a5568', cursor: 'pointer' }}>Editar</button>
                            <button onClick={() => openPwModal(u)} title="Cambiar contraseña" style={{ padding: '5px 10px', borderRadius: 7, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, cursor: 'pointer' }}>🔑</button>
                            {!isSelf && (
                              <button onClick={() => setConfirmDel(u)} style={{ padding: '5px 10px', borderRadius: 7, border: 'none', background: '#fef2f2', fontSize: 12, fontWeight: 600, color: '#e74c3c', cursor: 'pointer' }}>✕</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile card list ── */}
            <div className="hide-desktop">
              {filtered.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#8a9ab0', fontSize: 13 }}>
                  {users.length === 0 ? 'Sin usuarios registrados' : 'Sin resultados'}
                </div>
              ) : filtered.map((u, i) => {
                const rc = ROLE_COLORS[u.role] ?? ROLE_COLORS.recepcion
                const isSelf = currentUser?.username === u.username
                return (
                  <div key={u.id} onClick={() => setMobileDetail(u)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                    borderBottom: i < filtered.length - 1 ? '1px solid #f0f2f5' : 'none',
                    cursor: 'pointer', background: '#fff',
                  }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: rc.color, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                      {u.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1a2535', display: 'flex', alignItems: 'center', gap: 6 }}>
                        @{u.username}
                        {isSelf && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: '#e8f0f8', color: '#5b84b1', fontWeight: 700 }}>Tú</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#8a9ab0', marginTop: 2 }}>{u.name}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                      background: rc.bg, color: rc.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {rc.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Mobile detail bottom sheet ── */}
      {mobileDetail && (() => {
        const rc = ROLE_COLORS[mobileDetail.role] ?? ROLE_COLORS.recepcion
        const isSelf = currentUser?.username === mobileDetail.username
        return (
          <div onClick={() => setMobileDetail(null)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'flex-end',
          }}>
            <div onClick={e => e.stopPropagation()} style={{
              background: '#fff', borderRadius: '20px 20px 0 0', width: '100%',
              paddingBottom: 'env(safe-area-inset-bottom)', animation: 'slideUp 0.25s ease',
            }}>
              {/* Handle */}
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e2e8f0', margin: '12px auto 4px' }} />

              {/* Header */}
              <div style={{ padding: '12px 20px 16px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid #f0f2f5' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: rc.color, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, flexShrink: 0 }}>
                  {mobileDetail.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#1a2535' }}>@{mobileDetail.username}</div>
                  <div style={{ fontSize: 13, color: '#8a9ab0', marginTop: 1 }}>{mobileDetail.name}</div>
                </div>
                <button onClick={() => setMobileDetail(null)} style={{
                  background: '#f5f7fa', border: 'none', borderRadius: '50%', width: 32, height: 32,
                  fontSize: 18, color: '#4a5568', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>×</button>
              </div>

              {/* Info chips */}
              <div style={{ padding: '14px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#8a9ab0', letterSpacing: '0.5px', marginBottom: 6 }}>ROL</div>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: rc.bg, color: rc.color }}>{rc.label}</span>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#8a9ab0', letterSpacing: '0.5px', marginBottom: 6 }}>ESTADO</div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: mobileDetail.active ? '#8db84a' : '#8a9ab0' }}>
                    {mobileDetail.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {currentUser?.role === 'admin' && (
                  <button onClick={() => { setMobileDetail(null); openEdit(mobileDetail) }} style={{
                    width: '100%', padding: '13px', borderRadius: 10, border: '1.5px solid #e2e8f0',
                    background: '#fff', fontSize: 14, fontWeight: 700, color: '#1a2535', cursor: 'pointer',
                  }}>Editar usuario</button>
                )}
                {!isSelf && currentUser?.role === 'admin' && (
                  <button onClick={() => {
                    toggleActive(mobileDetail)
                    setMobileDetail(prev => prev ? { ...prev, active: !prev.active } : null)
                  }} style={{
                    width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                    background: mobileDetail.active ? '#fff8e6' : '#f0f7e6',
                    fontSize: 14, fontWeight: 700,
                    color: mobileDetail.active ? '#c9920a' : '#7aa33d', cursor: 'pointer',
                  }}>
                    {mobileDetail.active ? 'Desactivar' : 'Activar'}
                  </button>
                )}
                {!isSelf && currentUser?.role === 'admin' && (
                  <button onClick={() => { setMobileDetail(null); setConfirmDel(mobileDetail) }} style={{
                    width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                    background: '#fef2f2', fontSize: 14, fontWeight: 700, color: '#e74c3c', cursor: 'pointer',
                  }}>Eliminar usuario</button>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Add/Edit Modal ── */}
      {modal.open && (
        <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #5b84b1, #7aa3c9)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: 16, fontWeight: 800 }}>{modal.user ? 'Editar usuario' : 'Nuevo usuario'}</h3>
                <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
                  {modal.user ? `@${modal.user.username}` : 'Completa los datos'}
                </p>
              </div>
              <button onClick={close} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '6px 10px', color: '#fff', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={lStyle}>Usuario *</label>
                  <input style={iStyle} value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="ej. maria_r" />
                </div>
                <div>
                  <label style={lStyle}>{modal.user ? 'Nueva contraseña' : 'Contraseña *'}</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        style={{ ...iStyle, paddingRight: 36 }}
                        type={showPass ? 'text' : 'password'}
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        placeholder={modal.user ? 'Dejar vacío para no cambiar' : '••••••'}
                      />
                      <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8a9ab0', padding: 0, fontSize: 14 }}>
                        {showPass ? <Icon name="eyeOff" size={14} /> : <Icon name="eye" size={14} />}
                      </button>
                    </div>
                    <button type="button" onClick={() => { const p = generateSecurePassword(); setForm(f => ({ ...f, password: p })); setShowPass(true) }}
                      title="Generar contraseña segura"
                      style={{ height: 40, padding: '0 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: 12, fontWeight: 700, color: '#5b84b1', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      ⚡ Generar
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label style={lStyle}>Nombre completo *</label>
                <input style={iStyle} value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value, avatar: genAvatar(e.target.value) }))}
                  placeholder="Nombre completo" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={lStyle}>Rol *</label>
                  <select style={{ ...iStyle, cursor: 'pointer' }} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as any }))}>
                    <option value="admin">Administrador</option>
                    <option value="doctor">Fisioterapeuta</option>
                    <option value="recepcion">Recepcionista</option>
                  </select>
                </div>
                <div>
                  <label style={lStyle}>Iniciales (avatar)</label>
                  <input style={iStyle} value={form.avatar} maxLength={2}
                    onChange={e => setForm(f => ({ ...f, avatar: e.target.value.toUpperCase() }))}
                    placeholder={genAvatar(form.name) || 'AA'} />
                </div>
              </div>

              <div>
                <label style={lStyle}>Teléfono WhatsApp <span style={{ color: '#8a9ab0', fontWeight: 400 }}>(para notificaciones)</span></label>
                <input style={iStyle} value={form.phone} type="tel"
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="Ej: 2721234567" />
              </div>

              {modal.user && (
                <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5568', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                  Usuario activo
                </label>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={close} style={{ flex: 1, height: 40, borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#4a5568', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.username.trim() || !form.name.trim() || (!modal.user && !form.password.trim())}
                  style={{
                    flex: 2, height: 40, borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    background: (saving || !form.username.trim() || !form.name.trim() || (!modal.user && !form.password.trim())) ? '#c5d8ea' : '#5b84b1',
                    color: '#fff',
                  }}
                >
                  {saving ? 'Guardando…' : modal.user ? 'Guardar cambios' : 'Crear usuario'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Change Password Modal ── */}
      {pwModal.open && pwModal.user && (
        <div onClick={() => setPwModal({ open: false, user: null })} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #5b84b1, #7aa3c9)', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: 15, fontWeight: 800 }}>Cambiar contraseña</h3>
                <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>@{pwModal.user.username} · {pwModal.user.name}</p>
              </div>
              <button onClick={() => setPwModal({ open: false, user: null })} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '6px 10px', color: '#fff', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Password field */}
              <div>
                <label style={lStyle}>Nueva contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input
                    style={{ ...iStyle, paddingRight: 40, fontFamily: showNewPw ? 'inherit' : 'monospace', letterSpacing: showNewPw ? 'normal' : '2px' }}
                    type={showNewPw ? 'text' : 'password'}
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    placeholder="Escribe o genera una contraseña"
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowNewPw(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8a9ab0', padding: 0 }}>
                    <Icon name={showNewPw ? 'eyeOff' : 'eye'} size={15} />
                  </button>
                </div>
              </div>

              {/* Generator + Copy */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => { const p = generateSecurePassword(); setNewPw(p); setShowNewPw(true); setCopied(false) }}
                  style={{ flex: 1, height: 38, borderRadius: 8, border: '1.5px solid #5b84b1', background: '#e8f0f8', fontSize: 13, fontWeight: 700, color: '#5b84b1', cursor: 'pointer' }}>
                  ⚡ Generar segura
                </button>
                <button type="button" onClick={() => copyToClipboard(newPw)} disabled={!newPw}
                  style={{ height: 38, padding: '0 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: copied ? '#f0f7e6' : '#fff', fontSize: 13, fontWeight: 700, color: copied ? '#7aa33d' : '#4a5568', cursor: newPw ? 'pointer' : 'not-allowed', opacity: newPw ? 1 : 0.5 }}>
                  {copied ? '✓ Copiado' : '📋 Copiar'}
                </button>
              </div>

              {/* Strength hint */}
              {newPw && (
                <div style={{ fontSize: 11, color: newPw.length >= 10 ? '#7aa33d' : newPw.length >= 6 ? '#c9920a' : '#e74c3c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ height: 4, borderRadius: 2, background: '#f0f2f5', flex: 1, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 2, width: `${Math.min(100, newPw.length * 8)}%`, background: newPw.length >= 10 ? '#7aa33d' : newPw.length >= 6 ? '#c9920a' : '#e74c3c', transition: 'width 0.3s, background 0.3s' }} />
                  </div>
                  {newPw.length >= 10 ? 'Contraseña fuerte' : newPw.length >= 6 ? 'Contraseña aceptable' : 'Muy corta'}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => setPwModal({ open: false, user: null })} style={{ flex: 1, height: 40, borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#4a5568', cursor: 'pointer' }}>Cancelar</button>
                <button onClick={handleChangePw} disabled={savingPw || !newPw.trim()}
                  style={{ flex: 2, height: 40, borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: (savingPw || !newPw.trim()) ? 'not-allowed' : 'pointer', background: (savingPw || !newPw.trim()) ? '#c5d8ea' : '#5b84b1', color: '#fff' }}>
                  {savingPw ? 'Guardando…' : 'Actualizar contraseña'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {confirmDel && (
        <div onClick={() => setConfirmDel(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 360, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Icon name="alertTriangle" size={26} color="#e74c3c" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a2535', margin: '0 0 8px' }}>¿Eliminar usuario?</h3>
            <p style={{ fontSize: 13, color: '#8a9ab0', margin: '0 0 24px' }}>
              Se eliminará <strong style={{ color: '#1a2535' }}>@{confirmDel.username}</strong> permanentemente.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDel(null)} style={{ flex: 1, height: 40, borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#4a5568', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => handleDelete(confirmDel)} style={{ flex: 1, height: 40, borderRadius: 8, border: 'none', background: '#e74c3c', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </FadeContent>
  )
}
