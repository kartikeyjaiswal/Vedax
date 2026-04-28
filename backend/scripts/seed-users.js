/**
 * Create user documents directly in the database
 * Run: node scripts/seed-users.js
 */
import { Client, Databases, Users, ID, Query } from 'node-appwrite'
import dotenv from 'dotenv'
dotenv.config()

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const db = new Databases(client)
const authUsers = new Users(client)

const DB_ID = 'ecogamify_db'

async function getOrCreateAuthUser(email, password, name) {
  try {
    // Try to find existing auth user
    const list = await authUsers.list([Query.equal('email', email)])
    if (list.users.length > 0) {
      console.log(`  Found existing auth account: ${email} → ${list.users[0].$id}`)
      return list.users[0].$id
    }
  } catch {}

  // Create new
  try {
    const user = await authUsers.create(ID.unique(), email, undefined, password, name)
    console.log(`  Created auth account: ${email} → ${user.$id}`)
    return user.$id
  } catch (err) {
    console.error(`  Failed to create auth account: ${err.message}`)
    return null
  }
}

async function createUserDoc(userId, data) {
  try {
    const doc = await db.createDocument(DB_ID, 'users', userId, data)
    console.log(`  ✅ Created user doc: ${data.name} (${data.role})`)
    return doc
  } catch (err) {
    if (err.code === 409) {
      try {
        const doc = await db.updateDocument(DB_ID, 'users', userId, { role: data.role })
        console.log(`  ⚠️  Updated existing user doc role to: ${data.role}`)
        return doc
      } catch (ue) {
        console.log(`  ⚠️  Doc exists, update failed: ${ue.message}`)
      }
    } else {
      console.error(`  ❌ Create doc failed: ${err.message}`)
    }
    return null
  }
}

async function createLeaderboardEntry(userId, points) {
  try {
    await db.createDocument(DB_ID, 'leaderboard', ID.unique(), {
      userId,
      points,
      weeklyPoints: 0,
    })
    console.log(`  ✅ Leaderboard entry created`)
  } catch (err) {
    console.log(`  ⚠️  Leaderboard: ${err.message}`)
  }
}

async function main() {
  console.log('\n🌿 EcoGamify – Seeding User Accounts\n')

  const usersToCreate = [
    {
      email: 'jaikartik5044@gmail.com',
      password: 'Kartik@2026',
      name: 'Jai Kartik',
      role: 'super_admin',
      points: 9999,
      level: 10,
      badges: ['Eco Warrior', 'Quiz Master', 'Climate Champion'],
      ecoScore: 95,
    },
    {
      email: 'jamit5044@gmail.com',
      password: 'Kartik@2026',
      name: 'Jamit Student',
      role: 'student',
      points: 0,
      level: 1,
      badges: [],
      ecoScore: 0,
    },
  ]

  // First check what attributes the collection actually has
  console.log('📋 Checking collection schema...')
  try {
    const coll = await db.getCollection(DB_ID, 'users')
    console.log('  Attributes:', coll.attributes.map(a => `${a.key}(${a.type})`).join(', '))
  } catch (err) {
    console.log('  Could not read schema:', err.message)
  }

  for (const user of usersToCreate) {
    console.log(`\n🔧 Processing: ${user.name} (${user.email})`)

    const userId = await getOrCreateAuthUser(user.email, user.password, user.name)
    if (!userId) continue

    const docData = {
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
    }

    await createUserDoc(userId, docData)
    await createLeaderboardEntry(userId, user.points)

    console.log(`\n  📋 Login credentials:`)
    console.log(`     Email:    ${user.email}`)
    console.log(`     Password: ${user.password}`)
    console.log(`     Role:     ${user.role}`)
  }

  console.log('\n✨ Done! Both accounts are ready.\n')
}

main().catch(console.error)
