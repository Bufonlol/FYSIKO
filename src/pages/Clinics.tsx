import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Consultorio, ConsultorioEstado } from '../types'
import { FadeContent } from '../components/animations'
import { useStore } from '../store/useStore'
import { Icon } from '../components/ui/Icon'
import { EmptyState, LoadingState } from '../components/ui/FeedbackState'

const STATUS_STYLES: Record<ConsultorioEstado, {
  border: string; badge: string; badgeColor: string; label: string; dot: string
}> = {
  ocupado:      { border: '#5b84b1', badge: '#e8f0f8', badgeColor: '#5b84b1', label: 'Ocupado',      dot: '#5b84b1' },
  disponible:   { border: '#8db84a', badge: '#f0f7e6', badgeColor: '#7aa33d', label: 'Disponible',   dot: '#8db84a' },
  mantenimiento:{ border: '#e07b54', badge: '#fef0e8', badgeColor: '#e07b54', label: 'Mantenimiento',dot: '#e07b54' },
  en_descanso:  { border: '#e9c46a', badge: '#fffae6', badgeColor: '#c9920a', label: 'Descanso',     dot: '#e9c46a' },
}

const ESTADO_OPTIONS: ConsultorioEstado[] = ['disponible', 'ocupado', 'mantenimiento', 'en_descanso']

const DEFAULT_EQ = ['Camilla', 'Equipo de diagnóstico', 'Ultrasonido']

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1.5px solid #e2e8f0', fontSize: 13, color: '#1a2535',
  outline: 'none', boxSizing: 'border-box', background: '#fff',
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: '#8a9ab0',
  letterSpacing: '0.5px', marginBottom: 5, display: 'block',
}

