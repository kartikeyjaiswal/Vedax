import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const AI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

export const aiApi = axios.create({
  baseURL: AI_URL,
})

// Request interceptor - attach session token + account ID
api.interceptors.request.use((config) => {
  const session = localStorage.getItem('eco_session')
  const accountId = localStorage.getItem('eco_account_id')
  if (session) config.headers.Authorization = `Bearer ${session}`
  if (accountId) config.headers['X-Account-Id'] = accountId
  return config
})

// Response interceptor - auto-clear stale session on 401 and handle service suspension
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('eco_session')
      localStorage.removeItem('eco_account_id')
    }
    if (err.response?.status === 403 && err.response?.data?.code === 'SERVICE_SUSPENDED') {
      window.dispatchEvent(new CustomEvent('service-suspended', { 
        detail: { message: err.response.data.error } 
      }))
    }
    return Promise.reject(err)
  }
)

// Auth
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  me: (sessionId, accountId) => api.get('/api/auth/me', {
    headers: {
      ...(sessionId ? { Authorization: `Bearer ${sessionId}` } : {}),
      ...(accountId ? { 'X-Account-Id': accountId } : {}),
    }
  }),
  sendOtp: (data) => api.post('/api/auth/send-otp', data),
  verifyOtp: (data) => api.post('/api/auth/verify-otp', data),
}

// Users
export const usersAPI = {
  getProfile: (id) => api.get(`/api/users/${id}`),
  updateProfile: (id, data) => api.patch(`/api/users/${id}`, data),
  getStats: (id) => api.get(`/api/users/${id}/stats`),
  block: (id, isBlocked) => api.patch(`/api/users/${id}/block`, { isBlocked }),
  verify: (id, otp) => api.post(`/api/users/${id}/verify`, { otp }),
  uploadProfile: (id, formData) => api.post(`/api/users/${id}/upload-profile`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
}

// Tasks
export const tasksAPI = {
  getAll: (params) => api.get('/api/tasks', { params }),
  getById: (id) => api.get(`/api/tasks/${id}`),
  create: (data) => api.post('/api/tasks', data),
  update: (id, data) => api.patch(`/api/tasks/${id}`, data),
  delete: (id) => api.delete(`/api/tasks/${id}`),
}

// Submissions
export const submissionsAPI = {
  submit: (formData) => api.post('/api/submissions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMySubmissions: () => api.get('/api/submissions/mine'),
  getByTask: (taskId) => api.get(`/api/submissions/task/${taskId}`),
  approve: (id) => api.patch(`/api/submissions/${id}/approve`),
  reject: (id, reason) => api.patch(`/api/submissions/${id}/reject`, { reason }),
}

// Leaderboard
export const leaderboardAPI = {
  getGlobal: (params) => api.get('/api/leaderboard/global', { params }),
  getCollege: (collegeId, params) => api.get(`/api/leaderboard/college/${collegeId}`, { params }),
}

// Colleges
export const collegesAPI = {
  create: (data) => api.post('/api/colleges', data),
  getAll: () => api.get('/api/colleges'),
  getById: (id) => api.get(`/api/colleges/${id}`),
  getStats: (id) => api.get(`/api/colleges/${id}/stats`),
  getStudents: (id) => api.get(`/api/colleges/${id}/students`),
  updateStatus: (id, status, suspensionReason) => api.patch(`/api/colleges/${id}/status`, { status, suspensionReason }),
  updateSubscription: (id, data) => api.patch(`/api/colleges/${id}/subscription`, data),
  edit: (id, data) => api.patch(`/api/colleges/${id}`, data),
  delete: (id) => api.delete(`/api/colleges/${id}`),
}

// Quizzes
export const quizzesAPI = {
  getAll: () => api.get('/api/quizzes'),
  getById: (id) => api.get(`/api/quizzes/${id}`),
  submit: (id, answers) => api.post(`/api/quizzes/${id}/attempt`, { answers }),
  generateAI: (topic) => api.post('/api/quizzes/generate', { topic }),
}

// AI endpoints
export const aiRouteAPI = {
  chat: (message, history) => api.post('/api/ai/chatbot', { message, history }),
  verifyImage: (imageId, taskType) => api.post('/api/ai/verify-image', { imageId, taskType }),
  getRecommendations: () => api.get('/api/ai/recommendations'),
  getEcoScore: (data) => api.post('/api/ai/eco-score', data),
}

// Assignments
export const assignmentsAPI = {
  create: (data) => api.post('/api/assignments', data),
  getAll: () => api.get('/api/assignments'),
  getSubmissions: (id) => api.get(`/api/assignments/${id}/submissions`),
  getMySubmissions: () => api.get('/api/assignments/my-submissions'),
  submit: (id, answers) => api.post(`/api/assignments/${id}/submit`, { answers }),
  evaluate: (id, subId, score) => api.post(`/api/assignments/${id}/evaluate/${subId}`, { score })
}

// Platform (Super Admin)
export const platformAPI = {
  getSettings: () => api.get('/api/platform/settings'),
  updateSettings: (data) => api.patch('/api/platform/settings', data),
  getLogs: () => api.get('/api/platform/logs')
}

// Tickets
export const ticketsAPI = {
  getAll: () => api.get('/api/tickets'),
  create: (data) => api.post('/api/tickets', data),
  update: (id, data) => api.patch(`/api/tickets/${id}`, data)
}
