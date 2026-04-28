import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation } from '@tanstack/react-query'
import ReactConfetti from 'react-confetti'
import { Clock, CheckCircle, XCircle, ChevronRight, Trophy, Zap } from 'lucide-react'
import { quizzesAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const SAMPLE_QUESTIONS = [
  { id: 1, question: 'What percentage of Earth\'s surface is covered by oceans?', options: ['51%','61%','71%','81%'], correct: 2, explanation: 'About 71% of Earth\'s surface is covered by water, mostly oceans.' },
  { id: 2, question: 'Which gas is the primary contributor to climate change?', options: ['Oxygen','Carbon Dioxide','Nitrogen','Helium'], correct: 1, explanation: 'CO₂ from burning fossil fuels is the main greenhouse gas causing climate change.' },
  { id: 3, question: 'How long does a plastic bottle take to decompose?', options: ['10 years','50 years','450 years','1000 years'], correct: 2, explanation: 'Plastic bottles can take up to 450 years to decompose in a landfill.' },
  { id: 4, question: 'Which renewable energy source produces the most electricity globally?', options: ['Solar','Wind','Hydropower','Geothermal'], correct: 2, explanation: 'Hydropower generates the largest share of renewable electricity worldwide.' },
  { id: 5, question: 'What is the term for the variety of life on Earth?', options: ['Ecology','Biodiversity','Ecosystem','Biosphere'], correct: 1, explanation: 'Biodiversity refers to the variety of life on Earth at all levels.' },
]

export default function QuizPlay() {
  const { id } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { updateUserDoc, refreshUser } = useAuthStore()

  const { data: fetchResult, isLoading } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => quizzesAPI.getById(id),
    enabled: !state?.quiz && !!id,
  })

  // Determine quiz object securely
  let rawQuiz = state?.quiz || fetchResult?.data?.quiz
  
  const quiz = rawQuiz || { title: 'Eco Challenge Quiz', timeLimit: 10, questions: SAMPLE_QUESTIONS }
  const parsedQuestions = typeof quiz.questions === 'string' ? JSON.parse(quiz.questions) : quiz.questions
  const questions = parsedQuestions || SAMPLE_QUESTIONS

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selected, setSelected] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [timeLeft, setTimeLeft] = useState((quiz.timeLimit || 10) * 60)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [score, setScore] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  const submitMutation = useMutation({
    mutationFn: (data) => quizzesAPI.submit(id, data),
    onSuccess: (res) => {
      if (res.data.newPoints !== null) updateUserDoc({ points: res.data.newPoints })
      if (refreshUser) refreshUser()
    },
  })

  const finishQuiz = useCallback((currentAnswers = answers) => {
    let correct = 0
    questions.forEach((q, i) => {
      if (currentAnswers[i] === q.correct) correct++
    })
    const pct = Math.round((correct / questions.length) * 100)
    setScore(pct)
    setFinished(true)
    if (pct >= 70) setShowConfetti(true)
    submitMutation.mutate({ answers: currentAnswers, score: pct })
    setTimeout(() => setShowConfetti(false), 5000)
  }, [answers, questions])

  // Timer
  useEffect(() => {
    if (!started || finished) return
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer); finishQuiz(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [started, finished, finishQuiz])

  const handleExitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.log('Fullscreen exit error', err))
    }
  }

  const handleStart = () => {
    setStarted(true)
    const elem = document.documentElement
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => console.log('Fullscreen error:', err))
    }
  }

  const handleExitQuiz = () => {
    handleExitFullscreen()
    navigate('/quiz')
  }

  useEffect(() => {
    return () => handleExitFullscreen()
  }, [])

  const handleSelect = (optIdx) => {
    if (showFeedback) return
    setSelected(optIdx)
    setShowFeedback(true)
    setAnswers(prev => ({ ...prev, [current]: optIdx }))
  }

  const handleNext = () => {
    setSelected(null)
    setShowFeedback(false)
    if (current < questions.length - 1) {
      setCurrent(c => c + 1)
    } else {
      finishQuiz({ ...answers, [current]: selected })
    }
  }

  const q = questions[current]
  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0')
  const secs = (timeLeft % 60).toString().padStart(2, '0')
  const isCorrect = selected === q?.correct
  const earnedXP = Math.round((score / 100) * (quiz.maxPoints || 100))

  if (finished) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        {showConfetti && <ReactConfetti recycle={false} numberOfPieces={250} colors={['#22c55e','#3b82f6','#f59e0b','#8b5cf6']} />}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 max-w-md w-full text-center"
        >
          <div className="text-6xl mb-4">{score >= 90 ? '🏆' : score >= 70 ? '🎉' : score >= 50 ? '👏' : '💪'}</div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">
            {score >= 90 ? 'Incredible!' : score >= 70 ? 'Well Done!' : score >= 50 ? 'Good Effort!' : 'Keep Learning!'}
          </h2>
          <p className="text-gray-400 mb-6">You scored {score}% on {quiz.title}</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Score', value: `${score}%`, icon: '🎯' },
              { label: 'XP Earned', value: `+${earnedXP}`, icon: '⚡' },
              { label: 'Correct', value: `${Math.round(score/100*questions.length)}/${questions.length}`, icon: '✅' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-slate-800/60 rounded-xl p-3">
                <div className="text-xl">{icon}</div>
                <div className="text-lg font-bold text-white">{value}</div>
                <div className="text-xs text-gray-400">{label}</div>
              </div>
            ))}
          </div>

          {/* Score bar */}
          <div className="mb-6">
            <div className="h-3 rounded-full bg-slate-700 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${score >= 70 ? 'bg-gradient-to-r from-eco-500 to-green-400' : 'bg-gradient-to-r from-yellow-500 to-orange-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { handleExitFullscreen(); navigate('/profile') }} className="btn-secondary flex-1">View in Profile</button>
            <button onClick={() => { setCurrent(0); setAnswers({}); setFinished(false); setScore(0); setTimeLeft((quiz.timeLimit||10)*60) }} className="btn-primary flex-1">Retry</button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card max-w-md w-full p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-eco-500/20 text-eco-400 mx-auto flex items-center justify-center">
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">{quiz.title}</h2>
            <p className="text-gray-400 text-sm">Test your knowledge. The quiz will launch in full-screen mode to ensure a distraction-free experience.</p>
          </div>
          <div className="flex justify-center gap-4 text-sm font-medium text-gray-300">
            <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-eco-400" /> {quiz.timeLimit || 10} Mins</div>
            <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-eco-400" /> {questions.length} Questions</div>
          </div>
          <button onClick={handleStart} className="btn-primary w-full text-lg py-3">Start Quiz Now</button>
          <button onClick={() => navigate('/quiz')} className="text-sm text-gray-500 hover:text-white transition-colors block mx-auto">Go Back</button>
        </motion.div>
      </div>
    )
  }

  if (isLoading && !rawQuiz) {
    return <div className="min-h-[70vh] flex items-center justify-center text-gray-400">Loading Quiz...</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-slide-up relative">
      <div className="absolute -top-4 sm:-top-10 right-0 z-50">
        <button onClick={handleExitQuiz} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm transition-colors border border-red-500/20 shadow-sm backdrop-blur-md">
          <XCircle className="w-4 h-4" /> Exit Test
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between pt-4 sm:pt-0">
        <div>
          <h1 className="text-lg font-display font-bold text-white pr-24">{quiz.title}</h1>
          <p className="text-sm text-gray-400">Question {current + 1} of {questions.length}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold ${
          timeLeft < 60 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800/60 text-white border border-slate-700'
        }`}>
          <Clock className="w-4 h-4" />
          {mins}:{secs}
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
              i < current ? 'bg-eco-500' : i === current ? 'bg-eco-400 animate-pulse' : 'bg-slate-700'
            }`} />
          ))}
        </div>
        <div className="text-xs text-gray-500 text-right">{Math.round((current / questions.length) * 100)}% complete</div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="glass-card p-6"
        >
          <div className="flex items-start gap-3 mb-6">
            <span className="w-8 h-8 rounded-lg bg-eco-500/20 text-eco-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
              Q{current + 1}
            </span>
            <p className="text-lg text-white font-medium leading-relaxed">{q.question}</p>
          </div>

          <div className="space-y-3">
            {q.options.map((opt, i) => {
              let cls = 'glass-card p-4 cursor-pointer border transition-all duration-200 '
              if (!showFeedback) cls += 'border-slate-700/50 hover:border-eco-500/50 hover:bg-eco-500/5'
              else if (i === q.correct) cls += 'border-eco-500 bg-eco-500/10 text-eco-300'
              else if (i === selected && i !== q.correct) cls += 'border-red-500 bg-red-500/10 text-red-300'
              else cls += 'border-slate-700/30 opacity-60'

              return (
                <motion.button
                  key={i}
                  whileHover={!showFeedback ? { scale: 1.01 } : {}}
                  whileTap={!showFeedback ? { scale: 0.99 } : {}}
                  onClick={() => handleSelect(i)}
                  className={cls + ' w-full text-left flex items-center gap-3 rounded-xl'}
                >
                  <span className="w-7 h-7 rounded-lg border border-current flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {['A','B','C','D'][i]}
                  </span>
                  <span className="text-sm">{opt}</span>
                  {showFeedback && i === q.correct && <CheckCircle className="w-4 h-4 text-eco-400 ml-auto" />}
                  {showFeedback && i === selected && i !== q.correct && <XCircle className="w-4 h-4 text-red-400 ml-auto" />}
                </motion.button>
              )
            })}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-xl border ${isCorrect ? 'bg-eco-500/10 border-eco-500/30 text-eco-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}
              >
                <div className="flex items-center gap-2 font-semibold mb-1">
                  {isCorrect ? <><CheckCircle className="w-4 h-4" /> Correct! +10 XP</> : <><XCircle className="w-4 h-4" /> Incorrect</>}
                </div>
                <p className="text-sm opacity-80">{q.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {showFeedback && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleNext}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {current < questions.length - 1 ? (<>Next Question <ChevronRight className="w-4 h-4" /></>) : (<>Finish Quiz <Trophy className="w-4 h-4" /></>)}
        </motion.button>
      )}
    </div>
  )
}
