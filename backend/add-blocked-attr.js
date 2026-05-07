import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const db = new Databases(client);

async function initUsers() {
  const dbId = process.env.APPWRITE_DB_ID || 'ecogamify_db';
  const usersId = process.env.APPWRITE_USERS_COLLECTION || 'users';
  
  try {
    await db.createBooleanAttribute(dbId, usersId, 'isBlocked', false, false);
    console.log('Added isBlocked to users');
  } catch (e) { console.log('isBlocked:', e.message); }
}

initUsers();
