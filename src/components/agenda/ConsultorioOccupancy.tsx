import type { Appointment, AppointmentStatus } from '../../types'

// Estados que realmente reservan el horario del consultorio (bloquean la sala).
// Canceló, reagendó y no asistió liberan/no ocupan el espacio.
const OCCUPYING: Set<AppointmentStatus> = new Set(['confirmada', 'pendiente', 'en_curso', 'finalizada'])

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

// Horario base de operación de cada consultorio para calcular las horas
// disponibles del mes. Se puede ajustar aquí si la clínica cambia su jornada.
const OPERATING = {
  startHour: 8,      // 08:00
  endHour: 20,       // 20:00
  days: new Set([1, 2, 3, 4, 5, 6]), // Lunes a Sábado (0 = Domingo)
}

function formatHours(minutes: number) {
  const hours = Math.max(0, minutes) / 60
  return Number.isInteger(hours) ? `${hours} h` : `${hours.toFixed(1)} h`
}

function operatingMinutesInMonth(year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const perDay = (OPERATING.endHour - OPERATING.startHour) * 60
  let total = 0
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dow = new Date(year, month, day).getDay()
    if (OPERATING.days.has(dow)) total += perDay
  }
  return total
}

interface Props {
  appointments: Appointment[]
  consultorios: { id: number; nombre: string }[]
  selectedDate: Date
}

interface Stats {
  nombre: string
  total: number
  asistio: number
  noAsistio: number
  cancelo: number
  reagendo: number
  occupiedMinutes: number
}

export function ConsultorioOccupancy({ appointments, consultorios, selectedDate }: Props) {
  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`
  const monthly = appointments.filter(a => a.date.startsWith(monthPrefix))
  const capacityMinutes = operatingMinutesInMonth(year, month)

  // Agrupa por consultorio (campo room). Parte de la lista de consultorios
  // configurados y suma también salas que aparezcan en las citas pero no en el catálogo.
  const byRoom = new Map<string, Stats>()
  const ensure = (nombre: string) => {
    const key = nombre || 'Sin consultorio'
    if (!byRoom.has(key)) {
      byRoom.set(key, { nombre: key, total: 0, asistio: 0, noAsistio: 0, cancelo: 0, reagendo: 0, occupiedMinutes: 0 })
    }
    return byRoom.get(key)!
  }
  consultorios.forEach(c => ensure(c.nombre))
  monthly.forEach(a => {
    const s = ensure(a.room)
    s.total += 1
    // Las horas ocupadas cuentan las citas que reservan el horario, aunque
    // todavía no se marquen como "asistió".
    if (OCCUPYING.has(a.status)) s.occupiedMinutes += a.duration || 0
    if (a.status === 'finalizada') s.asistio += 1
    else if (a.status === 'no_asistio') s.noAsistio += 1
    else if (a.status === 'cancelada') s.cancelo += 1
    else if (a.status === 'reagendada') s.reagendo += 1
  })

  const rows = [...byRoom.values()].sort((a, b) => a.nombre.localeCompare(b.nombre))

  return (
    <section className='consultorio-occupancy' aria-label='Ocupación por consultorio'>
      <div className='consultorio-occupancy-heading'>
        <div>
          <h3>Ocupación por consultorio</h3>
          <p>Horas reservadas (citas agendadas) frente a las horas disponibles de la jornada base ({OPERATING.startHour}:00–{OPERATING.endHour}:00, L–S).</p>
        </div>
        <span className='consultorio-occupancy-month'>{MONTHS[month]} {year}</span>
      </div>

      {rows.length === 0 ? (
        <p className='consultorio-occupancy-empty'>Aún no hay consultorios registrados ni citas en el mes.</p>
      ) : (
        <div className='consultorio-occupancy-list'>
          {rows.map(row => {
            const ocupacion = capacityMinutes > 0 ? Math.round((row.occupiedMinutes / capacityMinutes) * 100) : 0
            const disponibles = Math.max(0, capacityMinutes - row.occupiedMinutes)
            const desenlaces = row.asistio + row.noAsistio + row.cancelo + row.reagendo
            const efectividad = desenlaces > 0 ? Math.round((row.asistio / desenlaces) * 100) : null
            return (
              <div className='consultorio-card' key={row.nombre}>
                <div className='consultorio-card-head'>
                  <strong>{row.nombre}</strong>
                  <span className='consultorio-card-pct'>{ocupacion}% ocupación</span>
                </div>
                <div className='consultorio-bar' aria-hidden='true'>
                  <div className='consultorio-bar-fill' style={{ width: `${Math.min(100, ocupacion)}%` }} />
                </div>
                <div className='consultorio-card-metrics'>
                  <div><span>Horas ocupadas</span><strong>{formatHours(row.occupiedMinutes)}</strong></div>
                  <div><span>Horas disponibles</span><strong>{formatHours(disponibles)}</strong></div>
                  <div><span>Efectividad</span><strong>{efectividad === null ? '—' : `${efectividad}%`}</strong></div>
                  <div><span>Citas del mes</span><strong>{row.total}</strong></div>
                </div>
                <div className='consultorio-card-outcomes'>
                  <span className='tone-green'>Asistió {row.asistio}</span>
                  <span className='tone-red'>No asistió {row.noAsistio}</span>
                  <span className='tone-amber'>Canceló {row.cancelo}</span>
                  <span className='tone-purple'>Reagendó {row.reagendo}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <p className='consultorio-occupancy-note'>
        Ocupación = horas reservadas ÷ horas disponibles del mes. Efectividad = citas que asistieron ÷ citas con desenlace (asistió, no asistió, canceló o reagendó); requiere marcar el resultado de cada cita en la Agenda.
      </p>
    </section>
  )
}
