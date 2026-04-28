import { Client, Databases, Users, ID } from 'node-appwrite'
import { writeFileSync } from 'fs'
import dotenv from 'dotenv'
dotenv.config()

const c = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const db = new Databases(c)
const auth = new Users(c)

async function main() {
  let output = ''

  const coll = await db.getCollection('ecogamify_db', 'users')
  output += 'ATTRS:\n'
  coll.attributes.forEach(a => {
    output += `  ${a.key}: required=${a.required} default="${a.default}" size=${a.size} array=${a.array} status=${a.status}\n`
  })

  const list = await auth.list()
  output += '\nAUTH_USERS:\n'
  list.users.forEach(u => output += `  ${u.email} = ${u.$id}\n`)

  const testUser = list.users.find(u => u.email === 'jaikartik5044@gmail.com')
  if (testUser) {
    output += `\nTEST_ID: ${testUser.$id}\n`

    // Try creating doc
    try {
      const doc = await db.createDocument('ecogamify_db', 'users', testUser.$id, {
        name: 'Jai Kartik',
        email: 'jaikartik5044@gmail.com',
        role: 'super_admin',
        points: 9999,
        level: 10,
        badges: ['Eco Warrior'],
        streakCount: 0,
        ecoScore: 95,
        tasksCompleted: 0,
        quizzesCompleted: 0,
        lastActive: new Date().toISOString(),
      })
      output += `DOC_CREATED: ${doc.$id}\n`
    } catch (e) {
      output += `DOC_ERROR: ${e.message} | code=${e.code} | type=${e.type}\n`
      // Try with fewer fields
      try {
        const doc2 = await db.createDocument('ecogamify_db', 'users', testUser.$id, {
          name: 'Jai Kartik',
          email: 'jaikartik5044@gmail.com',
        })
        output += `DOC_MINIMAL_CREATED: ${doc2.$id}\n`
      } catch (e2) {
        output += `DOC_MINIMAL_ERROR: ${e2.message}\n`
      }
    }
  }

  writeFileSync('diagnose-output.txt', output)
  console.log('Written to diagnose-output.txt')
  console.log(output.slice(0, 500))
}
main().catch(e => { const s = e.message; require('fs').writeFileSync('diagnose-error.txt', s); console.log('ERROR:', s) })
