import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Filter, Plus, Upload, CheckCircle, Clock, XCircle,
  Leaf, Globe, Building2, Star, ChevronDown, ChevronUp, Camera
} from 'lucide-react'
import { tasksAPI, submissionsAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const CATEGORIES = ['All', 'Energy', 'Water', 'Waste', 'Transport', 'Food', 'Nature']
const TYPE_FILTERS = ['All', 'Global', 'College']

function TaskCard({ task, onSubmit }) {
  const [expanded, setExpanded] = useState(false)
  const difficultyColors = { easy: 'badge-eco', medium: 'badge-ocean', hard: 'badge-gold' }

  return (
    <motion.div
      layout
      className="glass-card-hover p-5 cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-eco-500/20 to-ocean-500/20 border border-eco-500/20 flex items-center justify-center text-xl flex-shrink-0">
          {task.type === 'global' ? '🌍' : '🏫'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white">{task.title}</h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`badge ${difficultyColors[task.difficulty] || 'badge-eco'}`}>
                {task.difficulty || 'easy'}
              </span>
              <span className="badge badge-gold">+{task.points} XP</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{task.description}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className={`badge text-[10px] ${task.type === 'global' ? 'badge-ocean' : 'badge-eco'}`}>
              {task.type === 'global' ? <Globe className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
              {task.type}
            </span>
            <span className="text-xs text-gray-500">{task.category}</span>
          </div>
        </div>
        <div className="flex-shrink-0 text-gray-500">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-slate-700/50"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-sm text-gray-300 mb-4">{task.description}</p>
            <button
              onClick={() => onSubmit(task)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Upload className="w-4 h-4" />
              Submit Proof
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function SubmitModal({ task, onClose }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: (fd) => submissionsAPI.submit(fd),
    onSuccess: () => {
      toast.success('🎉 Submission sent for review!')
      qc.invalidateQueries(['submissions'])
      onClose()
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to submit. Try again.'),
  })

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = () => {
    if (!file) return toast.error('Please upload a proof image')
    const fd = new FormData()
    fd.append('taskId', task.$id)
    fd.append('proof', file)
    mutation.mutate(fd)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative glass-card w-full max-w-md p-6"
      >
        <h2 className="text-lg font-display font-bold text-white mb-1">Submit Proof</h2>
        <p className="text-sm text-gray-400 mb-4">{task.title}</p>

        <label className="block cursor-pointer">
          <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
            preview ? 'border-eco-500/50' : 'border-slate-700 hover:border-eco-500/40'
          }`}>
            {preview
              ? <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
              : (
                <div className="space-y-2">
                  <Camera className="w-10 h-10 text-gray-500 mx-auto" />
                  <p className="text-sm text-gray-400">Click to upload image/video</p>
                  <p className="text-xs text-gray-600">PNG, JPG, MP4 up to 10MB</p>
                </div>
              )
            }
          </div>
          <input type="file" accept="image/*,video/*" onChange={handleFile} className="hidden" />
        </label>

        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!file || mutation.isPending}
            className="btn-primary flex-1 text-sm"
          >
            {mutation.isPending ? 'Submitting...' : '🚀 Submit'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function MySubmissions() {
  const { data } = useQuery({
    queryKey: ['submissions'],
    queryFn: () => submissionsAPI.getMySubmissions(),
  })
  const submissions = data?.data?.submissions || []
  const statusIcon = {
    pending: <Clock className="w-4 h-4 text-yellow-400" />,
    approved: <CheckCircle className="w-4 h-4 text-eco-400" />,
    rejected: <XCircle className="w-4 h-4 text-red-400" />,
  }

  if (!submissions.length) return (
    <div className="text-center py-8 text-gray-500 text-sm">No submissions yet. Complete a task!</div>
  )

  return (
    <div className="space-y-3">
      {submissions.map((s) => (
        <div key={s.$id} className="glass-card p-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="font-medium text-white text-sm">{s.taskTitle}</div>
            <div className="text-xs text-gray-400 mt-0.5">{new Date(s.$createdAt).toLocaleDateString()}</div>
          </div>
          <div className={`badge ${`badge-${s.status}`} flex items-center gap-1`}>
            {statusIcon[s.status]}
            {s.status}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Tasks() {
  const { userDoc } = useAuthStore()
  const [category, setCategory] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [submitTask, setSubmitTask] = useState(null)
  const [activeTab, setActiveTab] = useState('browse')

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', category, typeFilter],
    queryFn: () => tasksAPI.getAll({
      category: category !== 'All' ? category : undefined,
      type: typeFilter !== 'All' ? typeFilter.toLowerCase() : undefined,
    }),
    enabled: !!userDoc,
  })

  const tasks = data?.data?.tasks || []

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header">
        <h1 className="page-title">Eco Tasks 🎯</h1>
        <p className="page-subtitle">Complete real-world challenges and earn XP</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['browse', 'my-submissions'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-eco-500/20 text-eco-400 border border-eco-500/30' : 'text-gray-400 hover:text-white bg-slate-800/50'
            }`}
          >
            {tab === 'browse' ? '🌍 Browse Tasks' : '📋 My Submissions'}
          </button>
        ))}
      </div>

      {activeTab === 'browse' && (
        <>
          {/* Filters */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    category === c ? 'bg-eco-500 text-white' : 'bg-slate-800/60 text-gray-400 hover:text-white'
                  }`}
                >{c}</button>
              ))}
            </div>
            <div className="flex gap-2">
              {TYPE_FILTERS.map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    typeFilter === t ? 'bg-ocean-500/20 text-ocean-400 border border-ocean-500/30' : 'bg-slate-800/60 text-gray-400 hover:text-white'
                  }`}
                >
                  {t === 'Global' && <Globe className="w-3 h-3" />}
                  {t === 'College' && <Building2 className="w-3 h-3" />}
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Task list */}
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl shimmer" />)}
            </div>
          ) : tasks.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <div className="text-4xl mb-3">🌱</div>
              <p className="text-gray-400 text-sm">No tasks found for this filter.</p>
              <p className="text-gray-600 text-xs mt-1">Admins can create tasks from the Admin Panel.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task, i) => (
                <motion.div key={task.$id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <TaskCard task={task} onSubmit={setSubmitTask} />
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'my-submissions' && <MySubmissions />}

      {/* Submit modal */}
      {submitTask && <SubmitModal task={submitTask} onClose={() => setSubmitTask(null)} />}
    </div>
  )
}
