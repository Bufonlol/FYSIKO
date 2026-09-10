import React, { useState, useEffect } from 'react'
import { useCitas, usePacientes, useDoctores, useConsultorios, useBloqueosAgenda } from '../lib/hooks'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'
import { FadeContent } from '../components/animations'
import { Icon } from '../components/ui/Icon'
import { LoadingState } from '../components/ui/FeedbackState'
import { PatientPicker } from '../components/ui/PatientPicker'
import type { AppointmentStatus, PatientType } from '../types'

const HOURS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00']

const TRATAMIENTOS = [
  'CONSULTA DE PRIMERA VEZ INFANTIL',
  'CONSULTA DE PRIMERA VEZ ADULTO',
  'RADIOGRAFIA',
  'PROFILAXIS Y APLICACIÓN DE FLUOR INFANTIL',
  'APLICACIÓN DE FLUOR EN BARNIZ',
  'PROFILAXIS (ULTRASONIDO) ADULTO',
  'RESINAS ADULTO GRADO 1',
  'RESINA COMPUESTA',
  'RESINA NIÑOS',
  'EXTRACCION ADULTO',
  'EXTRACCIÓN NIÑOS',
  'EXTRACCION DE CORDALES SUPERIORES',
  'PULPOTOMIA',
  'PULPECTOMIA',
  'CORONA DE ACERO CROMO',
  'BLANQUEAMIENTO',
  'BLANQUEAMIENTO CON GUARDAS',
  'FRENILECTOMIA',
  'TX. POR OPERCULITIS',
  'SELLADORES DE FOSETAS Y FISURAS',
  'CARILLAS EMAX',
  'CARILLAS ZIRCONIO',
  'JACKET CON DIENTE DE RESINA',
  'CORONA EMAX',
  'CORONA ZIRCONIO',
  'INCRUSTACION POLIVIDRIO',
  'PLACA PROVISIONAL DE 1 A 3 UNIDADES',
  'PLACA PROVISIONAL DE 4 A 7 UNIDADES',
  'PLACA PROVISIONAL DE 8 A 12 UNIDADES',
  'TRATAMIENTO DE ORTODONCIA',
  'TRATAMIENTO DE ORTODONCIA ESTETICO',
  'CONSULTA DE ORTODONCIA',
  'BONDEADO DE BRACKET',
  'CEMENTACION DE BANDA',
  'BONDEADO DE TUBO',
  'GUARDAS',
  'GUARDA DE ALTO IMPACTO',
  'TRATAMIENTO DE ORTOPEDIA',
  'CONSULTA DE ORTOPEDIA',
  'REPOSICIÓN DE APARATO',
  'ELIMINADORES DE HABITOS',
  'CEMENTACION DE MANTENEDOR',
  'MANTENEDOR DE ESPACIO BILATERAL',
  'MANTENEDOR DE ESPACIO UNILARAL',
  'ENDODONCIA ANTERIORES',
  'ENDODONCIA POSTERIORES',
  'RETRATAMIENTO DE ENDODONCIA',
  'BLANQUEAMIENTO INTERCONDUCTO',
  'ALARGAMIENTO DE CORONA',
  'ENDOPOSTE',
  'CIRUGIA DE TERCER MOLAR',
  'RESINA CORONA CELULOIDE INFANTIL',
  'RESINA CORONA CELULOIDE ADULTO',
  'IONOMERO RESTAURATIVO PEDIATRICO',
  'TERAPIA PULPAR ADULTO',
  'CURETAJE',
  'IMPLANTE',
  'PROTESIS FLEXIBLE UNILATERAL',
  'PROTESIS FLEXIBLE BILATERAL',
  'PROTESIS FLEXIBLE PARCIAL',
  'PROTESIS FLEXIBLE TOTAL',
  'PROTESIS ACRILICO TOTAL',
  'PROTESIS ACRILICO PARCIAL',
  'PROTESIS ACRILICO BILATERAL',
  'PROTESIS ACRILICO UNILATERAL',
  'REBASE PARA PROTESIS',
  'VALORACIÓN',
  'RETIRO DE ORTODONCIA',
  'TOMA DE IMPRESIONES',
  'ENTREGA DE APARATO O CEMENTACIÓN',
  'EQUIA',
  'IONOMERO',
]

