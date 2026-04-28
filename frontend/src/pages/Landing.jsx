import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Leaf } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-20 left-10 w-96 h-96 bg-eco-500/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-ocean-500/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay:'2s'}} />

      <nav className="relative z-10 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-eco-500 to-ocean-600 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-white text-xl">EcoGamify</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="btn-secondary px-5 py-2 text-sm">Sign In</Link>
          <Link to="/register" className="btn-primary px-5 py-2 text-sm">Get Started</Link>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-eco-500/10 border border-eco-500/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-eco-400 animate-pulse" />
            <span className="text-sm text-eco-400 font-medium">AI-Powered Environmental Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-black text-white leading-tight mb-6">
            Learn. Play.<br />
            <span className="text-gradient-eco">Change the World.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Complete eco-challenges, earn XP badges, battle on leaderboards,
            and let AI personalize your environmental learning journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary px-8 py-4 text-base">
              🌿 Start Free – Join 10,000+ Econauts
            </Link>
            <Link to="/login" className="btn-secondary px-8 py-4 text-base">
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl"
        >
          {[
            { emoji:'🎮', title:'Gamified Learning', desc:'XP, badges, streaks' },
            { emoji:'🤖', title:'AI Personalized', desc:'Gemini-powered quizzes' },
            { emoji:'🏆', title:'Live Leaderboard', desc:'College vs Global' },
            { emoji:'🌍', title:'Real Impact', desc:'Track CO₂ & trees saved' },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="glass-card p-4 text-center"
            >
              <div className="text-3xl mb-2">{f.emoji}</div>
              <div className="text-sm font-semibold text-white">{f.title}</div>
              <div className="text-xs text-gray-400 mt-1">{f.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  )
}
