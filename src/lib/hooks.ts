import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import type { Doctor, Patient, Appointment, AgendaBlock, Notification, SystemUser, User, ExpedienteClinco, NotaClinica, ToothData, Receta } from '../types'

// ── Auth ────────────────────────────────────────────────────────────────────
const TENANT_SLUG = 'fysiko'

export async function loginWithSupabase(username: string, password: string): Promise<User | null> {
  const email = `${TENANT_SLUG}.${username.trim().toLowerCase()}@coyo.local`
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) return null

  const { data: profile } = await supabase
    .from('usuarios')
    .select('id, username, name, role, avatar')
    .eq('auth_user_id', data.user.id)
    .eq('active', true)
    .single()

  if (!profile) { await supabase.auth.signOut(); return null }
  return { id: profile.id, username: profile.username, name: profile.name, role: profile.role, avatar: profile.avatar }
}

export function useUsuarios() {
  const [data, setData] = useState<SystemUser[]>([])
  const [loading, setLoading] = useState(true)

  async function fetch() {
    const { data: rows, error } = await supabase.from('usuarios').select('*').order('id')
    if (error) { setLoading(false); return }
    setData((rows ?? []).map(r => ({
      id: r.id, username: r.username, password: r.password,
      name: r.name, role: r.role, avatar: r.avatar, active: r.active,
      phone: r.phone ?? undefined,
      auth_user_id: r.auth_user_id,
    })))
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])
  return { data, setData, loading, refetch: fetch }
}

export function useDoctores() {
  const [data, setData] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)

  async function fetch() {
    const { data: rows, error } = await supabase.from('doctores').select('*').order('id')
    if (error) { setLoading(false); return }
    setData((rows ?? []).map(r => ({
      id: r.id, name: r.name, specialty: r.specialty, clinic: r.clinic,
      color: r.color, avatar: r.avatar, schedule: r.schedule,
      weekAppointments: r.week_appointments, rating: Number(r.rating),
    })))
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])
  return { data, setData, loading, refetch: fetch }
}

export function usePacientes() {
  const [data, setData] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  async function fetch() {
    const { data: rows, error } = await supabase.from('pacientes').select('*').order('name')
    if (error) { setLoading(false); return }
    setData((rows ?? []).map(r => ({
      id: r.id, name: r.name, age: r.age ?? 0, phone: r.phone ?? '', email: r.email ?? '',
      lastVisit: r.last_visit, nextAppointment: r.next_appointment,
      status: r.status, doctor: r.doctor,
      fechaNacimiento: r.fecha_nacimiento ?? null,
    })))
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])
  return { data, setData, loading, refetch: fetch }
}

