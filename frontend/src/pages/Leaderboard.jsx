import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Trophy, Globe, Building2, Crown, ChevronUp, ChevronDown, Minus } from 'lucide-react'
import { leaderboardAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { formatNumber, getLevelInfo } from '../lib/utils'

const MOCK_GLOBAL = [
  { rank:1, name:'Arjun Mehta', college:'IIT Bombay', points:4520, level:'Planet Protector', emoji:'🌍', change:0 },
  { rank:2, name:'Priya Sharma', college:'NIT Trichy', points:3890, level:'Eco Guardian', emoji:'👸', change:1 },
  { rank:3, name:'Rahul Kumar', college:'BITS Pilani', points:3200, level:'Eco Guardian', emoji:'🏆', change:-1 },
  { rank:4, name:'Sneha Patel', college:'VIT Vellore', points:2750, level:'Green Warrior', emoji:'🌿', change:2 },
  { rank:5, name:'Amit Joshi', college:'IIT Delhi', points:2100, level:'Green Warrior', emoji:'⚡', change:0 },
  { rank:6, name:'Kavya Nair', college:'NITK Surathkal', points:1850, level:'Sapling', emoji:'🌱', change:3 },
  { rank:7, name:'Rohan Das', college:'Jadavpur Univ.', points:1600, level:'Sapling', emoji:'🍃', change:-2 },
  { rank:8, name:'Meera Reddy', college:'CBIT Hyd.', points:1400, level:'Seedling', emoji:'🌻', change:1 },
  { rank:9, name:'Vijay Singh', college:'LPU Punjab', points:1200, level:'Seedling', emoji:'🦋', change:-1 },
  { rank:10, name:'Ananya Roy', college:'Presidency Kolkata', points:980, level:'Seedling', emoji:'🌺', change:4 },
]

function RankChange({ change }) {
  if (change > 0) return <div className="flex items-center text-eco-400 text-xs"><ChevronUp className="w-3 h-3" />{change}</div>
  if (change < 0) return <div className="flex items-center text-red-400 text-xs"><ChevronDown className="w-3 h-3" />{Math.abs(change)}</div>
  return <Minus className="w-3 h-3 text-gray-500" />
}

function RankRow({ entry, index, isCurrentUser }) {
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' }
  const lvlInfo = getLevelInfo(entry.points)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        isCurrentUser
          ? 'bg-eco-500/15 border border-eco-500/40 shadow-eco'
          : 'hover:bg-white/5'
      }`}
    >
      {/* Rank */}
      <div className="w-8 text-center flex-shrink-0">
        {medals[entry.rank]
          ? <span className="text-xl">{medals[entry.rank]}</span>
          : <span className="text-gray-400 font-bold text-sm">#{entry.rank}</span>
        }
      </div>

      {/* Avatar */}
      <div className="relative">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm
          ${entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
            entry.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
            entry.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-amber-600' :
            'bg-gradient-to-br from-eco-500 to-ocean-600'}`}
        >
          {entry.name?.charAt(0)}
        </div>
        {entry.rank <= 3 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center">
            <Crown className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className={`font-semibold text-sm ${isCurrentUser ? 'text-eco-300' : 'text-white'}`}>
          {entry.name} {isCurrentUser && '(You)'}
        </div>
        <div className="text-xs text-gray-400 flex items-center gap-1.5">
          <span>{lvlInfo.emoji}</span>
          <span className="truncate">{entry.college}</span>
        </div>
      </div>

      {/* Change */}
      <RankChange change={entry.change || 0} />

      {/* Points */}
      <div className="text-right flex-shrink-0">
        <div className="font-bold text-eco-400">{formatNumber(entry.points)}</div>
        <div className="text-xs text-gray-500">XP</div>
      </div>
    </motion.div>
  )
}

