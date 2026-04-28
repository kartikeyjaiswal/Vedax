import axios from 'axios'

const aiClient = axios.create({
  baseURL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  timeout: 30000,
})

export const generateQuiz = (topic, count = 10) =>
  aiClient.post('/generate-quiz', { topic, count })

export const chatbot = (message, history = []) =>
  aiClient.post('/chatbot', { message, history })

export const verifyImage = (imageUrl, taskType) =>
  aiClient.post('/verify-image', { image_url: imageUrl, task_type: taskType })

export const recommendTasks = (userId, completedTaskIds, points) =>
  aiClient.post('/recommend-tasks', { user_id: userId, completed_task_ids: completedTaskIds, points })

export const getEcoScore = (data) =>
  aiClient.post('/eco-score', data)

export default aiClient
