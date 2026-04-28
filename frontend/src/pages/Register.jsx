import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, User, Mail, Lock, Hash, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const ROLES = [
  { value: 'student', label: '🎓 Student', desc: 'Learn and earn XP' },
  { value: 'college_admin', label: '🏫 College Admin', desc: 'Manage your college' },
]

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', collegeId: '', role: 'student' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)
  const { register } = useAuthStore()
  const navigate = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return toast.error('Please fill required fields')
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters')
    setLoading(true)
    try {
      const user = await register(form)
      toast.success(`Welcome to EcoGamify, ${user.name}! 🎉`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const selectedRole = ROLES.find(r => r.value === form.role)

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 md:p-8">
      <h2 className="text-xl font-display font-bold text-white mb-1">Join EcoGamify</h2>
      <p className="text-gray-400 text-sm mb-6">Start your eco-journey today 🌱</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="label">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" className="input-field pl-10" />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="label">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@email.com" className="input-field pl-10" autoComplete="email" />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={e => set('password', e.target.value)}
              placeholder="Min 8 characters"
              className="input-field pl-10 pr-10"
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Role selector */}
        <div>
          <label className="label">I am a...</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setRoleOpen(!roleOpen)}
              className="input-field text-left flex items-center justify-between"
            >
              <span className="text-gray-200">{selectedRole?.label}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${roleOpen ? 'rotate-180' : ''}`} />
            </button>
            {roleOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 z-20 glass-card p-2 space-y-1">
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => { set('role', r.value); setRoleOpen(false) }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${form.role === r.value ? 'bg-eco-500/20 text-eco-300' : 'hover:bg-white/5 text-gray-300'}`}
                  >
                    <span className="font-medium">{r.label}</span>
                    <span className="text-xs text-gray-500 block">{r.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* College ID */}
        <div>
          <label className="label">
            College ID <span className="text-gray-600">(optional)</span>
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={form.collegeId}
              onChange={e => set('collegeId', e.target.value.toUpperCase())}
              placeholder="e.g. IITB-ECO-2024"
              className="input-field pl-10 uppercase"
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">Leave blank to join as Common Student (no college)</p>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Start Your Eco Journey 🚀'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-eco-400 hover:text-eco-300 font-medium">Sign in</Link>
      </p>
    </motion.div>
  )
}
