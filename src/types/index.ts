export interface Clinic {
  id: number
  name: string
  address: string
  color: string
  rooms: number
}

export interface Doctor {
  id: number
  name: string
  specialty: string
  clinic: number
  color: string
  avatar: string
  schedule: string
  phone?: string
  es_admin?: boolean
  recibir_resumen?: boolean
  weekAppointments?: number
  rating?: number
}

export interface Patient {
  id: number
  name: string
  age: number
  phone: string
  email: string
  lastVisit: string
  nextAppointment: string | null
  status: 'activo' | 'nuevo' | 'pendiente' | 'inactivo'
  doctor: number
  fechaNacimiento?: string | null
}

export type AppointmentStatus =
  | 'confirmada'
  | 'pendiente'
  | 'en_curso'
  | 'cancelada'
  | 'finalizada'
  | 'reagendada'
  | 'no_asistio'

export type PatientType = 'inicial' | 'subsecuente'

export interface Appointment {
  id: number
  patientId: number
  doctorId: number
  clinicId: number
  room: string
  date: string
  time: string
  duration: number
  type: string
  status: AppointmentStatus
  patientType: PatientType
  amount: number
}

export interface AgendaBlock {
  id: number
  doctorId: number
  date: string
  reason: string
  createdAt: string
}

export interface Room {
  id: number
  clinicId: number
  name: string
  doctor: string | null
  status: 'ocupado' | 'disponible' | 'mantenimiento' | 'en_descanso'
  equipment: string[]
}

export interface Notification {
  id: number
  type: 'cita' | 'alerta' | 'pago' | 'recordatorio' | 'sistema'
  message: string
  time: string
  read: boolean
  urgent: boolean
}

export interface User {
  id?: number
  username?: string
  name: string
  role: 'admin' | 'doctor' | 'recepcion' | 'agenda_admin'
  avatar: string
  active?: boolean
}

export interface SystemUser {
  id: number
  username: string
  password: string
  name: string
  role: 'admin' | 'doctor' | 'recepcion' | 'agenda_admin'
  avatar: string
  active: boolean
  phone?: string
  auth_user_id?: string
}

export type ConsultorioEstado = 'ocupado' | 'disponible' | 'mantenimiento' | 'en_descanso'

export interface Consultorio {
  id: number
  nombre: string
  estado: ConsultorioEstado
  equipamiento: string[]
  created_at: string
}

export type ToothStatus =
  'sano' | 'caries' | 'obturado' | 'corona' | 'ausente' | 'fractura' | 'implante' | 'puente'

export interface ToothData {
  status: ToothStatus
  notes?: string
}

export interface ExpedienteClinco {
  id?: number
  patientId: number
  bloodType: string
  allergies: string[]
  conditions: string[]
  medications: string[]
  emergencyContact: string
  emergencyPhone: string
  notes: string
}

export interface NotaClinica {
  id: number
  patientId: number
  appointmentId?: number
  doctorId?: number
  visitDate: string
  motivo: string
  hallazgos: string
  diagnostico: string
  tratamiento: string
  indicaciones: string
  seguimiento?: string
  createdAt: string
}

export interface RecetaMedicamento {
  nombre: string
  dosis: string
  frecuencia: string
  duracion: string
  indicaciones: string
}

export interface Receta {
  id: number
  patientId: number
  doctorId?: number
  visitDate: string
  diagnostico: string
  medicamentos: RecetaMedicamento[]
  notas: string
  createdAt: string
}

export type PageName =
  | 'dashboard'
  | 'agenda'
  | 'reports'
  | 'patients'
  | 'clinics'
  | 'doctors'
  | 'users'
  | 'notifications'
