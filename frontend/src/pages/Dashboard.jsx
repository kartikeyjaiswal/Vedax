import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, animate } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Zap, Flame, Star, Target, TrendingUp, Award, Users,
  CheckCircle, Clock, ChevronRight, Leaf, Droplets, Wind
} from 'lucide-react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { useAuthStore } from '../store/authStore'
import { tasksAPI, leaderboardAPI } from '../services/api'
import { getLevelInfo, formatNumber } from '../lib/utils'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }) {
  const nodeRef = useRef(null)

  useEffect(() => {
    const node = nodeRef.current
    if (!node) return
    
    const isRank = typeof value === 'string' && value.startsWith('#')
    const numStr = String(value).replace(/[^0-9.-]+/g, '')
    const numericValue = parseFloat(numStr)
    
    if (isNaN(numericValue)) {
      node.textContent = value
      return
    }

    const controls = animate(0, numericValue, {
      duration: 2,
      ease: "easeOut",
      onUpdate(v) {
        let text = formatNumber(v) // Use formatNumber from utils if we want commas, but for now simple fixed
        if (decimals > 0) text = v.toFixed(decimals)
        else text = Math.floor(v).toLocaleString() // add commas
        
        if (isRank) text = '#' + text
        node.textContent = prefix + text + suffix
      }
    })

    return () => controls.stop()
  }, [value, prefix, suffix, decimals])

  return <span ref={nodeRef}>{value}</span>
}

const ecoFacts = [
  "🌱 Planting one tree absorbs ~22kg of CO₂ per year",
  "💧 A 5-min shower saves 40 liters of water vs a bath",
  "♻️ Recycling one aluminum can saves 95% of energy",
  "🚲 Cycling 10km saves ~2.6kg of CO₂ emissions",
  "🌍 1,000 actions by EcoQuest users saved 847kg CO₂",
]

