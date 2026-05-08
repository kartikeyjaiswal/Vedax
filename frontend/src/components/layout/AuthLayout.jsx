import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface flex relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-eco-500/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-ocean-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />

      {/* Floating particles */}
      {['🌿', '🌱', '🍃', '🌍', '♻️', '🌲'].map((e, i) => (
        <div
          key={i}
          className="absolute text-2xl opacity-20 select-none pointer-events-none eco-particle"
          style={{
            left: `${10 + i * 15}%`,
            top: `${15 + (i % 3) * 25}%`,
            '--duration': `${3 + i}s`,
            '--delay': `${i * 0.5}s`,
          }}
        >{e}</div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full flex items-center justify-center p-4"
      >
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-eco-500 to-ocean-600 mb-4 shadow-glow-eco">
              <span className="text-3xl">🌍</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-white">EcoQuest</h1>
            <p className="text-gray-400 text-sm mt-1">Learn, Play, Change the World.</p>
          </div>
          <Outlet />
        </div>
      </motion.div>
    </div>
  )
}
