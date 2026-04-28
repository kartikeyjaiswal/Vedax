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
    console.log('\n📋 Checking users collection attributes:\n')
    const coll = await db.getCollection('ecogamify_db', 'users')
    coll.attributes.forEach(attr => {
      console.log(`  key: "${attr.key}" | type: ${attr.type} | required: ${attr.required} | default: "${attr.default}" | size: ${attr.size || '-'} | array: ${attr.array}`)
    })
    console.log('\n---\n')
  } catch (e) {
    console.error('Error fetching collection:', e.message)
  }
}
main()
