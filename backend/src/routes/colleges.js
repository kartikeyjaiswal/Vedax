import express from 'express'
import { db, teams, users, ID, Query, DB_ID, C } from '../services/appwrite.js'
import { v4 as uuidv4 } from 'uuid'
import { verifySession, checkRole } from '../middleware/auth.js'

const router = express.Router()

function generateCollegeId(name) {
  const prefix = name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase()
  const year = new Date().getFullYear()
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-ECO-${year}-${suffix}`
}

// POST /api/colleges (Super Admin Only)
router.post('/', verifySession, checkRole(['super_admin']), async (req, res) => {
  try {
    const { collegeName, adminEmail } = req.body
    if (!collegeName || !adminEmail) return res.status(400).json({ error: 'collegeName and adminEmail required' })

    const email = adminEmail.trim().toLowerCase()
    const collegeUniqueId = generateCollegeId(collegeName)
    const adminPassword = 'V' + Math.random().toString(36).slice(-8) + '!x'

    // 1. Create Appwrite Account for Admin
    const accountId = ID.unique()
    await users.create(accountId, email, undefined, adminPassword, `${collegeName} Admin`)

    // 2. Create User doc
    const userDocData = {
      name: `${collegeName} Admin`,
      email,
      role: 'college_admin',
      collegeId: collegeUniqueId,
      points: 0, level: 1, badges: [],
      streakCount: 0, ecoScore: 0, tasksCompleted: 0, quizzesCompleted: 0,
      lastActive: new Date().toISOString()
    }
    await db.createDocument(DB_ID, C.USERS, accountId, userDocData)

    // 3. Create College Document
    let teamId = null
    try {
      const team = await teams.create(ID.unique(), collegeName)
      teamId = team.$id
    } catch {}

    const college = await db.createDocument(DB_ID, C.COLLEGES, ID.unique(), {
      collegeName,
      collegeUniqueId,
      adminEmail: email,
      adminPassword,
      createdBy: req.userDoc.$id,
      teamId,
      memberCount: 0,
      status: 'active'
    })

    res.status(201).json({ college, adminEmail: email, adminPassword })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/colleges (Super Admin Only)
router.get('/', verifySession, checkRole(['super_admin']), async (req, res) => {
  try {
    const colleges = await db.listDocuments(DB_ID, C.COLLEGES, [Query.orderDesc('$createdAt'), Query.limit(100)])
    
    const enrichedColleges = await Promise.all(colleges.documents.map(async (col) => {
      try {
        const members = await db.listDocuments(DB_ID, C.USERS, [Query.equal('collegeId', col.collegeUniqueId)])
        const totalXP = members.documents.reduce((acc, u) => acc + (u.points || 0), 0)
        return { ...col, members: members.total, totalXP }
      } catch (e) {
        return { ...col, members: 0, totalXP: 0 }
      }
    }))

    res.json({ colleges: enrichedColleges, total: colleges.total })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/colleges/:id/students (College Admin Only)
router.get('/:id/students', verifySession, checkRole(['college_admin']), async (req, res) => {
  try {
    if (req.userDoc.collegeId !== req.params.id) {
      return res.status(403).json({ error: 'Cannot access other college data' })
    }
    const students = await db.listDocuments(DB_ID, C.USERS, [
      Query.equal('collegeId', req.params.id),
      Query.equal('role', 'student'),
      Query.limit(50),
      Query.orderDesc('$createdAt')
    ])
    res.json({ students: students.documents })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/colleges/:id
router.get('/:id', async (req, res) => {
  try {
    const college = await db.getDocument(DB_ID, C.COLLEGES, req.params.id)
    res.json({ college })
  } catch {
    res.status(404).json({ error: 'College not found' })
  }
})

// GET /api/colleges/:id/stats
router.get('/:id/stats', async (req, res) => {
  try {
    const college = await db.getDocument(DB_ID, C.COLLEGES, req.params.id)
    const members = await db.listDocuments(DB_ID, C.USERS, [Query.equal('collegeId', college.collegeUniqueId)])
    const submissions = await db.listDocuments(DB_ID, C.SUBMISSIONS, [Query.equal('status', 'approved')])
    const totalXP = members.documents.reduce((a, u) => a + (u.points || 0), 0)
    res.json({
      members: members.total,
      tasksCompleted: submissions.total,
      totalXP,
      pending: 0,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/colleges/:id/status (Super Admin Only)
router.patch('/:id/status', verifySession, checkRole(['super_admin']), async (req, res) => {
  try {
    const { status, suspensionReason } = req.body // 'active' or 'paused'
    if (!['active', 'paused'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }
    
    const updateData = { status }
    if (status === 'paused') {
      updateData.suspensionReason = suspensionReason || 'No reason provided'
    } else {
      updateData.suspensionReason = null
    }

    const college = await db.updateDocument(DB_ID, C.COLLEGES, req.params.id, updateData)
    res.json({ college })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/colleges/:id (Super Admin Only) - Edit College Details
router.patch('/:id', verifySession, checkRole(['super_admin']), async (req, res) => {
  try {
    const { collegeName } = req.body
    if (!collegeName) return res.status(400).json({ error: 'collegeName is required' })

    const college = await db.updateDocument(DB_ID, C.COLLEGES, req.params.id, {
      collegeName
    })

    res.json({ college })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/colleges/:id (Super Admin Only)
router.delete('/:id', verifySession, checkRole(['super_admin']), async (req, res) => {
  try {
    await db.deleteDocument(DB_ID, C.COLLEGES, req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/colleges/:id/subscription (Super Admin Only)
router.patch('/:id/subscription', verifySession, checkRole(['super_admin']), async (req, res) => {
  try {
    const { subscriptionPlan, paymentStatus } = req.body
    const updateData = {}
    if (subscriptionPlan) updateData.subscriptionPlan = subscriptionPlan
    if (paymentStatus) updateData.paymentStatus = paymentStatus
    
    // Fallback: If paymentStatus is past_due, maybe disable premium features or change plan to free
    // The prompt says "Handle failed payments", so we might let SuperAdmin downgrade them.

    const college = await db.updateDocument(DB_ID, C.COLLEGES, req.params.id, updateData)
    res.json({ college })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
