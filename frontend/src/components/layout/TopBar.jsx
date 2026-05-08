import { Bell, Moon, Sun, Search, Flame, Menu, Leaf } from 'lucide-react'
import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore, useThemeStore } from '../../store/authStore'
import { formatNumber } from '../../lib/utils'
import { tasksAPI, quizzesAPI } from '../../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { useDebounce } from '../../hooks/useDebounce'

function NotificationsDropdown({ userDoc }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef()

  const isSuperAdmin = userDoc?.role === 'super_admin'

  const { data } = useQuery({
    queryKey: isSuperAdmin ? ['admin-tickets', 'latest'] : ['notifications-latest'],
    queryFn: () => isSuperAdmin 
      ? import('../../services/api').then(m => m.ticketsAPI.getAll())
      : tasksAPI.getAll({ limit: 4, collegeId: userDoc?.collegeId }),
    enabled: !!userDoc && isOpen,
  })

  // Close when clicked outside
  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const notifications = isSuperAdmin ? (data?.data?.tickets || []) : (data?.data?.tasks || [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-700/50 text-gray-400 hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-72 md:w-80 glass-card p-4 shadow-xl z-50 origin-top-right border border-slate-700/50"
          >
            <h3 className="font-display font-bold text-white mb-3">Notifications</h3>

            {notifications.length === 0 ? (
              <div className="text-gray-500 text-sm py-3 text-center">No recent notifications.</div>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 4).map(item => (
                  <div key={item.$id} className="p-3 bg-slate-800/40 rounded-xl hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-700/50 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-eco-500/20 text-eco-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white line-clamp-1">
                          {isSuperAdmin ? `Ticket: ${item.subject}` : `New task: ${item.title}`}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {isSuperAdmin ? `From: ${item.collegeId}` : `Earn ${item.points} XP • Added recently`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {!isSuperAdmin && (
                  <Link to="/tasks" onClick={() => setIsOpen(false)} className="block text-center text-xs text-eco-400 hover:text-eco-300 font-medium pt-2 mt-2 border-t border-slate-700/50">
                    View all tasks
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}



export default function TopBar({ toggleSidebar, isSidebarOpen }) {
  const { userDoc } = useAuthStore()
  const { darkMode, toggleDarkMode } = useThemeStore()
  const [searchQuery, setSearchQuery] = useState('')
  const debounced = useDebounce(searchQuery, 300)
  const { data: searchData } = useQuery({
    queryKey: ['search', debounced],
    queryFn: async () => {
      const [tasksRes, quizzesRes] = await Promise.all([
        tasksAPI.getAll({ q: debounced, limit: 5 }),
        quizzesAPI.getAll({ q: debounced, limit: 5 })
      ])
      const taskItems = (tasksRes.data?.tasks || []).map(t => ({ id: t.$id, title: t.title, type: 'task' }))
      const quizItems = (quizzesRes.data?.quizzes || []).map(q => ({ id: q.$id, title: q.title, type: 'quiz' }))
      return { results: [...taskItems, ...quizItems] }
    },
    enabled: debounced.length > 2,
  })
  const searchResults = searchData?.results || [];
  return (
    <div className="flex items-center justify-between gap-4 w-full">
      {/* Left side: Toggle + Site Name */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="flex p-2 rounded-full text-gray-400 hover:text-white hover:bg-slate-700/50 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-eco-500 to-ocean-600 flex items-center justify-center shadow-glow-eco">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="font-display font-bold text-white text-lg">EcoQuest</span>
          </div>
        </div>
      </div>

      {/* Search (desktop) - Hidden for Super Admin */}
      {userDoc?.role !== 'super_admin' && (
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search tasks, quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-eco-500/50"
            />
            {searchQuery && searchResults?.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800/90 border border-slate-700/50 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                {searchResults.map((item) => (
                  <Link
                    key={item.id}
                    to={item.type === 'task' ? `/tasks/${item.id}` : `/quiz/${item.id}`}
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700/50"
                    onClick={() => setSearchQuery('')}
                  >
                    {item.type === 'task' ? 'Task' : 'Quiz'}: {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Streak */}
        {userDoc && userDoc.role !== 'super_admin' && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-bold text-orange-400">{userDoc.streakCount || 0}</span>
          </div>
        )}

        {/* Points */}
        {userDoc && userDoc.role !== 'super_admin' && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-eco-500/10 border border-eco-500/20">
            <span className="text-sm">⚡</span>
            <span className="text-sm font-bold text-eco-400">{formatNumber(userDoc.points || 0)}</span>
          </div>
        )}

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-gray-400 hover:text-white transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <NotificationsDropdown userDoc={userDoc} />

        {/* Avatar */}
        {userDoc && userDoc.role !== 'super_admin' && (
          <Link to="/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-eco-500 to-ocean-600 flex items-center justify-center font-bold text-white text-sm cursor-pointer hover:shadow-glow-eco hover:scale-105 transition-all overflow-hidden">
            {userDoc.profileImage ? (
              <img src={userDoc.profileImage} alt={userDoc.name} className="w-full h-full object-cover" />
            ) : (
              userDoc.name?.charAt(0)?.toUpperCase()
            )}
          </Link>
        )}
        {userDoc && userDoc.role === 'super_admin' && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm overflow-hidden">
            {userDoc.profileImage ? (
              <img src={userDoc.profileImage} alt={userDoc.name} className="w-full h-full object-cover" />
            ) : (
              userDoc.name?.charAt(0)?.toUpperCase()
            )}
          </div>
        )}
      </div>
    </div>

  )
}
