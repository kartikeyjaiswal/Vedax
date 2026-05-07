import express from 'express'
import { db, DB_ID, C } from '../services/appwrite.js'
import { verifySession, checkRole } from '../middleware/auth.js'
import { ID, Query } from 'node-appwrite'

const router = express.Router()

// POST /api/tickets (Any logged in user)
router.post('/', verifySession, async (req, res) => {
  try {
    const { subject, description, priority } = req.body
    if (!subject || !description) return res.status(400).json({ error: 'Subject and description required' })

    const ticket = await db.createDocument(DB_ID, C.TICKETS, ID.unique(), {
      subject,
      description,
      priority: priority || 'medium',
      status: 'open',
      reportedBy: req.userDoc.$id,
      collegeId: req.userDoc.collegeId || 'global'
    })

    res.status(201).json({ ticket })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/tickets (Super Admin gets all, College Admin gets college's, Student gets own)
router.get('/', verifySession, async (req, res) => {
  try {
    let queries = [Query.orderDesc('$createdAt')]
    
    if (req.userDoc.role === 'student') {
      queries.push(Query.equal('reportedBy', req.userDoc.$id))
    } else if (req.userDoc.role === 'college_admin') {
      queries.push(Query.equal('collegeId', req.userDoc.collegeId))
    }

    const tickets = await db.listDocuments(DB_ID, C.TICKETS, queries)
    res.json({ tickets: tickets.documents })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/tickets/:id (Super Admin / College Admin)
router.patch('/:id', verifySession, checkRole(['super_admin', 'college_admin']), async (req, res) => {
  try {
    const { status, adminReply } = req.body
    const updates = {}
    if (status) updates.status = status
    if (adminReply !== undefined) updates.adminReply = adminReply
    const ticket = await db.updateDocument(DB_ID, C.TICKETS, req.params.id, updates)
    res.json({ ticket })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
