import { useState } from 'react'
import { AgendaBalance } from '../components/agenda/AgendaBalance'
import { ConsultorioOccupancy } from '../components/agenda/ConsultorioOccupancy'
import { GuiaResultados } from '../components/agenda/GuiaResultados'
import { LoadingState } from '../components/ui/FeedbackState'
import { Icon } from '../components/ui/Icon'
import { useBloqueosAgenda, useCitas, useConsultorios, useDoctores } from '../lib/hooks'
import { useStore } from '../store/useStore'

function toLocalISO(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function fromLocalISO(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day, 12)
}

function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

export function Reports() {
  const currentUser = useStore(state => state.currentUser)
  const { data: appointments, loading: loadingAppointments } = useCitas()
  const { data: doctors, loading: loadingDoctors } = useDoctores()
  const { data: blocks, loading: loadingBlocks } = useBloqueosAgenda()
  const { data: consultorios } = useConsultorios()
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [reportDoctorId, setReportDoctorId] = useState('all')

  const myDoctor = currentUser?.role === 'doctor'
    ? doctors.find(doctor => doctor.name === currentUser.name)
    : undefined
  const visibleDoctors = myDoctor ? [myDoctor] : doctors
  const visibleAppointments = myDoctor
    ? appointments.filter(appointment => appointment.doctorId === myDoctor.id)
    : appointments
  const visibleBlocks = myDoctor
    ? blocks.filter(block => block.doctorId === myDoctor.id)
    : blocks
  const effectiveDoctorId = myDoctor ? String(myDoctor.id) : reportDoctorId
  const loading = loadingAppointments || loadingDoctors || loadingBlocks

  return (
    <div className='app-page reports-page'>
      <section className='reports-toolbar' aria-labelledby='reports-heading'>
        <div className='reports-toolbar-copy'>
          <div className='reports-toolbar-icon' aria-hidden='true'>
            <Icon name='reports' size={21} />
          </div>
          <div>
            <h2 id='reports-heading'>Control de agenda</h2>
            <p>Consulta el balance diario y el cierre mensual sin perder de vista la agenda de citas.</p>
          </div>
        </div>

        <div className='reports-date-tools'>
          <button
            type='button'
            className='reports-date-arrow'
            aria-label='Dia anterior'
            onClick={() => setSelectedDate(date => addDays(date, -1))}
          >
            &lsaquo;
          </button>
          <label className='reports-date-field'>
            <span>Fecha de an&aacute;lisis</span>
            <input
              type='date'
              value={toLocalISO(selectedDate)}
              onChange={event => {
                if (event.target.value) setSelectedDate(fromLocalISO(event.target.value))
              }}
            />
          </label>
          <button
            type='button'
            className='reports-date-arrow'
            aria-label='Dia siguiente'
            onClick={() => setSelectedDate(date => addDays(date, 1))}
          >
            &rsaquo;
          </button>
          <button type='button' className='reports-today-button' onClick={() => setSelectedDate(new Date())}>
            Hoy
          </button>
        </div>
      </section>

      {loading ? (
        <LoadingState label='Preparando reportes' />
      ) : (
        <>
          <GuiaResultados />
          <AgendaBalance
            appointments={visibleAppointments}
            doctors={visibleDoctors}
            blocks={visibleBlocks}
            selectedDate={selectedDate}
            reportDoctorId={effectiveDoctorId}
            onReportDoctorChange={myDoctor ? () => undefined : setReportDoctorId}
          />
          <ConsultorioOccupancy
            appointments={visibleAppointments}
            consultorios={consultorios}
            selectedDate={selectedDate}
          />
        </>
      )}
    </div>
  )
}
