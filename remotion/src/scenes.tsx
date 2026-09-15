import React from 'react'
import { colors } from './theme'
import { riseIn, popIn, countUp, barGrow } from './anim'
import { MiniSidebar, MiniTopbar, MobileTopbar, MobileBottomNav, Badge, Avatar, Card, KpiCard, MiniBarChart, MiniDonut, Row } from './MockUI'

// ───────────────────────────── Dashboard ─────────────────────────────

const scheduleRows = [
  { time: '09:00', doctor: 'Dra. Elena Cruz', patient: 'Jorge Ramírez', type: 'Rehabilitación rodilla', status: 'Confirmada', color: colors.green },
  { time: '10:30', doctor: 'Dr. Iván Soto', patient: 'Marta Domínguez', type: 'Terapia de hombro', status: 'En curso', color: colors.blue },
  { time: '12:00', doctor: 'Dra. Elena Cruz', patient: 'Lucía Fernández', type: 'Espalda baja', status: 'Pendiente', color: colors.amber },
]

export function DashboardDesktop() {
  const bars = [3, 5, 2, 6, 8, 5, 4, 7, 3, 6, 2, 4]
  return (
    <>
      <MiniSidebar active="dashboard" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: colors.bg }}>
        <MiniTopbar title="Dashboard" />
        <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ ...riseIn(2), flex: 1 }}>
              <KpiCard label="Citas hoy" value={countUp(24, 4)} glyph="▤" color={colors.blue} pale={colors.bluePale} change="+12%" />
            </div>
            <div style={{ ...riseIn(8), flex: 1 }}>
              <KpiCard label="Monto del día" value={`$${countUp(18450, 10).toLocaleString('es-MX')}`} glyph="$" color={colors.green} pale={colors.greenPale} />
            </div>
            <div style={{ ...riseIn(14), flex: 1 }}>
              <KpiCard label="Pacientes nuevos" value={countUp(6, 16)} glyph="◍" color={colors.purple} pale={colors.purplePale} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14, flex: 1, minHeight: 0 }}>
            <Card style={{ ...riseIn(18), flex: 1.4, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: colors.text, marginBottom: 2 }}>Citas por hora</div>
              <div style={{ fontSize: 10, color: colors.muted, marginBottom: 14 }}>Hoy · distribución horaria</div>
              <MiniBarChart values={bars} progress={barGrow(20, 26)} accent={colors.blue} />
            </Card>
            <Card style={{ ...riseIn(24), flex: 1, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: colors.text, alignSelf: 'flex-start' }}>Citas por estado</div>
              <MiniDonut
                segments={[
                  { value: 12, color: colors.green },
                  { value: 6, color: colors.amber },
                  { value: 4, color: colors.blue },
                ]}
                progress={barGrow(26, 26)}
              />
            </Card>
          </div>
          <Card style={{ ...riseIn(30), flex: 1.1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 18px 8px', fontSize: 13, fontWeight: 700, color: colors.text }}>Citas de hoy</div>
            {scheduleRows.map((r, i) => (
              <Row key={i} style={{ ...riseIn(34 + i * 5), padding: '9px 18px' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: colors.text, width: 46 }}>{r.time}</span>
                <Avatar initials={r.doctor.split(' ').slice(-1)[0][0]} color={colors.blue} size={26} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: colors.text }}>{r.patient}</div>
                  <div style={{ fontSize: 10, color: colors.muted }}>{r.type}</div>
                </div>
                <Badge label={r.status} color={r.color} pale={`${r.color}18`} />
              </Row>
            ))}
          </Card>
        </div>
      </div>
    </>
  )
}

