/**
 * Vedax – Appwrite Database Bootstrap Script
 * Run: node scripts/setup-appwrite.js
 * This creates all required collections and storage bucket in Appwrite.
 */
import { Client, Databases, Storage, ID, Permission, Role } from 'node-appwrite'
import dotenv from 'dotenv'
dotenv.config()

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const db = new Databases(client)
const storage = new Storage(client)

const DB_ID = process.env.APPWRITE_DB_ID || 'ecogamify_db'

const collections = [
  {
    id: 'users',
    name: 'Users',
    attrs: [
      { key: 'name', type: 'string', size: 100, required: true },
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'role', type: 'string', size: 20, required: false, default: 'student' },
      { key: 'collegeId', type: 'string', size: 50, required: false },
      { key: 'points', type: 'integer', required: false, default: 0 },
      { key: 'level', type: 'integer', required: false, default: 1 },
      { key: 'badges', type: 'string', size: 50, required: false, array: true },
      { key: 'streakCount', type: 'integer', required: false, default: 0 },
      { key: 'ecoScore', type: 'integer', required: false, default: 0 },
      { key: 'tasksCompleted', type: 'integer', required: false, default: 0 },
      { key: 'quizzesCompleted', type: 'integer', required: false, default: 0 },
      { key: 'lastActive', type: 'string', size: 50, required: false },
    ],
  },
  {
    id: 'colleges',
    name: 'Colleges',
    attrs: [
      { key: 'collegeName', type: 'string', size: 200, required: true },
      { key: 'collegeUniqueId', type: 'string', size: 50, required: true },
      { key: 'adminEmail', type: 'string', size: 255, required: false },
      { key: 'adminPassword', type: 'string', size: 255, required: false },
      { key: 'createdBy', type: 'string', size: 100, required: false },
      { key: 'teamId', type: 'string', size: 100, required: false },
      { key: 'memberCount', type: 'integer', required: false, default: 0 },
    ],
  },
  {
    id: 'tasks',
    name: 'Tasks',
    attrs: [
      { key: 'title', type: 'string', size: 200, required: true },
      { key: 'description', type: 'string', size: 2000, required: true },
      { key: 'points', type: 'integer', required: true },
      { key: 'type', type: 'string', size: 20, required: false, default: 'global' },
      { key: 'category', type: 'string', size: 50, required: false },
      { key: 'difficulty', type: 'string', size: 20, required: false, default: 'easy' },
      { key: 'collegeId', type: 'string', size: 50, required: false },
      { key: 'createdBy', type: 'string', size: 100, required: false },
      { key: 'isActive', type: 'boolean', required: false, default: true },
    ],
  },
  {
    id: 'submissions',
    name: 'Submissions',
    attrs: [
      { key: 'userId', type: 'string', size: 100, required: true },
      { key: 'taskId', type: 'string', size: 100, required: true },
      { key: 'taskTitle', type: 'string', size: 200, required: false },
      { key: 'imageProofId', type: 'string', size: 100, required: false },
      { key: 'status', type: 'string', size: 20, required: false, default: 'pending' },
      { key: 'feedback', type: 'string', size: 500, required: false },
      { key: 'userName', type: 'string', size: 100, required: false },
    ],
  },
  {
    id: 'leaderboard',
    name: 'Leaderboard',
    attrs: [
      { key: 'userId', type: 'string', size: 100, required: true },
      { key: 'collegeId', type: 'string', size: 50, required: false },
      { key: 'points', type: 'integer', required: false, default: 0 },
      { key: 'weeklyPoints', type: 'integer', required: false, default: 0 },
    ],
  },
  {
    id: 'quizzes',
    name: 'Quizzes',
    attrs: [
      { key: 'title', type: 'string', size: 200, required: true },
      { key: 'questions', type: 'string', size: 20000, required: true },
      { key: 'category', type: 'string', size: 50, required: false },
      { key: 'difficulty', type: 'string', size: 20, required: false },
      { key: 'isAI', type: 'boolean', required: false, default: false },
      { key: 'timeLimit', type: 'integer', required: false, default: 10 },
      { key: 'maxPoints', type: 'integer', required: false, default: 100 },
      { key: 'createdBy', type: 'string', size: 100, required: false },
      { key: 'isGlobal', type: 'boolean', required: false, default: false },
      { key: 'collegeId', type: 'string', size: 50, required: false },
    ],
  },
  {
    id: 'quiz_attempts',
    name: 'Quiz Attempts',
    attrs: [
      { key: 'userId', type: 'string', size: 100, required: true },
      { key: 'quizId', type: 'string', size: 100, required: true },
      { key: 'score', type: 'integer', required: true },
      { key: 'answers', type: 'string', size: 5000, required: false },
      { key: 'completedAt', type: 'string', size: 50, required: false },
    ],
  },
  {
    id: 'assignments',
    name: 'Assignments',
    attrs: [
      { key: 'title', type: 'string', size: 200, required: true },
      { key: 'description', type: 'string', size: 2000, required: false },
      { key: 'questions', type: 'string', size: 20000, required: true },
      { key: 'createdBy', type: 'string', size: 100, required: true },
      { key: 'collegeId', type: 'string', size: 50, required: true },
      { key: 'dueDate', type: 'string', size: 50, required: false },
      { key: 'totalMarks', type: 'integer', required: false, default: 100 },
    ],
  },
  {
    id: 'assignment_submissions',
    name: 'Assignment Submissions',
    attrs: [
      { key: 'studentId', type: 'string', size: 100, required: true },
      { key: 'assignmentId', type: 'string', size: 100, required: true },
      { key: 'answers', type: 'string', size: 20000, required: true },
      { key: 'score', type: 'integer', required: false },
      { key: 'status', type: 'string', size: 20, required: false, default: 'pending' },
    ],
  },
]

