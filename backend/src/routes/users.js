import express from 'express'
import multer from 'multer'
import { db, users, storage, ID, Query, DB_ID, C, BUCKET_ID } from '../services/appwrite.js'
import { verifySession, checkRole } from '../middleware/auth.js'

const upload = multer({ storage: multer.memoryStorage() })

const router = express.Router()

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await db.getDocument(DB_ID, C.USERS, req.params.id)
    try {
      const authUser = await users.get(req.params.id)
      user.isVerified = user.isVerified || false
    } catch {}
    if (user.collegeId && user.collegeId !== 'none') {
      try {
        const college = await db.getDocument(DB_ID, C.COLLEGES, user.collegeId)
        user.collegeName = college.collegeName
      } catch {}
    }
    res.json({ user })
  } catch (err) {
    res.status(404).json({ error: 'User not found' })
  }
})

// PATCH /api/users/:id
router.patch('/:id', async (req, res) => {
  try {
    const allowed = ['name', 'bio', 'avatar', 'profileImage', 'phone', 'age', 'qualification', 'address']
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

// PATCH /api/users/:id/block (Super Admin Only)
router.patch('/:id/block', verifySession, checkRole(['super_admin']), async (req, res) => {
  try {
    const { isBlocked } = req.body
    const user = await db.updateDocument(DB_ID, C.USERS, req.params.id, { isBlocked })
    
    // Also block in Appwrite Auth
    await users.updateStatus(req.params.id, !isBlocked)

    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/users/:id/upload-profile
router.post('/:id/upload-profile', verifySession, upload.single('image'), async (req, res) => {
  try {
    if (req.userDoc.$id !== req.params.id) return res.status(403).json({ error: 'Unauthorized' })
    if (!req.file) return res.status(400).json({ error: 'No image provided' })

    const { InputFile } = await import('node-appwrite/file')
    const file = await storage.createFile(
      BUCKET_ID,
      ID.unique(),
      InputFile.fromBuffer(req.file.buffer, req.file.originalname)
    )
    const profileImage = `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/preview?project=${process.env.APPWRITE_PROJECT_ID}`

    const user = await db.updateDocument(DB_ID, C.USERS, req.params.id, { profileImage })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/users/:id/verify
router.post('/:id/verify', verifySession, async (req, res) => {
  try {
    if (req.userDoc.$id !== req.params.id) return res.status(403).json({ error: 'Unauthorized' })
    const { otp } = req.body
    
    if (!otp || otp.length !== 6) return res.status(400).json({ error: 'Invalid code' })

    const user = await db.getDocument(DB_ID, C.USERS, req.params.id)
    if (user.isVerified) return res.status(400).json({ error: 'Already verified' })

    const updatedUser = await db.updateDocument(DB_ID, C.USERS, req.params.id, {
      isVerified: true,
      points: (user.points || 0) + 200
    })

    res.json({ user: updatedUser })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
