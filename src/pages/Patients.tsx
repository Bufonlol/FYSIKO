import { useState, useEffect } from 'react'
import { usePacientes, useDoctores, useExpediente, useNotasClinnicas, useRecetas } from '../lib/hooks'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'
import { FadeContent } from '../components/animations'
import { Icon } from '../components/ui/Icon'
import { EmptyState, LoadingState } from '../components/ui/FeedbackState'
import type { Patient, Doctor, RecetaMedicamento } from '../types'

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  activo:   { bg: '#f0f7e6', color: '#7aa33d', label: 'Activo' },
  nuevo:    { bg: '#e8f0f8', color: '#5b84b1', label: 'Nuevo' },
  pendiente:{ bg: '#fff8e6', color: '#c9920a', label: 'Pendiente' },
  inactivo: { bg: '#eef1f6', color: '#8a9ab0', label: 'Inactivo' },
}

const iStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1.5px solid #e2e8f0', fontSize: 13, color: '#1a2535',
  outline: 'none', boxSizing: 'border-box', background: '#fff',
}
const lStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: '#8a9ab0',
  letterSpacing: '0.5px', marginBottom: 5, display: 'block',
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

// Calcula la edad (años cumplidos) a partir de la fecha de nacimiento (YYYY-MM-DD)
function calcAge(fechaNacimiento: string): number {
  if (!fechaNacimiento) return 0
  const nac = new Date(fechaNacimiento + 'T12:00:00')
  if (isNaN(nac.getTime())) return 0
  const hoy = new Date()
  let edad = hoy.getFullYear() - nac.getFullYear()
  const m = hoy.getMonth() - nac.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
  return edad >= 0 && edad < 150 ? edad : 0
}

// ── ChipList ─────────────────────────────────────────────────────────────────
function ChipList({ items, onChange, placeholder, suggestions = [] }: {
  items: string[]; onChange: (v: string[]) => void
  placeholder: string; suggestions?: string[]
}) {
  const [input, setInput] = useState('')
  function add(val: string) {
    const v = val.trim()
    if (v && !items.includes(v)) onChange([...items, v])
    setInput('')
  }
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {items.map(item => (
          <span key={item} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: '#e8f0f8', color: '#5b84b1', fontSize: 12, fontWeight: 600 }}>
            {item}
            <button onClick={() => onChange(items.filter(i => i !== item))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5b84b1', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
          </span>
        ))}
      </div>
      {suggestions.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
          {suggestions.filter(s => !items.includes(s)).map(s => (
            <button key={s} onClick={() => add(s)} style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, border: '1.5px dashed #cbd5e1', background: 'transparent', color: '#8a9ab0', cursor: 'pointer' }}>+ {s}</button>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 6 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(input) } }}
          placeholder={placeholder}
          style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 12, outline: 'none' }} />
        <button onClick={() => add(input)} style={{ padding: '7px 12px', borderRadius: 8, background: '#5b84b1', color: '#fff', border: 'none', fontSize: 12, cursor: 'pointer' }}>+</button>
      </div>
    </div>
  )
}

