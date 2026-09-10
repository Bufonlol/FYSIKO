import { useEffect } from 'react'
import { useStore } from './store/useStore'
import { supabase } from './lib/supabase'
import { Layout } from './components/layout/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PatientTypeManager } from './components/agenda/PatientTypeManager'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Agenda } from './pages/Agenda'
import { Reports } from './pages/Reports'
import { Patients } from './pages/Patients'
import { Clinics } from './pages/Clinics'
import { Doctors } from './pages/Doctors'
import { Notifications } from './pages/Notifications'
import { Users } from './pages/Users'
import type { PageName } from './types'

const PAGES: Record<string, JSX.Element> = {
  dashboard:     <Dashboard />,
  agenda:        <Agenda />,
  reports:       <Reports />,
  patients:      <Patients />,
  clinics:       <Clinics />,
  doctors:       <Doctors />,
  users:         <Users />,
  notifications: <Notifications />,
}

const ROLE_PAGES: Record<string, PageName[]> = {
  admin:        ['dashboard','agenda','reports','patients','clinics','doctors','users','notifications'],
  doctor:       ['dashboard','agenda','reports','patients','notifications'],
  recepcion:    ['dashboard','agenda','reports','patients','notifications'],
  agenda_admin: ['dashboard','agenda','reports','patients','clinics','doctors','users','notifications'],
}

export default function App() {
  const { isLoggedIn, currentPage, pageKey, currentUser, initAuth, logout } = useStore()

  useEffect(() => {
    initAuth()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') logout()
    })
    return () => subscription.unsubscribe()
  }, [])

  if (!isLoggedIn) return <Login />

  const allowedPages = ROLE_PAGES[currentUser?.role ?? 'recepcion'] ?? ROLE_PAGES.recepcion
  const safePage: PageName = allowedPages.includes(currentPage) ? currentPage : 'dashboard'

  return (
    <Layout>
      <ErrorBoundary>
        <div key={pageKey} className="page-view">
          {(safePage === 'agenda' || safePage === 'patients') && (
            <PatientTypeManager mode={safePage} />
          )}
          {PAGES[safePage] ?? <Dashboard />}
        </div>
      </ErrorBoundary>
    </Layout>
  )
}
