import express from 'express'
import { chatbot, verifyImage, recommendTasks, getEcoScore } from '../services/aiClient.js'

const router = express.Router()

// POST /api/ai/chatbot
router.post('/chatbot', async (req, res) => {
  try {
    const { message, history } = req.body
    const result = await chatbot(message, history || [])
    res.json({ response: result.data.response })
  } catch (err) {
    res.status(500).json({ error: 'AI service unavailable', details: err.message })
  }
})

// POST /api/ai/verify-image
router.post('/verify-image', async (req, res) => {
  try {
    const { imageId, taskType } = req.body
    const imageUrl = `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${process.env.APPWRITE_STORAGE_BUCKET}/files/${imageId}/preview?project=${process.env.APPWRITE_PROJECT_ID}`
    const result = await verifyImage(imageUrl, taskType)
    res.json(result.data)
  } catch (err) {
    res.status(500).json({ verified: false, error: err.message })
  }
})

// GET /api/ai/recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const { userId, points = 0 } = req.query
    const result = await recommendTasks(userId, [], parseInt(points))
    res.json(result.data)
  } catch (err) {
    res.status(500).json({ recommendations: [], error: err.message })
  }
})

// POST /api/ai/eco-score
router.post('/eco-score', async (req, res) => {
  try {
    const result = await getEcoScore(req.body)
    res.json(result.data)
  } catch (err) {
    // Fallback calculation
    const { points = 0 } = req.body
    res.json({
      eco_score: Math.min(100, Math.round(points / 600)),
      co2_saved_kg: parseFloat((points * 0.012).toFixed(2)),
      trees_equivalent: Math.floor(points / 500),
      water_saved_liters: Math.floor(points * 0.8),
    })
  }
})

export default router
