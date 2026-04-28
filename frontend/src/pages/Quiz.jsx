import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Brain, Zap, Clock, Star, Sparkles, ChevronRight, Loader2 } from 'lucide-react'
import { quizzesAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const QUIZ_TOPICS = [
  { id: 'climate', label: 'Climate Change', emoji: '🌡️', color: 'from-red-500 to-orange-600' },
  { id: 'biodiversity', label: 'Biodiversity', emoji: '🦋', color: 'from-green-500 to-teal-600' },
  { id: 'energy', label: 'Renewable Energy', emoji: '⚡', color: 'from-yellow-500 to-amber-600' },
  { id: 'ocean', label: 'Ocean & Water', emoji: '🌊', color: 'from-blue-500 to-cyan-600' },
  { id: 'waste', label: 'Waste & Recycling', emoji: '♻️', color: 'from-purple-500 to-violet-600' },
  { id: 'food', label: 'Sustainable Food', emoji: '🥗', color: 'from-lime-500 to-green-600' },
]

function QuizCard({ quiz, onStart }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-card-hover p-5 cursor-pointer"
      onClick={() => onStart(quiz)}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${quiz.color || 'from-eco-500 to-ocean-600'} flex items-center justify-center text-2xl flex-shrink-0`}>
          {quiz.emoji || '🧠'}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white">{quiz.title}</h3>
          <p className="text-sm text-gray-400 mt-1">{quiz.questionCount || 10} questions • {quiz.timeLimit || 10} min</p>
          <div className="flex items-center gap-3 mt-3">
            <span className="badge badge-eco flex items-center gap-1">
              <Star className="w-3 h-3" />+{quiz.maxPoints || 100} XP
            </span>
            {quiz.isAI && (
              <span className="badge bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Generated
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
      </div>
    </motion.div>
  )
}

function AIQuizGenerator({ onGenerate, isLoading }) {
  const [topic, setTopic] = useState('')
  const [selected, setSelected] = useState('')

  const handleGenerate = () => {
    const t = selected || topic.trim()
    if (!t) return toast.error('Select a topic first')
    onGenerate(t)
  }

  return (
    <div className="glass-card p-6 border border-purple-500/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-display font-bold text-white">AI Quiz Generator</h3>
          <p className="text-xs text-gray-400">Powered by Gemini AI</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {QUIZ_TOPICS.map(t => (
          <button
            key={t.id}
            onClick={() => setSelected(selected === t.id ? '' : t.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all border ${
              selected === t.id
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                : 'bg-slate-800/50 border-slate-700/50 text-gray-400 hover:text-white hover:border-slate-600'
            }`}
          >
            <span>{t.emoji}</span>
            <span className="truncate text-xs">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="Or type a custom topic..."
          className="input-field flex-1 text-sm py-2"
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>
    </div>
  )
}

export default function Quiz() {
  const navigate = useNavigate()
  const { userDoc } = useAuthStore()

  const { data } = useQuery({
    queryKey: ['quizzes'],
    queryFn: () => quizzesAPI.getAll(),
    enabled: !!userDoc,
  })

  const generateMutation = useMutation({
    mutationFn: (topic) => quizzesAPI.generateAI(topic),
    onSuccess: (res) => {
      navigate(`/quiz/${res.data.quiz.$id || 'ai-generated'}`, { state: { quiz: res.data.quiz } })
    },
    onError: () => toast.error('Failed to generate quiz. Check AI service.'),
  })

  const staticQuizzes = [
    { $id: 'q1', title: 'Climate Change Fundamentals', emoji: '🌡️', color: 'from-red-500 to-orange-600', questionCount: 10, timeLimit: 10, maxPoints: 100 },
    { $id: 'q2', title: 'Ocean & Marine Life', emoji: '🌊', color: 'from-blue-500 to-cyan-600', questionCount: 8, timeLimit: 8, maxPoints: 80 },
    { $id: 'q3', title: 'Renewable Energy Deep Dive', emoji: '⚡', color: 'from-yellow-500 to-amber-600', questionCount: 12, timeLimit: 12, maxPoints: 120, isAI: false },
    { $id: 'q4', title: 'Biodiversity & Ecosystems', emoji: '🦋', color: 'from-green-500 to-teal-600', questionCount: 10, timeLimit: 10, maxPoints: 100 },
  ]

  const quizzes = data?.data?.quizzes || staticQuizzes

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header">
        <h1 className="page-title">Eco Quiz Hub 🧠</h1>
        <p className="page-subtitle">Test your environmental knowledge and earn XP</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Brain, label: 'Quizzes Done', value: userDoc?.quizzesCompleted || 0 },
          { icon: Star, label: 'Best Score', value: `${userDoc?.bestScore || 0}%` },
          { icon: Zap, label: 'XP from Quizzes', value: userDoc?.quizXP || 0 },
        ].map(({ icon: Icon, label, value }, i) => (
          <div key={i} className="stat-card text-center">
            <Icon className="w-5 h-5 text-eco-400 mx-auto" />
            <div className="stat-number text-xl">{value}</div>
            <div className="stat-label text-xs">{label}</div>
          </div>
        ))}
      </div>

      {/* AI Generator */}
      <AIQuizGenerator
        onGenerate={(topic) => generateMutation.mutate(topic)}
        isLoading={generateMutation.isPending}
      />

      {/* Quiz list */}
      <div>
        <h2 className="section-title">Available Quizzes</h2>
        <div className="space-y-3">
          {quizzes.map((quiz, i) => (
            <motion.div key={quiz.$id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <QuizCard quiz={quiz} onStart={(q) => navigate(`/quiz/${q.$id}`, { state: { quiz: q } })} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