export default function Leaderboard() {
  const { userDoc } = useAuthStore()
  const [tab, setTab] = useState('global')
  const [period, setPeriod] = useState('all-time')

  const { data: globalData, isLoading: isLoadingGlobal } = useQuery({
    queryKey: ['leaderboard', 'global', period],
    queryFn: () => leaderboardAPI.getGlobal({ period }),
  })

  const { data: collegeData, isLoading: isLoadingCollege } = useQuery({
    queryKey: ['leaderboard', 'college', userDoc?.collegeId, period],
    queryFn: () => leaderboardAPI.getCollege(userDoc?.collegeId, { period }),
    enabled: !!userDoc?.collegeId && tab === 'college',
  })

  const isLoading = tab === 'global' ? isLoadingGlobal : isLoadingCollege

  const entries = tab === 'global'
    ? (globalData?.data?.entries || [])
    : (collegeData?.data?.entries || [])

  // Dynamic user rank calculation
  const userEntry = entries.find(e => e.userId === userDoc?.$id)
  const userRank = userEntry ? userEntry.rank : '—'
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header">
        <h1 className="page-title">Leaderboard 🏆</h1>
        <p className="page-subtitle">Top Econauts making a real difference</p>
      </div>

      {/* Top 3 podium */}
      <div className="glass-card p-6">
        <div className="flex items-end justify-center gap-4">
          {/* 2nd */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-2xl">🥈</div>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-xl font-bold text-white">
              {entries[1]?.name?.charAt(0)||'P'}
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-white">{entries[1]?.name?.split(' ')[0]||'#2'}</div>
              <div className="text-xs text-eco-400 font-bold">{formatNumber(entries[1]?.points||0)}</div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-t from-gray-500/30 to-transparent rounded-t-xl flex items-end justify-center pb-1">
              <span className="text-gray-300 font-bold text-2xl">2</span>
            </div>
          </div>
          {/* 1st */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-3xl animate-float">🥇</div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl font-bold text-white shadow-glow-eco">
              {entries[0]?.name?.charAt(0)||'A'}
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-white">{entries[0]?.name?.split(' ')[0]||'#1'}</div>
              <div className="text-sm text-yellow-400 font-bold">{formatNumber(entries[0]?.points||0)}</div>
            </div>
            <div className="w-20 h-24 bg-gradient-to-t from-yellow-500/30 to-transparent rounded-t-xl flex items-end justify-center pb-1">
              <span className="text-yellow-300 font-bold text-3xl">1</span>
            </div>
          </div>
          {/* 3rd */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-2xl">🥉</div>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-xl font-bold text-white">
              {entries[2]?.name?.charAt(0)||'R'}
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-white">{entries[2]?.name?.split(' ')[0]||'#3'}</div>
              <div className="text-xs text-orange-400 font-bold">{formatNumber(entries[2]?.points||0)}</div>
            </div>
            <div className="w-16 h-10 bg-gradient-to-t from-orange-500/30 to-transparent rounded-t-xl flex items-end justify-center pb-1">
              <span className="text-orange-300 font-bold text-2xl">3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {[
            { id: 'global', icon: Globe, label: 'Global' },
            { id: 'college', icon: Building2, label: 'College' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === id ? 'bg-eco-500/20 text-eco-400 border border-eco-500/30' : 'bg-slate-800/50 text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {['all-time','weekly','monthly'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                period === p ? 'bg-ocean-500/20 text-ocean-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {p.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Your rank banner */}
      {userDoc && (
        <div className="glass-card p-4 border border-eco-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-eco-500/20 flex items-center justify-center font-bold text-eco-400">#{userRank}</div>
            <div>
              <div className="text-sm font-semibold text-white">Your Current Rank</div>
              <div className="text-xs text-gray-400">Keep going to reach the top! 🚀</div>
            </div>
          </div>
          <div className="text-eco-400 font-bold">{formatNumber(userDoc.points || 0)} XP</div>
        </div>
      )}

      {/* Full list */}
      <div className="glass-card p-4 space-y-1">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 rounded-full border-4 border-eco-500 border-t-transparent animate-spin"></div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center p-8 text-gray-500">No leaderboard data found.</div>
        ) : entries.map((entry, i) => (
          <RankRow
            key={entry.rank || i}
            entry={entry}
            index={i}
            isCurrentUser={entry.name === userDoc?.name}
          />
        ))}
      </div>
    </div>
  )
}
