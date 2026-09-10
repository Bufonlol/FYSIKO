import { useEffect, useMemo, useState } from 'react'
import { useBloqueosAgenda, useConsultorios, useDoctores, usePacientes } from '../../lib/hooks'
import { supabase } from '../../lib/supabase'
import { useStore } from '../../store/useStore'
import type { Appointment, AppointmentStatus, PatientType } from '../../types'

const STATUS_OPTIONS: { value: AppointmentStatus; label: string; helper: string }[] = [
  { value: 'pendiente', label: 'Pendiente', helper: 'Aún no confirma' },
  { value: 'confirmada', label: 'Confirmada', helper: 'Paciente confirmó' },
  { value: 'en_curso', label: 'En curso', helper: 'Consulta iniciada' },
  { value: 'finalizada', label: 'Asistió', helper: 'La consulta sí se realizó' },
  { value: 'no_asistio', label: 'No asistió', helper: 'No llegó y no canceló' },
  { value: 'cancelada', label: 'Canceló', helper: 'Canceló antes de asistir' },
  { value: 'reagendada', label: 'Reagendó', helper: 'Se movió a otra fecha' },
]

const ACTIVE_STATUSES = new Set<AppointmentStatus>(['pendiente', 'confirmada', 'en_curso'])

function localISODate() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  return (hours || 0) * 60 + (minutes || 0)
}

function mapAppointment(row: any): Appointment {
  return {
    id: row.id,
    patientId: row.patient_id,
    doctorId: row.doctor_id,
    clinicId: row.clinic_id,
    room: row.room ?? '',
    date: row.date,
    time: String(row.time ?? '').slice(0, 5),
    duration: Number(row.duration ?? 60),
    type: row.type ?? '',
    status: row.status,
    patientType: row.patient_type ?? 'subsecuente',
    amount: Number(row.amount ?? 0),
  }
}

type EditForm = {
  doctorId: string
  date: string
  time: string
  duration: string
  room: string
  treatment: string
  amount: string
  status: AppointmentStatus
  patientType: PatientType
}

function formFromAppointment(appointment: Appointment): EditForm {
  return {
    doctorId: String(appointment.doctorId),
    date: appointment.date,
    time: appointment.time,
    duration: String(appointment.duration || 60),
    room: appointment.room || '',
    treatment: appointment.type || '',
    amount: String(appointment.amount ?? 0),
    status: appointment.status,
    patientType: appointment.patientType ?? 'subsecuente',
  }
}

