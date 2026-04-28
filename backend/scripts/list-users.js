import { Client, Databases, Query } from 'node-appwrite'
import dotenv from 'dotenv'
dotenv.config()

const c = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const db = new Databases(c)

async function main() {
  try {
    const docs = await db.listDocuments('ecogamify_db', 'users', [Query.limit(20)])
    console.log('\n👥 Users in DB:\n')
    docs.documents.forEach(u => {
      console.log(`  ${u.name} | ${u.email} | role: ${u.role} | points: ${u.points} | id: ${u.$id}`)
    })
    console.log(`\nTotal: ${docs.total}`)
  } catch (e) {
    console.error('Error:', e.message)
  }
}
main()