export function DashboardMobile() {
  return (
    <>
      <MobileTopbar title="Dashboard" accent={colors.blue} />
      <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
        <div style={{ ...riseIn(6), display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <KpiCard label="Citas hoy" value={countUp(24, 8)} glyph="▤" color={colors.blue} pale={colors.bluePale} compact />
          </div>
          <div style={{ flex: 1 }}>
            <KpiCard label="Nuevos" value={countUp(6, 10)} glyph="◍" color={colors.purple} pale={colors.purplePale} compact />
          </div>
        </div>
        <Card style={{ ...riseIn(14), padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: colors.text, marginBottom: 8 }}>Citas por hora</div>
          <MiniBarChart values={[3, 5, 2, 6, 8, 5, 4]} progress={barGrow(18, 22)} accent={colors.blue} />
        </Card>
        <Card style={{ ...riseIn(22), flex: 1, overflow: 'hidden', padding: 4 }}>
          {scheduleRows.slice(0, 2).map((r, i) => (
            <Row key={i} style={{ ...riseIn(26 + i * 5) }}>
              <Avatar initials={r.doctor.split(' ').slice(-1)[0][0]} color={colors.blue} size={28} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: colors.text }}>{r.patient}</div>
                <div style={{ fontSize: 9.5, color: colors.muted }}>{r.time} · {r.type}</div>
              </div>
              <Badge label={r.status} color={r.color} pale={`${r.color}18`} />
            </Row>
          ))}
        </Card>
      </div>
      <MobileBottomNav active="dashboard" />
    </>
  )
}

// ───────────────────────────── Agenda ─────────────────────────────

const days = ['Lun 9', 'Mar 10', 'Mié 11', 'Jue 12', 'Vie 13']
const agendaBlocks: Record<string, { top: number; h: number; label: string; color: string }[]> = {
  'Lun 9': [{ top: 10, h: 22, label: 'J. Ramírez', color: colors.blue }, { top: 55, h: 16, label: 'L. Torres', color: colors.green }],
  'Mar 10': [{ top: 20, h: 18, label: 'M. Domínguez', color: colors.amber }],
  'Mié 11': [{ top: 5, h: 16, label: 'A. Vargas', color: colors.purple }, { top: 40, h: 22, label: 'S. Ibáñez', color: colors.blue }],
  'Jue 12': [{ top: 30, h: 20, label: 'R. Ponce', color: colors.green }],
  'Vie 13': [{ top: 15, h: 16, label: 'C. Molina', color: colors.blue }, { top: 60, h: 18, label: 'D. Nava', color: colors.amber }],
}

