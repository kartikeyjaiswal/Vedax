import express from 'express'
import { db, ID, Query, DB_ID, C } from '../services/appwrite.js'
import { verifySession, checkRole } from '../middleware/auth.js'

const router = express.Router()

// GET /api/leaderboard/global
router.get('/global', async (req, res) => {
  try {
    const { limit = 50 } = req.query
    const queries = [Query.orderDesc('points'), Query.limit(parseInt(limit))]

    const usersList = await db.listDocuments(DB_ID, C.USERS, queries)

    const entries = usersList.documents.map((user, i) => ({
      rank: i + 1,
      userId: user.$id,
      name: user.name,
      college: user.collegeId || 'Independent',
      points: user.points || 0,
      level: user.level || 'Seedling',
      change: 0, // dynamic change can be implemented later
    }))

    res.json({ entries, total: usersList.total })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/leaderboard/college/:collegeId
router.get('/college/:collegeId', verifySession, checkRole(['student', 'college_admin']), async (req, res) => {
  try {
    if (req.userDoc.collegeId !== req.params.collegeId) {
      return res.status(403).json({ error: 'You can only view your own college leaderboard' })
    }

    const { limit = 50 } = req.query
    const usersList = await db.listDocuments(DB_ID, C.USERS, [
      Query.equal('collegeId', req.params.collegeId),
      Query.orderDesc('points'),
      Query.limit(parseInt(limit)),
    ])

    const entries = usersList.documents.map((user, i) => ({
      rank: i + 1,
      userId: user.$id,
      name: user.name,
      points: user.points || 0,
      change: 0,
    }))

    res.json({ entries, collegeId: req.params.collegeId })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
