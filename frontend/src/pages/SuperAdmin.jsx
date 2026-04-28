import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Globe, Building2, Users, Shield, Plus, ChevronRight, Loader2 } from 'lucide-react'
import { collegesAPI } from '../services/api'
import { formatNumber } from '../lib/utils'
import toast from 'react-hot-toast'

const MOCK_COLLEGES = [
  { $id: '1', collegeName: 'IIT Bombay', collegeUniqueId: 'IITB-ECO-2024', members: 234, totalXP: 187500 },
  { $id: '2', collegeName: 'NIT Trichy', collegeUniqueId: 'NITT-ECO-2024', members: 178, totalXP: 142300 },
  { $id: '3', collegeName: 'BITS Pilani', collegeUniqueId: 'BITS-ECO-2024', members: 145, totalXP: 98700 },
  { $id: '4', collegeName: 'VIT Vellore', collegeUniqueId: 'VITV-ECO-2024', members: 312, totalXP: 245600 },
]

function CollegeDetailModal({ college, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ['college-students', college.collegeUniqueId],
    queryFn: () => collegesAPI.getStudents(college.collegeUniqueId),
  })

  const students = data?.data?.students || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative glass-card w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-700/50 shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 bg-slate-800/40 shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-display font-bold text-white">{college.collegeName}</h2>
              <div className="font-mono text-sm text-eco-400 mt-1">{college.collegeUniqueId}</div>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-700 rounded-full hover:bg-slate-600 text-white transition-colors">&times;</button>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
             <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
               <div className="text-xs text-gray-400 uppercase">Registered Students</div>
               <div className="text-xl font-bold text-white mt-1">{college.members || students.length}</div>
             </div>
             <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
               <div className="text-xs text-gray-400 uppercase">Total XP Mined</div>
               <div className="text-xl font-bold text-eco-400 mt-1">{formatNumber(college.totalXP || 0)}</div>
             </div>
             <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
               <div className="text-xs text-gray-400 uppercase">Admin Contact</div>
               <div className="text-sm font-medium text-white truncate mt-2" title={college.adminEmail}>{college.adminEmail || 'N/A'}</div>
             </div>
          </div>
        </div>

        {/* Student Roster */}
        <div className="p-6 overflow-y-auto flex-1">
          <h3 className="section-title mb-4 bg-transparent border-0!">Student Roster</h3>
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 text-eco-500 animate-spin" /></div>
          ) : students.length === 0 ? (
            <div className="text-center p-8 text-gray-500 bg-slate-800/40 rounded-xl border border-slate-700/30">No students registered yet.</div>
          ) : (
            <div className="space-y-3">
              {students.map(s => (
                <div key={s.$id} className="flex items-center justify-between p-3 bg-slate-800/60 border border-slate-700/50 rounded-xl hover:border-slate-600 transition-colors">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">{s.name?.charAt(0)}</div>
                    <div>
                      <div className="text-sm font-bold text-white">{s.name}</div>
                      <div className="text-xs text-gray-400">{s.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-eco-400">{formatNumber(s.points || 0)} XP</div>
                    <div className="text-xs text-gray-500">Lvl {s.level || 1} • {s.streakCount || 0}d streak</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function RegisterCollegeModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleCreate = async () => {
    if (!name.trim() || !email.trim()) return toast.error('Enter college name and admin email')
    setLoading(true)
    try {
      const res = await collegesAPI.create({ collegeName: name, adminEmail: email })
      setResult(res.data)
      onCreated()
      toast.success('College registered!')
    } catch {
      toast.error('Failed to register college')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative glass-card w-full max-w-md p-6 space-y-4">
        <h2 className="font-display font-bold text-white text-lg">Register New College</h2>
        {!result ? (
          <>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="College/University name" className="input-field" />
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Admin Email" type="email" className="input-field" />
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={handleCreate} disabled={loading} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Register
              </button>
            </div>
          </>
        ) : (
          <div className="glass-card p-4 border border-eco-500/30 space-y-3">
            <div className="text-2xl text-center">🎉</div>
            <div className="font-bold text-white text-center">{result.college.collegeName}</div>
            
            <div className="bg-slate-800 p-3 rounded-lg text-left mt-2">
              <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">College ID</div>
              <div className="font-mono font-bold text-eco-400">{result.college.collegeUniqueId}</div>
            </div>

            <div className="bg-slate-800 p-3 rounded-lg text-left">
              <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Admin Credentials</div>
              <div className="text-sm text-white">Email: {result.adminEmail}</div>
              <div className="text-sm text-white mt-1 flex gap-2">Password: <span className="font-mono text-yellow-500">{result.adminPassword}</span></div>
            </div>
            
            <button onClick={onClose} className="btn-primary w-full text-sm mt-3">Done</button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default function SuperAdmin() {
  const [showRegister, setShowRegister] = useState(false)
  const [selectedCollege, setSelectedCollege] = useState(null)
  const { data, refetch } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => collegesAPI.getAll(),
  })

  const colleges = data?.data?.colleges || MOCK_COLLEGES
  const totalUsers = colleges.reduce((a, c) => a + (c.members || 0), 0)
  const totalXP = colleges.reduce((a, c) => a + (c.totalXP || 0), 0)

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2"><Shield className="w-6 h-6 text-purple-400" /> Super Admin</h1>
          <p className="page-subtitle">Global platform management</p>
        </div>
        <button onClick={() => setShowRegister(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Register College
        </button>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Colleges', value: colleges.length, icon: Building2, color: 'bg-ocean-500' },
          { label: 'Total Users', value: totalUsers, icon: Users, color: 'bg-eco-500' },
          { label: 'Total XP Generated', value: formatNumber(totalXP), icon: Globe, color: 'bg-purple-500' },
          { label: 'Active Today', value: Math.floor(totalUsers * 0.3), icon: Shield, color: 'bg-yellow-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card glass-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="stat-number">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* College list */}
      <div>
        <h2 className="section-title">Registered Colleges</h2>
        <div className="space-y-3">
          {colleges.map((college, i) => (
            <motion.div
              key={college.$id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card-hover p-5 flex items-center gap-4 cursor-pointer"
              onClick={() => setSelectedCollege(college)}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ocean-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                {college.collegeName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white">{college.collegeName}</div>
                <div className="font-mono text-xs text-eco-400 mt-0.5">{college.collegeUniqueId}</div>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div>
                  <div className="font-bold text-white">{college.members || 0}</div>
                  <div className="text-xs text-gray-500">Members</div>
                </div>
                <div>
                  <div className="font-bold text-eco-400">{formatNumber(college.totalXP || 0)}</div>
                  <div className="text-xs text-gray-500">Total XP</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
            </motion.div>
          ))}
        </div>
      </div>

      {showRegister && <RegisterCollegeModal onClose={() => setShowRegister(false)} onCreated={refetch} />}
      {selectedCollege && <CollegeDetailModal college={selectedCollege} onClose={() => setSelectedCollege(null)} />}
    </div>
  )
}
