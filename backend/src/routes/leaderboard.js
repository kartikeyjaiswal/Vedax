import express from 'express'
import { db, ID, Query, DB_ID, C } from '../services/appwrite.js'

const router = express.Router()

// GET /api/leaderboard/global
router.get('/global', async (req, res) => {
  try {
    const { limit = 50, period } = req.query
    const queries = [Query.orderDesc('points'), Query.limit(parseInt(limit))]

    const lb = await db.listDocuments(DB_ID, C.LEADERBOARD, queries)

    // Enrich with user names
    const entries = await Promise.all(lb.documents.map(async (entry, i) => {
      try {
        const user = await db.getDocument(DB_ID, C.USERS, entry.userId)
        return {
          rank: i + 1,
          userId: entry.userId,
          name: user.name,
          college: entry.collegeId || 'Independent',
          points: entry.points,
          level: user.level,
          change: 0,
        }
      } catch {
        return { rank: i + 1, userId: entry.userId, name: 'Unknown', college: 'Independent', points: entry.points, change: 0 }
      }
    }))

    res.json({ entries, total: lb.total })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/leaderboard/college/:collegeId
router.get('/college/:collegeId', async (req, res) => {
  try {
    const { limit = 50 } = req.query
    const lb = await db.listDocuments(DB_ID, C.LEADERBOARD, [
      Query.equal('collegeId', req.params.collegeId),
      Query.orderDesc('points'),
      Query.limit(parseInt(limit)),
    ])

    const entries = await Promise.all(lb.documents.map(async (entry, i) => {
      try {
        const user = await db.getDocument(DB_ID, C.USERS, entry.userId)
        return { rank: i + 1, userId: entry.userId, name: user.name, points: entry.points, change: 0 }
      } catch {
        return { rank: i + 1, userId: entry.userId, name: 'Unknown', points: entry.points, change: 0 }
      }
    }))

    res.json({ entries, collegeId: req.params.collegeId })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
