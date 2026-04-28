import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, ListTodo, Brain, Trophy, User, PenTool } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/tasks', icon: ListTodo, label: 'Tasks' },
  { to: '/assignments', icon: PenTool, label: 'Assign' },
  { to: '/quiz', icon: Brain, label: 'Quiz' },
  { to: '/leaderboard', icon: Trophy, label: 'Ranks' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-3 mb-3">
        <div className="glass-card px-2 py-2 flex items-center justify-around">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}>
              {({ isActive }) => (
                <div className={`nav-item ${isActive ? 'active' : ''}`}>
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav"
                      className="absolute inset-0 rounded-xl bg-eco-500/10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <Icon className={`w-5 h-5 relative z-10 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                  <span className="text-[10px] font-medium relative z-10">{label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