// 15-minute granularity for the appointment form
const HOUR_NUMS = [8,9,10,11,12,13,14,15,16,17,18,19,20]
function toMin(t: string): number { const [h,m] = t.split(':').map(Number); return h*60+(m||0) }
function fmtSlot(h: number, m: number): string { return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}` }
function fmtTimeRange(time: string, duration = 60): string {
  const start = toMin(time)
  const end = start + duration
  const endHour = Math.floor(end / 60) % 24
  const endMinute = end % 60
  return `${fmtSlot(Math.floor(start / 60), start % 60)} - ${fmtSlot(endHour, endMinute)}`
}

const DAY_NAMES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const DAY_INITIALS = ['D','L','M','M','J','V','S']
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const STATUS_COLORS: Record<AppointmentStatus,string> = {
  confirmada:'#6f9d2e', pendiente:'#a86f00', en_curso:'#4a72a0', cancelada:'#d56a00',
  finalizada:'#2f855a', reagendada:'#7656a6', no_asistio:'#c2414f',
}
const STATUS_LABELS: Record<AppointmentStatus, string> = {
  confirmada:'Confirmada', pendiente:'Pendiente', en_curso:'En curso',
  cancelada:'Canceló · falta reprogramar', finalizada:'Asistió',
  reagendada:'Reagendó', no_asistio:'No asistió',
}
const STATUS_SHORT: Record<AppointmentStatus, string> = {
  confirmada:'Confirmó', pendiente:'Pendiente', en_curso:'En curso', cancelada:'Canceló',
  finalizada:'Asistió', reagendada:'Reagendó', no_asistio:'No asistió',
}
const NON_BLOCKING_STATUSES = new Set<AppointmentStatus>(['cancelada', 'reagendada', 'no_asistio'])
const FINAL_OUTCOME_STATUSES = new Set<AppointmentStatus>(['cancelada', 'reagendada', 'no_asistio', 'finalizada'])
const OUTCOME_OPTIONS: { status: AppointmentStatus; label: string; helper: string }[] = [
  { status:'finalizada', label:'Asistió', helper:'La consulta sí se realizó' },
  { status:'reagendada', label:'Reagendó', helper:'Ya acordó una nueva fecha' },
  { status:'no_asistio', label:'No asistió', helper:'No llegó ni canceló antes' },
  { status:'cancelada', label:'Canceló', helper:'Todavía falta reprogramar' },
]

function isBlockingStatus(status: AppointmentStatus) { return !NON_BLOCKING_STATUSES.has(status) }
function isFinalOutcome(status: AppointmentStatus) { return FINAL_OUTCOME_STATUSES.has(status) }

function getMonday(d: Date): Date {
  const r = new Date(d); r.setHours(0,0,0,0)
  const day = r.getDay(); r.setDate(r.getDate() - (day === 0 ? 6 : day - 1)); return r
}
function addDays(d: Date, n: number): Date { const r = new Date(d); r.setDate(r.getDate() + n); return r }
// Usa la fecha local (no UTC) para evitar que la zona horaria corra el día
function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

const iStyle: React.CSSProperties = {
  width:'100%', padding:'9px 12px', borderRadius:8,
  border:'1.5px solid #e2e8f0', fontSize:13, color:'#1a2535',
  outline:'none', boxSizing:'border-box', background:'#fff',
}
const lStyle: React.CSSProperties = {
  fontSize:11, fontWeight:700, color:'#8a9ab0',
  letterSpacing:'0.5px', marginBottom:5, display:'block',
}

function TratamientoCombobox({ values, onChange, lStyle, iStyle }: {
  values: string[]
  onChange: (v: string[]) => void
  lStyle: React.CSSProperties
  iStyle: React.CSSProperties
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = (query.trim() === ''
    ? TRATAMIENTOS
    : TRATAMIENTOS.filter(t => t.toLowerCase().includes(query.toLowerCase()))
  ).filter(t => !values.includes(t))

  function add(t: string) {
    if (!values.includes(t)) onChange([...values, t])
    setQuery('')
  }

  function remove(t: string) {
    onChange(values.filter(v => v !== t))
  }

  return (
    <div style={{ position: 'relative' }}>
      <label style={lStyle}>TRATAMIENTOS *</label>

      {values.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:6 }}>
          {values.map(t => (
            <span key={t} style={{
              display:'inline-flex', alignItems:'center', gap:6,
              background:'#eef4fb', border:'1.5px solid #b8cce0', borderRadius:16,
              padding:'3px 8px 3px 10px', fontSize:11, fontWeight:700, color:'#2b4a6b',
            }}>
              {t}
              <button
                type="button"
                onMouseDown={e => { e.preventDefault(); remove(t) }}
                style={{ background:'none', border:'none', cursor:'pointer', color:'#5b84b1',
                  fontSize:13, padding:0, lineHeight:1 }}
              >✕</button>
            </span>
          ))}
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <input
          placeholder="Buscar y agregar tratamiento…"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          style={iStyle}
        />
      </div>
      {open && filtered.length > 0 && (
        <div style={{
          position:'absolute', zIndex:999, top:'calc(100% + 2px)', left:0, right:0,
          background:'#fff', border:'1.5px solid #b8cce0', borderRadius:8,
          boxShadow:'0 8px 24px rgba(0,0,0,0.12)', maxHeight:220, overflowY:'auto',
        }}>
          {filtered.map(t => (
            <div
              key={t}
              onMouseDown={() => add(t)}
              style={{
                padding:'8px 12px', fontSize:12, cursor:'pointer', color:'#1a2535',
                borderBottom:'1px solid #f0f4f8',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f0f7ff')}
              onMouseLeave={e => (e.currentTarget.style.background = '')}
            >
              {t}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function Agenda() {
  const _td = new Date()
  const TODAY_ISO = `${_td.getFullYear()}-${String(_td.getMonth()+1).padStart(2,'0')}-${String(_td.getDate()).padStart(2,'0')}`
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [miniMonth, setMiniMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [detailAppt, setDetailAppt] = useState<typeof allAppts[0] | null>(null)
  const [changingStatus, setChangingStatus] = useState(false)
  const [viewMode, setViewMode] = useState<'week' | 'doctor'>('week')
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [savingBlock, setSavingBlock] = useState(false)
  const showToast   = useStore(s => s.showToast)
  const currentUser = useStore(s => s.currentUser)

  async function handleDeleteAppt(id: number) {
    if (!window.confirm('¿Eliminar esta cita? No se enviará ninguna notificación al paciente.')) return
    setChangingStatus(true)
    const { error } = await supabase.from('citas').delete().eq('id', id)
    if (error) { showToast(error.message, 'error') }
    else {
      setDetailAppt(null)
      await refetch()
      showToast('Cita eliminada', 'success')
    }
    setChangingStatus(false)
  }

  async function notifyPatient(type: string, appt: typeof allAppts[0], oldDate?: string, oldTime?: string) {
    const pat = patients.find(p => p.id === appt.patientId)
    const doc = doctors.find(d => d.id === appt.doctorId)
    if (!pat) return
    try {
      await supabase.functions.invoke('notify-appointment', {
        body: {
          type,
          patient_id: appt.patientId,
          date: appt.date,
          time: appt.time,
          appt_type: appt.type,
          amount: appt.amount,
          doctor_name: doc?.name,
          old_date: oldDate,
          old_time: oldTime,
        },
      })
    } catch (e) {
      console.warn('notify-appointment error:', e)
    }
  }

  async function handleChangeStatus(id: number, status: AppointmentStatus) {
    setChangingStatus(true)
    const { error } = await supabase.from('citas').update({ status }).eq('id', id)
    if (error) { showToast(error.message, 'error') }
    else {
      setDetailAppt(prev => prev ? { ...prev, status } : null)
      await refetch()
      showToast('Estado actualizado', 'success')
      if (status === 'cancelada' && detailAppt) {
        notifyPatient('cancelada_staff', detailAppt)
      }
    }
    setChangingStatus(false)
  }

  const { data: patients, setData: setPatients } = usePacientes()
  const { data: doctors } = useDoctores()
  const { data: consultorios } = useConsultorios()
  const { data: allApptsRaw, loading: loadingCitas, refetch } = useCitas((appt) => {
    const pat = patients.find(p => p.id === appt.patientId)
    const name = pat?.name ?? 'Paciente'
    const [y, m, d] = appt.date.split('-')
    const fecha = `${d}/${m}/${y}`
    if (appt.status === 'confirmada') {
      showToast(`${name} confirmó su cita del ${fecha} a las ${appt.time}`, 'success')
    } else if (appt.status === 'cancelada') {
      showToast(`${name} canceló su cita del ${fecha} a las ${appt.time}. Horario liberado`, 'error')
    }
  })
  const { data: agendaBlocks, refetch: refetchBlocks } = useBloqueosAgenda()

  // Doctor filter: si el usuario logueado es doctor, solo ve sus citas
  const myDoctor = currentUser?.role === 'doctor'
    ? doctors.find(d => d.name === currentUser.name) ?? null
    : null
  const allAppts = myDoctor
    ? allApptsRaw.filter(a => a.doctorId === myDoctor.id)
    : allApptsRaw

  // Pre-cargar doctor en el form cuando el rol es doctor
  useEffect(() => {
    if (myDoctor) {
      setForm(f => ({ ...f, doctor_id: String(myDoctor.id) }))
    }
  }, [myDoctor?.id])

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const weekISO  = weekDays.map(toISO)
  const weekAppts = allAppts.filter(a => weekISO.includes(a.date))

  // ── Form ──────────────────────────────────────────
  const [form, setForm] = useState({
    patient_id:'', doctor_id:'', treatments: [] as string[], date: TODAY_ISO,
    time:'09:00', duration:'60', room:'Consultorio 1', amount:'0', patient_type:'inicial' as PatientType,
  })
  const [blockForm, setBlockForm] = useState({
    doctor_id: '', date: TODAY_ISO, reason: 'Vacaciones',
  })

  function inferPatientType(patientId: number): PatientType {
    if (!patientId) return 'inicial'
    const patient = patients.find(item => item.id === patientId)
    const hasPreviousAppointment = allAppts.some(appointment => appointment.patientId === patientId)
    return patient?.status === 'nuevo' || !hasPreviousAppointment ? 'inicial' : 'subsecuente'
  }

  function openBlockModal(date = toISO(selectedDate), doctorId = '') {
    setBlockForm({
      doctor_id: doctorId || (myDoctor ? String(myDoctor.id) : ''),
      date,
      reason: 'Vacaciones',
    })
    setShowBlockModal(true)
  }

  async function handleBlockDay() {
    const doctorId = Number(blockForm.doctor_id)
    const reason = blockForm.reason.trim()
    if (!doctorId || !blockForm.date || !reason) return

    const affected = allAppts.filter(a =>
      a.doctorId === doctorId &&
      a.date === blockForm.date &&
      !isFinalOutcome(a.status)
    )
    const doctor = doctors.find(d => d.id === doctorId)
    const confirmation = affected.length > 0
      ? `Se cancelarán ${affected.length} cita${affected.length !== 1 ? 's' : ''} de ${doctor?.name ?? 'la doctora'} y se notificará a sus pacientes. ¿Continuar?`
      : `Se marcará el día completo como no disponible para ${doctor?.name ?? 'la doctora'}. ¿Continuar?`
    if (!window.confirm(confirmation)) return

    setSavingBlock(true)
    const { error } = await supabase.rpc('bloquear_dia_consulta', {
      p_doctor_id: doctorId,
      p_fecha: blockForm.date,
      p_motivo: reason,
    })
    if (error) {
      showToast('No se pudo bloquear el día: ' + error.message, 'error')
    } else {
      setShowBlockModal(false)
      await Promise.all([refetch(), refetchBlocks()])
      await Promise.all(affected.map(appt => notifyPatient('cancelada_staff', appt)))
      showToast(
        affected.length > 0
          ? `Día bloqueado y ${affected.length} cita${affected.length !== 1 ? 's' : ''} cancelada${affected.length !== 1 ? 's' : ''}`
          : 'Día bloqueado correctamente',
        'success'
      )
    }
    setSavingBlock(false)
  }

  async function handleUnblockDay(blockId: number) {
    if (!window.confirm('¿Reabrir este día? Las citas que ya fueron canceladas no se restaurarán.')) return
    const { error } = await supabase.from('bloqueos_agenda').delete().eq('id', blockId)
    if (error) showToast('No se pudo reabrir el día: ' + error.message, 'error')
    else {
      await refetchBlocks()
      showToast('Día disponible nuevamente', 'success')
    }
  }

  async function handleAdd() {
    if (!form.patient_id || !form.doctor_id || form.treatments.length === 0) return

    const dayBlock = agendaBlocks.find(b =>
      b.doctorId === Number(form.doctor_id) && b.date === form.date
    )
    if (dayBlock) {
      showToast(`No se puede agendar: día bloqueado por ${dayBlock.reason}`, 'error')
      return
    }

    // Bloquear horas pasadas (si es hoy)
    if (form.date === TODAY_ISO) {
      const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
      if (toMin(form.time) <= nowMin) {
        showToast('No se puede agendar en una hora pasada', 'error')
        return
      }
    }

    // Conflicto de consultorio con solapamiento real por duración
    if (form.room) {
      const newStart = toMin(form.time)
      const newEnd   = newStart + Number(form.duration || 60)
      const conflict = allAppts.find(a => {
        if (a.room !== form.room || a.date !== form.date || !isBlockingStatus(a.status)) return false
        const aStart = toMin(a.time), aEnd = aStart + (a.duration || 60)
        return newStart < aEnd && newEnd > aStart
      })
      if (conflict) {
        const pat = patients.find(p => p.id === conflict.patientId)
        showToast(`${form.room} está ocupado en ese horario (cita de ${pat?.name ?? 'otro paciente'} a las ${conflict.time})`, 'error')
        return
      }
    }

    // Conflicto del doctor con solapamiento real
    if (form.doctor_id) {
      const newStart = toMin(form.time)
      const newEnd   = newStart + Number(form.duration || 60)
      const conflict = allAppts.find(a => {
        if (a.doctorId !== Number(form.doctor_id) || a.date !== form.date || !isBlockingStatus(a.status)) return false
        const aStart = toMin(a.time), aEnd = aStart + (a.duration || 60)
        return newStart < aEnd && newEnd > aStart
      })
      if (conflict) {
        const pat = patients.find(p => p.id === conflict.patientId)
        showToast(`El doctor ya tiene cita en ese horario (${pat?.name ?? 'otro paciente'} a las ${conflict.time})`, 'error')
        return
      }
    }

    setSaving(true)

    const pat = patients.find(p => p.id === Number(form.patient_id))
    const doc = doctors.find(d => d.id === Number(form.doctor_id))
    const monto = Number(form.amount) || 0

    const { data: citaData, error } = await supabase.from('citas').insert({
      patient_id: Number(form.patient_id), doctor_id: Number(form.doctor_id),
      clinic_id: 1, room: form.room || 'Consultorio 1',
      date: form.date, time: form.time + ':00',
      duration: Number(form.duration), type: form.treatments.join(', '),
      status: 'pendiente', patient_type: form.patient_type, amount: monto,
    }).select().single()

    if (error) { showToast('Error: ' + error.message, 'error') }
    else {
      const folio = `V-${form.date.replace(/-/g,'').slice(2)}-${String(citaData.id).padStart(4,'0')}`
      await supabase.from('ventas').insert({
        folio,
        patient: pat?.name ?? '',
        doctor: doc?.name ?? '',
        services: form.treatments,
        total: monto,
        paid: 0,
        status: 'pendiente',
        date: form.date,
      })
      showToast('Cita agendada correctamente', 'success')
      setShowModal(false)
      setForm({ patient_id:'', doctor_id:'', treatments: [], date: TODAY_ISO, time:'09:00', duration:'60', room:'Consultorio 1', amount:'0', patient_type:'inicial' })
      setShowNewPatient(false)
      await refetch()
      // Notificar al paciente por WhatsApp
      if (citaData) {
        notifyPatient('nueva', {
          id: citaData.id, patientId: citaData.patient_id, doctorId: citaData.doctor_id,
          date: citaData.date, time: citaData.time, type: citaData.type,
          duration: citaData.duration, room: citaData.room, status: citaData.status,
          patientType: citaData.patient_type, amount: citaData.amount,
        } as any)
      }
    }
    setSaving(false)
  }

  // ── Alta rápida de paciente (desde el modal de Nueva Cita) ──
  const [showNewPatient, setShowNewPatient] = useState(false)
  const [newPatientForm, setNewPatientForm] = useState({ name: '', phone: '' })
  const [creatingPatient, setCreatingPatient] = useState(false)

  async function handleQuickCreatePatient() {
    const name = newPatientForm.name.trim()
    const phone = newPatientForm.phone.trim()
    if (!name || !phone) { showToast('Nombre y teléfono son obligatorios', 'error'); return }
    const dup = patients.find(p => p.name.trim().toLowerCase() === name.toLowerCase())
    if (dup) {
      // Ya existe: lo seleccionamos en vez de dejar que lo creen de nuevo
      setForm(f => ({ ...f, patient_id: String(dup.id), patient_type: inferPatientType(dup.id) }))
      setNewPatientForm({ name: '', phone: '' })
      setShowNewPatient(false)
      showToast(`"${dup.name}" ya existe. Lo seleccioné por ti`, 'error')
      return
    }
    setCreatingPatient(true)
    const { data, error } = await supabase.from('pacientes')
      .insert({ name, phone, status: 'nuevo' })
      .select().single()
    setCreatingPatient(false)
    if (error) { showToast('Error al crear paciente: ' + error.message, 'error'); return }
    setPatients(prev => [...prev, {
      id: data.id, name: data.name, age: data.age ?? 0, phone: data.phone ?? '', email: data.email ?? '',
      lastVisit: data.last_visit, nextAppointment: data.next_appointment,
      status: data.status, doctor: data.doctor, fechaNacimiento: data.fecha_nacimiento ?? null,
    }].sort((a, b) => a.name.localeCompare(b.name)))
    setForm(f => ({ ...f, patient_id: String(data.id), patient_type: 'inicial' }))
    setNewPatientForm({ name: '', phone: '' })
    setShowNewPatient(false)
    showToast(`Paciente "${name}" creado y seleccionado`, 'success')
  }

  // ── Mini-calendar ─────────────────────────────────
  const mYear = miniMonth.getFullYear(), mMonth = miniMonth.getMonth()
  const firstDow = new Date(mYear, mMonth, 1).getDay()
  const daysInMo = new Date(mYear, mMonth + 1, 0).getDate()
  // El encabezado del mini-calendario es domingo-primero (D L M M J V S),
  // así que el desfase inicial es directamente el día de la semana (0=Dom).
  const offset = firstDow
  const cells: (number|null)[] = [...Array(offset).fill(null)]
  for (let d = 1; d <= daysInMo; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const selectedISO = toISO(selectedDate)
  const dayAppts = allAppts.filter(a => a.date === selectedISO).sort((a, b) => a.time.localeCompare(b.time))
  const selectedDayBlocks = agendaBlocks.filter(b => b.date === selectedISO)
  const formDayBlock = agendaBlocks.find(b =>
    b.doctorId === Number(form.doctor_id) && b.date === form.date
  )

  // ── Render ────────────────────────────────────────
  return (
    <div className="app-page agenda-page">
    {/* ── MOBILE DAY VIEW ─────────────────────────── */}
    <div className="agenda-mobile">
      {/* Date strip */}
      <div style={{ overflowX: 'auto', display: 'flex', gap: 8, padding: '2px 0 6px', scrollbarWidth: 'none' }}>
        {weekDays.map((day, i) => {
          const iso = toISO(day)
          const isSel = iso === toISO(selectedDate)
          const isToday = iso === TODAY_ISO
          const cnt = allAppts.filter(a => a.date === iso).length
          return (
            <button key={i} onClick={() => setSelectedDate(day)} style={{
              flexShrink: 0, width: 52, height: 64, borderRadius: 14, border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
              background: isSel ? '#5b84b1' : isToday ? '#e8f0f8' : '#fff',
              color: isSel ? '#fff' : isToday ? '#5b84b1' : '#4a5568',
              boxShadow: isSel ? '0 4px 12px rgba(91,132,177,0.35)' : '0 2px 6px rgba(0,0,0,0.06)',
              transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase' }}>{DAY_NAMES[day.getDay()]}</span>
              <span style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{day.getDate()}</span>
              {cnt > 0 && <div style={{ width: 5, height: 5, borderRadius: '50%', background: isSel ? 'rgba(255,255,255,0.7)' : '#5b84b1' }} />}
            </button>
          )
        })}
      </div>

      {/* Day header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a2535', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {DAY_NAMES[selectedDate.getDay()]}, {selectedDate.getDate()} {MONTHS[selectedDate.getMonth()]}
          </h3>
          <p style={{ fontSize: 12, color: '#8a9ab0', margin: '2px 0 0' }}>
            {dayAppts.length} cita{dayAppts.length !== 1 ? 's' : ''} programada{dayAppts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display:'flex', gap:6, flexShrink:0 }}>
          <button onClick={() => openBlockModal(selectedISO)} style={{
            background:'#fff', color:'#c2414f', border:'1.5px solid #f1b8bf', borderRadius:10,
            padding:'9px 12px', fontSize:12, fontWeight:700, cursor:'pointer',
          }}>Bloquear día</button>
          <button onClick={() => { setForm(f => ({ ...f, date: selectedISO })); setShowModal(true) }} style={{
            background: '#8db84a', color: '#fff', border: 'none', borderRadius: 10,
            padding: '10px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(141,184,74,0.35)',
          }}>+ Nueva cita</button>
        </div>
      </div>


      {selectedDayBlocks.length > 0 && (
        <div style={{ background:'#fff5f6', border:'1px solid #f3c7cc', borderRadius:12, padding:'10px 12px', display:'flex', flexDirection:'column', gap:8 }}>
          {selectedDayBlocks.map(block => {
            const doc = doctors.find(d => d.id === block.doctorId)
            return (
              <div key={block.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:800, color:'#9f3040', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc?.name ?? 'Doctora'} sin consulta</div>
                  <div style={{ fontSize:11, color:'#b55260' }}>{block.reason}</div>
                </div>
                <button onClick={() => handleUnblockDay(block.id)} style={{ background:'#fff', border:'1px solid #e5a5ad', color:'#9f3040', borderRadius:8, padding:'6px 9px', fontSize:10, fontWeight:700, flexShrink:0 }}>Reabrir</button>
              </div>
            )
          })}
        </div>
      )}

      {/* Appointment cards */}
      {loadingCitas ? (
        <LoadingState label="Cargando agenda" />
      ) : dayAppts.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}><Icon name="agenda" size={32} color="#8a9ab0" /></div>
          <p style={{ color: '#8a9ab0', fontSize: 13, fontWeight: 600 }}>Sin citas este día</p>
        </div>
      ) : (
        dayAppts.map(appt => {
          const doc = doctors.find(d => d.id === appt.doctorId)
          const pat = patients.find(p => p.id === appt.patientId)
          const color = doc?.color ?? STATUS_COLORS[appt.status] ?? '#5b84b1'
          return (
            <div key={appt.id} onClick={() => setDetailAppt(appt)} style={{
              background: '#fff', borderRadius: 14, padding: '14px 16px',
              boxShadow: '0 2px 8px rgba(20,38,60,0.06)', border: `1px solid ${color}45`,
              cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center',
              transition: 'transform 0.15s', width: '100%', boxSizing: 'border-box', overflow: 'hidden',
            }}
              onTouchStart={e => (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)'}
              onTouchEnd={e => (e.currentTarget as HTMLElement).style.transform = ''}
            >
              <div style={{ textAlign: 'center', flexShrink: 0, width: 76 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#1a2535', lineHeight: 1.25 }}>{fmtTimeRange(appt.time, appt.duration)}</div>
                <div style={{ fontSize: 10, color: '#8a9ab0', marginTop: 2 }}>{appt.duration}m</div>
                <span className={`patient-type-badge ${appt.patientType === 'inicial' ? 'is-initial' : ''}`} title={appt.patientType === 'inicial' ? 'Paciente de inicio' : 'Paciente subsecuente'}>
                  {appt.patientType === 'inicial' ? 'I' : 'S'}
                </span>
              </div>
              <div style={{ width: 1, height: 40, background: color + '40', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a2535', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {pat?.name ?? '-'}
                </div>
                <div style={{ fontSize: 12, color: '#4a5568', marginTop: 1 }}>{appt.type}</div>
                <div style={{ fontSize: 11, color: '#8a9ab0', marginTop: 1 }}>{doc?.name ?? '-'}</div>
              </div>
              <span style={{
                padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0,
                background: STATUS_COLORS[appt.status] + '20', color: STATUS_COLORS[appt.status],
                whiteSpace: 'nowrap',
              }}>{STATUS_SHORT[appt.status] ?? appt.status}</span>
            </div>
          )
        })
      )}

      {/* Semana anterior/siguiente */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 4 }}>
        <button onClick={() => { const w = addDays(weekStart, -7); setWeekStart(w); setSelectedDate(addDays(selectedDate, -7)) }}
          style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#4a5568', cursor: 'pointer' }}>
          ‹ Semana anterior
        </button>
        <button onClick={() => { const w = addDays(weekStart, 7); setWeekStart(w); setSelectedDate(addDays(selectedDate, 7)) }}
          style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#4a5568', cursor: 'pointer' }}>
          Semana siguiente ›
        </button>
      </div>
    </div>

    {/* ── DESKTOP WEEK GRID ───────────────────────── */}
    <div className="agenda-desktop">
    <div className="agenda-grid">

      {/* ── Left panel ── */}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

        {/* Mini-calendar */}
        <FadeContent style={{ background:'#fff', borderRadius:12, overflow:'hidden', boxShadow:'0 4px 16px rgba(0,0,0,0.08)' }}>
          <div style={{ padding:14 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <button onClick={() => setMiniMonth(new Date(mYear, mMonth-1, 1))}
                style={{ background:'transparent', border:'none', cursor:'pointer', color:'#8a9ab0', fontSize:18, lineHeight:1, padding:'2px 6px' }}>‹</button>
              <span style={{ fontSize:13, fontWeight:700, color:'#1a2535' }}>{MONTHS[mMonth]} {mYear}</span>
              <button onClick={() => setMiniMonth(new Date(mYear, mMonth+1, 1))}
                style={{ background:'transparent', border:'none', cursor:'pointer', color:'#8a9ab0', fontSize:18, lineHeight:1, padding:'2px 6px' }}>›</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:1 }}>
              {DAY_INITIALS.map((d,i) => (
                <div key={i} style={{ textAlign:'center', fontSize:10, fontWeight:700, color:'#8a9ab0', padding:'3px 0' }}>{d}</div>
              ))}
              {cells.map((d, i) => {
                if (!d) return <div key={i} />
                const iso = toISO(new Date(mYear, mMonth, d))
                const isToday    = iso === TODAY_ISO
                const isSelected = iso === toISO(selectedDate)
                const hasAppt    = allAppts.some(a => a.date === iso)
                return (
                  <div key={i} onClick={() => {
                    const clicked = new Date(mYear, mMonth, d)
                    setSelectedDate(clicked); setWeekStart(getMonday(clicked))
                  }} style={{
                    textAlign:'center', padding:'4px 2px', fontSize:11,
                    cursor:'pointer', borderRadius:20, fontWeight: isSelected||isToday ? 700 : 400,
                    background: isSelected ? '#5b84b1' : 'transparent',
                    color: isSelected ? '#fff' : isToday ? '#5b84b1' : '#1a2535',
                  }}>
                    {d}
                    {hasAppt && !isSelected && (
                      <div style={{ width:3, height:3, borderRadius:'50%', background:'#5b84b1', margin:'1px auto 0' }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </FadeContent>

        {/* Doctors legend */}
        <FadeContent delay={80} style={{ background:'#fff', borderRadius:12, padding:16, boxShadow:'0 4px 16px rgba(0,0,0,0.08)' }}>
          <p style={{ fontSize:11, fontWeight:700, color:'#8a9ab0', letterSpacing:'0.5px', marginBottom:12 }}>DOCTORES</p>
          {doctors.map(doc => (
            <div key={doc.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:doc.color, flexShrink:0 }} />
              <span style={{ fontSize:12, color:'#4a5568', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {doc.name.replace('Dra. ','').replace('Dr. ','')}
              </span>
            </div>
          ))}
        </FadeContent>
      </div>

      {/* ── Main calendar ── */}
      <FadeContent delay={40} style={{ background:'#fff', borderRadius:12, boxShadow:'0 4px 16px rgba(0,0,0,0.08)', display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Toolbar */}
        <div style={{ padding:'12px 16px', borderBottom:'1px solid #f0f2f5', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, flexWrap:'wrap', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {viewMode === 'week' ? (
              <div style={{ display:'flex', alignItems:'center', gap:0 }}>
                <button onClick={() => setWeekStart(w => addDays(w,-7))}
                  style={{ padding:'6px 12px', borderRadius:'8px 0 0 8px', fontSize:15, border:'1px solid #e2e8f0', background:'#fff', color:'#4a5568', cursor:'pointer' }}>‹</button>
                <div style={{ padding:'6px 14px', fontSize:12, fontWeight:600, border:'1px solid #e2e8f0', borderLeft:'none', borderRight:'none', background:'#e8f0f8', color:'#5b84b1', whiteSpace:'nowrap' }}>
                  {weekDays[0].getDate()} - {weekDays[6].getDate()} {MONTHS[weekDays[0].getMonth()]} {weekDays[0].getFullYear()}
                </div>
                <button onClick={() => setWeekStart(w => addDays(w, 7))}
                  style={{ padding:'6px 12px', borderRadius:'0 8px 8px 0', fontSize:15, border:'1px solid #e2e8f0', background:'#fff', color:'#4a5568', cursor:'pointer' }}>›</button>
              </div>
            ) : (
              <div style={{ display:'flex', alignItems:'center', gap:0 }}>
                <button onClick={() => { setSelectedDate(d => addDays(d,-1)); setWeekStart(getMonday(addDays(selectedDate,-1))) }}
                  style={{ padding:'6px 12px', borderRadius:'8px 0 0 8px', fontSize:15, border:'1px solid #e2e8f0', background:'#fff', color:'#4a5568', cursor:'pointer' }}>‹</button>
                <div style={{ padding:'6px 14px', fontSize:12, fontWeight:600, border:'1px solid #e2e8f0', borderLeft:'none', borderRight:'none', background:'#e8f0f8', color:'#5b84b1', whiteSpace:'nowrap' }}>
                  {DAY_NAMES[selectedDate.getDay()]}, {selectedDate.getDate()} {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </div>
                <button onClick={() => { setSelectedDate(d => addDays(d, 1)); setWeekStart(getMonday(addDays(selectedDate, 1))) }}
                  style={{ padding:'6px 12px', borderRadius:'0 8px 8px 0', fontSize:15, border:'1px solid #e2e8f0', background:'#fff', color:'#4a5568', cursor:'pointer' }}>›</button>
              </div>
            )}

            {/* View toggle */}
            <div style={{ display:'flex', borderRadius:8, overflow:'hidden', border:'1px solid #e2e8f0' }}>
              {(['week','doctor'] as const).map((mode, i) => (
                <button key={mode} onClick={() => setViewMode(mode)} style={{
                  padding:'6px 12px', fontSize:11, fontWeight:700, border:'none',
                  borderLeft: i > 0 ? '1px solid #e2e8f0' : 'none',
                  background: viewMode === mode ? '#5b84b1' : '#fff',
                  color: viewMode === mode ? '#fff' : '#8a9ab0',
                  cursor:'pointer', transition:'all 0.15s',
                  whiteSpace:'nowrap',
                }}>
                  {mode === 'week'
                    ? <><Icon name="agenda" size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Semana</>
                    : <><Icon name="doctors" size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Por doctor</>
                  }
                </button>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <button onClick={() => openBlockModal(toISO(selectedDate))} style={{
              padding:'7px 12px', borderRadius:8, fontSize:11, fontWeight:700,
              border:'1.5px solid #f1b8bf', background:'#fff', color:'#b63d4c', cursor:'pointer',
              display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap',
            }}>
              <Icon name="x" size={12} /> Bloquear día
            </button>
            <button onClick={() => { setForm(f => ({ ...f, date: toISO(selectedDate) })); setShowModal(true) }} style={{
              padding:'8px 16px', borderRadius:8, fontSize:12, fontWeight:700, border:'none',
              background:'#8db84a', color:'#fff', cursor:'pointer',
              display:'flex', alignItems:'center', gap:6,
              boxShadow:'0 4px 12px rgba(141,184,74,0.3)', whiteSpace:'nowrap',
            }}>
              <Icon name="plus" size={14} /> Nueva cita
            </button>
          </div>
        </div>


        {/* Grid */}
        <div style={{ flex:1, overflowY:'auto', overflowX:'auto' }}>
          {loadingCitas ? (
            <div style={{ padding:48, textAlign:'center', color:'#8a9ab0', fontSize:14 }}>Cargando citas…</div>
          ) : viewMode === 'week' ? (
            <div style={{ display:'grid', gridTemplateColumns:'52px repeat(7, 1fr)', minWidth:700 }}>

              {/* Header row */}
              <div style={{ background:'#f8fafc', borderBottom:'1px solid #f0f2f5', position:'sticky', top:0, zIndex:2 }} />
              {weekDays.map((day, i) => {
                const iso = toISO(day)
                const isToday    = iso === TODAY_ISO
                const isSelected = iso === toISO(selectedDate)
                const jsDay = day.getDay()
                const dayBlockCount = agendaBlocks.filter(b => b.date === iso).length
                return (
                  <div key={i} onClick={() => setSelectedDate(day)} style={{
                    padding:'8px 4px', background: isSelected ? '#f0f6ff' : '#f8fafc',
                    borderBottom:'1px solid #f0f2f5', borderLeft:'1px solid #f0f2f5',
                    textAlign:'center', cursor:'pointer', position:'sticky', top:0, zIndex:2,
                    transition:'background 0.15s',
                  }}>
                    <span style={{ fontSize:10, fontWeight:600, color:'#8a9ab0', display:'block', textTransform:'uppercase' }}>
                      {DAY_NAMES[jsDay]}
                    </span>
                    <div style={{
                      fontSize:15, fontWeight:800, marginTop:3,
                      width:28, height:28, borderRadius:'50%',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      margin:'3px auto 0',
                      background: isToday ? '#5b84b1' : 'transparent',
                      color: isToday ? '#fff' : isSelected ? '#5b84b1' : '#1a2535',
                    }}>{day.getDate()}</div>
                    {weekAppts.filter(a => a.date === iso).length > 0 && (
                      <div style={{ fontSize:9, color: isToday ? '#5b84b1' : '#8a9ab0', marginTop:2, fontWeight:600 }}>
                        {weekAppts.filter(a => a.date === iso).length} cita{weekAppts.filter(a => a.date === iso).length !== 1 ? 's' : ''}
                      </div>
                    )}
                    {dayBlockCount > 0 && (
                      <div style={{ fontSize:8, color:'#b63d4c', marginTop:2, fontWeight:800 }}>
                        {dayBlockCount} sin consulta
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Time rows */}
              {HOURS.map(hour => (
                <React.Fragment key={hour}>
                  <div key={`lbl-${hour}`} style={{ padding:'0 8px', minHeight:72, display:'flex', alignItems:'flex-start', paddingTop:10, borderBottom:'1px solid #f0f2f5' }}>
                    <span style={{ fontSize:11, color:'#8a9ab0', fontWeight:600 }}>{hour}</span>
                  </div>
                  {weekDays.map((day, di) => {
                    const iso = toISO(day)
                    const cellAppts = weekAppts.filter(a => a.date === iso && parseInt(a.time) === parseInt(hour))
                    return (
                      <div key={`cell-${hour}-${di}`} style={{
                        minHeight:72, borderBottom:'1px solid #f0f2f5', borderLeft:'1px solid #f0f2f5',
                        padding:'3px 4px', position:'relative', overflow:'visible',
                        background: toISO(day) === toISO(selectedDate) ? '#fafcff' : 'transparent',
                      }}>
                        {cellAppts.map(appt => {
                          const doc = doctors.find(d => d.id === appt.doctorId)
                          const pat = patients.find(p => p.id === appt.patientId)
                          const isCanceled = appt.status === 'cancelada'
                          const color = isCanceled ? '#e74c3c' : (doc?.color ?? STATUS_COLORS[appt.status] ?? '#5b84b1')
                          return (
                            <div key={appt.id} onClick={() => setDetailAppt(appt)} style={{
                              background: isCanceled ? '#fff5f5' : color + '1a',
                              boxShadow:`inset 0 0 0 1px ${color}55`,
                              borderRadius:'0 6px 6px 0',
                              padding:'3px 6px', fontSize:10,
                              cursor:'pointer', marginBottom:2,
                              overflow:'hidden',
                              transition:'filter 0.15s',
                              opacity: isCanceled ? 0.75 : 1,
                            }}
                              onMouseEnter={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(0.92)'}
                              onMouseLeave={e => (e.currentTarget as HTMLElement).style.filter = ''}
                            >
                              {isCanceled && (
                                <div style={{ fontSize: 9, fontWeight: 800, color: '#8db84a', letterSpacing: '0.5px', marginBottom: 1 }}>
                                  LIBRE
                                </div>
                              )}
                              <div className='agenda-card-time' style={{ color: isCanceled ? '#e74c3c' : color }}>
                                {fmtTimeRange(appt.time, appt.duration)}
                                <span className={`patient-type-badge ${appt.patientType === 'inicial' ? 'is-initial' : ''}`} title={appt.patientType === 'inicial' ? 'Paciente de inicio' : 'Paciente subsecuente'}>
                                  {appt.patientType === 'inicial' ? 'I' : 'S'}
                                </span>
                              </div>
                              <div style={{ fontWeight:700, color: isCanceled ? '#e74c3c' : '#1a2535', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', textDecoration: isCanceled ? 'line-through' : 'none' }}>
                                {pat?.name ?? '-'}
                              </div>
                              <div style={{ color:'#8a9ab0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                                {appt.type}
                              </div>
                              <div className='agenda-card-status' style={{ color:STATUS_COLORS[appt.status] }}>
                                {STATUS_SHORT[appt.status]}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </React.Fragment>
              ))}
            </div>
          ) : (
            /* ── Vista por doctor ── */
            (() => {
              const dayISO = toISO(selectedDate)
              const dayApptsDr = allAppts.filter(a => a.date === dayISO)
              const visibleDoctors = doctors
              const cols = visibleDoctors.length || 1
              return (
                <div style={{ display:'grid', gridTemplateColumns:`52px repeat(${cols}, minmax(140px, 1fr))`, minWidth: 52 + cols * 140 }}>
                  {/* Header */}
                  <div style={{ background:'#f8fafc', borderBottom:'2px solid #e2e8f0', position:'sticky', top:0, zIndex:2 }} />
                  {visibleDoctors.map(doc => {
                    const dayBlock = agendaBlocks.find(b => b.doctorId === doc.id && b.date === dayISO)
                    return (
                    <div key={doc.id} style={{
                      padding:'10px 8px', background:'#f8fafc',
                      borderBottom:'2px solid #e2e8f0', borderLeft:'1px solid #f0f2f5',
                      position:'sticky', top:0, zIndex:2, textAlign:'center',
                    }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background: doc.color + '22', border:`2px solid ${doc.color}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 4px', fontSize:12, fontWeight:800, color: doc.color }}>
                        {doc.name.replace('Dra. ','').replace('Dr. ','').split(' ').map((w:string)=>w[0]).slice(0,2).join('')}
                      </div>
                      <div style={{ fontSize:11, fontWeight:700, color:'#1a2535', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        {doc.name.replace('Dra. ','Dra. ').replace('Dr. ','Dr. ')}
                      </div>
                      <div style={{ fontSize:9, color:'#8a9ab0', fontWeight:600, marginTop:1 }}>{doc.specialty}</div>
                      {dayBlock ? (
                        <div style={{ marginTop:4 }}>
                          <div style={{ fontSize:9, color:'#b63d4c', fontWeight:800 }}>DÍA BLOQUEADO</div>
                          <div style={{ fontSize:8, color:'#b55260', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{dayBlock.reason}</div>
                          <button onClick={() => handleUnblockDay(dayBlock.id)} style={{ marginTop:3, padding:'3px 7px', borderRadius:6, border:'1px solid #e5a5ad', background:'#fff', color:'#9f3040', fontSize:8, fontWeight:700 }}>Reabrir</button>
                        </div>
                      ) : (
                        <div style={{ fontSize:9, color: doc.color, fontWeight:700, marginTop:2 }}>
                          {dayApptsDr.filter(a => a.doctorId === doc.id && isBlockingStatus(a.status)).length} cita{dayApptsDr.filter(a => a.doctorId === doc.id && isBlockingStatus(a.status)).length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    )
                  })}

                  {/* Time rows */}
                  {HOURS.map(hour => (
                    <React.Fragment key={hour}>
                      <div style={{ padding:'0 8px', minHeight:72, display:'flex', alignItems:'flex-start', paddingTop:10, borderBottom:'1px solid #f0f2f5' }}>
                        <span style={{ fontSize:11, color:'#8a9ab0', fontWeight:600 }}>{hour}</span>
                      </div>
                      {visibleDoctors.map(doc => {
                        const cellAppts = dayApptsDr.filter(a => a.doctorId === doc.id && parseInt(a.time) === parseInt(hour))
                        const dayBlock = agendaBlocks.find(b => b.doctorId === doc.id && b.date === dayISO)
                        return (
                          <div key={`${doc.id}-${hour}`} onClick={() => {
                            if (!dayBlock && cellAppts.length === 0) {
                              setForm(f => ({ ...f, date: dayISO, time: hour, doctor_id: String(doc.id) }))
                              setShowModal(true)
                            }
                          }} style={{
                            minHeight:72, borderBottom:'1px solid #f0f2f5', borderLeft:'1px solid #f0f2f5',
                            padding:'3px 4px', position:'relative', overflow:'visible',
                            background: dayBlock ? '#fff5f6' : 'transparent',
                            cursor: !dayBlock && cellAppts.length === 0 ? 'pointer' : 'default',
                            transition:'background 0.15s',
                          }}
                            onMouseEnter={e => { if (!dayBlock && cellAppts.length === 0) (e.currentTarget as HTMLElement).style.background = doc.color + '08' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = dayBlock ? '#fff5f6' : 'transparent' }}
                          >
                            {cellAppts.map(appt => {
                              const pat = patients.find(p => p.id === appt.patientId)
                              const isCanceled = appt.status === 'cancelada'
                              const color = isCanceled ? '#e74c3c' : doc.color
                              return (
                                <div key={appt.id} onClick={e => { e.stopPropagation(); setDetailAppt(appt) }} style={{
                                  background: isCanceled ? '#fff5f5' : color + '18',
                                  boxShadow:`inset 0 0 0 1px ${color}55`,
                                  borderRadius:'0 6px 6px 0',
                                  padding:'4px 6px', fontSize:10,
                                  cursor:'pointer', marginBottom:2,
                                  overflow:'hidden',
                                  transition:'filter 0.15s',
                                  opacity: isCanceled ? 0.75 : 1,
                                }}
                                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(0.92)'}
                                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.filter = ''}
                                >
                                  <div style={{ fontSize:9, color: isCanceled ? '#e74c3c' : doc.color, fontWeight:800, marginBottom:1 }}>
                                    {fmtTimeRange(appt.time, appt.duration)}
                                    <span className={`patient-type-badge ${appt.patientType === 'inicial' ? 'is-initial' : ''}`} title={appt.patientType === 'inicial' ? 'Paciente de inicio' : 'Paciente subsecuente'}>
                                      {appt.patientType === 'inicial' ? 'I' : 'S'}
                                    </span>
                                  </div>
                                  <div style={{ fontWeight:700, color: isCanceled ? '#e74c3c' : '#1a2535', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', textDecoration: isCanceled ? 'line-through' : 'none' }}>
                                    {pat?.name ?? '-'}
                                  </div>
                                  <div style={{ color:'#8a9ab0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                                    {appt.type}
                                  </div>
                                  {appt.room && (
                                    <div style={{ color: doc.color, fontSize:9, fontWeight:700, marginTop:1 }}>
                                      {appt.room}
                                    </div>
                                  )}
                                  <div className='agenda-card-status' style={{ color:STATUS_COLORS[appt.status] }}>
                                    {STATUS_SHORT[appt.status]}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })}
                    </React.Fragment>
                  ))}
                </div>
              )
            })()
          )}
        </div>
      </FadeContent>

    </div>{/* end agenda-grid */}
    </div>{/* end agenda-desktop */}

      {/* ── Detalle de cita modal (fuera de agenda-desktop para que funcione en móvil) ── */}
      {detailAppt && (() => {
        const doc = doctors.find(d => d.id === detailAppt.doctorId)
        const pat = patients.find(p => p.id === detailAppt.patientId)
        const color = doc?.color ?? STATUS_COLORS[detailAppt.status] ?? '#5b84b1'
        return (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}
            onClick={e => { if (e.target === e.currentTarget) setDetailAppt(null) }}
          >
            <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:420, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', overflow:'hidden', maxHeight:'90vh', overflowY:'auto' }}>
              {/* Header con color del doctor */}
              <div style={{ background: color, padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.75)', letterSpacing:'0.5px', marginBottom:4 }}>DETALLE DE CITA</div>
                  <div style={{ fontSize:18, fontWeight:800, color:'#fff' }}>{detailAppt.type}</div>
                </div>
                <button onClick={() => setDetailAppt(null)} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer', fontSize:18, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
              </div>

              <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:14 }}>
                {/* Paciente */}
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:42, height:42, borderRadius:'50%', background: color + '20', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:800, color, flexShrink:0 }}>
                    {pat ? pat.name.split(' ').slice(0,2).map((w:string)=>w[0]).join('') : '?'}
                  </div>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, color:'#1a2535' }}>{pat?.name ?? '-'}</div>
                    <div style={{ fontSize:12, color:'#8a9ab0' }}>{pat?.phone ?? ''}</div>
                  </div>
                </div>

                <div style={{ height:1, background:'#f0f2f5' }} />

                {/* Info grid */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {[
                    { label:'Doctor', value: doc?.name ?? '-' },
                    { label:'Especialidad', value: doc?.specialty ?? '-' },
                    { label:'Fecha', value: detailAppt.date },
                    { label:'Horario', value: fmtTimeRange(detailAppt.time, detailAppt.duration) },
                    { label:'Duración', value: `${detailAppt.duration} min` },
                    { label:'Tipo de paciente', value: detailAppt.patientType === 'inicial' ? 'Inicio (I)' : 'Subsecuente (S)' },
                    { label:'Consultorio', value: detailAppt.room },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize:10, fontWeight:700, color:'#8a9ab0', letterSpacing:'0.5px', marginBottom:2 }}>{label.toUpperCase()}</div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#1a2535' }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ height:1, background:'#f0f2f5' }} />

                {/* Status + monto */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700, background: color + '20', color }}>
                    {STATUS_LABELS[detailAppt.status] ?? detailAppt.status}
                  </span>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:10, color:'#8a9ab0', fontWeight:600 }}>MONTO</div>
                    <div style={{ fontSize:16, fontWeight:800, color:'#1a2535' }}>
                      ${detailAppt.amount.toLocaleString('es-MX')}
                    </div>
                  </div>
                </div>

                {/* Action buttons by status */}
                {detailAppt.status === 'pendiente' && (
                  <div style={{ display:'flex', gap:8 }}>
                    <button disabled={changingStatus} onClick={() => handleChangeStatus(detailAppt.id, 'confirmada')} style={{ flex:1, padding:'10px 0', borderRadius:10, border:'none', background:'#6f9d2e', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>Marcar como confirmada</button>
                  </div>
                )}
                {detailAppt.status === 'confirmada' && (
                  <div style={{ display:'flex', gap:8 }}>
                    <button disabled={changingStatus} onClick={() => handleChangeStatus(detailAppt.id, 'en_curso')} style={{ flex:1, padding:'10px 0', borderRadius:10, border:'none', background:'#5b84b1', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>Iniciar consulta</button>
                  </div>
                )}
                {detailAppt.status === 'en_curso' && (
                  <div style={{ padding:'10px 12px', borderRadius:10, background:'#f0f7e6', border:'1px solid #c8e6a0', fontSize:12, color:'#4a7c1f', fontWeight:600, textAlign:'center' }}>
                    Consulta en curso. Al terminar, registra el resultado final.
                  </div>
                )}

                <div className='appointment-result-panel'>
                  <div className='appointment-result-heading'>
                    <strong>Resultado final</strong>
                    <span>Se puede modificar al finalizar el día</span>
                  </div>
                  <div className='appointment-result-grid'>
                    {OUTCOME_OPTIONS.map(option => {
                      const selected = detailAppt.status === option.status
                      return (
                        <button
                          key={option.status}
                          type='button'
                          disabled={changingStatus}
                          className={selected ? 'is-selected' : ''}
                          aria-pressed={selected}
                          onClick={() => handleChangeStatus(detailAppt.id, option.status)}
                          style={{ '--outcome-color': STATUS_COLORS[option.status] } as React.CSSProperties}
                        >
                          <strong>{option.label}</strong>
                          <span>{option.helper}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <button disabled={changingStatus} onClick={() => handleDeleteAppt(detailAppt.id)} style={{
                  width:'100%', padding:'11px 0', borderRadius:10, border:'1px solid #e74c3c',
                  background:'#fff', color:'#e74c3c', fontWeight:700, fontSize:13, cursor:'pointer',
                }}>🗑 Eliminar cita (sin notificar)</button>

                <button onClick={() => setDetailAppt(null)} style={{
                  width:'100%', padding:'11px 0', borderRadius:10, border:'none',
                  background:'#f1f5f9', color:'#4a5568', fontWeight:700, fontSize:13, cursor:'pointer',
                }}>Cerrar</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Nueva cita modal ── */}
      {showBlockModal && (() => {
        const doctorId = Number(blockForm.doctor_id)
        const activeCount = allAppts.filter(a =>
          a.doctorId === doctorId && a.date === blockForm.date &&
          !isFinalOutcome(a.status)
        ).length
        const existingBlock = agendaBlocks.find(b => b.doctorId === doctorId && b.date === blockForm.date)
        return (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}
            onClick={e => { if (e.target === e.currentTarget) setShowBlockModal(false) }}
          >
            <div className="modal-sheet" style={{ background:'#fff', borderRadius:16, padding:24, width:'100%', maxWidth:440, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', maxHeight:'90vh', overflowY:'auto' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:18 }}>
                <div>
                  <h2 style={{ fontSize:17, fontWeight:800, color:'#1a2535', margin:0 }}>Bloquear día de consulta</h2>
                  <p style={{ fontSize:12, color:'#8a9ab0', margin:'4px 0 0' }}>La doctora aparecerá como no disponible durante todo el día.</p>
                </div>
                <button onClick={() => setShowBlockModal(false)} aria-label="Cerrar" style={{ background:'#f1f5f9', border:'none', borderRadius:8, width:30, height:30, cursor:'pointer', color:'#8a9ab0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon name="x" size={15} /></button>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <label style={lStyle}>DOCTORA *</label>
                  {myDoctor ? (
                    <input value={myDoctor.name} readOnly style={{ ...iStyle, background:'#f8fafc', color:'#4a5568' }} />
                  ) : (
                    <select value={blockForm.doctor_id} onChange={e => setBlockForm(f => ({ ...f, doctor_id:e.target.value }))} style={iStyle}>
                      <option value="">Seleccionar doctora...</option>
                      {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <label style={lStyle}>FECHA *</label>
                  <input type="date" min={TODAY_ISO} value={blockForm.date} onChange={e => setBlockForm(f => ({ ...f, date:e.target.value }))} style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>MOTIVO *</label>
                  <input list="block-reasons" value={blockForm.reason} onChange={e => setBlockForm(f => ({ ...f, reason:e.target.value }))} placeholder="Ej. Vacaciones" style={iStyle} />
                  <datalist id="block-reasons">
                    <option value="Vacaciones" />
                    <option value="Ausencia médica" />
                    <option value="Curso o capacitación" />
                    <option value="Día festivo" />
                  </datalist>
                </div>

                {existingBlock ? (
                  <div style={{ padding:'10px 12px', borderRadius:10, background:'#fff5f6', border:'1px solid #f3c7cc', color:'#9f3040', fontSize:12, fontWeight:700 }}>
                    Este día ya está bloqueado por: {existingBlock.reason}
                  </div>
                ) : activeCount > 0 ? (
                  <div style={{ padding:'10px 12px', borderRadius:10, background:'#fff8e8', border:'1px solid #f1d18a', color:'#855d0b', fontSize:12, lineHeight:1.45 }}>
                    <strong>{activeCount} cita{activeCount !== 1 ? 's' : ''} activa{activeCount !== 1 ? 's' : ''}</strong> se cancelará{activeCount !== 1 ? 'n' : ''}. Se enviará aviso a cada paciente.
                  </div>
                ) : doctorId ? (
                  <div style={{ padding:'10px 12px', borderRadius:10, background:'#f0f7e6', border:'1px solid #c8e6a0', color:'#4a7c1f', fontSize:12 }}>
                    No hay citas activas que cancelar en esta fecha.
                  </div>
                ) : null}
              </div>

              <div style={{ display:'flex', gap:10, marginTop:22 }}>
                <button onClick={() => setShowBlockModal(false)} style={{ flex:1, padding:'10px 0', borderRadius:10, border:'1.5px solid #e2e8f0', background:'#fff', color:'#4a5568', fontWeight:700, fontSize:13 }}>Volver</button>
                <button onClick={handleBlockDay} disabled={savingBlock || !doctorId || !blockForm.date || !blockForm.reason.trim() || !!existingBlock} style={{
                  flex:1.5, padding:'10px 0', borderRadius:10, border:'none', color:'#fff', fontWeight:700, fontSize:13,
                  background: savingBlock || !doctorId || !blockForm.reason.trim() || existingBlock ? '#d8aeb4' : '#b63d4c',
                  cursor: savingBlock || !doctorId || !blockForm.reason.trim() || existingBlock ? 'not-allowed' : 'pointer',
                }}>{savingBlock ? 'Bloqueando...' : existingBlock ? 'Ya bloqueado' : 'Bloquear día'}</button>
              </div>
            </div>
          </div>
        )
      })()}

      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}
          onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); setShowNewPatient(false) } }}
        >
          <div style={{ background:'#fff', borderRadius:16, padding:28, width:'100%', maxWidth:480, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', animation:'fadeUp 0.25s ease', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <h2 style={{ fontSize:17, fontWeight:800, color:'#1a2535', margin:0 }}>Nueva Cita</h2>
              <button onClick={() => { setShowModal(false); setShowNewPatient(false) }} style={{ background:'#f1f5f9', border:'none', borderRadius:8, width:30, height:30, cursor:'pointer', fontSize:18, color:'#8a9ab0', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
                  <label style={{ ...lStyle, marginBottom:0 }}>PACIENTE *</label>
                  <button type="button" onClick={() => setShowNewPatient(v => !v)} style={{
                    background:'none', border:'none', padding:0, cursor:'pointer',
                    fontSize:11, fontWeight:700, color:'#5b84b1',
                  }}>{showNewPatient ? 'Cancelar' : '+ Nuevo paciente'}</button>
                </div>

                {showNewPatient ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:8, padding:12, borderRadius:10, background:'#f8fafc', border:'1px solid #e2e8f0' }}>
                    <input
                      value={newPatientForm.name}
                      onChange={e => setNewPatientForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Nombre completo"
                      style={iStyle}
                      autoFocus
                    />
                    <input
                      value={newPatientForm.phone}
                      onChange={e => setNewPatientForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="Teléfono (10 dígitos)"
                      style={iStyle}
                      onKeyDown={e => { if (e.key === 'Enter') handleQuickCreatePatient() }}
                    />
                    <button
                      type="button"
                      disabled={creatingPatient}
                      onClick={handleQuickCreatePatient}
                      style={{
                        padding:'9px 0', borderRadius:8, border:'none',
                        background:'#5b84b1', color:'#fff', fontWeight:700, fontSize:13,
                        cursor: creatingPatient ? 'default' : 'pointer', opacity: creatingPatient ? 0.7 : 1,
                      }}
                    >{creatingPatient ? 'Creando…' : 'Crear y usar paciente'}</button>
                  </div>
                ) : (
                  <PatientPicker
                    patients={patients}
                    value={patients.find(p => p.id === Number(form.patient_id))?.name ?? ''}
                    onSelect={(id) => setForm(f => ({ ...f, patient_id: String(id), patient_type: inferPatientType(id) }))}
                    style={iStyle}
                  />
                )}
              </div>

              <div>
                <label style={lStyle}>TIPO DE PACIENTE</label>
                <div className='patient-type-options'>
                  {([
                    { value:'inicial', short:'I', label:'Paciente de inicio' },
                    { value:'subsecuente', short:'S', label:'Paciente subsecuente' },
                  ] as { value: PatientType; short: string; label: string }[]).map(option => (
                    <button
                      key={option.value}
                      type='button'
                      className={form.patient_type === option.value ? 'is-selected' : ''}
                      aria-pressed={form.patient_type === option.value}
                      onClick={() => setForm(current => ({ ...current, patient_type: option.value }))}
                    >
                      <span>{option.short}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {myDoctor ? (
                <div>
                  <label style={lStyle}>DOCTOR</label>
                  <input style={{ ...iStyle, background: '#f8fafc', color: '#4a5568' }}
                    value={`${myDoctor.name} - ${myDoctor.specialty}`} readOnly />
                </div>
              ) : (
                <div>
                  <label style={lStyle}>DOCTOR *</label>
                  <select value={form.doctor_id} onChange={e => setForm(f=>({...f, doctor_id:e.target.value}))} style={iStyle}>
                    <option value="">Seleccionar doctor…</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name} - {d.specialty}</option>)}
                  </select>
                </div>
              )}

              <TratamientoCombobox
                values={form.treatments}
                onChange={v => setForm(f=>({...f, treatments:v}))}
                lStyle={lStyle}
                iStyle={iStyle}
              />

              {/* ── Fecha + Consultorio ── */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={lStyle}>FECHA</label>
                  <input type="date" value={form.date} min={TODAY_ISO} onChange={e => setForm(f=>({...f, date:e.target.value}))} style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>CONSULTORIO</label>
                  <select value={form.room} onChange={e => setForm(f=>({...f, room:e.target.value}))} style={iStyle}>
                    <option value="">Seleccionar…</option>
                    {consultorios.map(c => (
                      <option key={c.id} value={c.nombre}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ── Time picker 2D (filas=hora, cols=:00/:15/:30/:45) ── */}
              <div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                  <label style={{ ...lStyle, marginBottom:0 }}>HORA</label>
                  <span style={{ fontSize:10, color:'#5b84b1', fontWeight:700 }}>{form.time}</span>
                </div>

                {formDayBlock && (
                  <div style={{ padding:'9px 11px', borderRadius:9, background:'#fff5f6', border:'1px solid #f3c7cc', color:'#9f3040', fontSize:11, fontWeight:700, marginBottom:8 }}>
                    Día no disponible: {formDayBlock.reason}
                  </div>
                )}

                {/* Column headers */}
                <div style={{ display:'grid', gridTemplateColumns:'28px repeat(4,1fr)', gap:3, marginBottom:3 }}>
                  <div />
                  {[':00',':15',':30',':45'].map(m => (
                    <div key={m} style={{ textAlign:'center', fontSize:10, fontWeight:700, color:'#b0bcc8' }}>{m}</div>
                  ))}
                </div>

                {/* Rows */}
                {HOUR_NUMS.map(h => {
                  const nowMin = form.date === TODAY_ISO
                    ? new Date().getHours()*60 + new Date().getMinutes()
                    : -Infinity
                  return (
                    <div key={h} style={{ display:'grid', gridTemplateColumns:'28px repeat(4,1fr)', gap:3, marginBottom:3 }}>
                      {/* Hour label */}
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:3 }}>
                        <span style={{ fontSize:11, fontWeight:700, color:'#8a9ab0' }}>{String(h).padStart(2,'0')}</span>
                      </div>
                      {[0,15,30,45].map(min => {
                        if (h === 20 && min > 0) return <div key={min} />
                        const slot = fmtSlot(h, min)
                        const isPast = toMin(slot) <= nowMin

                        const doctorConflict = form.doctor_id && !isPast
                          ? allAppts.find(a => {
                              if (a.doctorId !== Number(form.doctor_id) || a.date !== form.date || !isBlockingStatus(a.status)) return false
                              const aS = toMin(a.time), aE = aS + (a.duration || 60)
                              return toMin(slot) >= aS && toMin(slot) < aE
                            })
                          : null
                        const roomConflict = form.room && !isPast
                          ? allAppts.find(a => {
                              if (a.room !== form.room || a.date !== form.date || !isBlockingStatus(a.status)) return false
                              const aS = toMin(a.time), aE = aS + (a.duration || 60)
                              return toMin(slot) >= aS && toMin(slot) < aE
                            })
                          : null

                        const conflict = roomConflict ?? doctorConflict
                        const isBlocked = isPast || !!conflict || !!formDayBlock
                        const isSelected = !formDayBlock && form.time === slot
                        const patName = conflict
                          ? patients.find(p => p.id === conflict.patientId)?.name?.split(' ')[0]
                          : null

                        let bg = '#fff', border = '1.5px solid #e2e8f0', clr = '#4a5568'
                        if (formDayBlock)      { bg = '#fff5f6'; border = '1px solid #f3c7cc'; clr = '#c58a92' }
                        else if (isSelected)   { bg = '#5b84b1'; border = 'none'; clr = '#fff' }
                        else if (isPast)       { bg = '#f5f5f5'; border = '1px solid #eee'; clr = '#c8c8c8' }
                        else if (roomConflict) { bg = '#fef2f2'; border = '1.5px solid #fecaca'; clr = '#b91c1c' }
                        else if (doctorConflict){ bg = '#fffbeb'; border = '1.5px solid #fde68a'; clr = '#b45309' }

                        return (
                          <button
                            key={min}
                            type="button"
                            disabled={isBlocked}
                            onClick={() => setForm(f => ({ ...f, time: slot }))}
                            title={
                              formDayBlock ? `Día bloqueado: ${formDayBlock.reason}`
                              : isPast ? 'Hora pasada'
                              : roomConflict ? `Consultorio ocupado: ${patName ?? ''}`
                              : doctorConflict ? `Doctor ocupado: ${patName ?? ''}`
                              : slot
                            }
                            style={{
                              padding:'5px 2px', borderRadius:6, border, background:bg, color:clr,
                              fontWeight: isSelected ? 700 : 500, fontSize:11,
                              cursor: isBlocked ? 'not-allowed' : 'pointer',
                              display:'flex', flexDirection:'column', alignItems:'center', gap:1,
                              transition:'all 0.1s',
                              boxShadow: isSelected ? '0 2px 8px rgba(91,132,177,0.4)' : 'none',
                              opacity: isPast ? 0.45 : 1,
                            }}
                            onMouseEnter={e => { if (!isBlocked && !isSelected) { (e.currentTarget as HTMLElement).style.background='#e8f0f8'; (e.currentTarget as HTMLElement).style.borderColor='#5b84b1' } }}
                            onMouseLeave={e => { if (!isBlocked && !isSelected) { (e.currentTarget as HTMLElement).style.background=bg; (e.currentTarget as HTMLElement).style.borderColor=border.split(' ')[2] } }}
                          >
                            <span>:{String(min).padStart(2,'0')}</span>
                            {conflict && patName && !isSelected && (
                              <span style={{ fontSize:7, opacity:0.9, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:40, lineHeight:1 }}>
                                {patName}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )
                })}

                {/* Legend */}
                <div style={{ display:'flex', gap:10, marginTop:4, flexWrap:'wrap' }}>
                  {[
                    { bg:'#fef2f2', border:'#fecaca', label:'Consultorio' },
                    { bg:'#fffbeb', border:'#fde68a', label:'Doctor' },
                    { bg:'#f5f5f5', border:'#eee',    label:'Hora pasada' },
                  ].map(({ bg, border, label }) => (
                    <div key={label} style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <div style={{ width:10, height:10, borderRadius:2, background:bg, border:`1px solid ${border}` }} />
                      <span style={{ fontSize:10, color:'#8a9ab0', fontWeight:600 }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Duración ── */}
              <div>
                <label style={lStyle}>DURACIÓN</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:6 }}>
                  {[15,30,45,60,90,120].map(d => {
                    const active = form.duration === String(d)
                    return (
                      <button key={d} type="button"
                        onClick={() => setForm(f=>({...f, duration:String(d)}))}
                        style={{
                          padding:'5px 10px', borderRadius:20, fontSize:12, fontWeight:700,
                          border: active ? 'none' : '1.5px solid #e2e8f0',
                          background: active ? '#5b84b1' : '#fff',
                          color: active ? '#fff' : '#4a5568',
                          cursor:'pointer', transition:'all 0.15s',
                        }}
                      >{d}m</button>
                    )
                  })}
                </div>
                <input
                  type="number" min="1" max="480" placeholder="Personalizado (min)"
                  value={form.duration}
                  onChange={e => setForm(f=>({...f, duration:e.target.value}))}
                  style={{ ...iStyle, marginTop:2 }}
                />
              </div>

              <div>
                <label style={lStyle}>MONTO ($)</label>
                <input
                  type="number" min="0" placeholder="0.00" value={form.amount}
                  onChange={e => setForm(f=>({...f, amount:e.target.value}))}
                  style={iStyle}
                />
              </div>
            </div>

            <div style={{ display:'flex', gap:10, marginTop:24 }}>
              <button onClick={() => setShowModal(false)} style={{
                flex:1, padding:'11px 0', borderRadius:10,
                border:'1.5px solid #e2e8f0', background:'#fff',
                color:'#8a9ab0', fontWeight:700, fontSize:13, cursor:'pointer',
              }}>Cancelar</button>
              <button
                onClick={handleAdd}
                disabled={saving || !form.patient_id || !form.doctor_id || form.treatments.length === 0}
                style={{
                  flex:2, padding:'11px 0', borderRadius:10, border:'none',
                  background: (!form.patient_id||!form.doctor_id||form.treatments.length===0) ? '#b0c4d8' : '#5b84b1',
                  color:'#fff', fontWeight:700, fontSize:13,
                  cursor: (!form.patient_id||!form.doctor_id||form.treatments.length===0) ? 'not-allowed' : 'pointer',
                  boxShadow:'0 4px 12px rgba(91,132,177,0.25)',
                }}
              >{saving ? 'Guardando…' : 'Guardar Cita'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
