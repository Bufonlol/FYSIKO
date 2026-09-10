import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, PageName, Notification } from '../types'
import { supabase } from '../lib/supabase'

interface AppState {
  currentUser: User | null
  isLoggedIn: boolean
  currentPage: PageName
  pageKey: number
  sidebarOpen: boolean
  notifPanelOpen: boolean
  selectedClinic: number
  notifications: Notification[]
  toasts: Array<{ id: number; msg: string; type: 'success' | 'error' | 'info' }>
  searchQuery: string

  login: (user: User) => void
  logout: () => void
  initAuth: () => Promise<void>
  navigate: (page: PageName) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleNotifPanel: () => void
  setSelectedClinic: (idx: number) => void
  setSearchQuery: (q: string) => void
  loadNotifications: () => Promise<void>
  subscribeNotifications: () => () => void
  markNotifRead: (id: number) => void
  markAllRead: () => void
  deleteNotif: (id: number) => void
  deleteAllRead: () => void
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void
  dismissToast: (id: number) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
  currentUser: null,
  isLoggedIn: false,
  currentPage: 'dashboard',
  pageKey: 0,
  sidebarOpen: false,
  notifPanelOpen: false,
  selectedClinic: 0,
  notifications: [],
  toasts: [],
  searchQuery: '',

  login: (user) => set({ currentUser: user, isLoggedIn: true, currentPage: 'dashboard' }),
  logout: () => {
    // Only clears local state — supabase.auth.signOut() must be called from UI
    // to avoid the signOut→SIGNED_OUT→logout→signOut feedback loop that deadlocks navigator.locks
    set({ currentUser: null, isLoggedIn: false, notifications: [], searchQuery: '' })
  },
  initAuth: async () => {
    try {
      const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
      const sessionResult = await Promise.race([supabase.auth.getSession(), timeout])
      if (!sessionResult) return
      const { data: { session } } = sessionResult as Awaited<ReturnType<typeof supabase.auth.getSession>>
      if (!session) return
      const { data: profile } = await supabase
        .from('usuarios')
        .select('id, username, name, role, avatar')
        .eq('auth_user_id', session.user.id)
        .eq('active', true)
        .single()
      if (profile) {
        set({ currentUser: { id: profile.id, username: profile.username, name: profile.name, role: profile.role, avatar: profile.avatar }, isLoggedIn: true })
      }
    } catch { /* ignore auth errors */ }
  },
  navigate: (page) => set((s) => ({ currentPage: page, pageKey: s.pageKey + 1, sidebarOpen: false, searchQuery: '' })),
  setSearchQuery: (q) => set({ searchQuery: q }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleNotifPanel: () => set((s) => ({ notifPanelOpen: !s.notifPanelOpen })),
  setSelectedClinic: (idx) => set({ selectedClinic: idx }),

  loadNotifications: async () => {
    const { data } = await supabase
      .from('notificaciones')
      .select('*')
      .order('id', { ascending: false })
    set({
      notifications: (data ?? []).map((r: any) => ({
        id: r.id, type: r.type, message: r.message,
        time: r.time, read: r.read, urgent: r.urgent,
      })),
    })
  },

  subscribeNotifications: () => {
    const channel = supabase
      .channel('notif-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notificaciones' }, () => {
        get().loadNotifications()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  },

  markNotifRead: async (id) => {
    await supabase.from('notificaciones').update({ read: true }).eq('id', id)
    set((s) => ({
      notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    }))
  },

  markAllRead: async () => {
    await supabase.from('notificaciones').update({ read: true }).eq('read', false)
    set((s) => ({
      notifications: s.notifications.map(n => ({ ...n, read: true })),
    }))
  },

  deleteNotif: async (id) => {
    await supabase.from('notificaciones').delete().eq('id', id)
    set((s) => ({ notifications: s.notifications.filter(n => n.id !== id) }))
  },

  deleteAllRead: async () => {
    await supabase.from('notificaciones').delete().eq('read', true)
    set((s) => ({ notifications: s.notifications.filter(n => !n.read) }))
  },

  showToast: (msg, type = 'info') => {
    const id = Date.now()
    set(s => ({ toasts: [...s.toasts, { id, msg, type }] }))
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
    }, 5000)
  },

  dismissToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
    }),
    {
      name: 'fysiko-app',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
)