async function createDatabase() {
  try {
    await db.create(DB_ID, 'Vedax Database')
    console.log(`✅ Created database: ${DB_ID}`)
  } catch (err) {
    if (err.code === 409) console.log(`⚠️  Database already exists: ${DB_ID}`)
    else if (err.code === 403) console.log(`⚠️  Database limit reached, assuming ${DB_ID} exists`)
    else throw err
  }
}

async function createCollection(col) {
  const perms = [Permission.read(Role.any()), Permission.write(Role.users())]
  try {
    await db.createCollection(DB_ID, col.id, col.name, perms)
    console.log(`✅ Created collection: ${col.name}`)
  } catch (err) {
    if (err.code === 409) { console.log(`⚠️  Collection exists: ${col.name}`) }
    else { throw err }
  }

  for (const attr of col.attrs) {
    try {
      if (attr.type === 'string') {
        await db.createStringAttribute(DB_ID, col.id, attr.key, attr.size, attr.required || false, attr.default, attr.array || false)
      } else if (attr.type === 'integer') {
        await db.createIntegerAttribute(DB_ID, col.id, attr.key, attr.required || false, undefined, undefined, attr.default)
      } else if (attr.type === 'boolean') {
        await db.createBooleanAttribute(DB_ID, col.id, attr.key, attr.required || false, attr.default)
      }
      console.log(`  ✅ Attribute: ${attr.key}`)
      await new Promise(r => setTimeout(r, 300)) // Rate limit
    } catch (err) {
      console.log(`  ⚠️  Attribute ${attr.key}: ${err.message}`)
    }
  }
}

async function createBucket() {
  try {
    await storage.createBucket(
      process.env.APPWRITE_STORAGE_BUCKET || 'submissions_bucket',
      'Submission Proofs',
      [Permission.read(Role.any()), Permission.write(Role.users())],
      false, false, 10 * 1024 * 1024, // 10MB
      ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4']
    )
    console.log('✅ Created storage bucket: submissions_bucket')
  } catch (err) {
    if (err.code === 409) console.log('⚠️  Storage bucket already exists')
    else console.log('Storage bucket error:', err.message)
  }
}

async function seedTasks() {
  const tasks = [
    { title: 'Plant a Sapling', description: 'Plant a tree or plant at home/college. Upload a photo as proof.', points: 100, type: 'global', category: 'Nature', difficulty: 'easy', isActive: true },
    { title: 'Zero Waste Day', description: 'Go an entire day without producing single-use plastic waste. Document your day.', points: 150, type: 'global', category: 'Waste', difficulty: 'medium', isActive: true },
    { title: '5-Minute Cold Shower', description: 'Take a shower under 5 minutes to save water. Upload proof.', points: 40, type: 'global', category: 'Water', difficulty: 'easy', isActive: true },
    { title: 'Cycle to College/Work', description: 'Use a bicycle instead of a motor vehicle for your commute today.', points: 80, type: 'global', category: 'Transport', difficulty: 'easy', isActive: true },
    { title: 'Meatless Monday', description: 'Eat a fully vegetarian/vegan diet for one day. Share your meal!', points: 60, type: 'global', category: 'Food', difficulty: 'easy', isActive: true },
    { title: 'Energy Audit', description: 'Turn off all unused electronics for 1 hour and document energy savings.', points: 50, type: 'global', category: 'Energy', difficulty: 'easy', isActive: true },
  ]

  for (const task of tasks) {
    try {
      await db.createDocument(DB_ID, 'tasks', ID.unique(), task)
      console.log(`  ✅ Seeded task: ${task.title}`)
    } catch {}
  }
}

async function main() {
  console.log('\n🌿 Vedax – Appwrite Bootstrap\n')
  await createDatabase()
  for (const col of collections) {
    await createCollection(col)
  }
  await createBucket()
  console.log('\n📦 Seeding starter tasks...')
  await seedTasks()
  console.log('\n✨ Setup complete! Your Vedax database is ready.\n')
}

main().catch(console.error)