// ── ExpedienteModal ───────────────────────────────────────────────────────────
function ExpedienteModal({ patient, doctors, onClose }: { patient: Patient; doctors: Doctor[]; onClose: () => void }) {
  const [tab, setTab] = useState<'historia' | 'notas' | 'recetas'>('historia')
  const showToast = useStore(s => s.showToast)
  const currentUser = useStore(s => s.currentUser)

  // ── Historia médica ──
  const { data: exp, loading: loadingExp, save: saveExp } = useExpediente(patient.id)
  const [hForm, setHForm] = useState({ bloodType: '', allergies: [] as string[], conditions: [] as string[], medications: [] as string[], emergencyContact: '', emergencyPhone: '', notes: '' })
  const [savingH, setSavingH] = useState(false)
  useEffect(() => {
    if (exp) setHForm({ bloodType: exp.bloodType, allergies: exp.allergies, conditions: exp.conditions, medications: exp.medications, emergencyContact: exp.emergencyContact, emergencyPhone: exp.emergencyPhone, notes: exp.notes })
  }, [exp])

  async function handleSaveHistoria() {
    setSavingH(true)
    await saveExp({ ...hForm, id: exp?.id, patientId: patient.id })
    showToast('Historia médica guardada', 'success')
    setSavingH(false)
  }

  // ── Notas clínicas ──
  const { data: notas, loading: loadingNotas, addNota } = useNotasClinnicas(patient.id)
  const [showNotaForm, setShowNotaForm] = useState(false)
  const [savingN, setSavingN] = useState(false)
  const today = new Date().toISOString().slice(0, 10)
  const myDoctor = currentUser?.role === 'doctor' ? doctors.find(d => d.name === currentUser.name) : null
  const [nForm, setNForm] = useState({ visitDate: today, motivo: '', hallazgos: '', diagnostico: '', tratamiento: '', indicaciones: '', seguimiento: '' })

  async function handleSaveNota() {
    setSavingN(true)
    await addNota({ patientId: patient.id, doctorId: myDoctor?.id, visitDate: nForm.visitDate, motivo: nForm.motivo, hallazgos: nForm.hallazgos, diagnostico: nForm.diagnostico, tratamiento: nForm.tratamiento, indicaciones: nForm.indicaciones, seguimiento: nForm.seguimiento || undefined })
    setNForm({ visitDate: today, motivo: '', hallazgos: '', diagnostico: '', tratamiento: '', indicaciones: '', seguimiento: '' })
    setShowNotaForm(false)
    showToast('Nota guardada', 'success')
    setSavingN(false)
  }

  // ── Recetas ──
  const { data: recetas, loading: loadingRecetas, addReceta } = useRecetas(patient.id)
  const [showRecetaForm, setShowRecetaForm] = useState(false)
  const [savingR, setSavingR] = useState(false)
  const emptyMed = (): RecetaMedicamento => ({ nombre: '', dosis: '', frecuencia: '', duracion: '', indicaciones: '' })
  const [rForm, setRForm] = useState({ visitDate: '', diagnostico: '', medicamentos: [emptyMed()], notas: '' })
  useEffect(() => {
    if (showRecetaForm) setRForm({ visitDate: new Date().toISOString().slice(0, 10), diagnostico: '', medicamentos: [emptyMed()], notas: '' })
  }, [showRecetaForm])

  function updateMed(idx: number, field: keyof RecetaMedicamento, val: string) {
    setRForm(f => { const m = [...f.medicamentos]; m[idx] = { ...m[idx], [field]: val }; return { ...f, medicamentos: m } })
  }

  async function handleSaveReceta() {
    setSavingR(true)
    await addReceta({ patientId: patient.id, doctorId: myDoctor?.id, visitDate: rForm.visitDate, diagnostico: rForm.diagnostico, medicamentos: rForm.medicamentos.filter(m => m.nombre.trim()), notas: rForm.notas })
    setShowRecetaForm(false)
    showToast('Receta guardada', 'success')
    setSavingR(false)
  }

  function printReceta(receta: import('../types').Receta) {
    const doc = doctors.find(d => d.id === receta.doctorId)
    const win = window.open('', '_blank', 'width=700,height=900')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><title>Receta — ${patient.name}</title><style>
      body{font-family:Georgia,serif;padding:40px;color:#1a2535;max-width:600px;margin:0 auto}
      h1{font-size:22px;margin:0 0 4px}h2{font-size:15px;font-weight:normal;color:#5b84b1;margin:0 0 24px}
      .sep{border:none;border-top:2px solid #1a2535;margin:16px 0}
      .label{font-size:10px;letter-spacing:1px;color:#8a9ab0;font-weight:bold;margin-bottom:4px}
      .field{font-size:14px;margin-bottom:16px}
      table{width:100%;border-collapse:collapse;margin:12px 0}
      th{text-align:left;font-size:10px;letter-spacing:1px;color:#8a9ab0;padding:6px 8px;border-bottom:2px solid #e2e8f0}
      td{font-size:13px;padding:8px;border-bottom:1px solid #f0f2f5;vertical-align:top}
      .footer{margin-top:60px;display:flex;justify-content:space-between;align-items:flex-end}
      .sig{text-align:center;border-top:1px solid #1a2535;padding-top:8px;width:200px;font-size:12px}
      @media print{body{padding:20px}}
    </style></head><body>
      <h1>FYSIKO</h1>
      <h2>${doc ? doc.name + ' — ' + doc.specialty : 'Fisioterapeuta'}</h2>
      <hr class="sep"/>
      <div class="label">PACIENTE</div><div class="field">${patient.name} &nbsp;·&nbsp; ${patient.age} años</div>
      <div class="label">FECHA</div><div class="field">${new Date(receta.visitDate + 'T12:00').toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'})}</div>
      <div class="label">DIAGNÓSTICO</div><div class="field">${receta.diagnostico || '—'}</div>
      <hr class="sep"/>
      <div class="label">MEDICAMENTOS</div>
      <table><thead><tr><th>Medicamento</th><th>Dosis</th><th>Frecuencia</th><th>Duración</th></tr></thead><tbody>
        ${receta.medicamentos.map(m=>`<tr><td><strong>${m.nombre}</strong>${m.indicaciones?'<br><small>'+m.indicaciones+'</small>':''}</td><td>${m.dosis}</td><td>${m.frecuencia}</td><td>${m.duracion}</td></tr>`).join('')}
      </tbody></table>
      ${receta.notas ? `<div class="label" style="margin-top:16px">NOTAS</div><div class="field">${receta.notas}</div>` : ''}
      <div class="footer">
        <div style="font-size:12px;color:#8a9ab0">Válida por 30 días</div>
        <div class="sig">${doc ? doc.name : 'Lic.'}<br><small style="color:#8a9ab0">Firma y sello</small></div>
      </div>
    </body></html>`)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 400)
  }

  function printExpediente() {
    const fmt = (d: string) => { try { return new Date(d + 'T12:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) } catch { return d } }
    const notasHTML = notas.length === 0 ? '<p class="empty">Sin notas clínicas registradas.</p>' :
      notas.map(n => { const doc = doctors.find(d => d.id === n.doctorId); return `<div class="card"><div class="card-head"><span class="date">${fmt(n.visitDate)}</span><span class="muted">${doc?.name ?? 'Fisioterapeuta'}</span></div>${n.motivo ? `<div><b>Motivo:</b> ${n.motivo}</div>` : ''}${n.diagnostico ? `<div><b>Diagnóstico:</b> ${n.diagnostico}</div>` : ''}${n.tratamiento ? `<div><b>Tratamiento:</b> ${n.tratamiento}</div>` : ''}${n.indicaciones ? `<div><b>Indicaciones:</b> ${n.indicaciones}</div>` : ''}${n.seguimiento ? `<div><b>Seguimiento:</b> ${n.seguimiento}</div>` : ''}</div>` }).join('')
    const recetasHTML = recetas.length === 0 ? '<p class="empty">Sin recetas registradas.</p>' :
      recetas.map(r => { const doc = doctors.find(d => d.id === r.doctorId); return `<div class="card"><div class="card-head"><span class="date">${fmt(r.visitDate)}</span><span class="muted">${doc?.name ?? 'Fisioterapeuta'}</span></div>${r.diagnostico ? `<div style="margin-bottom:8px"><b>Diagnóstico:</b> ${r.diagnostico}</div>` : ''}<table><thead><tr><th>Medicamento</th><th>Dosis</th><th>Frecuencia</th><th>Duración</th></tr></thead><tbody>${r.medicamentos.map(m => `<tr><td>${m.nombre}</td><td>${m.dosis}</td><td>${m.frecuencia}</td><td>${m.duracion}</td></tr>`).join('')}</tbody></table>${r.notas ? `<div style="margin-top:6px;color:#6b7280;font-size:11px">Notas: ${r.notas}</div>` : ''}</div>` }).join('')
    const today = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
    const css = `body{font-family:Arial,sans-serif;color:#1a2535;max-width:780px;margin:0 auto;padding:32px;font-size:13px}.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #5b84b1;padding-bottom:16px;margin-bottom:24px}h1{font-size:20px;margin:0;color:#5b84b1}.muted{font-size:11px;color:#8a9ab0}.section{margin-bottom:28px}h2{font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#5b84b1;border-bottom:1px solid #e2e8f0;padding-bottom:6px;margin-bottom:14px}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}.lbl{font-size:10px;font-weight:700;letter-spacing:.5px;color:#8a9ab0;margin-bottom:2px}.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}.chip{background:#e8f0f8;color:#5b84b1;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600}.card{border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin-bottom:10px;font-size:12px}.card-head{display:flex;justify-content:space-between;margin-bottom:8px}.date{font-weight:700}.empty{color:#8a9ab0;font-size:12px}table{width:100%;border-collapse:collapse;margin-bottom:8px}th{text-align:left;font-size:10px;letter-spacing:.8px;color:#8a9ab0;font-weight:700;padding:6px 8px;border-bottom:2px solid #e2e8f0;text-transform:uppercase}td{font-size:12px;padding:6px 8px;border-bottom:1px solid #f0f2f5}.footer{margin-top:40px;padding-top:14px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:10px;color:#b0bcc8}@media print{body{padding:16px}}`
    const html = `<!DOCTYPE html><html><head><title>Expediente — ${patient.name}</title><meta charset="UTF-8"><style>${css}</style></head><body>
      <div class="header"><div><h1>${patient.name}</h1><div class="muted">Expediente Clínico · ${patient.age} años${patient.phone ? ' · ' + patient.phone : ''}</div></div><div style="text-align:right"><strong style="color:#5b84b1;font-size:15px">FYSIKO</strong><div class="muted">Generado: ${today}</div></div></div>
      <div class="section"><h2>Historia Médica</h2><div class="grid2"><div><div class="lbl">TIPO DE SANGRE</div><div>${hForm.bloodType || '—'}</div></div><div><div class="lbl">CONTACTO DE EMERGENCIA</div><div>${hForm.emergencyContact || '—'}${hForm.emergencyPhone ? ' · ' + hForm.emergencyPhone : ''}</div></div></div>${hForm.allergies.length ? `<div style="margin-bottom:10px"><div class="lbl">ALERGIAS</div><div class="chips">${hForm.allergies.map(a => `<span class="chip">${a}</span>`).join('')}</div></div>` : ''}${hForm.conditions.length ? `<div style="margin-bottom:10px"><div class="lbl">PADECIMIENTOS</div><div class="chips">${hForm.conditions.map(c => `<span class="chip">${c}</span>`).join('')}</div></div>` : ''}${hForm.medications.length ? `<div style="margin-bottom:10px"><div class="lbl">MEDICAMENTOS</div><div class="chips">${hForm.medications.map(m => `<span class="chip">${m}</span>`).join('')}</div></div>` : ''}${hForm.notes ? `<div><div class="lbl">NOTAS</div><div>${hForm.notes}</div></div>` : ''}</div>
      <div class="section"><h2>Notas Clínicas</h2>${notasHTML}</div>
      <div class="section"><h2>Recetas</h2>${recetasHTML}</div>

      <div class="footer"><span>FYSIKO — Sistema de Gestión FYSIKO</span><span>Generado el ${today}</span></div>
    </body></html>`
    const win = window.open('', '_blank', 'width=850,height=1000')
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 500)
  }


  const lS: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#8a9ab0', letterSpacing: '0.5px', marginBottom: 4, display: 'block' }
  const iS: React.CSSProperties = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, color: '#1a2535', outline: 'none', boxSizing: 'border-box', background: '#fff' }

  return (
    <div className="expediente-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="expediente-modal" style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #5b84b1, #4a72a0)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' }}>
              {getInitials(patient.name)}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{patient.name}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>Expediente Clínico · {patient.age} años</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={printExpediente} title="Exportar expediente a PDF" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="reports" size={13} color="#fff" /> PDF
            </button>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 20, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-scroll" style={{ borderBottom: '2px solid #f0f2f5', background: '#fafbfc' }}>
          {([
            ['historia', 'hospital', 'Historia Médica'],
            ['notas', 'treatments', 'Notas Clínicas'],
            ['recetas', 'pill', 'Recetas'],

          ] as const).map(([key, icon, label]) => (
            <button key={key} onClick={() => setTab(key as typeof tab)} style={{
              padding: '12px 16px', fontSize: 13, fontWeight: 700, border: 'none',
              borderBottom: tab === key ? '2px solid #5b84b1' : '2px solid transparent',
              background: 'transparent', color: tab === key ? '#5b84b1' : '#8a9ab0',
              cursor: 'pointer', marginBottom: -2, transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
            }}><Icon name={icon as import('../components/ui/Icon').IconName} size={13} />{label}</button>
          ))}
        </div>

        {/* Body */}
        <div className="exp-body" style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

          {/* ── Tab: Historia Médica ── */}
          {tab === 'historia' && (
            loadingExp ? <div style={{ textAlign: 'center', color: '#8a9ab0', padding: 40 }}>Cargando…</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="exp-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={lS}>TIPO DE SANGRE</label>
                    <select value={hForm.bloodType} onChange={e => setHForm(f => ({ ...f, bloodType: e.target.value }))} style={iS}>
                      <option value="">Desconocido</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="exp-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={lS}>CONTACTO EMERGENCIA</label>
                      <input value={hForm.emergencyContact} onChange={e => setHForm(f => ({ ...f, emergencyContact: e.target.value }))} placeholder="Nombre" style={iS} />
                    </div>
                    <div>
                      <label style={lS}>TELÉFONO</label>
                      <input value={hForm.emergencyPhone} onChange={e => setHForm(f => ({ ...f, emergencyPhone: e.target.value }))} placeholder="55 0000-0000" style={iS} />
                    </div>
                  </div>
                </div>
                <div>
                  <label style={lS}>ALERGIAS</label>
                  <ChipList items={hForm.allergies} onChange={v => setHForm(f => ({ ...f, allergies: v }))} placeholder="Ej: Penicilina, Aspirina…" suggestions={['Penicilina','Aspirina','Ibuprofeno','Amoxicilina','Látex','Anestesia local']} />
                </div>
                <div>
                  <label style={lS}>CONDICIONES MÉDICAS</label>
                  <ChipList items={hForm.conditions} onChange={v => setHForm(f => ({ ...f, conditions: v }))} placeholder="Ej: Diabetes…" suggestions={['Diabetes','Hipertensión','Cardiopatía','Asma','Anticoagulantes','Embarazo','Osteoporosis']} />
                </div>
                <div>
                  <label style={lS}>MEDICAMENTOS ACTUALES</label>
                  <ChipList items={hForm.medications} onChange={v => setHForm(f => ({ ...f, medications: v }))} placeholder="Ej: Metformina 500mg…" />
                </div>
                <div>
                  <label style={lS}>NOTAS GENERALES</label>
                  <textarea value={hForm.notes} onChange={e => setHForm(f => ({ ...f, notes: e.target.value }))} placeholder="Observaciones relevantes del paciente…" style={{ ...iS, resize: 'vertical', minHeight: 80 }} />
                </div>
                <button onClick={handleSaveHistoria} disabled={savingH} style={{ alignSelf: 'flex-end', padding: '10px 28px', borderRadius: 10, border: 'none', background: '#5b84b1', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 12px rgba(91,132,177,0.3)' }}>
                  {savingH ? 'Guardando…' : 'Guardar historia médica'}
                </button>
              </div>
            )
          )}

          {/* ── Tab: Notas Clínicas ── */}
          {tab === 'notas' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowNotaForm(v => !v)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#8db84a', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  {showNotaForm ? '— Cancelar' : '+ Nueva nota'}
                </button>
              </div>

              {showNotaForm && (
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20, border: '1.5px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="exp-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={lS}>FECHA DE VISITA</label>
                      <input type="date" value={nForm.visitDate} onChange={e => setNForm(f => ({ ...f, visitDate: e.target.value }))} style={iS} />
                    </div>
                    <div>
                      <label style={lS}>FECHA SEGUIMIENTO (opcional)</label>
                      <input type="date" value={nForm.seguimiento} onChange={e => setNForm(f => ({ ...f, seguimiento: e.target.value }))} style={iS} />
                    </div>
                  </div>
                  {[
                    ['MOTIVO DE CONSULTA', 'motivo', 'Razón de la visita…'],
                    ['HALLAZGOS CLÍNICOS', 'hallazgos', 'Observaciones al examen…'],
                    ['DIAGNÓSTICO', 'diagnostico', 'Diagnóstico del doctor…'],
                    ['TRATAMIENTO REALIZADO', 'tratamiento', 'Procedimientos realizados…'],
                    ['INDICACIONES AL PACIENTE', 'indicaciones', 'Instrucciones post-tratamiento…'],
                  ].map(([label, field, ph]) => (
                    <div key={field}>
                      <label style={lS}>{label}</label>
                      <textarea value={(nForm as any)[field]} onChange={e => setNForm(f => ({ ...f, [field]: e.target.value }))}
                        placeholder={ph} style={{ ...iS, resize: 'vertical', minHeight: 56 }} />
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button onClick={() => setShowNotaForm(false)} style={{ padding: '9px 18px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', color: '#8a9ab0', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
                    <button onClick={handleSaveNota} disabled={savingN} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#5b84b1', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      {savingN ? 'Guardando…' : 'Guardar nota'}
                    </button>
                  </div>
                </div>
              )}

              {loadingNotas ? (
                <div style={{ textAlign: 'center', color: '#8a9ab0', padding: 32 }}>Cargando notas…</div>
              ) : notas.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#8a9ab0', padding: 40, background: '#f8fafc', borderRadius: 12 }}>
                  <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}><Icon name="treatments" size={32} color="#8a9ab0" /></div>
                  <p style={{ fontSize: 13 }}>Sin notas clínicas. Registra la primera visita.</p>
                </div>
              ) : notas.map(nota => {
                const doc = doctors.find(d => d.id === nota.doctorId)
                return (
                  <div key={nota.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8ecf2', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e8ecf2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1a2535' }}>
                          {new Date(nota.visitDate + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        {doc && <span style={{ fontSize: 11, color: '#8a9ab0', marginLeft: 10 }}>{doc.name}</span>}
                      </div>
                      {nota.seguimiento && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#e07b54', background: '#fef0e8', padding: '2px 8px', borderRadius: 10 }}>
                          Seguimiento: {new Date(nota.seguimiento + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                    <div className="exp-grid-2" style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {[
                        ['Motivo', nota.motivo],
                        ['Diagnóstico', nota.diagnostico],
                        ['Hallazgos', nota.hallazgos],
                        ['Tratamiento', nota.tratamiento],
                        ['Indicaciones', nota.indicaciones],
                      ].filter(([, v]) => v).map(([label, value]) => (
                        <div key={label as string} style={{ gridColumn: (label === 'Hallazgos' || label === 'Indicaciones') ? 'span 2' : undefined }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#8a9ab0', letterSpacing: '0.5px', marginBottom: 2 }}>{(label as string).toUpperCase()}</div>
                          <div style={{ fontSize: 13, color: '#1a2535', lineHeight: 1.5 }}>{value as string}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Tab: Recetas ── */}
          {tab === 'recetas' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowRecetaForm(v => !v)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  {showRecetaForm ? '— Cancelar' : '+ Nueva receta'}
                </button>
              </div>

              {showRecetaForm && (
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20, border: '1.5px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="exp-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={lS}>FECHA</label>
                      <input type="date" value={rForm.visitDate} onChange={e => setRForm(f => ({ ...f, visitDate: e.target.value }))} style={iS} />
                    </div>
                    <div>
                      <label style={lS}>DIAGNÓSTICO</label>
                      <input value={rForm.diagnostico} onChange={e => setRForm(f => ({ ...f, diagnostico: e.target.value }))} placeholder="Diagnóstico principal…" style={iS} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <label style={lS}>MEDICAMENTOS</label>
                      <button onClick={() => setRForm(f => ({ ...f, medicamentos: [...f.medicamentos, emptyMed()] }))}
                        style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+ Agregar</button>
                    </div>
                    {rForm.medicamentos.map((med, idx) => (
                      <div key={idx} style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', padding: 12, marginBottom: 8, position: 'relative' }}>
                        {rForm.medicamentos.length > 1 && (
                          <button onClick={() => setRForm(f => ({ ...f, medicamentos: f.medicamentos.filter((_, i) => i !== idx) }))}
                            style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', fontSize: 16, lineHeight: 1 }}>×</button>
                        )}
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ marginBottom: 6 }}>
                            <label style={{ ...lS, fontSize: 9 }}>MEDICAMENTO</label>
                            <input value={med.nombre} onChange={e => updateMed(idx, 'nombre', e.target.value)} placeholder="Ej: Amoxicilina 500mg" style={{ ...iS, fontSize: 12, padding: '6px 8px' }} />
                          </div>
                          <div className="med-fields-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                            {[['DOSIS', 'dosis', '1 cápsula'], ['FRECUENCIA', 'frecuencia', 'Cada 8h'], ['DURACIÓN', 'duracion', '7 días']].map(([lbl, fld, ph]) => (
                              <div key={fld}>
                                <label style={{ ...lS, fontSize: 9 }}>{lbl}</label>
                                <input value={(med as any)[fld]} onChange={e => updateMed(idx, fld as keyof RecetaMedicamento, e.target.value)} placeholder={ph} style={{ ...iS, fontSize: 12, padding: '6px 8px' }} />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label style={{ ...lS, fontSize: 9 }}>INDICACIONES ESPECIALES</label>
                          <input value={med.indicaciones} onChange={e => updateMed(idx, 'indicaciones', e.target.value)} placeholder="Tomar con alimentos, evitar alcohol…" style={{ ...iS, fontSize: 12, padding: '6px 8px' }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label style={lS}>NOTAS ADICIONALES</label>
                    <textarea value={rForm.notas} onChange={e => setRForm(f => ({ ...f, notas: e.target.value }))} placeholder="Indicaciones generales al paciente…" style={{ ...iS, resize: 'vertical', minHeight: 60 }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button onClick={() => setShowRecetaForm(false)} style={{ padding: '9px 18px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', color: '#8a9ab0', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
                    <button onClick={handleSaveReceta} disabled={savingR} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      {savingR ? 'Guardando…' : 'Guardar receta'}
                    </button>
                  </div>
                </div>
              )}

              {loadingRecetas ? (
                <div style={{ textAlign: 'center', color: '#8a9ab0', padding: 32 }}>Cargando recetas…</div>
              ) : recetas.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#8a9ab0', padding: 40, background: '#f8fafc', borderRadius: 12 }}>
                  <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}><Icon name="pill" size={32} color="#8a9ab0" /></div>
                  <p style={{ fontSize: 13 }}>Sin recetas registradas.</p>
                </div>
              ) : recetas.map(rec => {
                const doc = doctors.find(d => d.id === rec.doctorId)
                return (
                  <div key={rec.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8ecf2', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e8ecf2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1a2535' }}>
                          {new Date(rec.visitDate + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        {doc && <span style={{ fontSize: 11, color: '#8a9ab0', marginLeft: 10 }}>{doc.name}</span>}
                        {rec.diagnostico && <span style={{ fontSize: 11, color: '#5b84b1', marginLeft: 10 }}>· {rec.diagnostico}</span>}
                      </div>
                      <button onClick={() => printReceta(rec)} style={{ padding: '5px 12px', borderRadius: 6, border: '1.5px solid #7c3aed', background: 'transparent', color: '#7c3aed', fontWeight: 700, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="printer" size={12} color="#7c3aed" /> Imprimir</button>
                    </div>
                    <div style={{ padding: '12px 16px' }}>
                      {rec.medicamentos.length > 0 ? (
                        <div className="receta-table-scroll">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                          <thead>
                            <tr style={{ background: '#f8fafc' }}>
                              {['Medicamento', 'Dosis', 'Frecuencia', 'Duración'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: 10, fontWeight: 700, color: '#8a9ab0', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>{h.toUpperCase()}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {rec.medicamentos.map((m, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid #f0f2f5' }}>
                                <td style={{ padding: '7px 8px', fontWeight: 600, color: '#1a2535' }}>{m.nombre}{m.indicaciones && <div style={{ fontSize: 10, color: '#8a9ab0', fontWeight: 400 }}>{m.indicaciones}</div>}</td>
                                <td style={{ padding: '7px 8px', color: '#4a5568' }}>{m.dosis}</td>
                                <td style={{ padding: '7px 8px', color: '#4a5568' }}>{m.frecuencia}</td>
                                <td style={{ padding: '7px 8px', color: '#4a5568' }}>{m.duracion}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        </div>
                      ) : <span style={{ fontSize: 12, color: '#8a9ab0' }}>Sin medicamentos.</span>}
                      {rec.notas && <div style={{ marginTop: 8, fontSize: 12, color: '#4a5568', fontStyle: 'italic' }}>{rec.notas}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// ── Patients page constants ───────────────────────────────────────────────────
const EMPTY_FORM = {
  name: '', age: '', phone: '', email: '', status: 'nuevo', doctor: '', fechaNacimiento: '',
}

const PAGE_SIZE = 10

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function Patients() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [page, setPage] = useState(1)
  const { data: patients, loading: loadingP, refetch, setData } = usePacientes()
  const { data: doctors } = useDoctores()
  const searchQuery  = useStore(s => s.searchQuery)
  const currentRole  = useStore(s => s.currentUser?.role)
  const currentUser  = useStore(s => s.currentUser)

  // Para rol doctor: solo muestra sus propios pacientes
  const myDoctor = currentRole === 'doctor'
    ? doctors.find(d => d.name === currentUser?.name) ?? null
    : null
  const [doctorPatientIds, setDoctorPatientIds] = useState<Set<number> | null>(null)
  useEffect(() => {
    if (!myDoctor) { setDoctorPatientIds(null); return }
    supabase.from('citas').select('patient_id').eq('doctor_id', myDoctor.id).then(({ data }) => {
      setDoctorPatientIds(new Set((data ?? []).map((r: { patient_id: number }) => r.patient_id)))
    })
  }, [myDoctor?.id])

  const [showModal, setShowModal] = useState(false)
  const [showIncomplete, setShowIncomplete] = useState(false)
  const [editPatient, setEditPatient] = useState<Patient | null>(null)
  const [detailPatient, setDetailPatient] = useState<Patient | null>(null)
  const [expedientePatient, setExpedientePatient] = useState<Patient | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<{ email?: string; phone?: string; name?: string }>({})
  const [saving, setSaving] = useState(false)
  const [confirmDel, setConfirmDel] = useState<Patient | null>(null)
  const showToast = useStore(s => s.showToast)

  function validateField(field: 'email' | 'phone' | 'name', value: string) {
    setFormErrors(prev => {
      const next = { ...prev }
      if (field === 'email') {
        if (value && !EMAIL_RE.test(value)) next.email = 'Formato de email inválido'
        else delete next.email
      }
      if (field === 'phone') {
        const digits = value.replace(/\D/g, '')
        if (value && digits.length < 10) next.phone = 'Mínimo 10 dígitos'
        else delete next.phone
      }
      if (field === 'name') {
        const trimmed = value.trim().toLowerCase()
        const duplicate = trimmed && patients.some(p =>
          p.name.trim().toLowerCase() === trimmed && p.id !== editPatient?.id
        )
        if (duplicate) next.name = 'Ya existe un paciente con este nombre'
        else delete next.name
      }
      return next
    })
  }

  async function handleDelete() {
    if (!confirmDel) return
    const { error } = await supabase.from('pacientes').delete().eq('id', confirmDel.id)
    if (error) { showToast('Error al eliminar: ' + error.message, 'error'); return }
    setData(prev => prev.filter(p => p.id !== confirmDel.id))
    showToast('Paciente eliminado', 'success')
    setConfirmDel(null)
  }

  const combined = search || searchQuery
  const filtered = patients.filter(p => {
    const matchSearch = !combined ||
      p.name.toLowerCase().includes(combined.toLowerCase()) ||
      p.email.toLowerCase().includes(combined.toLowerCase()) ||
      p.phone.includes(combined)
    const matchStatus = statusFilter === 'todos' || p.status === statusFilter
    const matchDoctor = !doctorPatientIds || doctorPatientIds.has(p.id)
    return matchSearch && matchStatus && matchDoctor
  })

  // Paginación de 10 en 10
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  // Volver a la primera página cuando cambian búsqueda o filtros
  useEffect(() => { setPage(1) }, [combined, statusFilter, doctorPatientIds])

  // Pacientes con información incompleta (típico de altas rápidas desde Agenda)
  function missingFields(p: Patient): string[] {
    const missing: string[] = []
    if (!p.doctor) missing.push('Fisioterapeuta por asignar')
    if (!p.fechaNacimiento) missing.push('Cumpleaños')
    if (!p.age) missing.push('Edad')
    return missing
  }
  const incomplete = patients
    .filter(p => !doctorPatientIds || doctorPatientIds.has(p.id))
    .map(p => ({ patient: p, missing: missingFields(p) }))
    .filter(x => x.missing.length > 0)

  function openNew() {
    setEditPatient(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
    setShowModal(true)
  }

  function openEdit(pat: Patient) {
    setEditPatient(pat)
    setForm({
      name: pat.name, age: String(pat.age), phone: pat.phone,
      email: pat.email, status: pat.status, doctor: String(pat.doctor ?? ''),
      fechaNacimiento: pat.fechaNacimiento ?? '',
    })
    setFormErrors({})
    setDetailPatient(null)
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.phone.trim()) return
    if (Object.keys(formErrors).length > 0) return
    setSaving(true)
    // Si hay fecha de nacimiento, la edad se deriva de ella (fuente de verdad);
    // si no, se usa la edad capturada manualmente.
    const edad = form.fechaNacimiento ? calcAge(form.fechaNacimiento) : (Number(form.age) || 0)
    const payload = {
      name: form.name.trim(), age: edad,
      phone: form.phone.trim(), email: form.email.trim(),
      status: form.status as 'activo' | 'nuevo' | 'pendiente' | 'inactivo',
      doctor: form.doctor ? Number(form.doctor) : null,
      fecha_nacimiento: form.fechaNacimiento || null,
    }
    if (editPatient) {
      const { error } = await supabase.from('pacientes').update(payload).eq('id', editPatient.id)
      if (error) { showToast('Error: ' + error.message, 'error') }
      else {
        // Actualiza el estado local con las claves camelCase que usa la app
        // (antes se copiaba fecha_nacimiento en snake_case y por eso el aviso
        // de "información incompleta" seguía apareciendo hasta recargar).
        setData(prev => prev.map(p => p.id === editPatient.id
          ? {
              ...p,
              name: payload.name, age: payload.age, phone: payload.phone,
              email: payload.email, status: payload.status,
              doctor: payload.doctor ?? 0,
              fechaNacimiento: payload.fecha_nacimiento,
            }
          : p))
        showToast('Paciente actualizado', 'success')
        setShowModal(false)
      }
    } else {
      const { error } = await supabase.from('pacientes').insert(payload)
      if (error) { showToast('Error: ' + error.message, 'error') }
      else { await refetch(); showToast('Paciente registrado', 'success'); setShowModal(false) }
    }
    setSaving(false)
  }

  return (
    <div className="app-page patients-page" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {incomplete.length > 0 && (
        <div
          onClick={() => setShowIncomplete(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
            borderRadius: 12, background: '#fff8e6', border: '1px solid #f5deab',
            cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}
        >
          <Icon name="alertTriangle" size={18} color="#c9920a" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a2535' }}>
              {incomplete.length} paciente{incomplete.length !== 1 ? 's' : ''} con información incompleta
            </div>
            <div style={{ fontSize: 12, color: '#8a9ab0', marginTop: 1 }}>
              Suelen ser altas rápidas hechas desde Agenda — falta doctor, cumpleaños, email, etc.
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#c9920a' }}>Ver detalle →</span>
        </div>
      )}

      <FadeContent className="ui-card ui-table-panel" style={{
        background: '#fff', borderRadius: 12, overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2535' }}>Lista de Pacientes</h2>
            <p style={{ fontSize: 12, color: '#8a9ab0', marginTop: 2 }}>
              {loadingP ? 'Cargando...' : `${filtered.length} paciente${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Status filter */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {(['todos', 'activo', 'nuevo', 'pendiente', 'inactivo'] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                  padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  border: 'none', cursor: 'pointer',
                  background: statusFilter === s ? '#5b84b1' : '#f0f2f5',
                  color: statusFilter === s ? '#fff' : '#4a5568',
                }}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              <Icon name="search" size={15} color="#8a9ab0" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar..." style={{
                  paddingLeft: 32, paddingRight: 12, height: 36, borderRadius: 8,
                  border: '1.5px solid #e2e8f0', fontSize: 13, color: '#1a2535',
                  background: '#f5f7fa', width: 200, outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = '#5b84b1'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f5f7fa' }}
              />
            </div>
            <button onClick={openNew} style={{
              padding: '8px 16px', borderRadius: 8, background: '#8db84a', color: '#fff',
              fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 4px 12px rgba(141,184,74,0.3)',
            }}>
              <Icon name="plus" size={14} /> Nuevo paciente
            </button>
          </div>
        </div>

        {loadingP ? (
          <LoadingState label="Cargando pacientes" />
        ) : (
          <>
            {/* ── Desktop table ── */}
            <div className="table-scroll hide-mobile">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Paciente', 'Edad', 'Teléfono', 'Email', 'Última visita', 'Próxima cita', 'Fisioterapeuta', 'Estado', ''].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#8a9ab0', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map((pat, i) => {
                    const doc = doctors.find(d => d.id === pat.doctor)
                    const st = STATUS_STYLES[pat.status] ?? STATUS_STYLES.inactivo
                    return (
                      <tr key={pat.id}
                        style={{ borderBottom: i < paged.length - 1 ? '1px solid #f5f7fa' : 'none', transition: 'background 0.15s', cursor: 'pointer' }}
                        onClick={() => setDetailPatient(pat)}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff' }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e8f0f8', color: '#5b84b1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{getInitials(pat.name)}</div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#1a2535' }}>{pat.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#4a5568' }}>{pat.age} años</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#4a5568' }}>{pat.phone}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#4a5568' }}>{pat.email}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#4a5568' }}>
                          {pat.lastVisit ? new Date(pat.lastVisit).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {pat.nextAppointment ? (
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#5b84b1' }}>
                              {new Date(pat.nextAppointment).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                            </span>
                          ) : <span style={{ fontSize: 13, color: '#8a9ab0' }}>—</span>}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#4a5568' }}>{doc?.name ?? '—'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {currentRole !== 'agenda_admin' && (
                              <button onClick={e => { e.stopPropagation(); setExpedientePatient(pat) }} style={{ padding: '4px 10px', borderRadius: 6, border: '1.5px solid #5b84b1', background: '#e8f0f8', color: '#5b84b1', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                                <Icon name="clipboard" size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Expediente
                              </button>
                            )}
                            <button onClick={e => { e.stopPropagation(); openEdit(pat) }} style={{ padding: '4px 10px', borderRadius: 6, border: '1.5px solid #e2e8f0', background: '#fff', color: '#4a5568', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Editar</button>
                            <button onClick={e => { e.stopPropagation(); setConfirmDel(pat) }} style={{ padding: '4px 10px', borderRadius: 6, border: '1.5px solid #fca5a5', background: '#fff', color: '#e74c3c', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <EmptyState icon="patients" title="No se encontraron pacientes" description="Prueba con otro nombre, teléfono o filtro." />
              )}
            </div>

            {/* ── Mobile card list ── */}
            <div className="hide-desktop">
              {filtered.length === 0 ? (
                <EmptyState icon="patients" title="No se encontraron pacientes" description="Prueba con otro nombre, teléfono o filtro." />
              ) : paged.map((pat, i) => {
                const doc = doctors.find(d => d.id === pat.doctor)
                const st = STATUS_STYLES[pat.status] ?? STATUS_STYLES.inactivo
                return (
                  <div key={pat.id} onClick={() => setDetailPatient(pat)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                    borderBottom: i < paged.length - 1 ? '1px solid #f0f2f5' : 'none',
                    cursor: 'pointer', background: '#fff',
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%',
                      background: st.bg, color: st.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, flexShrink: 0,
                    }}>{getInitials(pat.name)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1a2535', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pat.name}</div>
                      <div style={{ fontSize: 12, color: '#8a9ab0', marginTop: 2 }}>
                        {pat.age} años · {pat.phone}
                        {doc && <span> · {doc.name}</span>}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: st.bg, color: st.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {st.label}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* ── Paginación ── */}
            {filtered.length > PAGE_SIZE && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '14px 24px', borderTop: '1px solid #f0f2f5' }}>
                <span style={{ fontSize: 12, color: '#8a9ab0' }}>
                  Mostrando {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} de {filtered.length}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    style={{
                      padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      border: '1.5px solid #e2e8f0', background: '#fff',
                      color: safePage <= 1 ? '#cbd5e1' : '#4a5568',
                      cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
                    }}
                  >Anterior</button>
                  {Array.from({ length: pageCount }, (_, idx) => idx + 1).map(n => (
                    <button key={n} onClick={() => setPage(n)} style={{
                      minWidth: 32, padding: '6px 0', borderRadius: 8, fontSize: 12, fontWeight: 700,
                      border: 'none', cursor: 'pointer',
                      background: n === safePage ? '#5b84b1' : '#f0f2f5',
                      color: n === safePage ? '#fff' : '#4a5568',
                    }}>{n}</button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                    disabled={safePage >= pageCount}
                    style={{
                      padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      border: '1.5px solid #e2e8f0', background: '#fff',
                      color: safePage >= pageCount ? '#cbd5e1' : '#4a5568',
                      cursor: safePage >= pageCount ? 'not-allowed' : 'pointer',
                    }}
                  >Siguiente</button>
                </div>
              </div>
            )}
          </>
        )}
      </FadeContent>

      {/* ── Detail modal ── */}
      {detailPatient && (() => {
        const doc = doctors.find(d => d.id === detailPatient.doctor)
        const st = STATUS_STYLES[detailPatient.status] ?? STATUS_STYLES.inactivo
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
            onClick={e => { if (e.target === e.currentTarget) setDetailPatient(null) }}
          >
            <div className="modal-sheet" style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg, #5b84b1, #4a72a0)', padding: '24px 24px 20px', position: 'relative' }}>
                <button onClick={() => setDetailPatient(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 18, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 12 }}>
                  {getInitials(detailPatient.name)}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{detailPatient.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.25)', color: '#fff' }}>{st.label}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>{detailPatient.age} años</span>
                </div>
              </div>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Teléfono', value: detailPatient.phone, icon: 'phone' as const },
                    { label: 'Email', value: detailPatient.email, icon: 'mail' as const },
                    { label: 'Fisioterapeuta asignado', value: doc?.name ?? '—', icon: 'doctors' as const },
                    { label: 'Especialidad', value: doc?.specialty ?? '—', icon: 'treatments' as const },
                    { label: 'Última visita', value: detailPatient.lastVisit ? new Date(detailPatient.lastVisit).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : '—', icon: 'clock' as const },
                    { label: 'Próxima cita', value: detailPatient.nextAppointment ? new Date(detailPatient.nextAppointment).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : '—', icon: 'agenda' as const },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#8a9ab0', letterSpacing: '0.5px', marginBottom: 2 }}>{label.toUpperCase()}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a2535', wordBreak: 'break-all' }}>{value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4, flexDirection: 'column' }}>
                  {currentRole !== 'agenda_admin' && (
                  <button onClick={() => { setDetailPatient(null); setExpedientePatient(detailPatient) }} style={{
                    width: '100%', padding: '10px 0', borderRadius: 10, border: 'none',
                    background: '#5b84b1', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}><Icon name="clipboard" size={14} color="#fff" /> Ver Expediente Clínico</button>
                  )}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => { setDetailPatient(null); openEdit(detailPatient) }} style={{
                      flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #e2e8f0',
                      background: '#fff', color: '#4a5568', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    }}>Editar</button>
                    <button onClick={() => { setConfirmDel(detailPatient); setDetailPatient(null) }} style={{
                      flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                      background: '#e74c3c', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    }}>Eliminar</button>
                    <button onClick={() => setDetailPatient(null)} style={{
                      flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #e2e8f0',
                      background: '#fff', color: '#8a9ab0', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    }}>Cerrar</button>
                  </div>
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
                {editPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 18, color: '#8a9ab0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={lStyle}>NOMBRE COMPLETO *</label>
                <input value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  onBlur={e => validateField('name', e.target.value)}
                  placeholder="Ej: María García López"
                  style={{ ...iStyle, borderColor: formErrors.name ? '#e74c3c' : undefined }} />
                {formErrors.name && <span style={{ fontSize: 11, color: '#e74c3c', marginTop: 4, display: 'block' }}>{formErrors.name}</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lStyle}>EDAD</label>
                  <input type="number" min="0" max="120" value={form.age}
                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    placeholder="Ej: 32" style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>ESTADO</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={iStyle}>
                    <option value="nuevo">Nuevo</option>
                    <option value="activo">Activo</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={lStyle}>TELÉFONO *</label>
                <input value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  onBlur={e => validateField('phone', e.target.value)}
                  placeholder="Ej: 55 1234-5678"
                  style={{ ...iStyle, borderColor: formErrors.phone ? '#e74c3c' : undefined }} />
                {formErrors.phone && <span style={{ fontSize: 11, color: '#e74c3c', marginTop: 4, display: 'block' }}>{formErrors.phone}</span>}
              </div>
              <div>
                <label style={lStyle}>EMAIL</label>
                <input value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  onBlur={e => validateField('email', e.target.value)}
                  placeholder="Ej: paciente@email.com"
                  style={{ ...iStyle, borderColor: formErrors.email ? '#e74c3c' : undefined }} />
                {formErrors.email && <span style={{ fontSize: 11, color: '#e74c3c', marginTop: 4, display: 'block' }}>{formErrors.email}</span>}
              </div>
              <div>
                <label style={lStyle}>FECHA DE NACIMIENTO</label>
                <input type="date" value={form.fechaNacimiento}
                  onChange={e => {
                    const fn = e.target.value
                    // Al capturar la fecha de nacimiento, la edad se completa sola
                    setForm(f => ({ ...f, fechaNacimiento: fn, age: fn ? String(calcAge(fn)) : f.age }))
                  }}
                  style={iStyle} />
                {form.fechaNacimiento && (
                  <span style={{ fontSize: 11, color: '#8a9ab0', marginTop: 4, display: 'block' }}>
                    Edad calculada: {calcAge(form.fechaNacimiento)} años
                  </span>
                )}
              </div>
              <div>
                <label style={lStyle}>FISIOTERAPEUTA ASIGNADO</label>
                <select value={form.doctor} onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))} style={iStyle}>
                  <option value="">Sin asignar</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name} – {d.specialty}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: '11px 0', borderRadius: 10, border: '1.5px solid #e2e8f0',
                background: '#fff', color: '#8a9ab0', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}>Cancelar</button>
              <button onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.phone.trim() || Object.keys(formErrors).length > 0}
                style={{
                  flex: 2, padding: '11px 0', borderRadius: 10, border: 'none',
                  background: (!form.name.trim() || !form.phone.trim() || Object.keys(formErrors).length > 0) ? '#b0c4d8' : '#5b84b1',
                  color: '#fff', fontWeight: 700, fontSize: 13,
                  cursor: (!form.name.trim() || !form.phone.trim()) ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(91,132,177,0.25)',
                }}
              >{saving ? 'Guardando…' : editPatient ? 'Guardar cambios' : 'Registrar paciente'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete modal ── */}
      {confirmDel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>⚠️</div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a2535', marginBottom: 8 }}>¿Eliminar paciente?</h3>
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

      {/* ── Expediente modal ── */}
      {expedientePatient && (
        <ExpedienteModal
          patient={expedientePatient}
          doctors={doctors}
          onClose={() => setExpedientePatient(null)}
        />
      )}

      {/* ── Información incompleta modal ── */}
      {showIncomplete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setShowIncomplete(false) }}
        >
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 560, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a2535', margin: 0 }}>Información incompleta</h3>
              <button onClick={() => setShowIncomplete(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 18, color: '#8a9ab0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
            <p style={{ fontSize: 12, color: '#8a9ab0', marginBottom: 16 }}>
              {incomplete.length} paciente{incomplete.length !== 1 ? 's' : ''} — normalmente altas rápidas hechas desde Agenda.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {incomplete.map(({ patient: pat, missing }) => (
                <div key={pat.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                  borderRadius: 10, border: '1px solid #f0f2f5',
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', background: '#e8f0f8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800, color: '#5b84b1', flexShrink: 0,
                  }}>{getInitials(pat.name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1a2535', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pat.name}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                      {missing.map(m => (
                        <span key={m} style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: '#fff8e6', color: '#c9920a' }}>{m}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => { setShowIncomplete(false); openEdit(pat) }} style={{
                    padding: '7px 12px', borderRadius: 8, border: 'none', background: '#5b84b1',
                    color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
                  }}>Completar</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
