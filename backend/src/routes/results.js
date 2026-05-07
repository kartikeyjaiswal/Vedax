import express from 'express'
import { db, Query, DB_ID, C } from '../services/appwrite.js'
import { verifySession, checkRole } from '../middleware/auth.js'

const router = express.Router()

// GET /api/results
router.get('/', verifySession, checkRole(['student']), async (req, res) => {
  try {
    const userId = req.userDoc.$id

    const [quizAttempts, assignmentSubmissions] = await Promise.all([
      db.listDocuments(DB_ID, C.QUIZ_ATTEMPTS, [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt')
      ]),
      db.listDocuments(DB_ID, C.ASSIGNMENT_SUBMISSIONS, [
        Query.equal('studentId', userId),
        Query.orderDesc('$createdAt')
      ])
    ])

    const quizResults = quizAttempts.documents.map(doc => ({
      id: doc.$id,
      userId: doc.userId,
      score: doc.score,
      type: 'quiz',
      status: 'completed',
      date: doc.completedAt || doc.$createdAt,
      referenceId: doc.quizId
    }))

    const assignmentResults = assignmentSubmissions.documents.map(doc => ({
      id: doc.$id,
      userId: doc.studentId,
      score: doc.score || 0,
      type: 'assignment',
      status: doc.status || 'pending',
      date: doc.$createdAt,
      referenceId: doc.assignmentId
    }))

    const results = [...quizResults, ...assignmentResults].sort((a, b) => new Date(b.date) - new Date(a.date))

    res.json({ results })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
