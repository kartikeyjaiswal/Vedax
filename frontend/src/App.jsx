import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
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
        <div className="text-gray-400 text-sm font-medium animate-pulse">Loading EcoGamify...</div>
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
      <BrowserRouter>
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
    </QueryClientProvider>
  )
}