export function useCitas(onStatusChange?: (appt: Appointment) => void) {
  const [data, setData] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const cbRef = { current: onStatusChange }
  cbRef.current = onStatusChange

  async function fetch() {
    const { data: rows } = await supabase.from('citas').select('*').order('date').order('time')
    setData((rows ?? []).map(r => ({
      id: r.id, patientId: r.patient_id, doctorId: r.doctor_id, clinicId: r.clinic_id,
      room: r.room, date: r.date, time: (r.time as string).slice(0, 5),
      duration: r.duration, type: r.type, status: r.status,
      patientType: r.patient_type ?? 'subsecuente', amount: Number(r.amount),
    })))
    setLoading(false)
  }

  useEffect(() => {
    fetch()
    const channelName = `citas-realtime-${crypto.randomUUID()}`
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'citas' }, (payload) => {
        const r = payload.new as any
        const updated: Appointment = {
          id: r.id, patientId: r.patient_id, doctorId: r.doctor_id, clinicId: r.clinic_id,
          room: r.room, date: r.date, time: (r.time as string).slice(0, 5),
          duration: r.duration, type: r.type, status: r.status,
          patientType: r.patient_type ?? 'subsecuente', amount: Number(r.amount),
        }
        setData(prev => prev.map(a => a.id === updated.id ? updated : a))
        if (cbRef.current && (r.status === 'confirmada' || r.status === 'cancelada')) {
          cbRef.current(updated)
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'citas' }, () => { fetch() })
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { data, loading, refetch: fetch }
}

export function useBloqueosAgenda() {
  const [data, setData] = useState<AgendaBlock[]>([])
  const [loading, setLoading] = useState(true)

  async function fetch() {
    const { data: rows, error } = await supabase
      .from('bloqueos_agenda')
      .select('id, doctor_id, date, reason, created_at')
      .order('date')
    if (!error) {
      setData((rows ?? []).map(r => ({
        id: r.id,
        doctorId: r.doctor_id,
        date: r.date,
        reason: r.reason,
        createdAt: r.created_at,
      })))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetch()
    const channelName = `bloqueos-agenda-realtime-${crypto.randomUUID()}`
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bloqueos_agenda' }, () => { void fetch() })
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { data, loading, refetch: fetch }
}

export function useNotificaciones() {
  const [data, setData] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('notificaciones').select('*').order('id', { ascending: false }).then(({ data: rows }) => {
      setData((rows ?? []).map(r => ({
        id: r.id, type: r.type, message: r.message,
        time: r.time, read: r.read, urgent: r.urgent,
      })))
      setLoading(false)
    })
  }, [])

  async function markRead(id: number) {
    await supabase.from('notificaciones').update({ read: true }).eq('id', id)
    setData(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  async function markAllRead() {
    await supabase.from('notificaciones').update({ read: true }).eq('read', false)
    setData(prev => prev.map(n => ({ ...n, read: true })))
  }

  return { data, loading, markRead, markAllRead }
}

export function useDashboard() {
  const [citasHoy, setCitasHoy] = useState(0)
  const [ingresosHoy, setIngresosHoy] = useState(0)
  const [pacientesNuevos, setPacientesNuevos] = useState(0)
  const [todayAppts, setTodayAppts] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    Promise.all([
      supabase.from('citas').select('*').eq('date', today),
      supabase.from('pacientes').select('id').eq('status', 'nuevo'),
    ]).then(([{ data: citas }, { data: nuevos }]) => {
      const appts = (citas ?? []).map((r: any) => ({
        id: r.id, patientId: r.patient_id, doctorId: r.doctor_id, clinicId: r.clinic_id,
        room: r.room, date: r.date, time: (r.time as string).slice(0, 5),
        duration: r.duration, type: r.type, status: r.status,
        patientType: r.patient_type ?? 'subsecuente', amount: Number(r.amount),
      }))
      const ingresos = appts.reduce((s, a) => s + a.amount, 0)
      setCitasHoy(appts.length)
      setIngresosHoy(ingresos)
      setPacientesNuevos((nuevos ?? []).length)
      setTodayAppts(appts)
      setLoading(false)
    })
  }, [])

  return { citasHoy, ingresosHoy, pacientesNuevos, todayAppts, loading }
}

export function useTratamientos() {
  const [data, setData] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  async function fetch() {
    const { data: rows } = await supabase
      .from('tratamientos')
      .select('nombre')
      .eq('activo', true)
      .order('nombre')
    setData((rows ?? []).map(r => r.nombre))
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])
  return { data, loading, refetch: fetch }
}

export function useConsultorios() {
  const [data, setData] = useState<{ id: number; nombre: string }[]>([])
  useEffect(() => {
    supabase.from('consultorios').select('id, nombre').order('id').then(({ data: rows }) => {
      setData(rows ?? [])
    })
  }, [])
  return { data }
}

export function useExpediente(patientId: number | null) {
  const [data, setData] = useState<ExpedienteClinco | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!patientId) return
    setLoading(true)
    supabase.from('expediente_clinico').select('*').eq('patient_id', patientId).maybeSingle().then(({ data: row }) => {
      if (row) {
        setData({
          id: row.id, patientId: row.patient_id,
          bloodType: row.blood_type ?? '',
          allergies: row.allergies ?? [],
          conditions: row.conditions ?? [],
          medications: row.medications ?? [],
          emergencyContact: row.emergency_contact ?? '',
          emergencyPhone: row.emergency_phone ?? '',
          notes: row.notes ?? '',
        })
      } else {
        setData({ patientId, bloodType: '', allergies: [], conditions: [], medications: [], emergencyContact: '', emergencyPhone: '', notes: '' })
      }
      setLoading(false)
    })
  }, [patientId])

  async function save(payload: ExpedienteClinco) {
    const row = {
      patient_id: payload.patientId,
      blood_type: payload.bloodType || null,
      allergies: payload.allergies,
      conditions: payload.conditions,
      medications: payload.medications,
      emergency_contact: payload.emergencyContact || null,
      emergency_phone: payload.emergencyPhone || null,
      notes: payload.notes || null,
      updated_at: new Date().toISOString(),
    }
    if (payload.id) {
      await supabase.from('expediente_clinico').update(row).eq('id', payload.id)
    } else {
      const { data: inserted } = await supabase.from('expediente_clinico').insert(row).select().single()
      if (inserted) setData(prev => prev ? { ...prev, id: inserted.id } : prev)
    }
  }

  return { data, loading, save }
}

