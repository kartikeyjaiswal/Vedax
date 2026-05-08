import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import taskRoutes from './routes/tasks.js'
import submissionRoutes from './routes/submissions.js'
import leaderboardRoutes from './routes/leaderboard.js'
import collegeRoutes from './routes/colleges.js'
import quizRoutes from './routes/quiz.js'
import aiRoutes from './routes/ai.js'
import assignmentsRoutes from './routes/assignments.js'
import platformRoutes from './routes/platform.js'
import ticketsRoutes from './routes/tickets.js'
import resultsRoutes from './routes/results.js'

const app = express()

// Security & middleware
app.use(helmet({ crossOriginEmbedderPolicy: false }))
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://vedax-lyart.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(morgan('dev'))

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 })
app.use('/api/', limiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/submissions', submissionRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/colleges', collegeRoutes)
app.use('/api/quizzes', quizRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/assignments', assignmentsRoutes)
app.use('/api/platform', platformRoutes)
app.use('/api/tickets', ticketsRoutes)
app.use('/api/results', resultsRoutes)

// Base route
app.get('/', (req, res) => res.send('Vedax Backend is running successfully'))

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'Vedax Backend' }))

// Serve Frontend Static Files (only when dist exists, e.g. local dev or monolith deploy)
const frontendPath = path.join(__dirname, '../../frontend/dist')
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath))

  // Catch-all route to serve the React app for non-API requests (SPA routing)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next()
    }
    res.sendFile(path.join(frontendPath, 'index.html'))
  })
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`🌿 Vedax Backend running on port ${PORT}`))
