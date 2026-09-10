import { useEffect, useMemo, useState } from 'react'
import { useDoctores, usePacientes } from '../../lib/hooks'
import { supabase } from '../../lib/supabase'
import { useStore } from '../../store/useStore'
import { PatientPicker } from '../ui/PatientPicker'
import type { Appointment, PatientType } from '../../types'

type PatientTypeManagerProps = {
  mode: 'agenda' | 'patients'
}

function localISODate() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return value
  return new Date(year, month - 1, day).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function PatientTypeManager({ mode }: PatientTypeManagerProps) {
  const { data: patients } = usePacientes()
  const { data: doctors } = useDoctores()
  const showToast = useStore(state => state.showToast)
  const currentUser = useStore(state => state.currentUser)

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(localISODate)
  const [search, setSearch] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  async function fetchAppointments() {
    const { data: rows, error } = await supabase
      .from('citas')
      .select('*')
      .order('date')
      .order('time')

    if (error) {
      showToast(`No se pudieron cargar las citas: ${error.message}`, 'error')
      setLoading(false)
      return
    }

    setAppointments((rows ?? []).map(row => ({
      id: row.id,
      patientId: row.patient_id,
      doctorId: row.doctor_id,
      clinicId: row.clinic_id,
      room: row.room,
      date: row.date,
      time: (row.time as string).slice(0, 5),
      duration: row.duration,
      type: row.type,
      status: row.status,
      patientType: (row.patient_type ?? 'subsecuente') as PatientType,
      amount: Number(row.amount),
    })))
    setLoading(false)
  }

  useEffect(() => {
    fetchAppointments()
    // Este editor no abre un segundo canal Realtime: Agenda ya mantiene su propia suscripción.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const myDoctor = currentUser?.role === 'doctor'
    ? doctors.find(doctor => doctor.name === currentUser.name) ?? null
    : null

  const scopedAppointments = useMemo(() => (
    myDoctor
      ? appointments.filter(appointment => appointment.doctorId === myDoctor.id)
      : appointments
  ), [appointments, myDoctor])

  const visibleAppointments = useMemo(() => {
    if (mode === 'patients') {
      if (!selectedPatientId) return []
      return scopedAppointments
        .filter(appointment => appointment.patientId === selectedPatientId)
        .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))
        .slice(0, 20)
    }

    const normalizedSearch = search.trim().toLowerCase()
    return scopedAppointments
      .filter(appointment => appointment.date === date)
      .filter(appointment => {
        if (!normalizedSearch) return true
        const patient = patients.find(item => item.id === appointment.patientId)
        return patient?.name.toLowerCase().includes(normalizedSearch) ?? false
      })
      .sort((a, b) => a.time.localeCompare(b.time))
  }, [mode, scopedAppointments, selectedPatientId, date, search, patients])

  async function updatePatientType(appointmentId: number, patientType: PatientType) {
    setSavingId(appointmentId)
    const { error } = await supabase
      .from('citas')
      .update({ patient_type: patientType })
      .eq('id', appointmentId)

    if (error) {
      showToast(`No se pudo actualizar: ${error.message}`, 'error')
    } else {
      setAppointments(current => current.map(appointment =>
        appointment.id === appointmentId ? { ...appointment, patientType } : appointment
      ))
      showToast(
        patientType === 'inicial' ? 'Cita marcada como inicial' : 'Cita marcada como subsecuente',
        'success'
      )
    }
    setSavingId(null)
  }

  const selectedPatient = selectedPatientId
    ? patients.find(patient => patient.id === selectedPatientId) ?? null
    : null

  return (
    <section style={{
      marginBottom: 14,
      border: '1px solid #dfe7ef',
      borderRadius: 14,
      background: '#fff',
      boxShadow: '0 3px 12px rgba(20,38,60,0.05)',
      overflow: 'hidden',
    }}>
      {/* Toda cita nueva nace como subsecuente. Se oculta el selector antiguo del alta
          para evitar que vuelva a inferir o sugerir una clasificación automática. */}
      {mode === 'agenda' && (
        <style>{`.agenda-page div:has(> .patient-type-options) { display: none !important; }`}</style>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        padding: '12px 14px', background: '#f8fafc',
        borderBottom: collapsed ? 'none' : '1px solid #edf1f5',
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#1a2535' }}>
            Clasificación Inicial / Subsecuente
          </div>
          <div style={{ marginTop: 2, fontSize: 10, color: '#6b7c90', lineHeight: 1.4 }}>
            Todas las citas son subsecuentes por defecto. Marca “Inicial” solo cuando corresponda.
          </div>
        </div>
        <button type="button" onClick={() => setCollapsed(value => !value)} style={{
          flexShrink: 0, border: '1px solid #d7e0e9', borderRadius: 8, background: '#fff',
          color: '#52657a', padding: '6px 9px', fontSize: 10, fontWeight: 700, cursor: 'pointer',
        }}>
          {collapsed ? 'Mostrar' : 'Ocultar'}
        </button>
      </div>

      {!collapsed && (
        <div style={{ padding: 14 }}>
          {mode === 'agenda' ? (
            <div style={{
              display: 'grid', gridTemplateColumns: 'minmax(150px, 190px) minmax(180px, 1fr)',
              gap: 10, marginBottom: 12,
            }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#718096', letterSpacing: '.4px' }}>FECHA</span>
                <input type="date" value={date} onChange={event => setDate(event.target.value)} style={{
                  width: '100%', boxSizing: 'border-box', border: '1px solid #d6e0ea', borderRadius: 8,
                  padding: '8px 10px', background: '#fff', color: '#1a2535', fontSize: 12,
                }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#718096', letterSpacing: '.4px' }}>BUSCAR PACIENTE</span>
                <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Nombre del paciente…" style={{
                  width: '100%', boxSizing: 'border-box', border: '1px solid #d6e0ea', borderRadius: 8,
                  padding: '8px 10px', background: '#fff', color: '#1a2535', fontSize: 12,
                }} />
              </label>
            </div>
          ) : (
            <div style={{ marginBottom: 12 }}>
              <div style={{ marginBottom: 4, fontSize: 9, fontWeight: 800, color: '#718096', letterSpacing: '.4px' }}>
                PACIENTE
              </div>
              <PatientPicker
                patients={patients}
                value={selectedPatient?.name ?? ''}
                onSelect={id => setSelectedPatientId(id)}
                style={{
                  width: '100%', boxSizing: 'border-box', border: '1px solid #d6e0ea', borderRadius: 8,
                  padding: '8px 10px', background: '#fff', color: '#1a2535', fontSize: 12,
                }}
              />
            </div>
          )}

          {loading ? (
            <div style={{ padding: '18px 0', textAlign: 'center', color: '#8493a5', fontSize: 11 }}>
              Cargando citas…
            </div>
          ) : visibleAppointments.length === 0 ? (
            <div style={{
              padding: '18px 12px', borderRadius: 10, background: '#f8fafc',
              textAlign: 'center', color: '#8493a5', fontSize: 11,
            }}>
              {mode === 'patients' && !selectedPatientId
                ? 'Selecciona un paciente para ver sus citas.'
                : 'No hay citas que mostrar con estos filtros.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 330, overflowY: 'auto' }}>
              {visibleAppointments.map(appointment => {
                const patient = patients.find(item => item.id === appointment.patientId)
                const doctor = doctors.find(item => item.id === appointment.doctorId)
                const saving = savingId === appointment.id

                return (
                  <div key={appointment.id} style={{
                    display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 12,
                    alignItems: 'center', padding: '9px 10px', border: '1px solid #e6ecf2',
                    borderRadius: 10, background: '#fff',
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: 12, color: '#1a2535' }}>{patient?.name ?? 'Paciente'}</strong>
                        <span style={{ fontSize: 9, color: '#7d8da0', fontWeight: 700 }}>
                          {formatDate(appointment.date)} · {appointment.time}
                        </span>
                      </div>
                      <div style={{
                        marginTop: 2, color: '#68798d', fontSize: 10, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {appointment.type || 'Sin tratamiento'}{doctor ? ` · ${doctor.name}` : ''}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 5 }}>
                      {([
                        { value: 'inicial' as PatientType, short: 'I', label: 'Inicial' },
                        { value: 'subsecuente' as PatientType, short: 'S', label: 'Subsecuente' },
                      ]).map(option => {
                        const active = appointment.patientType === option.value
                        return (
                          <button
                            key={option.value}
                            type="button"
                            disabled={saving}
                            title={option.label}
                            aria-pressed={active}
                            onClick={() => updatePatientType(appointment.id, option.value)}
                            style={{
                              minWidth: option.value === 'inicial' ? 34 : 42, height: 31, padding: '0 9px',
                              borderRadius: 8,
                              border: active
                                ? `1px solid ${option.value === 'inicial' ? '#5b84b1' : '#718096'}`
                                : '1px solid #dce4ec',
                              background: active
                                ? option.value === 'inicial' ? '#eaf2fb' : '#eef1f5'
                                : '#fff',
                              color: active
                                ? option.value === 'inicial' ? '#41698f' : '#4f5e70'
                                : '#8a98a8',
                              fontSize: 11, fontWeight: 800, cursor: saving ? 'default' : 'pointer',
                              opacity: saving ? 0.6 : 1,
                            }}
                          >
                            {option.short}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
