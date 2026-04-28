import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, Plus, Clock, CheckCircle, Upload, ChevronRight, PenTool } from 'lucide-react'
import { assignmentsAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

function CreateAssignmentModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', totalMarks: 100 })
  const [questions, setQuestions] = useState([{ q: '', a: '' }])
  
  const mutation = useMutation({
    mutationFn: () => assignmentsAPI.create({ 
      ...form, 
      questions: JSON.stringify(questions.map(q => q.q)) 
    }),
    onSuccess: () => { toast.success('Assignment published!'); onCreated(); onClose() },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create')
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative glass-card w-full max-w-2xl p-6 flex flex-col max-h-[90vh]">
        <h2 className="font-display font-bold text-white text-lg flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-eco-400" /> New Assignment
        </h2>
        
        <div className="overflow-y-auto pr-2 space-y-4 flex-1 custom-scrollbar">
          <input value={form.title} required onChange={e => setForm({...form, title: e.target.value})} placeholder="Assignment Title" className="input-field" />
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Instructions..." rows={2} className="input-field resize-none" />
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="label">Total Marks</label>
              <input type="number" value={form.totalMarks} onChange={e => setForm({...form, totalMarks: +e.target.value})} className="input-field" />
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <label className="label mb-0">Questions</label>
              <button onClick={() => setQuestions([...questions, { q: '', a: '' }])} className="text-xs text-eco-400 font-medium flex items-center gap-1"><Plus className="w-3 h-3"/> Add Q</button>
            </div>
            {questions.map((q, i) => (
              <input key={i} value={q.q} onChange={e => {
                const n = [...questions]; n[i].q = e.target.value; setQuestions(n)
              }} placeholder={`Q${i + 1}`} className="input-field text-sm py-2" />
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-700/50">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm">Cancel</button>
          <button onClick={() => { if(!form.title) return toast.error('Title is required'); mutation.mutate() }} disabled={mutation.isPending} className="btn-primary flex-1 text-sm">
            {mutation.isPending ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function StudentAttemptModal({ assignment, onClose, onSubmitted }) {
  const questions = typeof assignment.questions === 'string' ? JSON.parse(assignment.questions) : assignment.questions
  const [answers, setAnswers] = useState(Array(questions.length).fill(''))
  
  const mutation = useMutation({
    mutationFn: () => assignmentsAPI.submit(assignment.$id, JSON.stringify(answers)),
    onSuccess: () => { toast.success('Submitted successfully!'); onSubmitted(); onClose() },
    onError: () => toast.error('Failed to submit')
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative glass-card w-full max-w-3xl p-6 flex flex-col max-h-[90vh]">
        <h2 className="font-display font-bold text-white text-xl">{assignment.title}</h2>
        <p className="text-gray-400 text-sm mt-1">{assignment.description}</p>
        
        <div className="overflow-y-auto pr-2 space-y-6 mt-6 flex-1 custom-scrollbar">
          {questions.map((q, i) => (
            <div key={i} className="space-y-2">
              <div className="text-white font-medium text-sm border-l-2 border-eco-500 pl-3">Q{i + 1}: {q}</div>
              <textarea 
                value={answers[i]} 
                onChange={e => { const n = [...answers]; n[i] = e.target.value; setAnswers(n); }} 
                rows={3} className="input-field text-sm resize-none" placeholder="Write your answer..." 
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-700/50">
          <button onClick={onClose} className="btn-secondary text-sm">Save Draft</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
            <Upload className="w-4 h-4"/> {mutation.isPending ? 'Submitting...' : 'Turn In Assignment'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function EvaluateModal({ sub, assignment, onClose, onEvaluated }) {
  const [score, setScore] = useState(sub.score || 0)
  const studentAnswers = typeof sub.answers === 'string' ? JSON.parse(sub.answers) : sub.answers
  const questions = typeof assignment.questions === 'string' ? JSON.parse(assignment.questions) : assignment.questions

  const mutation = useMutation({
    mutationFn: () => assignmentsAPI.evaluate(assignment.$id, sub.$id, score),
    onSuccess: () => { toast.success('Evaluated!'); onEvaluated(); onClose() }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative glass-card w-full max-w-3xl p-6 flex flex-col max-h-[90vh]">
        <h2 className="font-display font-bold text-white text-lg">Evaluate Submission</h2>
        <div className="text-sm text-gray-400 mb-4">Student ID: {sub.studentId} | Max Marks: {assignment.totalMarks}</div>

        <div className="overflow-y-auto space-y-6 flex-1 custom-scrollbar pr-2">
          {questions.map((q, i) => (
            <div key={i} className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
              <div className="text-white text-sm font-medium mb-3 border-b border-slate-700 pb-2">Q: {q}</div>
              <div className="text-gray-300 text-sm whitespace-pre-wrap">{studentAnswers[i] || <span className="text-gray-600 italic">No answer provided</span>}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-700/50">
          <div className="flex-1 flex items-center gap-3">
            <label className="text-white font-medium">Score:</label>
            <input type="number" value={score} onChange={e => setScore(e.target.value)} max={assignment.totalMarks} className="input-field w-32" />
            <span className="text-gray-500">/ {assignment.totalMarks}</span>
          </div>
          <button onClick={onClose} className="btn-secondary text-sm px-6">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="btn-primary text-sm px-8">Complete</button>
        </div>
      </motion.div>
    </div>
  )
}

export default function Assignments() {
  const { userDoc } = useAuthStore()
  const isAdmin = ['college_admin', 'super_admin'].includes(userDoc?.role)
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [activeAttempt, setActiveAttempt] = useState(null)
  const [viewSubmissionsFor, setViewSubmissionsFor] = useState(null)
  
  const { data, isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => assignmentsAPI.getAll(),
  })
  
  const { data: subsData } = useQuery({
    queryKey: ['assignment-subs', viewSubmissionsFor?.$id],
    queryFn: () => assignmentsAPI.getSubmissions(viewSubmissionsFor?.$id),
    enabled: !!viewSubmissionsFor && isAdmin,
  })

  const { data: mySubsData } = useQuery({
    queryKey: ['my-assignments-subs'],
    queryFn: () => assignmentsAPI.getMySubmissions(),
    enabled: !isAdmin,
  })

  const assignments = data?.data?.assignments || []
  const currentSubmissions = subsData?.data?.submissions || []
  const mySubmissions = mySubsData?.data?.submissions || []

  // Helper to check assignment state for student
  const getSubState = (assignmentId) => {
    const sub = mySubmissions.find(s => s.assignmentId === assignmentId)
    if (!sub) return { locked: false }
    
    // Check 24 cooldown
    const hoursSince = (Date.now() - new Date(sub.$createdAt).getTime()) / (1000 * 60 * 60)
    if (hoursSince < 24) {
      if (sub.status === 'checked') return { locked: true, reason: 'evaluated', score: sub.score }
      return { locked: true, reason: 'cooldown', waitHours: Math.ceil(24 - hoursSince) }
    }
    return { locked: false }
  }

  // If viewing submissions (Admin Mode)
  if (viewSubmissionsFor) return (
    <div className="space-y-6 animate-slide-up">
      <button onClick={() => setViewSubmissionsFor(null)} className="text-sm font-medium text-gray-400 hover:text-white flex items-center gap-1 mb-4">
        &larr; Back to Assignments
      </button>
      <div className="page-header">
        <h1 className="page-title">{viewSubmissionsFor.title}</h1>
        <p className="page-subtitle">Evaluation Portal</p>
      </div>
      <div className="space-y-3">
        {currentSubmissions.length === 0 ? <div className="text-gray-500 py-10 text-center">No submissions yet.</div> : currentSubmissions.map(s => (
          <div key={s.$id} className="glass-card flex items-center justify-between p-4">
            <div>
              <div className="text-white font-medium text-sm">Student {s.studentId.substring(0, 8)}...</div>
              <div className="text-xs text-gray-400">{new Date(s.$createdAt).toLocaleDateString()}</div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`badge ${s.status === 'checked' ? 'badge-eco' : 'badge-gold'}`}>{s.status}</span>
              {s.status === 'checked' && <span className="text-eco-400 font-bold">{s.score} / {viewSubmissionsFor.totalMarks}</span>}
              <button onClick={() => setActiveAttempt({ sub: s, asgn: viewSubmissionsFor })} className="btn-secondary py-1.5 px-3 text-xs">Evaluate</button>
            </div>
          </div>
        ))}
      </div>
      {activeAttempt && <EvaluateModal sub={activeAttempt.sub} assignment={activeAttempt.asgn} onClose={() => setActiveAttempt(null)} onEvaluated={() => qc.invalidateQueries(['assignment-subs'])} />}
    </div>
  )

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2"><PenTool className="w-8 h-8 text-eco-400" /> Formal Assignments</h1>
          <p className="page-subtitle">Academic tests and essays</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Create Assignment
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-24 rounded-xl shimmer" />)}</div>
      ) : assignments.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-gray-400 text-sm">No assignments posted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map(a => (
            <div key={a.$id} className="glass-card-hover p-5 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg">{a.title}</h3>
                <p className="text-sm text-gray-400 mt-1 max-w-lg truncate">{a.description}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="badge badge-ocean text-xs font-mono">{a.totalMarks} Marks</span>
                  {a.dueDate && <span className="text-xs text-gray-500 font-medium flex items-center gap-1"><Clock className="w-3 h-3"/> Due: {new Date(a.dueDate).toLocaleDateString()}</span>}
                </div>
              </div>
              <div>
                {isAdmin ? (
                  <button onClick={() => setViewSubmissionsFor(a)} className="btn-secondary text-sm">View Submissions</button>
                ) : (
                  (() => {
                    const st = getSubState(a.$id)
                    if (st.locked && st.reason === 'evaluated') {
                      return <span className="font-bold text-eco-400">Score: {st.score} / {a.totalMarks}</span>
                    } else if (st.locked && st.reason === 'cooldown') {
                      return <span className="text-xs text-gray-500 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700">Available in {st.waitHours}h</span>
                    }
                    return <button onClick={() => setActiveAttempt(a)} className="btn-primary text-sm flex items-center gap-2">Attempt <ChevronRight className="w-4 h-4"/></button>
                  })()
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateAssignmentModal onClose={() => setShowCreate(false)} onCreated={() => qc.invalidateQueries(['assignments'])} />}
      {activeAttempt && !isAdmin && <StudentAttemptModal assignment={activeAttempt} onClose={() => setActiveAttempt(null)} onSubmitted={() => qc.invalidateQueries(['my-assignments-subs'])} />}
    </div>
  )
}
