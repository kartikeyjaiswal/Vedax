import express from 'express'
import { db, users, ID, Query, DB_ID, C } from '../services/appwrite.js'

const router = express.Router()

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await db.getDocument(DB_ID, C.USERS, req.params.id)
    try {
      const authUser = await users.get(req.params.id)
      user.isEmailVerified = authUser.emailVerification
    } catch {}
    res.json({ user })
  } catch (err) {
    res.status(404).json({ error: 'User not found' })
  }
})

// PATCH /api/users/:id
router.patch('/:id', async (req, res) => {
  try {
    const allowed = ['name', 'bio', 'avatar', 'phone', 'age', 'qualification', 'address']
    const updates = {}
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k] })
    
    // Check if user is being fully onboarded for the first time
    const oldUser = await db.getDocument(DB_ID, C.USERS, req.params.id)
    const isFirstTimeComplete = !oldUser.onboardingComplete && 
        (updates.phone || oldUser.phone) && 
        (updates.age || oldUser.age) && 
        (updates.qualification || oldUser.qualification) && 
        (updates.address || oldUser.address)
        
    if (isFirstTimeComplete) {
      updates.onboardingComplete = true
      updates.points = (oldUser.points || 0) + 200
    }

    const user = await db.updateDocument(DB_ID, C.USERS, req.params.id, updates)
    if (isFirstTimeComplete) user._awardedOnboardingXP = true // flag for frontend toast
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/users/:id/stats
router.get('/:id/stats', async (req, res) => {
  try {
    const user = await db.getDocument(DB_ID, C.USERS, req.params.id)
    const submissions = await db.listDocuments(DB_ID, C.SUBMISSIONS, [
      Query.equal('userId', req.params.id),
      Query.equal('status', 'approved'),
    ])
    const attempts = await db.listDocuments(DB_ID, C.QUIZ_ATTEMPTS, [
      Query.equal('userId', req.params.id),
    ])

    res.json({
      stats: {
        points: user.points,
        level: user.level,
        badges: user.badges,
        streak: user.streakCount,
        tasksCompleted: submissions.total,
        quizzesCompleted: attempts.total,
        ecoScore: user.ecoScore,
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