export function AgendaDesktop() {
  return (
    <>
      <MiniSidebar active="agenda" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: colors.bg }}>
        <MiniTopbar title="Agenda" />
        <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
          <div style={{ ...riseIn(2), display: 'flex', gap: 8 }}>
            {['Hoy', 'Semana', 'Mes'].map((l, i) => (
              <div key={l} style={{ padding: '6px 16px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: i === 1 ? colors.blue : '#fff', color: i === 1 ? '#fff' : colors.text2, border: `1px solid ${colors.border}` }}>
                {l}
              </div>
            ))}
          </div>
          <Card style={{ ...riseIn(8), flex: 1, display: 'flex', overflow: 'hidden' }}>
            {days.map((d, i) => (
              <div key={d} style={{ flex: 1, borderRight: i < days.length - 1 ? `1px solid ${colors.borderSoft}` : 'none', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '10px 0', textAlign: 'center', fontSize: 11, fontWeight: 700, color: colors.text2, borderBottom: `1px solid ${colors.borderSoft}` }}>{d}</div>
                <div style={{ position: 'relative', flex: 1, padding: '0 6px' }}>
                  {agendaBlocks[d].map((b, bi) => {
                    const p = popIn(14 + i * 4 + bi * 3, 0.85)
                    return (
                      <div
                        key={bi}
                        style={{
                          position: 'absolute',
                          top: `${b.top}%`,
                          height: `${b.h}%`,
                          left: 6,
                          right: 6,
                          borderRadius: 6,
                          background: `${b.color}1f`,
                          borderLeft: `3px solid ${b.color}`,
                          padding: '4px 6px',
                          fontSize: 9.5,
                          fontWeight: 700,
                          color: colors.text,
                          ...p,
                        }}
                      >
                        {b.label}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  )
}

export function AgendaMobile() {
  const items = [
    { time: '09:00', name: 'Jorge Ramírez', doc: 'Dra. Elena Cruz', color: colors.blue },
    { time: '10:30', name: 'Marta Domínguez', doc: 'Dr. Iván Soto', color: colors.amber },
    { time: '12:00', name: 'Lucía Fernández', doc: 'Dra. Elena Cruz', color: colors.green },
    { time: '13:15', name: 'Andrés Vargas', doc: 'Dr. Iván Soto', color: colors.purple },
  ]
  return (
    <>
      <MobileTopbar title="Agenda" accent={colors.green} />
      <div style={{ ...riseIn(4), padding: '10px 16px 0', fontSize: 11, fontWeight: 700, color: colors.text2 }}>Lunes 9 de marzo</div>
      <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
        {items.map((it, i) => (
          <Card key={i} style={{ ...riseIn(10 + i * 6), padding: 12, display: 'flex', alignItems: 'center', gap: 10, borderLeft: `4px solid ${it.color}` }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: it.color, width: 44 }}>{it.time}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>{it.name}</div>
              <div style={{ fontSize: 9.5, color: colors.muted }}>{it.doc}</div>
            </div>
          </Card>
        ))}
      </div>
      <MobileBottomNav active="agenda" />
    </>
  )
}

// ───────────────────────────── Patients ─────────────────────────────

const patients = [
  { name: 'Jorge Ramírez', cond: 'Rehabilitación de rodilla', color: colors.blue },
  { name: 'Marta Domínguez', cond: 'Terapia de hombro', color: colors.green },
  { name: 'Lucía Fernández', cond: 'Espalda baja crónica', color: colors.purple },
  { name: 'Andrés Vargas', cond: 'Postoperatorio LCA', color: colors.amber },
  { name: 'Sara Ibáñez', cond: 'Fisioterapia deportiva', color: colors.orange },
]

export function PatientsDesktop() {
  return (
    <>
      <MiniSidebar active="patients" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: colors.bg }}>
        <MiniTopbar title="Pacientes" />
        <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
          <div style={{ ...riseIn(2), display: 'flex', gap: 10 }}>
            {['Total 248', 'Activos 210', 'Nuevos (mes) 18'].map((s, i) => (
              <div key={s} style={{ flex: 1 }}>
                <Card style={{ padding: '10px 16px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: colors.text2 }}>{s}</span>
                </Card>
              </div>
            ))}
          </div>
          <Card style={{ ...riseIn(8), flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', padding: '10px 18px', fontSize: 9.5, fontWeight: 700, color: colors.muted, letterSpacing: 0.5, textTransform: 'uppercase', borderBottom: `1px solid ${colors.borderSoft}`, background: '#f8fafc' }}>
              <span style={{ flex: 2 }}>Paciente</span>
              <span style={{ flex: 2 }}>Tratamiento</span>
              <span style={{ flex: 1 }}>Última visita</span>
            </div>
            {patients.map((p, i) => (
              <Row key={p.name} style={{ ...riseIn(12 + i * 5) }}>
                <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar initials={p.name.split(' ').map((w) => w[0]).join('')} color={p.color} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>{p.name}</span>
                </div>
                <span style={{ flex: 2, fontSize: 11.5, color: colors.text2 }}>{p.cond}</span>
                <span style={{ flex: 1, fontSize: 11, color: colors.muted }}>Hace 2 días</span>
              </Row>
            ))}
          </Card>
        </div>
      </div>
    </>
  )
}

export function PatientsMobile() {
  return (
    <>
      <MobileTopbar title="Pacientes" accent={colors.purple} />
      <div style={{ ...riseIn(4), padding: '10px 16px 0' }}>
        <div style={{ height: 30, borderRadius: 8, background: '#fff', border: `1px solid ${colors.border}`, fontSize: 10.5, color: colors.muted, display: 'flex', alignItems: 'center', padding: '0 10px' }}>Buscar paciente…</div>
      </div>
      <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
        {patients.map((p, i) => (
          <Card key={p.name} style={{ ...riseIn(10 + i * 6), padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar initials={p.name.split(' ').map((w) => w[0]).join('')} color={p.color} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>{p.name}</div>
              <div style={{ fontSize: 9.5, color: colors.muted }}>{p.cond}</div>
            </div>
          </Card>
        ))}
      </div>
      <MobileBottomNav active="patients" />
    </>
  )
}

// ───────────────────────────── Doctors ─────────────────────────────

const doctors = [
  { name: 'Dra. Elena Cruz', specialty: 'Traumatología', load: 82, color: colors.blue },
  { name: 'Dr. Iván Soto', specialty: 'Deportiva', load: 64, color: colors.green },
  { name: 'Dra. Paula Reyes', specialty: 'Neurológica', load: 47, color: colors.purple },
  { name: 'Dr. Marco León', specialty: 'Pediátrica', load: 58, color: colors.orange },
]

export function DoctorsDesktop() {
  return (
    <>
      <MiniSidebar active="doctors" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: colors.bg }}>
        <MiniTopbar title="Fisioterapeutas" />
        <div style={{ flex: 1, padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, overflow: 'hidden', alignContent: 'start' }}>
          {doctors.map((d, i) => (
            <Card key={d.name} style={{ ...riseIn(4 + i * 6), padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar initials={d.name.split(' ').slice(-1)[0][0]} color={d.color} size={40} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>{d.name}</div>
                  <div style={{ fontSize: 10.5, color: colors.muted }}>{d.specialty}</div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: colors.muted, marginBottom: 4 }}>
                  <span>Ocupación</span>
                  <span style={{ fontWeight: 700, color: colors.text2 }}>{Math.round(d.load * barGrow(10 + i * 6, 22))}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: '#eef1f5', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${d.load * barGrow(10 + i * 6, 22)}%`, background: d.color, borderRadius: 3 }} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}

export function DoctorsMobile() {
  return (
    <>
      <MobileTopbar title="Fisioterapeutas" accent={colors.orange} />
      <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
        {doctors.map((d, i) => (
          <Card key={d.name} style={{ ...riseIn(6 + i * 6), padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar initials={d.name.split(' ').slice(-1)[0][0]} color={d.color} size={34} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>{d.name}</div>
              <div style={{ fontSize: 9.5, color: colors.muted }}>{d.specialty}</div>
            </div>
            <Badge label={`${Math.round(d.load * barGrow(10 + i * 6, 20))}%`} color={d.color} pale={`${d.color}18`} />
          </Card>
        ))}
      </div>
      <MobileBottomNav active="doctors" />
    </>
  )
}

// ───────────────────────────── Clinics ─────────────────────────────

const clinics = [
  { name: 'Consultorio A', room: 'Piso 1 · Terapia manual', status: 'Disponible', color: colors.green },
  { name: 'Consultorio B', room: 'Piso 1 · Rehabilitación', status: 'Ocupado', color: colors.red },
  { name: 'Consultorio C', room: 'Piso 2 · Electroterapia', status: 'Disponible', color: colors.green },
  { name: 'Sala de gimnasio', room: 'Piso 2 · Ejercicio terapéutico', status: 'Ocupado', color: colors.red },
]

export function ClinicsDesktop() {
  return (
    <>
      <MiniSidebar active="clinics" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: colors.bg }}>
        <MiniTopbar title="Consultorios" />
        <div style={{ flex: 1, padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, overflow: 'hidden', alignContent: 'start' }}>
          {clinics.map((c, i) => (
            <Card key={c.name} style={{ ...riseIn(4 + i * 6), padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: colors.bluePale, color: colors.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>▣</div>
                <Badge label={c.status} color={c.color} pale={`${c.color}18`} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>{c.name}</div>
                <div style={{ fontSize: 10.5, color: colors.muted, marginTop: 2 }}>{c.room}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}

export function ClinicsMobile() {
  return (
    <>
      <MobileTopbar title="Consultorios" accent={colors.blueDark} />
      <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
        {clinics.map((c, i) => (
          <Card key={c.name} style={{ ...riseIn(6 + i * 6), padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: colors.bluePale, color: colors.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>▣</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>{c.name}</div>
              <div style={{ fontSize: 9.5, color: colors.muted }}>{c.room}</div>
            </div>
            <Badge label={c.status} color={c.color} pale={`${c.color}18`} />
          </Card>
        ))}
      </div>
      <MobileBottomNav active="clinics" />
    </>
  )
}

// ───────────────────────────── Reports ─────────────────────────────

export function ReportsDesktop() {
  return (
    <>
      <MiniSidebar active="reports" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: colors.bg }}>
        <MiniTopbar title="Reportes" />
        <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ ...riseIn(2), flex: 1 }}>
              <KpiCard label="Ingresos del mes" value={`$${countUp(184500, 6).toLocaleString('es-MX')}`} glyph="$" color={colors.green} pale={colors.greenPale} change="+18%" />
            </div>
            <div style={{ ...riseIn(8), flex: 1 }}>
              <KpiCard label="Citas completadas" value={countUp(312, 10)} glyph="✓" color={colors.blue} pale={colors.bluePale} change="+6%" />
            </div>
            <div style={{ ...riseIn(14), flex: 1 }}>
              <KpiCard label="Tasa de retención" value={`${countUp(91, 16)}%`} glyph="◍" color={colors.purple} pale={colors.purplePale} />
            </div>
          </div>
          <Card style={{ ...riseIn(20), flex: 1, padding: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: colors.text, marginBottom: 2 }}>Ingresos mensuales</div>
            <div style={{ fontSize: 10, color: colors.muted, marginBottom: 18 }}>Últimos 12 meses</div>
            <MiniBarChart values={[8, 10, 9, 12, 14, 11, 15, 13, 17, 16, 19, 18]} progress={barGrow(22, 30)} accent={colors.green} />
          </Card>
        </div>
      </div>
    </>
  )
}

export function ReportsMobile() {
  return (
    <>
      <MobileTopbar title="Reportes" accent={colors.green} />
      <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
        <div style={{ ...riseIn(6), display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <KpiCard label="Ingresos" value={`$${countUp(184500, 8).toLocaleString('es-MX')}`} glyph="$" color={colors.green} pale={colors.greenPale} compact />
          </div>
          <div style={{ flex: 1 }}>
            <KpiCard label="Retención" value={`${countUp(91, 12)}%`} glyph="◍" color={colors.purple} pale={colors.purplePale} compact />
          </div>
        </div>
        <Card style={{ ...riseIn(16), flex: 1, padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: colors.text, marginBottom: 10 }}>Ingresos mensuales</div>
          <MiniBarChart values={[8, 10, 9, 12, 14, 11, 15]} progress={barGrow(20, 24)} accent={colors.green} />
        </Card>
      </div>
      <MobileBottomNav active="reports" />
    </>
  )
}

// ───────────────────────────── Users ─────────────────────────────

const users = [
  { name: 'María Alcántara', role: 'Administrador', color: colors.blue, pale: colors.bluePale },
  { name: 'Dra. Elena Cruz', role: 'Fisioterapeuta', color: colors.green, pale: colors.greenPale },
  { name: 'Carla Núñez', role: 'Recepcionista', color: colors.orange, pale: colors.orangePale },
  { name: 'Dr. Iván Soto', role: 'Fisioterapeuta', color: colors.green, pale: colors.greenPale },
  { name: 'Beto Salinas', role: 'Módulo Agenda', color: colors.purple, pale: colors.purplePale },
]

export function UsersDesktop() {
  return (
    <>
      <MiniSidebar active="users" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: colors.bg }}>
        <MiniTopbar title="Usuarios" />
        <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
          <Card style={{ ...riseIn(4), flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', padding: '10px 18px', fontSize: 9.5, fontWeight: 700, color: colors.muted, letterSpacing: 0.5, textTransform: 'uppercase', borderBottom: `1px solid ${colors.borderSoft}`, background: '#f8fafc' }}>
              <span style={{ flex: 2 }}>Usuario</span>
              <span style={{ flex: 1.4 }}>Rol</span>
              <span style={{ flex: 1 }}>Estado</span>
            </div>
            {users.map((u, i) => (
              <Row key={u.name} style={{ ...riseIn(8 + i * 5) }}>
                <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar initials={u.name.split(' ').map((w) => w[0]).join('').slice(0, 2)} color={u.color} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>{u.name}</span>
                </div>
                <div style={{ flex: 1.4 }}>
                  <Badge label={u.role} color={u.color} pale={u.pale} />
                </div>
                <span style={{ flex: 1, fontSize: 11, color: colors.greenDark, fontWeight: 700 }}>● Activo</span>
              </Row>
            ))}
          </Card>
        </div>
      </div>
    </>
  )
}

export function UsersMobile() {
  return (
    <>
      <MobileTopbar title="Usuarios" accent={colors.purple} />
      <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
        {users.map((u, i) => (
          <Card key={u.name} style={{ ...riseIn(8 + i * 6), padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar initials={u.name.split(' ').map((w) => w[0]).join('').slice(0, 2)} color={u.color} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>{u.name}</div>
              <Badge label={u.role} color={u.color} pale={u.pale} />
            </div>
          </Card>
        ))}
      </div>
      <MobileBottomNav active="users" />
    </>
  )
}

// ───────────────────────────── Notifications ─────────────────────────────

const notifications = [
  { text: 'Nueva cita agendada con Jorge Ramírez', time: 'Hace 5 min', color: colors.blue, glyph: '▤' },
  { text: 'Pago recibido de Marta Domínguez — $850', time: 'Hace 22 min', color: colors.green, glyph: '$' },
  { text: 'Cita cancelada: Lucía Fernández', time: 'Hace 1 h', color: colors.red, glyph: '✕' },
  { text: 'Recordatorio: reunión de equipo 4:00 pm', time: 'Hace 2 h', color: colors.purple, glyph: '◔' },
]

export function NotificationsDesktop() {
  return (
    <>
      <MiniSidebar active="notifications" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: colors.bg }}>
        <MiniTopbar title="Notificaciones" />
        <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
          <Card style={{ ...riseIn(4), flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {notifications.map((n, i) => (
              <Row key={i} style={{ ...riseIn(8 + i * 7), alignItems: 'flex-start' }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: `${n.color}18`, color: n.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{n.glyph}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>{n.text}</div>
                  <div style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>{n.time}</div>
                </div>
              </Row>
            ))}
          </Card>
        </div>
      </div>
    </>
  )
}

export function NotificationsMobile() {
  return (
    <>
      <MobileTopbar title="Notificaciones" accent={colors.orange} />
      <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
        {notifications.map((n, i) => (
          <Card key={i} style={{ ...riseIn(8 + i * 7), padding: 12, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `${n.color}18`, color: n.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{n.glyph}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: colors.text }}>{n.text}</div>
              <div style={{ fontSize: 9.5, color: colors.muted, marginTop: 2 }}>{n.time}</div>
            </div>
          </Card>
        ))}
      </div>
      <MobileBottomNav active="notifications" />
    </>
  )
}
