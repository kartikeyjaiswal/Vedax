import express from 'express'
import { db, ID, Query, DB_ID, C } from '../services/appwrite.js'
import { verifySession, checkRole } from '../middleware/auth.js'

const router = express.Router()

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const { category, type, collegeId, limit = 25 } = req.query
    const queries = [Query.limit(parseInt(limit))]
    if (category && category !== 'All') queries.push(Query.equal('category', category))
    if (type) queries.push(Query.equal('type', type))
    if (collegeId) queries.push(Query.or([Query.equal('type', 'global'), Query.equal('collegeId', collegeId)]))
    else queries.push(Query.equal('type', 'global'))

    const tasks = await db.listDocuments(DB_ID, C.TASKS, queries)
    res.json({ tasks: tasks.documents, total: tasks.total })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/tasks/:id
router.get('/:id', async (req, res) => {
  try {
    const task = await db.getDocument(DB_ID, C.TASKS, req.params.id)
    res.json({ task })
  } catch {
    res.status(404).json({ error: 'Task not found' })
  }
})

// POST /api/tasks (admin)
router.post('/', verifySession, checkRole(['super_admin', 'college_admin']), async (req, res) => {
  try {
    const { title, description, points, type, category, difficulty, collegeId } = req.body

    if (!title || !description) {
      return res.status(400).json({ error: 'title and description are required' })
    }

    // Enforce Tenant Boundaries
    const isSuper = req.userDoc.role === 'super_admin'
    const finalType = (!isSuper) ? 'college' : (type || 'global')
    const finalCollegeId = (!isSuper) ? req.userDoc.collegeId : collegeId

    const docData = {
      title,
      description,
      points: parseInt(points) || 50,
      type: finalType,
      category: category || 'Nature',
      difficulty: difficulty || 'easy',
      createdBy: req.userDoc.$id,
      isActive: true,
    }

    if (finalType === 'college' && finalCollegeId) {
      docData.collegeId = finalCollegeId
    }

    const task = await db.createDocument(DB_ID, C.TASKS, ID.unique(), docData)
    res.status(201).json({ task })
  } catch (err) {
    console.error('Create task error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/tasks/:id
router.patch('/:id', verifySession, checkRole(['super_admin', 'college_admin']), async (req, res) => {
  try {
    const task = await db.updateDocument(DB_ID, C.TASKS, req.params.id, req.body)
    res.json({ task })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/tasks/:id
router.delete('/:id', verifySession, checkRole(['super_admin', 'college_admin']), async (req, res) => {
  try {
    await db.deleteDocument(DB_ID, C.TASKS, req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
