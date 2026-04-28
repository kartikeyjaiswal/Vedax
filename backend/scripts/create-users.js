/**
 * Create user accounts in Appwrite for EcoGamify
 * Run: node scripts/create-users.js
 */
import { Client, Databases, Users, ID, Query } from 'node-appwrite'
import dotenv from 'dotenv'
dotenv.config()

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const db = new Databases(client)
const usersAPI = new Users(client)

const DB_ID = 'ecogamify_db'
const USERS_COL = 'users'

const accounts = [
  {
    email: 'jaikartik5044@gmail.com',
    password: 'Kartik@2026',
    name: 'Jai Kartik',
    role: 'super_admin',
  },
  {
    email: 'jamit5044@gmail.com',
    password: 'Kartik@2026',
    name: 'Jamit Student',
    role: 'student',
  },
]

async function createAccount(data) {
  const { email, password, name, role } = data
  let userId

  // 1. Create Appwrite auth account
  try {
    const user = await usersAPI.create(ID.unique(), email, undefined, password, name)
    userId = user.$id
    console.log(`✅ Appwrite account created: ${name} (${email}) → ID: ${userId}`)
  } catch (err) {
    if (err.code === 409) {
      // Already exists — find it
      const existing = await usersAPI.list([Query.equal('email', email)])
      if (existing.users.length > 0) {
        userId = existing.users[0].$id
        console.log(`⚠️  Account exists: ${email} → ID: ${userId}`)
      } else {
        console.error(`❌ Could not find existing account for ${email}`)
        return
      }
    } else {
      console.error(`❌ Failed to create account for ${email}:`, err.message)
      return
    }
  }

  // 2. Create user document in Appwrite DB
  try {
    await db.createDocument(DB_ID, USERS_COL, userId, {
      name,
      email,
      role,
      collegeId: null,
      points: role === 'super_admin' ? 9999 : 0,
      level: role === 'super_admin' ? 10 : 1,
      badges: role === 'super_admin' ? ['Eco Warrior', 'Quiz Master', 'Climate Champion'] : [],
      streakCount: 0,
      ecoScore: role === 'super_admin' ? 95 : 0,
      tasksCompleted: 0,
      quizzesCompleted: 0,
      lastActive: new Date().toISOString(),
    })
    console.log(`✅ User document created in DB: ${name} as ${role}`)
  } catch (err) {
    if (err.code === 409) {
      // Update if exists
      try {
        await db.updateDocument(DB_ID, USERS_COL, userId, { role, name })
        console.log(`⚠️  User doc already exists, updated role to ${role}`)
      } catch (ue) {
        console.log(`⚠️  Could not update: ${ue.message}`)
      }
    } else {
      console.error(`❌ Failed to create user doc for ${email}:`, err.message)
    }
  }

  // 3. Create leaderboard entry
  try {
    await db.createDocument(DB_ID, 'leaderboard', ID.unique(), {
      userId,
      collegeId: null,
      points: role === 'super_admin' ? 9999 : 0,
      weeklyPoints: 0,
    })
    console.log(`✅ Leaderboard entry created for: ${name}`)
  } catch (err) {
    console.log(`⚠️  Leaderboard (may already exist): ${err.message}`)
  }

  console.log(`\n📋 ${name}:`)
  console.log(`   Email: ${email}`)
  console.log(`   Password: ${data.password}`)
  console.log(`   Role: ${role}`)
  console.log(`   ID: ${userId}\n`)
}

async function main() {
  console.log('\n🌿 EcoGamify – Creating User Accounts\n')
  for (const account of accounts) {
    await createAccount(account)
  }
  console.log('✨ Done! You can now log in with these credentials.\n')
}

main().catch(console.error)
