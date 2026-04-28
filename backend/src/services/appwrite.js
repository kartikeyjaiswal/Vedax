import { Client, Databases, Storage, Teams, Users, ID, Query } from 'node-appwrite'
import dotenv from 'dotenv'
dotenv.config()

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

export const db = new Databases(client)
export const storage = new Storage(client)
export const teams = new Teams(client)
export const users = new Users(client)
export { ID, Query }

export const DB_ID = process.env.APPWRITE_DB_ID || 'ecogamify_db'
export const C = {
  USERS: process.env.APPWRITE_USERS_COLLECTION || 'users',
  COLLEGES: process.env.APPWRITE_COLLEGES_COLLECTION || 'colleges',
  TASKS: process.env.APPWRITE_TASKS_COLLECTION || 'tasks',
  SUBMISSIONS: process.env.APPWRITE_SUBMISSIONS_COLLECTION || 'submissions',
  LEADERBOARD: process.env.APPWRITE_LEADERBOARD_COLLECTION || 'leaderboard',
  QUIZZES: process.env.APPWRITE_QUIZZES_COLLECTION || 'quizzes',
  QUIZ_ATTEMPTS: process.env.APPWRITE_QUIZ_ATTEMPTS_COLLECTION || 'quiz_attempts',
  BADGES: process.env.APPWRITE_BADGES_COLLECTION || 'badges',
  ASSIGNMENTS: process.env.APPWRITE_ASSIGNMENTS_COLLECTION || 'assignments',
  ASSIGNMENT_SUBMISSIONS: process.env.APPWRITE_ASSIGNMENT_SUBMISSIONS_COLLECTION || 'assignment_submissions',
}
export const BUCKET_ID = process.env.APPWRITE_STORAGE_BUCKET || 'submissions_bucket'
