import { Client, Users } from 'node-appwrite'
import { db, DB_ID, C, Query } from '../services/appwrite.js'

export const verifySession = async (req, res, next) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '')
  const accountId = req.headers['x-account-id']

  if (!sessionId || !accountId) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY)

    const users = new Users(client)
    // Securely verify that the session actually exists for this user account
    const sessionList = await users.listSessions(accountId)
    const isValidSession = sessionList.sessions.some(s => s.$id === sessionId)
    if (!isValidSession) throw new Error('Session not found')
    
    req.account = await users.get(accountId)
    
    // Hydrate the user doc to support RBAC
    try {
      req.userDoc = await db.getDocument(DB_ID, C.USERS, accountId)
      
      // Check service status
      if (req.userDoc && !req.originalUrl.includes('/logout')) {
        // Global Check
        try {
          const settings = await db.getDocument(DB_ID, C.PLATFORM_SETTINGS, 'global_settings')
          if (settings && !settings.isGlobalServiceActive && req.userDoc.role !== 'super_admin') {
            return res.status(403).json({ 
              error: settings.globalSuspensionReason || 'Platform is under maintenance.', 
              code: 'GLOBAL_SUSPENSION' 
            })
          }
        } catch(e) {
          // Ignore if document not created
        }

        // College Check
        if (req.userDoc.collegeId && req.userDoc.role !== 'super_admin') {
        try {
          const collegesList = await db.listDocuments(DB_ID, C.COLLEGES, [
            Query.equal('collegeUniqueId', req.userDoc.collegeId)
          ])
          if (collegesList.total > 0) {
            const college = collegesList.documents[0]
            if (college.status === 'paused') {
              return res.status(403).json({ 
                error: college.suspensionReason || 'Services are currently suspended. Please contact the Super Admin to resolve the issue and resume access.', 
                code: 'SERVICE_SUSPENDED' 
              })
            }
          }
        } catch(e) {
          console.error('Error checking college status:', e)
        }
        }
      }
    } catch {
      req.userDoc = null
    }

    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired session' })
  }
}

export const checkRole = (roles) => (req, res, next) => {
  const userRole = req.userDoc?.role
  if (!userRole || !roles.includes(userRole)) {
    return res.status(403).json({ error: 'Insufficient permissions' })
  }
  next()
}