export function useNotasClinnicas(patientId: number | null) {
  const [data, setData] = useState<NotaClinica[]>([])
  const [loading, setLoading] = useState(false)

  async function fetch() {
    if (!patientId) return
    setLoading(true)
    const { data: rows } = await supabase
      .from('notas_clinicas')
      .select('*')
      .eq('patient_id', patientId)
      .order('visit_date', { ascending: false })
    setData((rows ?? []).map((r: any) => ({
      id: r.id, patientId: r.patient_id,
      appointmentId: r.appointment_id ?? undefined,
      doctorId: r.doctor_id ?? undefined,
      visitDate: r.visit_date,
      motivo: r.motivo ?? '',
      hallazgos: r.hallazgos ?? '',
      diagnostico: r.diagnostico ?? '',
      tratamiento: r.tratamiento ?? '',
      indicaciones: r.indicaciones ?? '',
      seguimiento: r.seguimiento ?? undefined,
      createdAt: r.created_at,
    })))
    setLoading(false)
  }

  useEffect(() => { fetch() }, [patientId])

  async function addNota(nota: Omit<NotaClinica, 'id' | 'createdAt'>) {
    const { data: inserted } = await supabase.from('notas_clinicas').insert({
      patient_id: nota.patientId,
      appointment_id: nota.appointmentId ?? null,
      doctor_id: nota.doctorId ?? null,
      visit_date: nota.visitDate,
      motivo: nota.motivo || null,
      hallazgos: nota.hallazgos || null,
      diagnostico: nota.diagnostico || null,
      tratamiento: nota.tratamiento || null,
      indicaciones: nota.indicaciones || null,
      seguimiento: nota.seguimiento || null,
    }).select().single()
    if (inserted) await fetch()
  }

  return { data, loading, addNota, refetch: fetch }
}

export function useOdontograma(patientId: number | null) {
  const [dientes, setDientes] = useState<Record<string, ToothData>>({})
  const [loading, setLoading] = useState(false)
  const [rowId, setRowId] = useState<number | null>(null)

  useEffect(() => {
    if (!patientId) return
    setLoading(true)
    supabase.from('odontograma').select('*').eq('patient_id', patientId).maybeSingle().then(({ data: row }) => {
      if (row) { setDientes(row.dientes ?? {}); setRowId(row.id) }
      else { setDientes({}); setRowId(null) }
      setLoading(false)
    })
  }, [patientId])

  async function saveDientes(updated: Record<string, ToothData>) {
    setDientes(updated)
    if (rowId) {
      await supabase.from('odontograma').update({ dientes: updated, updated_at: new Date().toISOString() }).eq('id', rowId)
    } else {
      const { data: inserted } = await supabase.from('odontograma').insert({ patient_id: patientId, dientes: updated }).select().single()
      if (inserted) setRowId(inserted.id)
    }
  }

  return { dientes, loading, saveDientes }
}

export function useRecetas(patientId: number | null) {
  const [data, setData] = useState<Receta[]>([])
  const [loading, setLoading] = useState(false)

  async function fetch() {
    if (!patientId) return
    setLoading(true)
    const { data: rows } = await supabase
      .from('recetas')
      .select('*')
      .eq('patient_id', patientId)
      .order('visit_date', { ascending: false })
    setData((rows ?? []).map((r: any) => ({
      id: r.id, patientId: r.patient_id,
      doctorId: r.doctor_id ?? undefined,
      visitDate: r.visit_date,
      diagnostico: r.diagnostico ?? '',
      medicamentos: r.medicamentos ?? [],
      notas: r.notas ?? '',
      createdAt: r.created_at,
    })))
    setLoading(false)
  }

  useEffect(() => { fetch() }, [patientId])

  async function addReceta(receta: Omit<Receta, 'id' | 'createdAt'>) {
    await supabase.from('recetas').insert({
      patient_id: receta.patientId,
      doctor_id: receta.doctorId ?? null,
      visit_date: receta.visitDate,
      diagnostico: receta.diagnostico || null,
      medicamentos: receta.medicamentos,
      notas: receta.notas || null,
    })
    await fetch()
  }

  return { data, loading, addReceta, refetch: fetch }
}
