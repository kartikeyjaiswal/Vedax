import express from 'express'
import { db, DB_ID, C } from '../services/appwrite.js'
import { verifySession, checkRole } from '../middleware/auth.js'
import { ID } from 'node-appwrite'

const router = express.Router()

// We will use a hardcoded document ID 'global_settings' for simplicity
const SETTINGS_DOC_ID = 'global_settings'

const initSettings = async () => {
  try {
    await db.getDocument(DB_ID, C.PLATFORM_SETTINGS, SETTINGS_DOC_ID)
  } catch {
    // If it doesn't exist, create it
    try {
      await db.createDocument(DB_ID, C.PLATFORM_SETTINGS, SETTINGS_DOC_ID, {
        isGlobalServiceActive: true,
        globalSuspensionReason: null,
        isChatbotEnabled: true
      })
    } catch (e) {
      console.log('Failed to init settings:', e.message)
    }
  }
}

initSettings()

// GET /api/platform/settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await db.getDocument(DB_ID, C.PLATFORM_SETTINGS, SETTINGS_DOC_ID)
    res.json({ settings })
  } catch (err) {
    // Return default if not found
    res.json({ settings: { isGlobalServiceActive: true, isChatbotEnabled: true } })
  }
})

// PATCH /api/platform/settings (Super Admin Only)
router.patch('/settings', verifySession, checkRole(['super_admin']), async (req, res) => {
  try {
    const updates = req.body // { isGlobalServiceActive, globalSuspensionReason, isChatbotEnabled }
    const settings = await db.updateDocument(DB_ID, C.PLATFORM_SETTINGS, SETTINGS_DOC_ID, updates)
    res.json({ settings })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/platform/logs (Super Admin Only)
router.get('/logs', verifySession, checkRole(['super_admin']), async (req, res) => {
  try {
    const logs = await db.listDocuments(DB_ID, C.LOGS)
    res.json({ logs: logs.documents })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
