import { motion } from 'framer-motion'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS, RadialLinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend
} from 'chart.js'
import { Edit, Share2, Award, Target, Brain, Flame, Star, Shield } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { authAPI, usersAPI } from '../services/api'
import { getLevelInfo, formatNumber, getBadgeColor } from '../lib/utils'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { Loader2, Mail, Phone, Calendar, GraduationCap, MapPin, CheckCircle2 } from 'lucide-react'

function VerifyEmailModal({ userDoc, onClose, onVerified }) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [otp, setOtp] = useState('')

  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleSend = async () => {
    if (cooldown > 0) return
    setLoading(true)
    try {
      await authAPI.sendOtp({ email: userDoc.email })
      setStep(2)
      setCooldown(60)
      toast.success('Verification code sent!')
    } catch {
      toast.error('Failed to send code')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setLoading(true)
    try {
      await authAPI.sendOtp({ email: userDoc.email })
      setCooldown(60)
      toast.success('A new code has been sent!')
    } catch {
      toast.error('Failed to resend code')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (otp.length !== 6) return toast.error('Enter 6-digit code')
    setLoading(true)
    try {
      const res = await authAPI.verifyOtp({ email: userDoc.email, otp, userId: userDoc.$id })
      toast.success('Email verified successfully!')
      
      // Inject isEmailVerified regardless of DB schema support
      onVerified({ ...res.data.user, isEmailVerified: true })
      onClose()
    } catch {
      toast.error('Invalid or expired code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative glass-card w-full max-w-sm p-6 space-y-4">
        <h2 className="font-display font-bold text-white text-lg">Verify Email</h2>
        <p className="text-sm text-gray-400">Prove ownership of {userDoc.email}</p>
        
        {step === 1 ? (
          <button onClick={handleSend} disabled={loading || cooldown > 0} className="btn-primary w-full flex justify-center gap-2 transition-all">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} 
            {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Send Verification Code'}
          </button>
        ) : (
          <div className="space-y-3">
            <input 
              value={otp} 
              onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              className="input-field text-center text-xl tracking-[0.5em] font-mono" 
              placeholder="000000" 
            />
            <button onClick={handleVerify} disabled={loading} className="btn-primary w-full flex justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Verify
            </button>
            <div className="text-center mt-4">
              <button onClick={handleResend} disabled={cooldown > 0 || loading} className="text-xs text-eco-400 hover:text-eco-300 disabled:text-gray-600 transition-colors">
                {cooldown > 0 ? `Resend Code (${cooldown}s)` : "Didn't receive it? Resend"}
              </button>
            </div>
          </div>
        )}
        <button onClick={onClose} className="w-full text-center text-sm text-gray-500 hover:text-white mt-2">Cancel</button>
      </motion.div>
    </div>
  )
}

function EditProfileModal({ userDoc, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    name: userDoc?.name || '',
    phone: userDoc?.phone || '',
    age: userDoc?.age || '',
    qualification: userDoc?.qualification || '',
    address: userDoc?.address || ''
  })
  
  const mutation = useMutation({
    mutationFn: () => usersAPI.updateProfile(userDoc.$id, formData),
    onSuccess: (res) => {
      const newUser = res.data.user
      if (newUser._awardedOnboardingXP) toast.success('Profile complete! +200 XP 🎉')
      else toast.success('Profile updated!')
      delete newUser._awardedOnboardingXP
      onUpdated(newUser)
      onClose() 
    },
    onError: () => toast.error('Failed to update profile')
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative glass-card w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="font-display font-bold text-white text-lg">Edit Profile</h2>
        {!userDoc.onboardingComplete && (
          <div className="bg-ocean-500/20 border border-ocean-500/30 p-3 rounded-xl text-sm text-ocean-400 mb-4">
            Complete your profile details below to earn a one-time <b>200 XP</b> bonus!
          </div>
        )}
        <div className="space-y-3">
          <div>
            <label className="label">Display Name</label>
            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" placeholder="Enter your name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Phone Number</label>
              <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-field" placeholder="+1..." />
            </div>
            <div>
              <label className="label">Age</label>
              <input value={formData.age} type="number" onChange={e => setFormData({...formData, age: e.target.value})} className="input-field" placeholder="20" />
            </div>
          </div>
          <div>
            <label className="label">Highest Qualification</label>
            <input value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} className="input-field" placeholder="B.Tech Computer Science" />
          </div>
          <div>
            <label className="label">Address / Location</label>
            <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="input-field" placeholder="City, Country" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm bg-transparent border-slate-700/50">Cancel</button>
          <button onClick={() => { if(!formData.name.trim()) return toast.error('Name required'); mutation.mutate() }} disabled={mutation.isPending} className="btn-primary flex-1 text-sm flex justify-center gap-2">
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  )
}

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const ALL_BADGES = [
  { name: 'Eco Warrior', emoji: '⚔️', desc: 'Complete 10 eco tasks' },
  { name: 'Energy Saver', emoji: '💡', desc: 'Save energy 5 days in a row' },
  { name: 'Water Guardian', emoji: '💧', desc: 'Complete all water tasks' },
  { name: 'Tree Planter', emoji: '🌳', desc: 'Plant 5 trees' },
  { name: 'Quiz Master', emoji: '🧠', desc: 'Score 100% in 3 quizzes' },
  { name: 'Daily Streaker', emoji: '🔥', desc: 'Maintain 7-day streak' },
  { name: 'Climate Champion', emoji: '🌍', desc: 'Top 10 in leaderboard' },
  { name: 'Community Leader', emoji: '👥', desc: 'Create 5 college tasks' },
]

function ProfileHeader({ userDoc, onEditClick }) {
  const lvl = getLevelInfo(userDoc?.points || 0)
  return (
    <div className="glass-card p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-eco-500/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-ocean-500/10 rounded-full blur-2xl" />

      <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-eco-500 to-ocean-600 flex items-center justify-center text-4xl font-bold text-white shadow-glow-eco">
            {userDoc?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-lg">
            {lvl.emoji}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            {userDoc?.name}
            {userDoc?.isEmailVerified && <CheckCircle2 className="w-5 h-5 text-eco-400" />}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-gray-400 text-sm">{userDoc?.email}</p>
            {!userDoc?.isEmailVerified && (
              <button onClick={() => window.openVerifyModal()} className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-md hover:bg-red-500/30 transition-colors">
                Verify
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
            <span className="badge badge-eco">{lvl.name}</span>
            {userDoc?.collegeId && (
              <span className="badge badge-ocean">🏫 College Member</span>
            )}
            <span className="badge bg-orange-500/20 text-orange-400 border border-orange-500/30">
              🔥 {userDoc?.streakCount || 0} day streak
            </span>
          </div>

          {/* XP Bar */}
          <div className="mt-4 max-w-xs">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Level {lvl.level}</span><span>{lvl.progress}% → Level {lvl.level+1}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-eco-500 to-ocean-500"
                initial={{ width: 0 }}
                animate={{ width: `${lvl.progress}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={onEditClick} className="btn-secondary px-3 py-2 text-sm flex items-center gap-1.5">
            <Edit className="w-4 h-4" /> Edit
          </button>
          <button className="btn-secondary px-3 py-2 text-sm flex items-center gap-1.5">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function StatsGrid({ userDoc }) {
  const stats = [
    { icon: Target, label: 'Tasks Done', value: userDoc?.tasksCompleted || 0, color: 'text-eco-400' },
    { icon: Brain, label: 'Quizzes', value: userDoc?.quizzesCompleted || 0, color: 'text-purple-400' },
    { icon: Award, label: 'Badges', value: (userDoc?.badges?.length ?? 0), color: 'text-yellow-400' },
    { icon: Flame, label: 'Streak', value: `${userDoc?.streakCount || 0}d`, color: 'text-orange-400' },
    { icon: Star, label: 'XP Total', value: formatNumber(userDoc?.points || 0), color: 'text-eco-400' },
    { icon: Shield, label: 'Global Rank', value: `#${userDoc?.globalRank || '—'}`, color: 'text-ocean-400' },
  ]
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {stats.map(({ icon: Icon, label, value, color }, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="stat-card text-center"
        >
          <Icon className={`w-5 h-5 ${color} mx-auto`} />
          <div className={`text-xl font-display font-bold ${color}`}>{value}</div>
          <div className="text-xs text-gray-500">{label}</div>
        </motion.div>
      ))}
    </div>
  )
}

function BadgesSection({ badges }) {
  return (
    <div className="glass-card p-5">
      <h3 className="section-title">Badges & Achievements</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ALL_BADGES.map((badge, i) => {
          const isEarned = badges?.includes(badge.name) || false;
          return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`p-4 rounded-2xl text-center transition-all ${
              isEarned
                ? `bg-gradient-to-br ${getBadgeColor(badge.name)} p-0.5`
                : 'bg-slate-800/40 opacity-50'
            }`}
          >
            <div className={isEarned ? 'bg-slate-900 rounded-[14px] p-3' : 'p-3'}>
              <div className="text-2xl mb-1">{badge.emoji}</div>
              <div className="text-xs font-semibold text-white leading-tight">{badge.name}</div>
              <div className="text-[10px] text-gray-400 mt-1">{badge.desc}</div>
              {isEarned && (
                <div className="mt-2 text-[10px] text-eco-400 font-bold">✓ Earned</div>
              )}
            </div>
          </motion.div>
        )})}
      </div>
    </div>
  )
}

function PerformanceRadar({ userDoc }) {
  const data = {
    labels: ['Tasks', 'Quizzes', 'Streak', 'Community', 'Impact', 'Knowledge'],
    datasets: [{
      label: 'Performance',
      data: [
        Math.min(100, ((userDoc?.tasksCompleted || 0) / 50) * 100),
        Math.min(100, ((userDoc?.quizzesCompleted || 0) / 20) * 100),
        Math.min(100, ((userDoc?.streakCount || 0) / 30) * 100),
        40, 60, 70,
      ],
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34,197,94,0.1)',
      borderWidth: 2,
      pointBackgroundColor: '#22c55e',
    }],
  }
  const options = {
    responsive: true, maintainAspectRatio: false,
    scales: { r: { grid: { color: 'rgba(148,163,184,0.3)' }, ticks: { color: '#64748b', backdropColor: 'transparent', font: { size: 10 } }, pointLabels: { color: '#64748b', font: { size: 11 } } } },
    plugins: { legend: { display: false } },
  }
  return (
    <div className="glass-card p-5">
      <h3 className="section-title">Performance Overview</h3>
      <div className="h-56 flex items-center justify-center">
        <Radar data={data} options={options} />
      </div>
    </div>
  )
}

export default function Profile() {
  const { userDoc, updateUserDoc } = useAuthStore()
  const [showEdit, setShowEdit] = useState(false)
  const [showVerify, setShowVerify] = useState(false)

  // Attach global handler for header button above
  useEffect(() => {
    window.openVerifyModal = () => setShowVerify(true)
    return () => delete window.openVerifyModal
  }, [])

  const { data } = useQuery({
    queryKey: ['profile', userDoc?.$id],
    queryFn: () => usersAPI.getProfile(userDoc?.$id),
    enabled: !!userDoc?.$id,
  })

  const profile = data?.data?.user || userDoc

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <h1 className="page-title">My Profile 👤</h1>
        <p className="page-subtitle">Your eco journey at a glance</p>
      </div>

      <ProfileHeader userDoc={profile} onEditClick={() => setShowEdit(true)} />
      <StatsGrid userDoc={profile} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PerformanceRadar userDoc={profile} />
        <BadgesSection badges={profile?.badges} />
      </div>

      {/* Eco Score */}
      <div className="glass-card p-5 border border-eco-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-white">Eco Score™</h3>
            <p className="text-sm text-gray-400 mt-1">Your overall environmental impact rating</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-display font-bold text-gradient-eco">{profile?.ecoScore || 72}</div>
            <div className="text-xs text-gray-400">out of 100</div>
          </div>
        </div>
        <div className="mt-4 h-3 rounded-full bg-slate-700 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-eco-500 to-green-400"
            initial={{ width: 0 }}
            animate={{ width: `${profile?.ecoScore || 72}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Beginner</span><span>Planet Hero</span>
        </div>
      </div>

      {showEdit && (
        <EditProfileModal 
          userDoc={profile} 
          onClose={() => setShowEdit(false)} 
          onUpdated={(updatedUser) => updateUserDoc(updatedUser)} 
        />
      )}

      {showVerify && (
        <VerifyEmailModal
          userDoc={profile}
          onClose={() => setShowVerify(false)}
          onVerified={(updatedUser) => updateUserDoc(updatedUser)}
        />
      )}
    </div>
  )
}
