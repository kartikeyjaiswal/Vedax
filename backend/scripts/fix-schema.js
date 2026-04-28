/**
 * Add missing 'role' attribute to users collection
 * Run: node scripts/fix-schema.js
 */
import { Client, Databases, Users, ID, Query } from 'node-appwrite'
import dotenv from 'dotenv'
dotenv.config()

const c = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const db = new Databases(c)
const auth = new Users(c)
const DB_ID = 'ecogamify_db'

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function addAttrIfMissing(colId, key, type, opts = {}) {
  try {
    if (type === 'string') {
      await db.createStringAttribute(DB_ID, colId, key, opts.size || 100, opts.required || false, opts.default || null, opts.array || false)
    } else if (type === 'integer') {
      await db.createIntegerAttribute(DB_ID, colId, key, opts.required || false, undefined, undefined, opts.default || 0)
    } else if (type === 'boolean') {
      await db.createBooleanAttribute(DB_ID, colId, key, opts.required || false, opts.default || false)
    }
    console.log(`  ✅ Added "${key}" to ${colId}`)
    await sleep(800) // Wait for Appwrite to process
  } catch (err) {
    if (err.code === 409) {
      console.log(`  ⚠️  "${key}" already exists in ${colId}`)
    } else {
      console.error(`  ❌ Failed to add "${key}": ${err.message}`)
    }
  }
}

async function main() {
  console.log('\n🔧 EcoGamify – Fixing Collection Schema\n')

  // Add missing attributes to users collection
  console.log('📋 Patching users collection...')
  await addAttrIfMissing('users', 'role', 'string', { size: 30, required: false, default: 'student' })
  await addAttrIfMissing('users', 'phone', 'string', { size: 20, required: false })
  await addAttrIfMissing('users', 'age', 'string', { size: 10, required: false })
  await addAttrIfMissing('users', 'qualification', 'string', { size: 100, required: false })
  await addAttrIfMissing('users', 'address', 'string', { size: 200, required: false })
  await addAttrIfMissing('users', 'onboardingComplete', 'boolean', { required: false, default: false })

  // Also check and patch submissions
  console.log('\n📋 Patching submissions collection...')
  await addAttrIfMissing('submissions', 'userName', 'string', { size: 100 })

  console.log('\n⏳ Waiting 5s for attributes to become available...')
  await sleep(5000)

  // Now create user documents
  console.log('\n👥 Creating user documents...\n')

  const users = [
    {
      email: 'jaikartik5044@gmail.com',
      name: 'Jai Kartik',
      role: 'super_admin',
      points: 9999,
      level: 10,
      badges: ['Eco Warrior', 'Quiz Master'],
      ecoScore: 95,
    },
    {
      email: 'jamit5044@gmail.com',
      name: 'Jamit Student',
      role: 'student',
      points: 0,
      level: 1,
      badges: [],
      ecoScore: 0,
    },
  ]

  // Get auth user IDs
  const authList = await auth.list()
  const authMap = {}
  authList.users.forEach(u => authMap[u.email] = u.$id)

  for (const user of users) {
    const userId = authMap[user.email]
    if (!userId) {
      console.log(`❌ Auth account not found for ${user.email}`)
      continue
    }

    // Try to delete existing minimal doc first
    try {
      await db.deleteDocument(DB_ID, 'users', userId)
      console.log(`  🗑️  Deleted old doc for ${user.email}`)
    } catch {}

    await sleep(500)

    try {
      const doc = await db.createDocument(DB_ID, 'users', userId, {
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
        level: user.level,
        badges: user.badges,
        streakCount: 0,
        ecoScore: user.ecoScore,
        tasksCompleted: 0,
        quizzesCompleted: 0,
        lastActive: new Date().toISOString(),
        phone: '',
        age: '',
        qualification: '',
        address: '',
        onboardingComplete: false,
      })
      console.log(`  ✅ Created doc: ${user.name} (${user.role}) → ${doc.$id}`)
    } catch (e) {
      console.log(`  ❌ Failed to create doc for ${user.email}: ${e.message}`)
    }

    // Create leaderboard entry
    try {
      await db.createDocument(DB_ID, 'leaderboard', ID.unique(), {
        userId,
        points: user.points,
        weeklyPoints: 0,
      })
      console.log(`  ✅ Leaderboard entry created`)
    } catch (e) {
      console.log(`  ⚠️  Leaderboard: ${e.message}`)
    }

    console.log(`  📧 ${user.email} | 🔑 Kartik@2026 | 👤 ${user.role}\n`)
  }

  console.log('✨ Schema fix and user creation complete!\n')
  console.log('🔐 Login credentials:')
  console.log('   Super Admin: jaikartik5044@gmail.com / Kartik@2026')
  console.log('   Student:     jamit5044@gmail.com / Kartik@2026\n')
}

main().catch(console.error)