export function XPProgressBar({ points }) {
  const lvl = getLevelInfo(points)
  return (
    <div className="glass-card p-5 gradient-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{lvl.emoji}</div>
          <div>
            <div className="text-sm text-gray-400">Current Level</div>
            <div className="font-display font-bold text-white">{lvl.name}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-display font-bold text-gradient-eco">
            <AnimatedNumber value={points} />
          </div>
          <div className="text-xs text-gray-400">XP Points</div>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Level {lvl.level}</span>
          <span>{lvl.progress}% to Level {lvl.level + 1}</span>
        </div>
        <div className="h-3 rounded-full bg-slate-700 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-eco-500 via-eco-400 to-ocean-500 relative"
            initial={{ width: 0 }}
            animate={{ width: `${lvl.progress}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-glow-eco" />
          </motion.div>
        </div>
        <div className="text-xs text-gray-500 text-right">Next: {lvl.next?.name}</div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, suffix = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="stat-card glass-card-hover"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="stat-number">
        <AnimatedNumber value={value} suffix={suffix} />
      </div>
      <div className="stat-label">{label}</div>
    </motion.div>
  )
}

function EcoImpactBanner({ userDoc }) {
  const co2 = ((userDoc?.points || 0) * 0.012).toFixed(1)
  const trees = Math.floor((userDoc?.points || 0) / 500)
  const water = Math.floor((userDoc?.points || 0) * 0.8)

  return (
    <div className="glass-card p-5 bg-gradient-to-r from-eco-500/10 to-ocean-500/10 border border-eco-500/20">
      <div className="flex items-center gap-2 mb-4">
        <Leaf className="w-5 h-5 text-eco-400" />
        <span className="font-semibold text-white">Your Eco Impact</span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Wind, label: 'CO₂ Saved', value: co2, suffix: 'kg', decimals: 1, color: 'text-eco-400' },
          { icon: Leaf, label: 'Trees Equiv.', value: trees, suffix: '', decimals: 0, color: 'text-green-400' },
          { icon: Droplets, label: 'Water Saved', value: water, suffix: 'L', decimals: 0, color: 'text-blue-400' },
        ].map(({ icon: Icon, label, value, suffix, decimals, color }) => (
          <div key={label} className="text-center">
            <Icon className={`w-6 h-6 ${color} mx-auto mb-1`} />
            <div className={`text-xl font-display font-bold ${color}`}>
              <AnimatedNumber value={value} suffix={suffix} decimals={decimals} />
            </div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActivityChart({ userDoc }) {
  const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  // Build realistic data from user's actual XP - show 0s for new users
  const totalXP = userDoc?.points || 0
  const avgDaily = Math.round(totalXP / 30)
  const data = {
    labels,
    datasets: [
      {
        label: 'XP Earned',
        data: labels.map((_, i) => i === labels.length - 1 ? totalXP : Math.max(0, avgDaily - (labels.length - 1 - i) * Math.round(avgDaily * 0.1))),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#22c55e',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Tasks Done',
        data: labels.map((_, i) => i === labels.length - 1 ? (userDoc?.tasksCompleted || 0) : 0),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.05)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y1',
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { size: 12 } } },
      tooltip: {
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
      },
    },
    scales: {
      x: { grid: { color: 'rgba(51,65,85,0.4)' }, ticks: { color: '#64748b' } },
      y: { grid: { color: 'rgba(51,65,85,0.4)' }, ticks: { color: '#64748b' } },
      y1: { position: 'right', grid: { display: false }, ticks: { color: '#64748b' } },
    },
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title mb-0">Weekly Activity</h3>
        <span className="badge badge-eco">This Week</span>
      </div>
      <div className="h-56">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}

function DailyChallenge({ task }) {
  return (
    <div className="glass-card-hover p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-eco-500/20 to-ocean-500/20 border border-eco-500/20 flex items-center justify-center text-xl flex-shrink-0">
        {task.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-white text-sm">{task.title}</div>
        <div className="text-xs text-gray-400 mt-0.5">{task.description}</div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="text-eco-400 font-bold text-sm">+{task.points} XP</div>
        <div className={`badge ${task.done ? 'badge-approved' : 'badge-pending'} text-[10px]`}>
          {task.done ? '✓ Done' : 'Pending'}
        </div>
      </div>
    </div>
  )
}

function LeaderboardPreview({ entries }) {
  const medals = ['🥇','🥈','🥉']
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title mb-0">Top Econauts</h3>
        <a href="/leaderboard" className="text-xs text-eco-400 hover:text-eco-300 flex items-center gap-1">
          View all <ChevronRight className="w-3 h-3" />
        </a>
      </div>
      <div className="space-y-2">
        {entries.slice(0, 5).map((entry, i) => (
          <motion.div
            key={entry.userId || i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <span className="w-6 text-center text-sm">{medals[i] || `#${i + 1}`}</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-eco-500 to-ocean-600 flex items-center justify-center text-xs font-bold text-white">
              {entry.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{entry.name || 'Unknown'}</div>
              <div className="text-xs text-gray-500">{entry.college || 'Independent'}</div>
            </div>
            <div className="text-eco-400 font-bold text-sm">{formatNumber(entry.points || 0)}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
const categoryIcons = {
  Nature: '🌱',
  Energy: '⚡',
  Waste: '♻️',
  Water: '💧',
  Transport: '🚲',
  Food: '🍎',
  Community: '🤝'
}

function getTaskIcon(task) {
  if (task.icon) return task.icon
  if (task.category) return categoryIcons[task.category] || '🌍'
  return '🌍'
}
export default function Dashboard() {
  const { userDoc, refreshUser } = useAuthStore()
  const [factIndex, setFactIndex] = useState(0)

  useEffect(() => {
    if (refreshUser) refreshUser()
    const timer = setInterval(() => setFactIndex(i => (i + 1) % ecoFacts.length), 5000)
    return () => clearInterval(timer)
  }, [refreshUser])

  const { data: tasksData } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksAPI.getAll({ limit: 5 }),
    enabled: !!userDoc,
  })

  const { data: leaderboardData } = useQuery({
    queryKey: ['leaderboard-preview'],
    queryFn: () => leaderboardAPI.getGlobal({ limit: 5 }),
  })

  const dailyChallenges = tasksData?.data?.tasks?.slice(0, 3) || []

  const leaderEntries = leaderboardData?.data?.entries || []

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">
              Hey {userDoc?.name?.split(' ')[0] || 'Eco Warrior'} 👋
            </h1>
            <p className="page-subtitle">Ready to make a difference today?</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 glass-card">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-bold text-orange-400">{userDoc?.streakCount || 0} day streak!</span>
          </div>
        </div>
      </div>

      {/* Eco fact ticker */}
      <AnimatePresence mode="wait">
        <motion.div
          key={factIndex}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="glass-card px-4 py-3 border-l-4 border-eco-500 text-sm text-eco-300"
        >
          {ecoFacts[factIndex]}
        </motion.div>
      </AnimatePresence>

      {/* XP Progress */}
      <XPProgressBar points={userDoc?.points || 0} />

      {/* Eco Impact */}
      <EcoImpactBanner userDoc={userDoc} />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Target} label="Tasks Done" value={userDoc?.tasksCompleted || 0} color="bg-eco-500" delay={0.1} />
        <StatCard icon={Star} label="Badges" value={userDoc?.badges?.length ?? 0} color="bg-yellow-500" delay={0.15} />
        <StatCard icon={TrendingUp} label="Global Rank" value={`#${userDoc?.globalRank || '—'}`} color="bg-ocean-500" delay={0.2} />
        <StatCard icon={Award} label="Eco Score" value={userDoc?.ecoScore || 0} color="bg-purple-500" delay={0.25} />
      </div>

      {/* Chart + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <ActivityChart userDoc={userDoc} />
        </div>
        <div className="lg:col-span-2">
          <LeaderboardPreview entries={leaderEntries} />
        </div>
      </div>

      {/* Daily Challenges / Recent Tasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title mb-0">Available Challenges</h2>
          <a href="/tasks" className="text-xs text-eco-400 hover:text-eco-300">View all →</a>
        </div>
        {dailyChallenges.length === 0 ? (
          <div className="glass-card p-6 text-center text-gray-500 text-sm">
            No tasks available yet. Check back soon! 🌱
          </div>
        ) : (
          <div className="space-y-3">
            {dailyChallenges.map((task, i) => (
              <motion.div key={task.$id || i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="glass-card-hover p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-eco-500/20 to-ocean-500/20 border border-eco-500/20 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
                    <motion.div whileHover={{ scale: 1.2, rotate: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                      {getTaskIcon(task)}
                    </motion.div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm">{task.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="text-eco-400 font-bold text-sm">+{task.points} XP</div>
                    <a href="/tasks" className="badge badge-eco text-[10px] hover:bg-eco-500 hover:text-white transition-colors">Do it →</a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
