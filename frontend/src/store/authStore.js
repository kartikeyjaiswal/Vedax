import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { account, databases, ID, Query } from '../lib/appwrite'
import { authAPI } from '../services/api'

const DB_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      userDoc: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,

      initialize: async () => {
        try {
          set({ isLoading: true })
          const session = await account.getSession('current')
          const accountData = await account.get()
          const res = await authAPI.me(session.$id, accountData.$id)
          localStorage.setItem('eco_session', session.$id)
          localStorage.setItem('eco_account_id', accountData.$id)
          set({
            user: accountData,
            userDoc: res.data.user,
            session,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch {
          set({ user: null, userDoc: null, session: null, isAuthenticated: false, isLoading: false })
          localStorage.removeItem('eco_session')
          localStorage.removeItem('eco_account_id')
        }
      },

      login: async (email, password) => {
        // Delete any existing session first to avoid "session already exists" error
        try { await account.deleteSession('current') } catch {}

        const session = await account.createEmailPasswordSession(email, password)
        const accountData = await account.get()

        // Pass both session ID and account ID to backend
        const res = await authAPI.me(session.$id, accountData.$id)

        localStorage.setItem('eco_session', session.$id)
        localStorage.setItem('eco_account_id', accountData.$id)
        set({
          user: accountData,
          userDoc: res.data.user,
          session,
          isAuthenticated: true,
        })
        return res.data.user
      },

      register: async ({ name, email, password, collegeId, role }) => {
        const result = await account.create(ID.unique(), email, password, name)
        await account.createEmailPasswordSession(email, password)
        const res = await authAPI.register({ name, email, collegeId, role, accountId: result.$id })
        const session = await account.getSession('current')
        localStorage.setItem('eco_session', session.$id)
        set({
          user: result,
          userDoc: res.data.user,
          session,
          isAuthenticated: true,
        })
        return res.data.user
      },

      logout: async () => {
        try {
          await account.deleteSession('current')
          await authAPI.logout()
        } catch {}
        localStorage.removeItem('eco_session')
        localStorage.removeItem('eco_account_id')
        set({ user: null, userDoc: null, session: null, isAuthenticated: false })
      },

      refreshUser: async () => {
        try {
          const session = localStorage.getItem('eco_session')
          const accountId = localStorage.getItem('eco_account_id')
          if (!session || !accountId) return

          const res = await authAPI.me(session, accountId)
          if (res.data?.user) {
            set({ userDoc: res.data.user })
          }
        } catch (error) {
          console.error('Failed to refresh user:', error)
        }
      },

      updateUserDoc: (updates) => {
        set(state => ({ userDoc: { ...state.userDoc, ...updates } }))
      },
    }),
    {
      name: 'eco-auth',
      partialize: (state) => ({ userDoc: state.userDoc, isAuthenticated: state.isAuthenticated }),
    }
  )
)

export const useThemeStore = create(
  persist(
    (set) => ({
      darkMode: false,
      toggleDarkMode: () => set(state => {
        const next = !state.darkMode
        if (next) document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
        return { darkMode: next }
      }),
      initTheme: () => {
        const stored = localStorage.getItem('eco-theme-v2')
        const parsed = stored ? JSON.parse(stored) : { state: { darkMode: false } }
        if (parsed.state?.darkMode) document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
      },
    }),
    { name: 'eco-theme-v2' }
  )
)
