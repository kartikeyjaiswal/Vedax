import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore, useThemeStore } from './store/authStore'

// Layouts
import AppLayout from './components/layout/AppLayout'
import AuthLayout from './components/layout/AuthLayout'

// Pages
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Assignments from './pages/Assignments'
import Quiz from './pages/Quiz'
import QuizPlay from './pages/QuizPlay'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import Results from './pages/Results'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import SuperAdmin from './pages/SuperAdmin'
import NotFound from './pages/NotFound'
import Landing from './pages/Landing'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,       // 30s — avoid redundant refetches
      gcTime: 5 * 60_000,     // 5min cache retention
    },
  },
})

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, userDoc, isLoading } = useAuthStore()
  if (isLoading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && userDoc && !roles.includes(userDoc.role)) return <Navigate to="/dashboard" replace />
  return children
}

function PageLoader() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-eco-500 to-ocean-500 animate-pulse-slow flex items-center justify-center text-2xl">
          🌿
        </div>
        <div className="text-gray-400 text-sm font-medium animate-pulse">Loading EcoQuest...</div>
      </div>
    </div>
  )
}

function ServiceSuspendedModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleSuspended = (e) => {
      setMessage(e.detail?.message || 'Services are currently suspended. Please contact the Super Admin to resolve the issue and resume access.')
      setIsOpen(true)
    }
    window.addEventListener('service-suspended', handleSuspended)
    return () => window.removeEventListener('service-suspended', handleSuspended)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500 text-3xl">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-white">Service Suspended</h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          {message}
        </p>
        <div className="bg-slate-800/50 rounded-xl p-4 text-left border border-slate-700/50">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Contact Details</div>
          <div className="text-sm text-white flex items-center gap-2 mb-1">
            <span>✉️</span> superadmin@ecoquest.com
          </div>
          <div className="text-sm text-white flex items-center gap-2">
            <span>📞</span> 91+ 6392107120
          </div>
        </div>
        <div className="pt-4 flex flex-col gap-2">
          <button
            onClick={() => window.location.href = 'mailto:superadmin@ecoquest.com'}
            className="w-full py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Contact Super Admin
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('eco_session')
              localStorage.removeItem('eco_account_id')
              window.location.href = '/login'
            }}
            className="w-full py-2.5 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { initialize, isLoading } = useAuthStore()
  const { initTheme } = useThemeStore()

  useEffect(() => {
    initTheme()
    initialize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading) return <PageLoader />

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Student / Common */}
          <Route element={
            <ProtectedRoute roles={['student', 'college_admin', 'super_admin', 'common']}>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/quiz/:id" element={<QuizPlay />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/results" element={<Results />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* College Admin */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['college_admin', 'super_admin']}>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="assignments" element={<Assignments />} />
          </Route>

          {/* Super Admin */}
          <Route path="/super-admin" element={
            <ProtectedRoute roles={['super_admin']}>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<SuperAdmin />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '12px',
          },
        }}
      />
      <ServiceSuspendedModal />
    </QueryClientProvider>
  )
}
