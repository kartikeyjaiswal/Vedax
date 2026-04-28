import { Client, Databases } from 'node-appwrite'
import dotenv from 'dotenv'
dotenv.config()

const c = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const db = new Databases(c)

async function main() {
  try {
    const result = await db.listCollections('ecogamify_db')
    result.collections.forEach(col => {
      console.log(`${col.name} = ${col.$id}`)
    })
  } catch (e) {
    console.error('Error:', e.message)
  }
}
main()
