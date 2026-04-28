import express from 'express'
import multer from 'multer'
import { db, storage, ID, Query, DB_ID, C, BUCKET_ID } from '../services/appwrite.js'
import { verifyImage } from '../services/aiClient.js'
import { verifySession } from '../middleware/auth.js'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

const POINTS_FOR_LEVEL = [0, 200, 500, 1000, 2000, 4000, 8000, 15000, 30000, 60000]

async function awardPoints(userId, points) {
  try {
    const user = await db.getDocument(DB_ID, C.USERS, userId)
    const newPoints = (user.points || 0) + points
    const newLevel = POINTS_FOR_LEVEL.findIndex((p, i) => newPoints < (POINTS_FOR_LEVEL[i + 1] || Infinity)) + 1
    const newEcoScore = Math.min(100, Math.round(newPoints / 600))
    const newStreak = (user.streakCount || 0) + 1
    const newTasksCompleted = (user.tasksCompleted || 0) + 1

    await db.updateDocument(DB_ID, C.USERS, userId, {
      points: newPoints,
      level: newLevel,
      ecoScore: newEcoScore,
      streakCount: newStreak,
      tasksCompleted: newTasksCompleted,
      lastActive: new Date().toISOString(),
    })

    // Update leaderboard
    const lb = await db.listDocuments(DB_ID, C.LEADERBOARD, [Query.equal('userId', userId)])
    if (lb.documents.length > 0) {
      await db.updateDocument(DB_ID, C.LEADERBOARD, lb.documents[0].$id, {
        points: newPoints,
        weeklyPoints: (lb.documents[0].weeklyPoints || 0) + points,
      })
    }
    return { newPoints, newLevel }
  } catch (err) {
    console.error('Award points error:', err)
  }
}

// POST /api/submissions
router.post('/', verifySession, upload.single('proof'), async (req, res) => {
  try {
    const { taskId } = req.body
    const userId = req.account.$id

    if (!taskId) return res.status(400).json({ error: 'taskId required' })
    if (!userId) return res.status(401).json({ error: 'userId required - please log in' })

    let imageProofId = null
    let imageUrl = null

    // Upload file to Appwrite Storage
    if (req.file) {
      const { InputFile } = await import('node-appwrite/file')
      const file = await storage.createFile(
        BUCKET_ID,
        ID.unique(),
        InputFile.fromBuffer(req.file.buffer, req.file.originalname)
      )
      imageProofId = file.$id
      imageUrl = `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/preview?project=${process.env.APPWRITE_PROJECT_ID}`
    }

    // Get task + user details
    const [task, userDoc] = await Promise.all([
      db.getDocument(DB_ID, C.TASKS, taskId).catch(() => ({ title: 'Task', points: 50, category: 'General' })),
      db.getDocument(DB_ID, C.USERS, userId).catch(() => ({ name: 'Student' })),
    ])

    // Create submission
    const submission = await db.createDocument(DB_ID, C.SUBMISSIONS, ID.unique(), {
      userId,
      taskId,
      taskTitle: task.title,
      userName: userDoc.name || 'Student',
      status: 'pending',
      ...(imageProofId ? { imageProofId } : {}),
    })

    // AI verify image (non-blocking) disabled per manual approval rules.
    // Tasks will stay in 'pending' status until College Admin approves them.

    res.status(201).json({ submission })
  } catch (err) {
    console.error('Submission error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/submissions/mine
router.get('/mine', verifySession, async (req, res) => {
  try {
    const userId = req.account.$id
    if (!userId) return res.json({ submissions: [] })

    const subs = await db.listDocuments(DB_ID, C.SUBMISSIONS, [
      Query.equal('userId', userId),
      Query.orderDesc('$createdAt'),
      Query.limit(20),
    ])
    res.json({ submissions: subs.documents, total: subs.total })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/submissions/task/:taskId
router.get('/task/:taskId', async (req, res) => {
  try {
    const q = req.params.taskId === 'all' ? [] : [Query.equal('taskId', req.params.taskId)]
    const subs = await db.listDocuments(DB_ID, C.SUBMISSIONS, [...q, Query.orderDesc('$createdAt'), Query.limit(50)])
    res.json({ submissions: subs.documents, total: subs.total })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/submissions/:id/approve
router.patch('/:id/approve', async (req, res) => {
  try {
    const sub = await db.updateDocument(DB_ID, C.SUBMISSIONS, req.params.id, { status: 'approved' })
    const task = await db.getDocument(DB_ID, C.TASKS, sub.taskId).catch(() => ({ points: 50 }))
    if (sub.userId) await awardPoints(sub.userId, task.points || 50)
    res.json({ submission: sub })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/submissions/:id/reject
router.patch('/:id/reject', async (req, res) => {
  try {
    const sub = await db.updateDocument(DB_ID, C.SUBMISSIONS, req.params.id, {
      status: 'rejected',
      feedback: req.body.reason || 'Does not meet task requirements',
    })
    res.json({ submission: sub })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