export function AppointmentEditor() {
  const showToast = useStore(state => state.showToast)
  const currentUser = useStore(state => state.currentUser)
  const { data: patients } = usePacientes()
  const { data: doctors } = useDoctores()
  const { data: consultorios } = useConsultorios()
  const { data: blocks } = useBloqueosAgenda()

  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(localISODate)
  const [search, setSearch] = useState('')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [form, setForm] = useState<EditForm | null>(null)
  const [saving, setSaving] = useState(false)

  const myDoctor = currentUser?.role === 'doctor'
    ? doctors.find(doctor => doctor.name === currentUser.name) ?? null
    : null

  async function loadAppointments(targetDate = date) {
    setLoading(true)
    const { data: rows, error } = await supabase
      .from('citas')
      .select('*')
      .eq('date', targetDate)
      .order('time')

    if (error) {
      showToast(`No se pudieron cargar las citas: ${error.message}`, 'error')
      setAppointments([])
    } else {
      const mapped = (rows ?? []).map(mapAppointment)
      setAppointments(myDoctor ? mapped.filter(item => item.doctorId === myDoctor.id) : mapped)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (open) loadAppointments(date)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, date, myDoctor?.id])

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return appointments
    return appointments.filter(appointment => {
      const patient = patients.find(item => item.id === appointment.patientId)
      const doctor = doctors.find(item => item.id === appointment.doctorId)
      return [patient?.name, doctor?.name, appointment.type, appointment.room]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(query))
    })
  }, [appointments, search, patients, doctors])

  function selectAppointment(appointment: Appointment) {
    setSelected(appointment)
    setForm(formFromAppointment(appointment))
  }

  function closeEditor() {
    setSelected(null)
    setForm(null)
  }

  async function validateSchedule() {
    if (!selected || !form || !ACTIVE_STATUSES.has(form.status)) return true

    const doctorId = Number(form.doctorId)
    const duration = Math.max(1, Number(form.duration) || 60)
    const start = toMinutes(form.time)
    const end = start + duration

    const dayBlock = blocks.find(block => block.doctorId === doctorId && block.date === form.date)
    if (dayBlock) {
      showToast(`No se puede mover la cita: la doctora tiene el día bloqueado por ${dayBlock.reason}`, 'error')
      return false
    }

    const { data: rows, error } = await supabase
      .from('citas')
      .select('id, doctor_id, room, date, time, duration, status')
      .eq('date', form.date)

    if (error) {
      showToast(`No se pudo validar el horario: ${error.message}`, 'error')
      return false
    }

    const conflicts = (rows ?? []).filter((row: any) => {
      if (row.id === selected.id) return false
      if (!ACTIVE_STATUSES.has(row.status as AppointmentStatus)) return false
      const otherStart = toMinutes(String(row.time).slice(0, 5))
      const otherEnd = otherStart + Number(row.duration || 60)
      if (!(start < otherEnd && end > otherStart)) return false
      return row.doctor_id === doctorId || (!!form.room && row.room === form.room)
    })

    if (conflicts.length > 0) {
      const conflict = conflicts[0] as any
      const reason = conflict.doctor_id === doctorId ? 'la doctora ya tiene otra cita' : 'el consultorio ya está ocupado'
      showToast(`No se puede guardar: ${reason} en ese horario`, 'error')
      return false
    }

    return true
  }

  async function saveAppointment() {
    if (!selected || !form) return
    if (!form.doctorId || !form.date || !form.time || !form.duration || !form.treatment.trim()) {
      showToast('Completa doctora, fecha, hora, duración y tratamiento', 'error')
      return
    }

    if (!(await validateSchedule())) return

    setSaving(true)
    const payload = {
      doctor_id: Number(form.doctorId),
      room: form.room || null,
      date: form.date,
      time: `${form.time}:00`,
      duration: Math.max(1, Number(form.duration) || 60),
      type: form.treatment.trim(),
      status: form.status,
      patient_type: form.patientType,
      amount: Math.max(0, Number(form.amount) || 0),
    }

    const { data, error } = await supabase
      .from('citas')
      .update(payload)
      .eq('id', selected.id)
      .select()
      .single()

    if (error) {
      showToast(`No se pudo modificar la cita: ${error.message}`, 'error')
      setSaving(false)
      return
    }

    const updated = mapAppointment(data)
    if (updated.date === date) {
      setAppointments(current => current.map(item => item.id === updated.id ? updated : item))
    } else {
      setAppointments(current => current.filter(item => item.id !== updated.id))
    }
    setSelected(updated)
    setForm(formFromAppointment(updated))
    showToast('Cita modificada correctamente', 'success')
    setSaving(false)
  }

  const selectedPatient = selected ? patients.find(patient => patient.id === selected.patientId) : null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          right: 18,
          bottom: 82,
          zIndex: 900,
          border: 'none',
          borderRadius: 999,
          padding: '11px 16px',
          background: '#1a2535',
          color: '#fff',
          boxShadow: '0 10px 28px rgba(26,37,53,.24)',
          fontSize: 12,
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        Editar cita
      </button>

      {open && (
        <div
          onClick={event => { if (event.target === event.currentTarget) setOpen(false) }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 14,
            background: 'rgba(15,23,42,.55)',
          }}
        >
          <div style={{
            width: '100%',
            maxWidth: 820,
            maxHeight: '92vh',
            overflowY: 'auto',
            borderRadius: 18,
            background: '#fff',
            boxShadow: '0 24px 70px rgba(0,0,0,.25)',
          }}>
            <div style={{
              position: 'sticky',
              top: 0,
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '16px 18px',
              borderBottom: '1px solid #e8edf2',
              background: '#fff',
            }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#1a2535' }}>Modificar cita</div>
                <div style={{ marginTop: 2, fontSize: 10, color: '#718096' }}>
                  Corrige datos o el resultado final. Estos cambios no envían WhatsApp.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{ width: 32, height: 32, borderRadius: 9, border: 'none', background: '#f1f5f9', color: '#64748b', fontSize: 18, cursor: 'pointer' }}
              >×</button>
            </div>

            <div style={{ padding: 18 }}>
              {!selected || !form ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(145px,190px) minmax(180px,1fr)', gap: 10, marginBottom: 14 }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#718096' }}>FECHA</span>
                      <input type="date" value={date} onChange={event => setDate(event.target.value)} style={{ padding: '9px 10px', border: '1px solid #d8e1ea', borderRadius: 9, fontSize: 12 }} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#718096' }}>BUSCAR</span>
                      <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Paciente, doctora, tratamiento o consultorio…" style={{ padding: '9px 10px', border: '1px solid #d8e1ea', borderRadius: 9, fontSize: 12 }} />
                    </label>
                  </div>

                  {loading ? (
                    <div style={{ padding: 32, textAlign: 'center', color: '#718096', fontSize: 12 }}>Cargando citas…</div>
                  ) : filteredAppointments.length === 0 ? (
                    <div style={{ padding: 32, borderRadius: 12, background: '#f8fafc', textAlign: 'center', color: '#718096', fontSize: 12 }}>No hay citas con esos filtros.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {filteredAppointments.map(appointment => {
                        const patient = patients.find(item => item.id === appointment.patientId)
                        const doctor = doctors.find(item => item.id === appointment.doctorId)
                        const status = STATUS_OPTIONS.find(item => item.value === appointment.status)?.label ?? appointment.status
                        return (
                          <button
                            key={appointment.id}
                            type="button"
                            onClick={() => selectAppointment(appointment)}
                            style={{
                              width: '100%',
                              display: 'grid',
                              gridTemplateColumns: '72px minmax(0,1fr) auto',
                              alignItems: 'center',
                              gap: 10,
                              padding: '10px 12px',
                              border: '1px solid #e4eaf0',
                              borderRadius: 11,
                              background: '#fff',
                              textAlign: 'left',
                              cursor: 'pointer',
                            }}
                          >
                            <strong style={{ fontSize: 12, color: '#334155' }}>{appointment.time}</strong>
                            <span style={{ minWidth: 0 }}>
                              <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: '#1a2535' }}>{patient?.name ?? 'Paciente'}</strong>
                              <small style={{ display: 'block', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#718096', fontSize: 9 }}>{doctor?.name ?? 'Fisioterapeuta'} · {appointment.type || 'Sin tratamiento'}</small>
                            </span>
                            <span style={{ padding: '4px 8px', borderRadius: 999, background: '#f1f5f9', color: '#52657a', fontSize: 9, fontWeight: 800 }}>{status}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button type="button" onClick={closeEditor} style={{ marginBottom: 14, border: 'none', background: 'transparent', color: '#5b84b1', fontSize: 11, fontWeight: 800, cursor: 'pointer', padding: 0 }}>← Volver a las citas</button>

                  <div style={{ marginBottom: 16, padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e7edf3' }}>
                    <strong style={{ display: 'block', fontSize: 14, color: '#1a2535' }}>{selectedPatient?.name ?? 'Paciente'}</strong>
                    <span style={{ display: 'block', marginTop: 2, fontSize: 10, color: '#718096' }}>{selectedPatient?.phone ?? ''}</span>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ marginBottom: 7, fontSize: 10, fontWeight: 900, color: '#52657a' }}>ESTADO / RESULTADO</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 7 }}>
                      {STATUS_OPTIONS.map(option => {
                        const active = form.status === option.value
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setForm(current => current ? { ...current, status: option.value } : current)}
                            style={{
                              padding: '9px 10px',
                              border: active ? '1.5px solid #5b84b1' : '1px solid #dde5ed',
                              borderRadius: 10,
                              background: active ? '#edf5fd' : '#fff',
                              textAlign: 'left',
                              cursor: 'pointer',
                            }}
                          >
                            <strong style={{ display: 'block', color: active ? '#41698f' : '#334155', fontSize: 11 }}>{option.label}</strong>
                            <span style={{ display: 'block', marginTop: 2, color: '#8493a5', fontSize: 8, lineHeight: 1.3 }}>{option.helper}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 11 }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#718096' }}>FISIOTERAPEUTA</span>
                      <select disabled={!!myDoctor} value={form.doctorId} onChange={event => setForm(current => current ? { ...current, doctorId: event.target.value } : current)} style={{ padding: '9px 10px', border: '1px solid #d8e1ea', borderRadius: 9, background: myDoctor ? '#f8fafc' : '#fff', fontSize: 12 }}>
                        {doctors.map(doctor => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}
                      </select>
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#718096' }}>CONSULTORIO</span>
                      <select value={form.room} onChange={event => setForm(current => current ? { ...current, room: event.target.value } : current)} style={{ padding: '9px 10px', border: '1px solid #d8e1ea', borderRadius: 9, background: '#fff', fontSize: 12 }}>
                        <option value="">Sin consultorio</option>
                        {consultorios.map(room => <option key={room.id} value={room.nombre}>{room.nombre}</option>)}
                      </select>
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#718096' }}>FECHA</span>
                      <input type="date" value={form.date} onChange={event => setForm(current => current ? { ...current, date: event.target.value } : current)} style={{ padding: '9px 10px', border: '1px solid #d8e1ea', borderRadius: 9, fontSize: 12 }} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#718096' }}>HORA</span>
                      <input type="time" step="900" value={form.time} onChange={event => setForm(current => current ? { ...current, time: event.target.value } : current)} style={{ padding: '9px 10px', border: '1px solid #d8e1ea', borderRadius: 9, fontSize: 12 }} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#718096' }}>DURACIÓN (MIN)</span>
                      <input type="number" min="1" max="480" value={form.duration} onChange={event => setForm(current => current ? { ...current, duration: event.target.value } : current)} style={{ padding: '9px 10px', border: '1px solid #d8e1ea', borderRadius: 9, fontSize: 12 }} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#718096' }}>MONTO</span>
                      <input type="number" min="0" value={form.amount} onChange={event => setForm(current => current ? { ...current, amount: event.target.value } : current)} style={{ padding: '9px 10px', border: '1px solid #d8e1ea', borderRadius: 9, fontSize: 12 }} />
                    </label>
                  </div>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 11 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: '#718096' }}>TRATAMIENTO</span>
                    <input value={form.treatment} onChange={event => setForm(current => current ? { ...current, treatment: event.target.value } : current)} style={{ padding: '9px 10px', border: '1px solid #d8e1ea', borderRadius: 9, fontSize: 12 }} />
                  </label>

                  <div style={{ marginTop: 13 }}>
                    <div style={{ marginBottom: 6, fontSize: 9, fontWeight: 800, color: '#718096' }}>TIPO DE CITA</div>
                    <div style={{ display: 'flex', gap: 7 }}>
                      {([
                        { value: 'inicial' as PatientType, label: 'Inicial' },
                        { value: 'subsecuente' as PatientType, label: 'Subsecuente' },
                      ]).map(option => (
                        <button key={option.value} type="button" onClick={() => setForm(current => current ? { ...current, patientType: option.value } : current)} style={{ padding: '8px 12px', borderRadius: 9, border: form.patientType === option.value ? '1.5px solid #5b84b1' : '1px solid #dce4ec', background: form.patientType === option.value ? '#edf5fd' : '#fff', color: form.patientType === option.value ? '#41698f' : '#718096', fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>{option.label}</button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 9, marginTop: 20 }}>
                    <button type="button" onClick={closeEditor} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid #dce4ec', background: '#fff', color: '#64748b', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>Cancelar</button>
                    <button type="button" disabled={saving} onClick={saveAppointment} style={{ flex: 2, padding: '11px 0', borderRadius: 10, border: 'none', background: saving ? '#94a3b8' : '#5b84b1', color: '#fff', fontSize: 12, fontWeight: 900, cursor: saving ? 'default' : 'pointer' }}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
