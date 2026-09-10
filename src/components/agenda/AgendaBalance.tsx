import type { AgendaBlock, Appointment, AppointmentStatus, Doctor } from '../../types'

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DAY_TOKEN_TO_INDEX: Record<string, number> = { dom:0, lun:1, mar:2, mie:3, jue:4, vie:5, sab:6 }

function toISO(date: Date) { return date.toISOString().slice(0, 10) }

function getDoctorSchedule(schedule: string) {
  const normalized = (schedule || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const timeMatch = normalized.match(/(\d{1,2})(?::(\d{2}))?\s*h?\s*-\s*(\d{1,2})(?::(\d{2}))?/)
  const dayRange = normalized.match(/(dom|lun|mar|mie|jue|vie|sab)\s*-\s*(dom|lun|mar|mie|jue|vie|sab)/)
  const dayTokens = normalized.match(/dom|lun|mar|mie|jue|vie|sab/g) ?? []
  let days = new Set<number>([1, 2, 3, 4, 5, 6])

  if (dayRange) {
    const range: number[] = []
    let cursor = DAY_TOKEN_TO_INDEX[dayRange[1]]
    const endDay = DAY_TOKEN_TO_INDEX[dayRange[2]]
    for (let guard = 0; guard < 7; guard += 1) {
      range.push(cursor)
      if (cursor === endDay) break
      cursor = (cursor + 1) % 7
    }
    days = new Set(range)
  } else if (dayTokens.length > 0) {
    days = new Set(dayTokens.map(token => DAY_TOKEN_TO_INDEX[token]))
  }

  if (!timeMatch) return { days, start: 8 * 60, end: 20 * 60, usedFallback: true }
  const start = Number(timeMatch[1]) * 60 + Number(timeMatch[2] || 0)
  const end = Number(timeMatch[3]) * 60 + Number(timeMatch[4] || 0)
  if (end <= start) return { days, start: 8 * 60, end: 20 * 60, usedFallback: true }
  return { days, start, end, usedFallback: false }
}

function formatHours(minutes: number) {
  const hours = Math.max(0, minutes) / 60
  return Number.isInteger(hours) ? `${hours} h` : `${hours.toFixed(1)} h`
}

interface Props {
  appointments: Appointment[]
  doctors: Doctor[]
  blocks: AgendaBlock[]
  selectedDate: Date
  reportDoctorId: string
  onReportDoctorChange: (value: string) => void
}

export function AgendaBalance({ appointments, doctors, blocks, selectedDate, reportDoctorId, onReportDoctorChange }: Props) {
  const selectedDoctorIds = reportDoctorId === 'all'
    ? new Set(doctors.map(doctor => doctor.id))
    : new Set([Number(reportDoctorId)])
  const scopedAppointments = appointments.filter(appointment => selectedDoctorIds.has(appointment.doctorId))
  const selectedISO = toISO(selectedDate)
  const monthPrefix = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`
  const daily = scopedAppointments.filter(appointment => appointment.date === selectedISO)
  const monthly = scopedAppointments.filter(appointment => appointment.date.startsWith(monthPrefix))
  const countStatus = (items: Appointment[], status: AppointmentStatus) => items.filter(item => item.status === status).length
  const attended = countStatus(monthly, 'finalizada')
  const noShows = countStatus(monthly, 'no_asistio')
  const attendanceBase = attended + noShows
  const attendanceRate = attendanceBase > 0 ? `${Math.round((attended / attendanceBase) * 100)}%` : '—'
  const reportDoctors = doctors.filter(doctor => selectedDoctorIds.has(doctor.id))
  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  let capacityMinutes = 0
  let fallbackSchedules = 0

  reportDoctors.forEach(doctor => {
    const workSchedule = getDoctorSchedule(doctor.schedule)
    if (workSchedule.usedFallback) fallbackSchedules += 1
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day)
      const isBlocked = blocks.some(block => block.doctorId === doctor.id && block.date === toISO(date))
      if (workSchedule.days.has(date.getDay()) && !isBlocked) capacityMinutes += workSchedule.end - workSchedule.start
    }
  })

  const occupiedMinutes = monthly
    .filter(appointment => appointment.status === 'finalizada')
    .reduce((total, appointment) => total + (appointment.duration || 0), 0)
  const availableMinutes = Math.max(0, capacityMinutes - occupiedMinutes)
  const dailyMetrics = [
    { label:'Inicio (I)', value:daily.filter(item => item.patientType === 'inicial').length, tone:'blue' },
    { label:'Subsecuentes (S)', value:daily.filter(item => item.patientType === 'subsecuente').length, tone:'slate' },
    { label:'Cancelaron', value:countStatus(daily, 'cancelada'), tone:'amber' },
    { label:'No asistieron', value:countStatus(daily, 'no_asistio'), tone:'red' },
    { label:'Reagendaron', value:countStatus(daily, 'reagendada'), tone:'purple' },
  ]
  const monthlyMetrics = [
    { label:'Citas del mes', value:monthly.length, helper:'Registros totales' },
    { label:'Atendidos', value:attended, helper:'Marcados como asistió' },
    { label:'Reagendaron', value:countStatus(monthly, 'reagendada'), helper:'Ya tienen nueva fecha' },
    { label:'Cancelaron', value:countStatus(monthly, 'cancelada'), helper:'Pendientes de reprogramar' },
    { label:'No asistieron', value:noShows, helper:'Sin cancelación previa' },
    { label:'Asistencia real', value:attendanceRate, helper:'Asistió ÷ (asistió + no asistió)' },
    { label:'Horas ocupadas', value:formatHours(occupiedMinutes), helper:'Tiempo de citas atendidas' },
    { label:'Horas disponibles', value:formatHours(availableMinutes), helper:`De ${formatHours(capacityMinutes)} de jornada` },
  ]

  return (
    <section className='agenda-balance' aria-label='Balance operativo de la agenda'>
      <div className='agenda-balance-heading'>
        <div>
          <h3>Balance de agenda</h3>
          <p>Canceló significa que falta reprogramar; Reagendó indica que ya se acordó otra fecha.</p>
        </div>
        <label className='agenda-balance-filter'>
          <span>Profesional</span>
          <select value={reportDoctorId} onChange={event => onReportDoctorChange(event.target.value)}>
            <option value='all'>Todos</option>
            {doctors.map(doctor => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}
          </select>
        </label>
      </div>
      <div className='agenda-daily-balance'>
        <div className='agenda-balance-subheading'>
          <strong>Día seleccionado</strong>
          <span>{DAY_NAMES[selectedDate.getDay()]}, {selectedDate.getDate()} {MONTHS[selectedDate.getMonth()]}</span>
        </div>
        <div className='agenda-daily-metrics'>
          {dailyMetrics.map(metric => (
            <div className={`agenda-daily-metric tone-${metric.tone}`} key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className='agenda-monthly-balance'>
        <div className='agenda-balance-subheading'>
          <strong>Cierre mensual</strong>
          <span>{MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}</span>
        </div>
        <div className='agenda-monthly-metrics'>
          {monthlyMetrics.map(metric => (
            <div className='agenda-monthly-metric' key={metric.label} title={metric.helper}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.helper}</small>
            </div>
          ))}
        </div>
      </div>
      {fallbackSchedules > 0 && (
        <p className='agenda-balance-note'>
          Se usó el horario base de 08:00–20:00, lunes a sábado, para {fallbackSchedules} profesional{fallbackSchedules === 1 ? '' : 'es'} sin horario reconocible. Puedes ajustarlo en Doctores.
        </p>
      )}
    </section>
  )
}
