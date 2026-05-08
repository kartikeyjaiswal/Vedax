import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users, ListTodo, CheckCircle, XCircle, Clock, Plus,
  BarChart3, Building2, Trophy, ChevronRight, Loader2, MessageSquare, Eye
} from 'lucide-react'
import { tasksAPI, submissionsAPI, collegesAPI, ticketsAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { formatNumber } from '../lib/utils'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import toast from 'react-hot-toast'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="stat-card glass-card">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="stat-number">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export function SubmissionRow({ sub, onApprove, onReject, onViewMedia }) {
  const [loading, setLoading] = useState(false)
  const handle = async (action) => {
    setLoading(true)
    try { await action() } finally { setLoading(false) }
  }

  const mediaUrl = sub.imageProofId ? `${import.meta.env.VITE_APPWRITE_ENDPOINT}/storage/buckets/submissions_bucket/files/${sub.imageProofId}/view?project=${import.meta.env.VITE_APPWRITE_PROJECT_ID}` : null;

  return (
    <div className="flex items-center gap-4 p-4 glass-card relative z-10">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white text-sm">{sub.taskTitle || 'Eco Task'}</div>
        <div className="text-xs text-gray-400">{sub.userName} · {new Date(sub.$createdAt || Date.now()).toLocaleDateString()}</div>
      </div>
      <div className={`badge badge-${sub.status}`}>{sub.status}</div>
      {sub.status === 'pending' && (
        <div className="flex gap-2">
          {mediaUrl && (
            <button onClick={() => onViewMedia(mediaUrl)} className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 flex items-center justify-center transition-colors" title="View Submission">
              <Eye className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => handle(onApprove)} disabled={loading} className="w-8 h-8 rounded-lg bg-eco-500/20 text-eco-400 hover:bg-eco-500/30 flex items-center justify-center transition-colors" title="Approve">
            <CheckCircle className="w-4 h-4" />
          </button>
          <button onClick={() => handle(onReject)} disabled={loading} className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-colors" title="Reject">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

function CreateTaskModal({ collegeId, onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', points: 50, category: 'Nature', difficulty: 'easy', type: 'college' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const mutation = useMutation({
    mutationFn: () => tasksAPI.create({ ...form, collegeId }),
    onSuccess: () => { toast.success('Task created!'); onCreated(); onClose() },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create task'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative glass-card w-full max-w-md p-6 space-y-4">
        <h2 className="font-display font-bold text-white text-lg">Create Task</h2>
        <input value={form.title} required onChange={e => set('title', e.target.value)} placeholder="Task title" className="input-field" />
        <textarea value={form.description} required onChange={e => set('description', e.target.value)} placeholder="Description..." rows={3} className="input-field resize-none" />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Points</label>
            <input type="number" value={form.points} onChange={e => set('points', +e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">Difficulty</label>
            <select value={form.difficulty} onChange={e => set('difficulty', e.target.value)} className="input-field">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm">Cancel</button>
          <button onClick={() => { if(!form.title || !form.description) return toast.error('Fill required fields'); mutation.mutate() }} disabled={mutation.isPending} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function SupportTab() {
  const [showCreate, setShowCreate] = useState(false)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['college-tickets'],
    queryFn: () => ticketsAPI.getAll(),
  })

  const tickets = data?.data?.tickets || []

  const handleSubmit = async () => {
    if (!subject || !description) return toast.error('Subject and description required')
    setIsSubmitting(true)
    try {
      await ticketsAPI.create({ subject, description, priority })
      toast.success('Ticket created successfully')
      setShowCreate(false)
      setSubject('')
      setDescription('')
      setPriority('medium')
      qc.invalidateQueries(['college-tickets'])
    } catch {
      toast.error('Failed to create ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="section-title m-0">Support Tickets</h3>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      {showCreate && (
        <div className="glass-card p-5 mb-4 space-y-3">
          <h4 className="font-bold text-white">Create New Support Ticket</h4>
          <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Subject" className="input-field" />
          <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe your issue..." className="input-field min-h-[100px]" />
          <select value={priority} onChange={e=>setPriority(e.target.value)} className="input-field">
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="critical">Critical</option>
          </select>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary flex-1 text-sm flex justify-center items-center gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Submit
            </button>
          </div>
        </div>
      )}

      {tickets.length === 0 && !isLoading && (
        <div className="text-center p-8 text-gray-500 glass-card">No support tickets found.</div>
      )}

      <div className="space-y-3">
        {tickets.map(ticket => (
          <div key={ticket.$id} className="glass-card p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-white">{ticket.subject}</h4>
              <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${
                ticket.status === 'open' ? 'bg-yellow-500/20 text-yellow-500' :
                ticket.status === 'approved' ? 'bg-eco-500/20 text-eco-400' :
                ticket.status === 'denied' ? 'bg-red-500/20 text-red-500' :
                'bg-gray-500/20 text-gray-400'
              }`}>{ticket.status}</span>
            </div>
            <p className="text-sm text-gray-400 whitespace-pre-wrap">{ticket.description}</p>
            {ticket.adminReply && (
              <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="text-xs text-purple-400 font-bold mb-1">Super Admin Reply:</div>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{ticket.adminReply}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { userDoc } = useAuthStore()
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [viewMediaUrl, setViewMediaUrl] = useState(null)

  const { data: statsData } = useQuery({
    queryKey: ['college-stats', userDoc?.collegeId],
    queryFn: () => collegesAPI.getStats(userDoc?.collegeId),
    enabled: !!userDoc?.collegeId,
  })

  const { data: submissionsData, refetch } = useQuery({
    queryKey: ['admin-submissions', userDoc?.collegeId],
    queryFn: () => submissionsAPI.getByTask('all'),
  })

  const { data: studentsData } = useQuery({
    queryKey: ['college-students', userDoc?.collegeId],
    queryFn: () => collegesAPI.getStudents(userDoc?.collegeId),
    enabled: !!userDoc?.collegeId,
  })

  const approveMutation = useMutation({
    mutationFn: (id) => submissionsAPI.approve(id),
    onSuccess: () => { toast.success('Submission approved! +XP awarded'); qc.invalidateQueries(['admin-submissions']) },
  })
  const rejectMutation = useMutation({
    mutationFn: (id) => submissionsAPI.reject(id, 'Does not meet requirements'),
    onSuccess: () => { toast.success('Submission rejected'); qc.invalidateQueries(['admin-submissions']) },
  })

  const stats = statsData?.data || { members: 0, tasksCompleted: 0, pending: 0, totalXP: 0 }
  const submissions = submissionsData?.data?.submissions || []
  const studentsList = studentsData?.data?.students || []

  const chartData = {
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets: [{
      label: 'Tasks Completed',
      data: Array(7).fill(0).map((_, i) => i === 6 ? stats.tasksCompleted : 0),
      backgroundColor: 'rgba(34,197,94,0.6)',
      borderRadius: 6,
    }],
  }
  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(51,65,85,0.4)' }, ticks: { color: '#64748b' } },
      y: { grid: { color: 'rgba(51,65,85,0.4)' }, ticks: { color: '#64748b' } },
    },
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Admin Dashboard 🏫</h1>
          <p className="page-subtitle">{userDoc?.collegeName || 'Your College'} · College Admin</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Create Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Members" value={stats.members} color="bg-ocean-500" />
        <StatCard icon={ListTodo} label="Tasks Done" value={stats.tasksCompleted} color="bg-eco-500" />
        <StatCard icon={Clock} label="Pending Reviews" value={stats.pending} color="bg-yellow-500" />
        <StatCard icon={Trophy} label="Total XP" value={formatNumber(stats.totalXP)} color="bg-purple-500" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['overview', 'submissions', 'students', 'support'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === t ? 'bg-eco-500/20 text-eco-400 border border-eco-500/30' : 'text-gray-400 bg-slate-800/50 hover:text-white capitalize'}`}>
            {t === 'overview' ? '📊 Overview' : t === 'submissions' ? '📋 Submissions' : t === 'students' ? '🎓 Students Roster' : '🎫 Support'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="glass-card p-5">
          <h3 className="section-title">Weekly Activity</h3>
          <div className="h-56">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="space-y-3">
          <h3 className="section-title">Pending Reviews</h3>
          {submissions.map(sub => (
            <SubmissionRow
              key={sub.$id}
              sub={sub}
              onApprove={() => approveMutation.mutateAsync(sub.$id)}
              onReject={() => rejectMutation.mutateAsync(sub.$id)}
              onViewMedia={setViewMediaUrl}
            />
          ))}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="glass-card p-5">
          <h3 className="section-title mb-4">Enrolled Students</h3>
          {studentsList.length === 0 ? (
            <div className="text-gray-500 text-sm py-4 text-center">No students enrolled yet. Get them to join using your College ID!</div>
          ) : (
            <div className="space-y-2">
              {studentsList.map(s => (
                <div key={s.$id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-eco-500/20 text-eco-400 font-bold flex items-center justify-center">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">{s.name}</div>
                      <div className="text-xs text-gray-400">{s.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-eco-400 font-bold">{formatNumber(s.points || 0)} XP</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 justify-end">Level {s.level || 1}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'support' && <SupportTab />}

      {showCreate && (
        <CreateTaskModal
          collegeId={userDoc?.collegeId}
          onClose={() => setShowCreate(false)}
          onCreated={() => qc.invalidateQueries(['tasks'])}
        />
      )}

      {viewMediaUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setViewMediaUrl(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative glass-card w-full max-w-3xl p-6 space-y-4 max-h-[90vh] flex flex-col z-[101]">
            <div className="flex justify-between items-center">
              <h2 className="font-display font-bold text-white text-lg">Submission Media</h2>
              <button onClick={() => setViewMediaUrl(null)} className="text-gray-400 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto rounded-lg bg-black/50 flex items-center justify-center min-h-[300px]">
              <iframe src={viewMediaUrl} className="w-full h-[60vh] rounded-lg border-0" title="Submission Proof" allowFullScreen />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
