import { CountUp, TiltCard, FadeContent } from '../components/animations'
import { useDashboard, usePacientes, useDoctores } from '../lib/hooks'
import { useStore } from '../store/useStore'

const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
import { Icon } from '../components/ui/Icon'
import { LoadingState } from '../components/ui/FeedbackState'

const statusColors: Record<string, string> = {
  confirmada: '#8db84a', pendiente: '#d49a18', en_curso: '#5b84b1', cancelada: '#e74c3c', finalizada: '#64748b',
}
const statusLabels: Record<string, string> = {
  confirmada: 'Confirmada', pendiente: 'Pendiente', en_curso: 'En curso', cancelada: 'Cancelada', finalizada: 'Finalizada',
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + (minutes || 0)
}

function formatTimeRange(time: string, duration = 60) {
  const start = toMinutes(time)
  const end = start + duration
  const format = (minutes: number) => `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
  return `${format(start)} - ${format(end)}`
}

export function Dashboard() {
  const currentUser = useStore(s => s.currentUser)
  const { citasHoy, ingresosHoy, pacientesNuevos, todayAppts, loading } = useDashboard()
  const { data: patients } = usePacientes()
  const { data: doctors } = useDoctores()

  const myDoctor = currentUser?.role === 'doctor'
    ? doctors.find(d => d.name === currentUser.name)
    : null
  const visibleAppts = myDoctor
    ? todayAppts.filter(a => a.doctorId === myDoctor.id)
    : todayAppts

  const sortedAppts = [...visibleAppts].sort((a, b) => {
    const byTime = toMinutes(a.time) - toMinutes(b.time)
    if (byTime !== 0) return byTime
    const doctorA = doctors.find(d => d.id === a.doctorId)?.name ?? ''
    const doctorB = doctors.find(d => d.id === b.doctorId)?.name ?? ''
    return doctorA.localeCompare(doctorB, 'es')
  })
  const appointmentGroups = sortedAppts.reduce<Array<{ hour: string; appointments: typeof sortedAppts }>>((groups, appointment) => {
    const hour = `${appointment.time.slice(0, 2)}:00`
    const currentGroup = groups[groups.length - 1]
    if (currentGroup?.hour === hour) currentGroup.appointments.push(appointment)
    else groups.push({ hour, appointments: [appointment] })
    return groups
  }, [])
  const doctorCount = new Set(visibleAppts.map(appointment => appointment.doctorId)).size

  const confirmadas = visibleAppts.filter(a => a.status === 'confirmada').length
  const pendientes = visibleAppts.filter(a => a.status === 'pendiente').length
  const enCurso = visibleAppts.filter(a => a.status === 'en_curso').length

  const donutData = [
    { label: 'Confirmadas', count: confirmadas, color: '#8db84a' },
    { label: 'Pendientes', count: pendientes, color: '#e9c46a' },
    { label: 'En curso', count: enCurso, color: '#5b84b1' },
  ]
  const donutTotal = donutData.reduce((s, d) => s + d.count, 0)

  const kpis = [
    { label: 'Citas hoy', value: myDoctor ? visibleAppts.length : citasHoy, prefix: '', suffix: '', icon: 'agenda' as const, iconColor: '#5b84b1', iconBg: '#e8f0f8', change: '+12%', up: true },
    { label: 'Monto del día', value: ingresosHoy, prefix: '$', suffix: '', icon: 'dollar' as const, iconColor: '#8db84a', iconBg: '#f0f7e6', change: '', up: true },
    { label: 'Pacientes nuevos', value: pacientesNuevos, prefix: '', suffix: '', icon: 'patients' as const, iconColor: '#7c3aed', iconBg: '#f0ebfa', change: '', up: true },
  ]

  function DonutChart() {
    const size = 140, r = 52, cx = size / 2, cy = size / 2
    const circ = 2 * Math.PI * r
    let offset = 0
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative', width: size, height: size }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f2f5" strokeWidth={18} />
            {donutData.map((d, i) => {
              const portion = donutTotal > 0 ? (d.count / donutTotal) * circ : 0
              const seg = (
                <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                  stroke={d.color} strokeWidth={18}
                  strokeDasharray={`${portion} ${circ - portion}`}
                  strokeDashoffset={-offset} strokeLinecap="round"
                />
              )
              offset += portion
              return seg
            })}
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1a2535' }}>{donutTotal}</div>
            <div style={{ fontSize: 10, color: '#8a9ab0', fontWeight: 600 }}>Total</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
          {donutData.map(d => (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#4a5568', flex: 1 }}>{d.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1a2535' }}>{d.count}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Citas por hora para el gráfico de barras
  const apptsByHour = Array(12).fill(0)
  todayAppts.forEach(a => {
    const h = parseInt(a.time.split(':')[0], 10)
    if (h >= 8 && h <= 19) apptsByHour[h - 8]++
  })
  const maxAppts = Math.max(...apptsByHour, 1)
  const hourLabels = Array.from({ length: 12 }, (_, i) => `${i + 8}h`)

  return (
    <div className="app-page dashboard-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="kpi-grid">
        {kpis.map((kpi, i) => (
          <TiltCard className="ui-card ui-kpi" key={kpi.label} intensity={4} style={{
            background: '#fff', borderRadius: 12, padding: 20,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <FadeContent delay={i * 80} style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: kpi.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={kpi.icon} size={20} color={kpi.iconColor} />
                </div>
                {kpi.change && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                    background: kpi.up ? '#f0f7e6' : '#fef2f2',
                    color: kpi.up ? '#7aa33d' : '#e74c3c',
                  }}>{kpi.change}</span>
                )}
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#1a2535', letterSpacing: '-0.5px' }}>
                {loading ? '—' : <CountUp to={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} decimals={(kpi as any).decimals || 0} duration={1400} />}
              </div>
              <div style={{ fontSize: 13, color: '#8a9ab0', fontWeight: 500, marginTop: 4 }}>{kpi.label}</div>
            </FadeContent>
          </TiltCard>
        ))}
      </div>

      <div className="chart-grid">
        <FadeContent className="ui-card" style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2535' }}>Citas por hora</h3>
            <p style={{ fontSize: 12, color: '#8a9ab0', marginTop: 2 }}>Hoy · distribución horaria</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140 }}>
            {apptsByHour.map((v, i) => {
              const isCurrentHour = i === new Date().getHours() - 8
              const barH = Math.max(Math.round((v / maxAppts) * 116), v > 0 ? 4 : 0)
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                  {v > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: isCurrentHour ? '#5b84b1' : '#8a9ab0' }}>{v}</span>}
                  <div title={`${v} cita${v !== 1 ? 's' : ''}`} style={{
                    width: '100%', borderRadius: '4px 4px 0 0',
                    background: isCurrentHour ? '#5b84b1' : '#e8f0f8',
                    height: barH,
                    transition: `height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 40}ms`,
                    cursor: 'pointer',
                  }}
                    onMouseEnter={e => { if (!isCurrentHour) (e.currentTarget as HTMLElement).style.background = '#7aa3c9' }}
                    onMouseLeave={e => { if (!isCurrentHour) (e.currentTarget as HTMLElement).style.background = '#e8f0f8' }}
                  />
                  <span style={{ fontSize: 9, color: '#8a9ab0', fontWeight: 600 }}>{hourLabels[i]}</span>
                </div>
              )
            })}
          </div>
        </FadeContent>

        <FadeContent className="ui-card" delay={100} style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2535', marginBottom: 4 }}>Citas por Estado</h3>
          <p style={{ fontSize: 12, color: '#8a9ab0', marginBottom: 16 }}>Hoy · {new Date().toISOString().slice(0, 10)}</p>
          <DonutChart />
        </FadeContent>
      </div>

      <FadeContent className="ui-card ui-table-panel" delay={150} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div className="today-schedule-heading">
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2535' }}>
              {myDoctor ? 'Mis citas de hoy' : 'Citas de Hoy'}
            </h3>
            <p style={{ fontSize: 12, color: '#8a9ab0', marginTop: 2 }}>
              {loading ? 'Cargando...' : `${visibleAppts.length} cita${visibleAppts.length !== 1 ? 's' : ''} programada${visibleAppts.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          {!loading && visibleAppts.length > 0 && (
            <div className="today-schedule-summary" aria-label={`${doctorCount} doctoras con citas`}>
              <span>Ordenado por hora</span>
              <strong>{doctorCount} doctor{doctorCount !== 1 ? 'as' : 'a'}</strong>
            </div>
          )}
        </div>

        {loading ? (
          <LoadingState label="Cargando citas de hoy" />
        ) : visibleAppts.length === 0 ? (
          <div className="today-schedule-empty">
            <div className="today-schedule-empty-icon"><Icon name="agenda" size={20} /></div>
            <strong>Sin citas programadas para hoy</strong>
            <span>La agenda del día aparecerá aquí por hora y doctora.</span>
          </div>
        ) : (
          <div className="today-schedule">
            <div className="today-schedule-columns" aria-hidden="true">
              <span>Hora</span><span>Fisioterapeuta</span><span>Paciente y tratamiento</span><span>Consultorio</span><span>Estado</span><span>Monto</span>
            </div>
            {appointmentGroups.map(group => (
              <section className="today-schedule-group" key={group.hour} aria-labelledby={`schedule-${group.hour}`}>
                <div className="today-schedule-hour">
                  <strong id={`schedule-${group.hour}`}>{group.hour}</strong>
                  <span>{group.appointments.length} cita{group.appointments.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="today-schedule-appointments">
                  {group.appointments.map(appt => {
                    const pat = patients.find(p => p.id === appt.patientId)
                    const doc = doctors.find(d => d.id === appt.doctorId)
                    const isCanceled = appt.status === 'cancelada'
                    return (
                      <article className={`today-schedule-appointment${isCanceled ? ' is-canceled' : ''}`} key={appt.id}>
                        <div className="today-schedule-doctor">
                          <div className="today-schedule-avatar" style={{ background: `${doc?.color ?? '#5b84b1'}1f`, color: doc?.color ?? '#5b84b1' }}>
                            {doc ? getInitials(doc.name.replace(/^Dra?\.\s*/i, '')) : '?'}
                          </div>
                          <div><strong>{doc?.name ?? 'Sin asignar'}</strong><span>{doc?.specialty ?? 'Fisioterapeuta'}</span></div>
                        </div>
                        <div className="today-schedule-patient">
                          <span className="today-schedule-range">{formatTimeRange(appt.time, appt.duration)} <small>{appt.duration} min</small></span>
                          <strong>{pat?.name ?? 'Paciente sin asignar'}</strong>
                          <span>{appt.type}</span>
                        </div>
                        <div className="today-schedule-room"><span className="mobile-field-label">Consultorio</span>{appt.room}</div>
                        <div className="today-schedule-status">
                          <span style={{ background: `${statusColors[appt.status] ?? '#64748b'}18`, color: statusColors[appt.status] ?? '#64748b' }}>
                            {statusLabels[appt.status] ?? appt.status}
                          </span>
                        </div>
                        <div className="today-schedule-amount"><span className="mobile-field-label">Monto</span>${appt.amount.toLocaleString('es-MX')}</div>
                      </article>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </FadeContent>
    </div>
  )
}