export function Clinics() {
  const [consultorios, setConsultorios] = useState<Consultorio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editConsultorio, setEditConsultorio] = useState<Consultorio | null>(null)
  const [saving, setSaving] = useState(false)
  const showToast = useStore(s => s.showToast)

  const [form, setForm] = useState({
    nombre: '',
    estado: 'disponible' as ConsultorioEstado,
    equipamiento: DEFAULT_EQ.join(', '),
  })

  function openEdit(c: Consultorio) {
    setEditConsultorio(c)
    setForm({
      nombre: c.nombre,
      estado: c.estado,
      equipamiento: c.equipamiento.join(', '),
    })
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditConsultorio(null)
    setForm({ nombre: '', estado: 'disponible', equipamiento: DEFAULT_EQ.join(', ') })
  }

  async function fetchConsultorios() {
    setLoading(true)
    const { data, error } = await supabase
      .from('consultorios')
      .select('*')
      .order('id', { ascending: true })
    if (error) {
      setError(error.message)
    } else {
      setConsultorios(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchConsultorios() }, [])

  async function handleAdd() {
    if (!form.nombre.trim()) return
    setSaving(true)
    const eq = form.equipamiento.split(',').map(s => s.trim()).filter(Boolean)
    const { error } = await supabase.from('consultorios').insert({
      nombre: form.nombre.trim(),
      estado: form.estado,
      equipamiento: eq,
    })
    if (error) { showToast('Error al guardar: ' + error.message, 'error') }
    else {
      closeModal()
      showToast('Consultorio agregado', 'success')
      await fetchConsultorios()
    }
    setSaving(false)
  }

  async function handleEdit() {
    if (!editConsultorio || !form.nombre.trim()) return
    setSaving(true)
    const eq = form.equipamiento.split(',').map(s => s.trim()).filter(Boolean)
    const { error } = await supabase.from('consultorios').update({
      nombre: form.nombre.trim(),
      estado: form.estado,
      equipamiento: eq,
    }).eq('id', editConsultorio.id)
    if (error) { showToast('Error al guardar: ' + error.message, 'error') }
    else {
      setConsultorios(prev => prev.map(c => c.id === editConsultorio.id
        ? { ...c, nombre: form.nombre.trim(), estado: form.estado, equipamiento: eq }
        : c))
      showToast('Consultorio actualizado', 'success')
      closeModal()
    }
    setSaving(false)
  }

  async function handleStatusChange(id: number, estado: ConsultorioEstado) {
    await supabase.from('consultorios').update({ estado }).eq('id', id)
    setConsultorios(prev => prev.map(c => c.id === id ? { ...c, estado } : c))
  }

  const total = consultorios.length
  const ocupados = consultorios.filter(c => c.estado === 'ocupado').length
  const disponibles = consultorios.filter(c => c.estado === 'disponible').length

  return (
    <div className="app-page clinics-page" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <FadeContent delay={0}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { label: 'Total', value: total, color: '#5b84b1' },
              { label: 'Ocupados', value: ocupados, color: '#e07b54' },
              { label: 'Disponibles', value: disponibles, color: '#8db84a' },
            ].map(stat => (
              <div className="ui-stat" key={stat.label} style={{
                background: '#fff', borderRadius: 10, padding: '10px 18px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                border: `1px solid ${stat.color}38`,
                minWidth: 80, textAlign: 'center',
              }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: '#8a9ab0', fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#5b84b1', color: '#fff', border: 'none',
              borderRadius: 10, padding: '10px 20px', fontSize: 13,
              fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(91,132,177,0.3)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'translateY(-1px)'
              el.style.boxShadow = '0 6px 18px rgba(91,132,177,0.4)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'none'
              el.style.boxShadow = '0 4px 12px rgba(91,132,177,0.3)'
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
            Agregar Consultorio
          </button>
        </div>
      </FadeContent>

      {/* Error */}
      {error && (
        <div style={{
          background: '#fef0e8', border: '1px solid #e07b54', borderRadius: 10,
          padding: '12px 16px', color: '#e07b54', fontSize: 13,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <LoadingState label="Cargando consultorios" />
      ) : consultorios.length === 0 ? (
        <EmptyState icon="clinics" title="Sin consultorios registrados" description="Agrega el primer consultorio para comenzar." />
      ) : (
        <div className="card-grid-sm" style={{ gap: 20 }}>
          {consultorios.map((c, i) => {
            const st = STATUS_STYLES[c.estado]
            return (
              <FadeContent key={c.id} delay={i * 60} style={{ height: '100%' }}>
                <div className="ui-card" style={{
                  background: '#fff', borderRadius: 16,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  overflow: 'hidden', display: 'flex', flexDirection: 'column',
                  height: '100%', transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(-4px)'
                    el.style.boxShadow = '0 12px 32px rgba(0,0,0,0.13)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'none'
                    el.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'
                  }}
                >
                  {/* Card header with color accent */}
                  <div style={{
                    background: `${st.border}12`,
                    borderBottom: `3px solid ${st.border}`,
                    padding: '14px 18px',
                  }}>
                    {/* Icon + status row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: `${st.border}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon name="clinics" size={16} color={st.border} />
                      </div>
                      <select
                        value={c.estado}
                        onChange={e => handleStatusChange(c.id, e.target.value as ConsultorioEstado)}
                        style={{
                          fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 20,
                          background: st.badge, color: st.badgeColor,
                          border: `1.5px solid ${st.border}40`, cursor: 'pointer', outline: 'none',
                          flexShrink: 0,
                      }}
                    >
                      {ESTADO_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{STATUS_STYLES[opt].label}</option>
                      ))}
                    </select>
                  </div>
                    {/* Title — full width, no truncation */}
                    <h3 style={{
                      fontSize: 15, fontWeight: 800, color: '#1a2535', margin: 0,
                    }}>{c.nombre}</h3>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Equipamiento */}
                    {c.equipamiento.length > 0 && (
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#8a9ab0', letterSpacing: '0.8px', marginBottom: 8 }}>
                          EQUIPAMIENTO
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          {c.equipamiento.map(eq => (
                            <div key={eq} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot, flexShrink: 0 }} />
                              <span style={{ fontSize: 12, color: '#4a5568' }}>{eq}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Edit button always at bottom */}
                    <button onClick={() => openEdit(c)} style={{
                      marginTop: 'auto', width: '100%', padding: '9px 0', borderRadius: 10,
                      border: `1.5px solid ${st.border}50`, background: st.badge,
                      color: st.badgeColor, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      transition: 'opacity 0.15s',
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.8' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                    >Editar</button>
                  </div>
                </div>
              </FadeContent>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16,
        }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div style={{
            background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            animation: 'fadeUp 0.25s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1a2535', margin: 0 }}>
                {editConsultorio ? 'Editar Consultorio' : 'Nuevo Consultorio'}
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: '#f1f5f9', border: 'none', borderRadius: 8,
                  width: 30, height: 30, cursor: 'pointer', fontSize: 16, color: '#8a9ab0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>NOMBRE *</label>
                <input
                  style={inputStyle}
                  placeholder="Ej: Consultorio 4"
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                />
              </div>

              <div>
                <label style={labelStyle}>ESTADO</label>
                <select
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  value={form.estado}
                  onChange={e => setForm(f => ({ ...f, estado: e.target.value as ConsultorioEstado }))}
                >
                  {ESTADO_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{STATUS_STYLES[opt].label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>EQUIPAMIENTO (separado por comas)</label>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 68 }}
                  placeholder="Camilla, Equipo de diagnóstico, Ultrasonido"
                  value={form.equipamiento}
                  onChange={e => setForm(f => ({ ...f, equipamiento: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button
                onClick={closeModal}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 10, border: '1.5px solid #e2e8f0',
                  background: '#fff', color: '#8a9ab0', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={editConsultorio ? handleEdit : handleAdd}
                disabled={saving || !form.nombre.trim()}
                style={{
                  flex: 2, padding: '11px 0', borderRadius: 10, border: 'none',
                  background: !form.nombre.trim() ? '#b0c4d8' : '#5b84b1',
                  color: '#fff', fontWeight: 700, fontSize: 13,
                  cursor: !form.nombre.trim() ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(91,132,177,0.25)',
                  transition: 'background 0.2s',
                }}
              >
                {saving ? 'Guardando…' : editConsultorio ? 'Guardar cambios' : 'Guardar Consultorio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
