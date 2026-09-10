import { useState } from 'react'
import { useDoctores, useUsuarios } from '../lib/hooks'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'
import { TiltCard, FadeContent, CountUp } from '../components/animations'
import { Icon } from '../components/ui/Icon'
import { EmptyState, LoadingState } from '../components/ui/FeedbackState'
import type { Doctor } from '../types'

const iStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1.5px solid #e2e8f0', fontSize: 13, color: '#1a2535',
  outline: 'none', boxSizing: 'border-box', background: '#fff',
}
const lStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: '#8a9ab0',
  letterSpacing: '0.5px', marginBottom: 5, display: 'block',
}

const COLORS = ['#5b84b1','#8db84a','#e07b54','#9b59b6','#e74c3c','#e9c46a','#2c3e50','#27ae60']

const EMPTY_FORM = {
  name: '', specialty: '', schedule: '', color: '#5b84b1', avatar: '',
  phone: '', es_admin: false, recibir_resumen: true,
}

export function Doctors() {
  const { data: doctors, loading, setData, refetch } = useDoctores()
  const { data: usuarios } = useUsuarios()
  const currentUser = useStore(s => s.currentUser)
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'agenda_admin'
  const searchQuery = useStore(s => s.searchQuery)
  const [showModal, setShowModal] = useState(false)
  const [editDoc, setEditDoc] = useState<Doctor | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [detailDoc, setDetailDoc] = useState<Doctor | null>(null)
  const [confirmDel, setConfirmDel] = useState<Doctor | null>(null)
  const [newCredentials, setNewCredentials] = useState<{ username: string; password: string; name: string } | null>(null)
  const [visiblePassId, setVisiblePassId] = useState<number | null>(null)
  const showToast = useStore(s => s.showToast)

  function getUsuario(doc: Doctor) {
    return usuarios.find(u => u.name === doc.name && u.role === 'doctor') ?? null
  }

  async function handleDelete() {
    if (!confirmDel) return
    const { error } = await supabase.from('doctores').delete().eq('id', confirmDel.id)
    if (error) { showToast('Error al eliminar: ' + error.message, 'error'); return }
    setData(prev => prev.filter(d => d.id !== confirmDel.id))
    showToast('Fisioterapeuta eliminado', 'success')
    setConfirmDel(null)
  }

  function openNew() {
    setEditDoc(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEdit(doc: Doctor) {
    setEditDoc(doc)
    setForm({
      name: doc.name, specialty: doc.specialty,
      schedule: doc.schedule, color: doc.color, avatar: doc.avatar,
      phone: doc.phone ?? '', es_admin: doc.es_admin ?? false, recibir_resumen: doc.recibir_resumen ?? true,
    })
    setDetailDoc(null)
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.specialty.trim()) return
    setSaving(true)
    const initials = form.avatar.trim() || form.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    const payload = {
      name: form.name.trim(), specialty: form.specialty.trim(),
      clinic: 1, schedule: form.schedule.trim(),
      color: form.color, avatar: initials,
      phone: form.phone.trim() || undefined,
      es_admin: form.es_admin,
      recibir_resumen: form.recibir_resumen,
    }
    if (editDoc) {
      const { error } = await supabase.from('doctores').update(payload).eq('id', editDoc.id)
      if (error) { showToast('Error: ' + error.message, 'error') }
      else {
        setData(prev => prev.map(d => d.id === editDoc.id
          ? { ...d, ...payload, weekAppointments: d.weekAppointments, rating: d.rating }
          : d))
        showToast('Fisioterapeuta actualizado', 'success')
        setShowModal(false)
      }
    } else {
      const { data: rpcData, error } = await supabase.rpc('create_doctor_with_user', {
        p_name: payload.name,
        p_specialty: payload.specialty,
        p_clinic: payload.clinic,
        p_schedule: payload.schedule,
        p_color: payload.color,
        p_avatar: initials,
      })
      if (error) { showToast('Error: ' + error.message, 'error') }
      else {
        await refetch()
        setShowModal(false)
        setNewCredentials({ username: rpcData.username, password: rpcData.password, name: payload.name })
      }
    }
    setSaving(false)
  }

  const filteredDoctors = doctors.filter(d =>
    !searchQuery ||
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="app-page doctors-page" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="page-toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 13, color: '#8a9ab0' }}>
          {loading ? 'Cargando...' : `${filteredDoctors.length} fisioterapeutas registrados`}
        </p>
        <button onClick={openNew} style={{
          padding: '8px 16px', borderRadius: 8, background: '#8db84a', color: '#fff',
          fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: '0 4px 12px rgba(141,184,74,0.3)',
        }}>
          <Icon name="plus" size={14} /> Nuevo fisioterapeuta
        </button>
      </div>

      {loading ? (
        <LoadingState label="Cargando fisioterapeutas" />
      ) : filteredDoctors.length === 0 ? (
        <EmptyState
          icon="doctors"
          title={doctors.length === 0 ? 'Sin fisioterapeutas registrados' : 'Sin resultados'}
          description={doctors.length === 0 ? 'Agrega el primer fisioterapeuta al equipo.' : 'Intenta con otro término de búsqueda.'}
        />
      ) : (
        <div className="card-grid-sm" style={{ gap: 16 }}>
          {filteredDoctors.map((doc, i) => {
            return (
              <FadeContent key={doc.id} delay={i * 60}>
                <TiltCard className="ui-card" intensity={3} style={{
                  background: '#fff', borderRadius: 12,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
                  cursor: 'pointer',
                }} onClick={() => setDetailDoc(doc)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 2 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: doc.color + '20', color: doc.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, fontWeight: 800, border: `2px solid ${doc.color}40`,
                    }}>{doc.avatar}</div>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2535' }}>{doc.name}</h3>
                      <p style={{ fontSize: 12, color: '#4a5568', marginTop: 2 }}>{doc.specialty}</p>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
                    background: '#f8fafc', borderRadius: 10, padding: 12,
                    position: 'relative', zIndex: 2,
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#1a2535' }}>
                        <CountUp to={doc.weekAppointments || 0} duration={1000} />
                      </div>
                      <div style={{ fontSize: 11, color: '#8a9ab0', fontWeight: 600 }}>Citas semana</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                        <span style={{ fontSize: 20, fontWeight: 800, color: '#1a2535' }}>
                          <CountUp to={doc.rating || 0} decimals={1} duration={1000} />
                        </span>
                        <Icon name="star" size={14} color="#e9c46a" />
                      </div>
                      <div style={{ fontSize: 11, color: '#8a9ab0', fontWeight: 600 }}>Calificación</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 2 }}>
                    <Icon name="clock" size={14} color="#8a9ab0" />
                    <span style={{ fontSize: 12, color: '#4a5568' }}>{doc.schedule}</span>
                  </div>

                  {isAdmin && (() => {
                    const u = getUsuario(doc)
                    if (!u) return null
                    const shown = visiblePassId === doc.id
                    return (
                      <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px', border: '1px solid #e2e8f0', position: 'relative', zIndex: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#8a9ab0', letterSpacing: '0.5px' }}>ACCESO</span>
                          <button onClick={e => { e.stopPropagation(); setVisiblePassId(shown ? null : doc.id) }}
                            style={{ fontSize: 10, fontWeight: 700, color: '#5b84b1', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            {shown ? 'Ocultar' : 'Ver contraseña'}
                          </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                          <Icon name="user" size={11} color="#8a9ab0" />
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#4a5568' }}>{u.username}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12, fontFamily: 'monospace', color: shown ? '#8db84a' : '#8a9ab0', letterSpacing: shown ? 1 : 2, flex: 1 }}>
                            {shown ? u.password : '••••••••'}
                          </span>
                          {shown && (
                            <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(u.password); showToast('Contraseña copiada', 'success') }}
                              style={{ fontSize: 10, color: '#5b84b1', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 700, flexShrink: 0 }}>
                              Copiar
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })()}

                  <div style={{ display: 'flex', gap: 8, position: 'relative', zIndex: 2 }}>
                    <button onClick={e => { e.stopPropagation(); setDetailDoc(doc) }} style={{
                      flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
                      background: '#5b84b1', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>Ver perfil</button>
                    <button onClick={e => { e.stopPropagation(); openEdit(doc) }} style={{
                      flex: 1, padding: '8px 0', borderRadius: 8,
                      border: '1.5px solid #e2e8f0', background: '#fff',
                      color: '#4a5568', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>Editar</button>
                    <button onClick={e => { e.stopPropagation(); setConfirmDel(doc) }} style={{
                      flex: 1, padding: '8px 0', borderRadius: 8,
                      border: '1.5px solid #fca5a5', background: '#fff',
                      color: '#e74c3c', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>Eliminar</button>
                  </div>
                </TiltCard>
              </FadeContent>
            )
          })}
        </div>
      )}

      {/* ── Detail modal ── */}
      {detailDoc && (() => {
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
            onClick={e => { if (e.target === e.currentTarget) setDetailDoc(null) }}
          >
            <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
              <div style={{ background: detailDoc.color, padding: '24px 24px 20px', position: 'relative' }}>
                <button onClick={() => setDetailDoc(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 18, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 12, border: '2px solid rgba(255,255,255,0.4)' }}>
                  {detailDoc.avatar}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{detailDoc.name}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{detailDoc.specialty}</div>
              </div>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {([
                    { label: 'Horario', value: detailDoc.schedule || '—' },
                    { label: 'Teléfono', value: detailDoc.phone || '—' },
                    { label: 'Citas esta semana', value: String(detailDoc.weekAppointments || 0) },
                    { label: 'Calificación', value: <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>{detailDoc.rating?.toFixed(1) ?? '—'} / 5.0 <Icon name="star" size={12} color="#f0c000" /></span> },
                  ] as { label: string; value: React.ReactNode }[]).map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#8a9ab0', letterSpacing: '0.5px', marginBottom: 2 }}>{label.toUpperCase()}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a2535' }}>{value}</div>
                    </div>
                  ))}
                </div>
                {isAdmin && (() => {
                  const u = getUsuario(detailDoc)
                  if (!u) return null
                  const shown = visiblePassId === detailDoc.id
                  return (
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', border: '1.5px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#8a9ab0', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="key" size={11} /> CREDENCIALES DE ACCESO</span>
                        <button onClick={() => setVisiblePassId(shown ? null : detailDoc.id)}
                          style={{ fontSize: 11, fontWeight: 700, color: '#5b84b1', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                          {shown ? 'Ocultar' : 'Mostrar'}
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <div style={{ fontSize: 10, color: '#8a9ab0', fontWeight: 700, marginBottom: 3 }}>USUARIO</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <code style={{ fontSize: 13, fontWeight: 700, color: '#5b84b1' }}>{u.username}</code>
                            <button onClick={() => { navigator.clipboard.writeText(u.username); showToast('Usuario copiado', 'success') }}
                              style={{ fontSize: 10, color: '#8a9ab0', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Icon name="clipboard" size={12} /></button>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: '#8a9ab0', fontWeight: 700, marginBottom: 3 }}>CONTRASEÑA</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <code style={{ fontSize: 13, fontWeight: 700, color: shown ? '#8db84a' : '#8a9ab0', fontFamily: 'monospace' }}>
                              {shown ? u.password : '••••••••'}
                            </code>
                            {shown && (
                              <button onClick={() => { navigator.clipboard.writeText(u.password); showToast('Contraseña copiada', 'success') }}
                                style={{ fontSize: 10, color: '#8a9ab0', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Icon name="clipboard" size={12} /></button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })()}
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button onClick={() => { setDetailDoc(null); openEdit(detailDoc) }} style={{
                    flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                    background: detailDoc.color, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}>Editar</button>
                  <button onClick={() => { setConfirmDel(detailDoc); setDetailDoc(null) }} style={{
                    flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                    background: '#e74c3c', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}>Eliminar</button>
                  <button onClick={() => setDetailDoc(null)} style={{
                    flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #e2e8f0',
                    background: '#fff', color: '#8a9ab0', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}>Cerrar</button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── New / Edit modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1a2535', margin: 0 }}>
                {editDoc ? 'Editar Fisioterapeuta' : 'Nuevo Fisioterapeuta'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 18, color: '#8a9ab0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={lStyle}>NOMBRE COMPLETO *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Lic. Ana Martínez" style={iStyle} />
              </div>
              <div>
                <label style={lStyle}>ESPECIALIDAD *</label>
                <input value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}
                  placeholder="Ej: Rehabilitación deportiva" style={iStyle} />
              </div>
              <div>
                <label style={lStyle}>INICIALES (avatar)</label>
                <input value={form.avatar} onChange={e => setForm(f => ({ ...f, avatar: e.target.value.toUpperCase().slice(0, 2) }))}
                  placeholder="Ej: AM" maxLength={2} style={iStyle} />
              </div>
              <div>
                <label style={lStyle}>HORARIO</label>
                <input value={form.schedule} onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))}
                  placeholder="Ej: Lun-Vie 9-18h" style={iStyle} />
              </div>
              <div>
                <label style={lStyle}>TELÉFONO WHATSAPP</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="Ej: 2721234567" style={iStyle} type="tel" />
              </div>
              <div>
                <label style={lStyle}>COLOR DE IDENTIFICACIÓN</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{
                      width: 28, height: 28, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                      outline: form.color === c ? `3px solid ${c}` : 'none',
                      outlineOffset: 2, transition: 'transform 0.15s',
                      transform: form.color === c ? 'scale(1.2)' : 'scale(1)',
                    }} />
                  ))}
                </div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', border: '1.5px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#8a9ab0', letterSpacing: '0.5px' }}>NOTIFICACIONES WHATSAPP</span>
                {[
                  { key: 'recibir_resumen', label: 'Resumen diario de sus citas', desc: 'Recibe su agenda personal cada mañana' },
                  { key: 'es_admin', label: 'Alertas de administración', desc: 'Stock bajo de inventario y resumen general' },
                ].map(({ key, label, desc }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a2535' }}>{label}</div>
                      <div style={{ fontSize: 11, color: '#8a9ab0', marginTop: 1 }}>{desc}</div>
                    </div>
                    <button
                      onClick={() => setForm(f => ({ ...f, [key]: !f[key as keyof typeof f] }))}
                      style={{
                        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', flexShrink: 0,
                        background: form[key as keyof typeof form] ? '#8db84a' : '#e2e8f0',
                        transition: 'background 0.2s', position: 'relative',
                        padding: 0, display: 'block',
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: 3, borderRadius: '50%', width: 18, height: 18,
                        background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        left: form[key as keyof typeof form] ? 23 : 3,
                        transition: 'left 0.2s', display: 'block',
                      }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: '11px 0', borderRadius: 10, border: '1.5px solid #e2e8f0',
                background: '#fff', color: '#8a9ab0', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}>Cancelar</button>
              <button onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.specialty.trim()}
                style={{
                  flex: 2, padding: '11px 0', borderRadius: 10, border: 'none',
                  background: (!form.name.trim() || !form.specialty.trim()) ? '#b0c4d8' : '#5b84b1',
                  color: '#fff', fontWeight: 700, fontSize: 13,
                  cursor: (!form.name.trim() || !form.specialty.trim()) ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(91,132,177,0.25)',
                }}
              >{saving ? 'Guardando…' : editDoc ? 'Guardar cambios' : 'Registrar doctor'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Credentials modal ── */}
      {newCredentials && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 420, boxShadow: '0 24px 80px rgba(0,0,0,0.25)', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0f7e6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Icon name="key" size={26} color="#8db84a" /></div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1a2535', marginBottom: 6 }}>Fisioterapeuta registrado</h3>
            <p style={{ fontSize: 13, color: '#8a9ab0', marginBottom: 24 }}>
              Guarda estas credenciales — la contraseña no se podrá ver después.
            </p>

            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20, marginBottom: 20, border: '1.5px solid #e2e8f0', textAlign: 'left' }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#8a9ab0', letterSpacing: '0.5px', marginBottom: 4 }}>FISIOTERAPEUTA</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a2535' }}>{newCredentials.name}</div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#8a9ab0', letterSpacing: '0.5px', marginBottom: 4 }}>USUARIO</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <code style={{ fontSize: 15, fontWeight: 700, color: '#5b84b1', background: '#e8f0f8', padding: '4px 10px', borderRadius: 6, flex: 1 }}>{newCredentials.username}</code>
                  <button onClick={() => { navigator.clipboard.writeText(newCredentials.username); showToast('Usuario copiado', 'success') }}
                    style={{ padding: '5px 10px', borderRadius: 6, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 12, color: '#8a9ab0' }}>Copiar</button>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#8a9ab0', letterSpacing: '0.5px', marginBottom: 4 }}>CONTRASEÑA</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <code style={{ fontSize: 15, fontWeight: 700, color: '#8db84a', background: '#f0f7e6', padding: '4px 10px', borderRadius: 6, flex: 1 }}>{newCredentials.password}</code>
                  <button onClick={() => { navigator.clipboard.writeText(newCredentials.password); showToast('Contraseña copiada', 'success') }}
                    style={{ padding: '5px 10px', borderRadius: 6, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 12, color: '#8a9ab0' }}>Copiar</button>
                </div>
              </div>
            </div>

            <button onClick={() => setNewCredentials(null)} style={{
              width: '100%', padding: '12px 0', borderRadius: 10, border: 'none',
              background: '#5b84b1', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(91,132,177,0.3)',
            }}>Entendido, ya lo guardé</button>
          </div>
        </div>
      )}

      {/* ── Confirm delete modal ── */}
      {confirmDel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>⚠️</div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a2535', marginBottom: 8 }}>¿Eliminar fisioterapeuta?</h3>
            <p style={{ fontSize: 13, color: '#4a5568', marginBottom: 24 }}>
              Se eliminará a <strong>{confirmDel.name}</strong>. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDel(null)} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#8a9ab0', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: 'none', background: '#e74c3c', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
