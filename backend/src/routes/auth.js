import express from 'express'
import { db, teams, users, ID, Query, DB_ID, C } from '../services/appwrite.js'
import { sendOTP } from '../services/email.js'

const otpCache = new Map()

const router = express.Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, collegeId, role, accountId } = req.body

    if (!name || !email || !accountId) {
      return res.status(400).json({ error: 'name, email, and accountId are required' })
    }

    // Validate role (Only student/common self-registrations allowed)
    const validRoles = ['student', 'common']
    const userRole = validRoles.includes(role) ? role : 'student'

    // Check if college exists
    let resolvedCollegeId = ''
    let teamId = null

    if (collegeId && collegeId.trim()) {
      try {
        const colleges = await db.listDocuments(DB_ID, C.COLLEGES, [
          Query.equal('collegeUniqueId', collegeId.trim().toUpperCase())
        ])
        if (colleges.documents.length > 0) {
          const college = colleges.documents[0]
          resolvedCollegeId = collegeId.trim().toUpperCase()
          teamId = college.teamId
          if (teamId) {
            try {
              await teams.createMembership(
                teamId, [],
                `mailto:${email}`,
                undefined, undefined,
                `${process.env.FRONTEND_URL}/dashboard`,
                name
              )
            } catch {}
          }
        }
      } catch {}
    }

    const finalRole = !resolvedCollegeId ? 'common' : userRole

    // Build doc — omit empty strings for optional fields
    const docData = {
      name,
      email,
      role: finalRole,
      points: 0,
      level: 1,
      badges: [],
      streakCount: 0,
      ecoScore: 0,
      tasksCompleted: 0,
      quizzesCompleted: 0,
      lastActive: new Date().toISOString(),
    }
    if (resolvedCollegeId) docData.collegeId = resolvedCollegeId

    const userDoc = await db.createDocument(DB_ID, C.USERS, accountId, docData)

    // Create leaderboard entry
    const lbData = { userId: accountId, points: 0, weeklyPoints: 0 }
    if (resolvedCollegeId) lbData.collegeId = resolvedCollegeId
    await db.createDocument(DB_ID, C.LEADERBOARD, ID.unique(), lbData).catch(() => {})

    res.status(201).json({ user: userDoc })
  } catch (err) {
    console.error('Register error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/logout
router.post('/logout', (req, res) => res.json({ success: true }))

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email required' })
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    otpCache.set(email, { code: otp, expiresAt: Date.now() + 10 * 60 * 1000 })
    await sendOTP(email, otp)
    res.json({ success: true, message: 'OTP sent' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, userId } = req.body
    const cached = otpCache.get(email)
    
    if (!cached || cached.code !== otp || Date.now() > cached.expiresAt) {
      return res.status(400).json({ error: 'Invalid or expired OTP' })
    }
    
    otpCache.delete(email)
    
    // We update Appwrite core user verification and store a flag if possible
    try {
      await users.updateEmailVerification(userId, true)
    } catch (e) {
      console.log('Appwrite native email verif update failed:', e.message)
    }

    // Try to update document. If schema lacks field, let it pass gracefully.
    let userDoc = null
    try {
      userDoc = await db.updateDocument(DB_ID, C.USERS, userId, { isEmailVerified: true })
    } catch {
      userDoc = await db.getDocument(DB_ID, C.USERS, userId)
    }

    res.json({ success: true, user: userDoc })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/auth/me
// Frontend sends X-Account-Id header after verifying session on client side with Appwrite
router.get('/me', async (req, res) => {
  const accountId = req.headers['x-account-id']
  const sessionToken = req.headers.authorization?.replace('Bearer ', '')

  if (!accountId && !sessionToken) {
    return res.status(401).json({ error: 'No credentials provided' })
  }

  try {
    let userId = accountId

    // If we have accountId directly, use it; otherwise try session approach
    if (!userId && sessionToken) {
      try {
        const { Client, Account } = await import('node-appwrite')
        const tempClient = new Client()
          .setEndpoint(process.env.APPWRITE_ENDPOINT)
          .setProject(process.env.APPWRITE_PROJECT_ID)
          .setJWT(sessionToken)
        const tempAccount = new Account(tempClient)
        const accountData = await tempAccount.get()
        userId = accountData.$id
      } catch {
        // Fall back to using server SDK with API key to find by looking up token
        // Extract userId from sessionToken pattern if it's a session doc ID
        console.log('/me: could not verify JWT, trying admin lookup')
      }
    }

    if (!userId) {
      return res.status(401).json({ error: 'Could not identify user' })
    }

    // Use admin SDK to get user doc
    let userDoc = null
    try {
      userDoc = await db.getDocument(DB_ID, C.USERS, userId)
    } catch {
      // Fallback: user exists in Appwrite auth but no doc yet
      try {
        const userInfo = await users.get(userId)
        const docs = await db.listDocuments(DB_ID, C.USERS, [
          Query.equal('email', userInfo.email)
        ])
        if (docs.documents.length > 0) userDoc = docs.documents[0]
      } catch {}
    }

    if (!userDoc) {
      return res.status(404).json({ error: 'User profile not found. Please complete setup.' })
    }

    try {
      const authUser = await users.get(userId)
      userDoc.isEmailVerified = authUser.emailVerification
    } catch {}

    res.json({ user: { ...userDoc, accountId: userId } })
  } catch (err) {
    console.error('/me error:', err.message)
    res.status(401).json({ error: 'Authentication failed' })
  }
})

export default router
