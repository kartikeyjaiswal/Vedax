import express from 'express'
import { db, ID, Query, DB_ID, C } from '../services/appwrite.js'
import { verifySession, checkRole } from '../middleware/auth.js'

const router = express.Router()

// POST /api/assignments (College Admin Only)
router.post('/', verifySession, checkRole(['college_admin']), async (req, res) => {
  try {
    const { title, description, questions, dueDate, totalMarks, reattemptCost } = req.body
    
    if (!title || !questions) return res.status(400).json({ error: 'title and questions required' })

    const assignment = await db.createDocument(DB_ID, C.ASSIGNMENTS, ID.unique(), {
      title,
      description: description || '',
      questions: typeof questions === 'string' ? questions : JSON.stringify(questions),
      createdBy: req.userDoc.$id,
      collegeId: req.userDoc.collegeId,
      dueDate: dueDate || null,
      totalMarks: parseInt(totalMarks) || 100,
      reattemptCost: parseInt(reattemptCost) || 50,
    })

    res.status(201).json({ assignment })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/assignments (Students and Admins)
router.get('/', verifySession, async (req, res) => {
  try {
    const isSuper = req.userDoc.role === 'super_admin'
    let queries = [Query.orderDesc('$createdAt'), Query.limit(50)]
    
    if (!isSuper) {
      queries.push(Query.equal('collegeId', req.userDoc.collegeId || 'none'))
    }

    const assignments = await db.listDocuments(DB_ID, C.ASSIGNMENTS, queries)
    res.json({ assignments: assignments.documents })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/assignments/:id/submissions (Admin)
router.get('/:id/submissions', verifySession, checkRole(['college_admin']), async (req, res) => {
  try {
    const submissions = await db.listDocuments(DB_ID, C.ASSIGNMENT_SUBMISSIONS, [
      Query.equal('assignmentId', req.params.id),
      Query.orderDesc('$createdAt')
    ])
    res.json({ submissions: submissions.documents })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/assignments/my-submissions (Student Only)
router.get('/my-submissions', verifySession, checkRole(['student']), async (req, res) => {
  try {
    const submissions = await db.listDocuments(DB_ID, C.ASSIGNMENT_SUBMISSIONS, [
      Query.equal('studentId', req.userDoc.$id),
      Query.orderDesc('$createdAt')
    ])
    res.json({ submissions: submissions.documents })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/assignments/:id/submit (Student Only)
router.post('/:id/submit', verifySession, checkRole(['student']), async (req, res) => {
  try {
    const { answers } = req.body

    const assignment = await db.getDocument(DB_ID, C.ASSIGNMENTS, req.params.id)
    const cost = assignment.reattemptCost || 50

    // Check existing attempts
    const existing = await db.listDocuments(DB_ID, C.ASSIGNMENT_SUBMISSIONS, [
      Query.equal('studentId', req.userDoc.$id),
      Query.equal('assignmentId', req.params.id),
      Query.orderDesc('$createdAt')
    ])

    if (existing.documents.length > 0) {
      // Reattempt logic
      const lastAttempt = new Date(existing.documents[0].$createdAt).getTime()
      const hoursSince = (Date.now() - lastAttempt) / (1000 * 60 * 60)
      if (hoursSince < 24) {
        return res.status(400).json({ error: `You can only reattempt this assignment in ${Math.ceil(24 - hoursSince)} hours.` })
      }
      
      // Deduct XP
      if (req.userDoc.points < cost) {
        return res.status(400).json({ error: `Not enough XP to reattempt. Cost is ${cost} XP.` })
      }
      await db.updateDocument(DB_ID, C.USERS, req.userDoc.$id, {
        points: req.userDoc.points - cost
      })
    }

    const submission = await db.createDocument(DB_ID, C.ASSIGNMENT_SUBMISSIONS, ID.unique(), {
      studentId: req.userDoc.$id,
      assignmentId: req.params.id,
      answers: typeof answers === 'string' ? answers : JSON.stringify(answers),
      status: 'pending'
    })

    res.status(201).json({ submission })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/assignments/:id/evaluate/:submissionId (Admin Only)
router.post('/:id/evaluate/:submissionId', verifySession, checkRole(['college_admin']), async (req, res) => {
  try {
    const { score } = req.body

    const submission = await db.updateDocument(DB_ID, C.ASSIGNMENT_SUBMISSIONS, req.params.submissionId, {
      score: parseInt(score),
      status: 'checked'
    })

    res.json({ submission })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
