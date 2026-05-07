import express from 'express'
import { db, ID, Query, DB_ID, C } from '../services/appwrite.js'
import { generateQuiz as aiGenerateQuiz } from '../services/aiClient.js'
import { verifySession, checkRole } from '../middleware/auth.js'

const router = express.Router()

// GET /api/quizzes
router.get('/', verifySession, async (req, res) => {
  try {
    let queries = [Query.orderDesc('$createdAt'), Query.limit(40)]
    if (req.userDoc.role !== 'super_admin') {
      queries.push(
        Query.or([
          Query.equal('createdBy', req.userDoc.$id),
          Query.equal('collegeId', req.userDoc.collegeId || 'none')
        ])
      )
    }
    const quizzes = await db.listDocuments(DB_ID, C.QUIZZES, queries)
    
    // Client-side strict filter (in case OR query is not perfectly indexed)
    const filtered = req.userDoc.role === 'super_admin' ? quizzes.documents : quizzes.documents.filter(q => 
      q.createdBy === req.userDoc.$id || (q.collegeId === req.userDoc.collegeId && q.isGlobal)
    )

    res.json({ quizzes: filtered })
  } catch (err) {
    console.error(err);
    res.json({ quizzes: [] })
  }
})

// GET /api/quizzes/:id
router.get('/:id', async (req, res) => {
  try {
    const quiz = await db.getDocument(DB_ID, C.QUIZZES, req.params.id)
    res.json({ quiz })
  } catch {
    res.status(404).json({ error: 'Quiz not found' })
  }
})

// POST /api/quizzes/generate  (AI generated - College Admin Only)
router.post('/generate', verifySession, checkRole(['college_admin']), async (req, res) => {
  try {
    const { topic, count = 10 } = req.body
    const aiRes = await aiGenerateQuiz(topic, count)
    const questions = aiRes.data.questions

    const isGlobal = req.userDoc.role !== 'student' // Admin quizzes are global to college

    // Optionally save to DB
    const quiz = await db.createDocument(DB_ID, C.QUIZZES, ID.unique(), {
      title: `${topic} – AI Quiz`,
      questions: JSON.stringify(questions),
      category: topic,
      difficulty: 'medium',
      isAI: true,
      timeLimit: Math.ceil(count * 1.2),
      maxPoints: count * 10,
      createdBy: req.userDoc.$id,
      collegeId: req.userDoc.collegeId || null,
      isGlobal,
    }).catch((err) => {
      console.error(err); 
      return { questions, title: `${topic} – AI Quiz`, $id: 'ai-temp', timeLimit: count, maxPoints: count * 10 }
    })

    res.json({
      quiz: {
        ...quiz,
        questions: typeof quiz.questions === 'string' ? JSON.parse(quiz.questions) : questions,
        emoji: '🤖', isAI: true, color: 'from-purple-500 to-violet-600'
      }
    })
  } catch (err) {
    res.status(500).json({ error: `AI service error: ${err.message}` })
  }
})

// POST /api/quizzes/:id/attempt (Student Only)
router.post('/:id/attempt', verifySession, checkRole(['student']), async (req, res) => {
  try {
    const { answers, score } = req.body
    const userId = req.userDoc.$id

    const attempt = await db.createDocument(DB_ID, C.QUIZ_ATTEMPTS, ID.unique(), {
      userId: userId || 'unknown',
      quizId: req.params.id,
      score: score || 0,
      answers: JSON.stringify(answers || {}),
      completedAt: new Date().toISOString(),
    }).catch(() => ({ score }))

    // Fetch quiz to get maxPoints for accurate XP
    let maxPoints = 100
    try {
      const quiz = await db.getDocument(DB_ID, C.QUIZZES, req.params.id)
      maxPoints = quiz.maxPoints || 100
    } catch {}

    const xpEarned = Math.round((score / 100) * maxPoints)
    let newPoints = null

    if (userId && xpEarned > 0) {
      try {
        const user = await db.getDocument(DB_ID, C.USERS, userId)
        newPoints = (user.points || 0) + xpEarned
        await db.updateDocument(DB_ID, C.USERS, userId, {
          points: newPoints,
          quizzesCompleted: (user.quizzesCompleted || 0) + 1,
          bestScore: Math.max(user.bestScore || 0, score),
        })
      } catch {}
    }

    res.json({ attempt, xpEarned, newPoints })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
