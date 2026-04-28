import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, ListTodo, Brain, Trophy, User,
  Settings, Shield, LogOut, Leaf, BarChart3, PenTool
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { getLevelInfo, formatNumber } from '../../lib/utils'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: ListTodo, label: 'Tasks' },
  { to: '/assignments', icon: PenTool, label: 'Assignments' },
  { to: '/quiz', icon: Brain, label: 'Quiz' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Sidebar() {
  const { userDoc, logout } = useAuthStore()
  const navigate = useNavigate()
  const levelInfo = getLevelInfo(userDoc?.points || 0)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col z-40">
      <div className="flex-1 m-3 glass-card flex flex-col overflow-hidden">
        {/* Logo */}
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-eco-500 to-ocean-600 flex items-center justify-center shadow-glow-eco">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-white text-lg">EcoGamify</span>
              <div className="text-xs text-eco-400">v1.0</div>
            </div>
          </div>
        </div>

        {/* User profile mini */}
        {userDoc && (
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-eco-500 to-ocean-600 flex items-center justify-center font-bold text-white text-sm">
                {userDoc.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm truncate">{userDoc.name}</div>
                <div className="text-xs text-gray-400">{levelInfo.emoji} {levelInfo.name}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-eco-400 font-bold">{formatNumber(userDoc.points || 0)}</div>
                <div className="text-xs text-gray-500">XP</div>
              </div>
            </div>
            {/* XP Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Lv {levelInfo.level}</span>
                <span>{levelInfo.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-700">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-eco-500 to-ocean-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${levelInfo.progress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto hide-scrollbar">
          <div className="text-xs text-gray-500 uppercase tracking-wider px-3 pb-2 pt-1">Menu</div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-eco-500/15 text-eco-400 border border-eco-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-eco-400' : ''}`} />
                  <span className="font-medium text-sm">{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-eco-400"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* Admin links */}
          {(userDoc?.role === 'college_admin' || userDoc?.role === 'super_admin') && (
            <>
              <div className="text-xs text-gray-500 uppercase tracking-wider px-3 pb-2 pt-4">Admin</div>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive ? 'bg-ocean-500/15 text-ocean-400 border border-ocean-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium text-sm">Admin Panel</span>
              </NavLink>
            </>
          )}
          {userDoc?.role === 'super_admin' && (
            <NavLink
              to="/super-admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Shield className="w-5 h-5" />
              <span className="font-medium text-sm">Super Admin</span>
            </NavLink>
          )}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-slate-700/50 space-y-1">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
