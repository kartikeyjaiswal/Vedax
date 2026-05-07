import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const db = new Databases(client);

async function addAttribute() {
  const DB_ID = process.env.APPWRITE_DB_ID || 'ecogamify_db';
  const C_USERS = process.env.APPWRITE_USERS_COLLECTION || 'users';

  try {
    await db.createStringAttribute(DB_ID, C_USERS, 'profileImage', 500, false);
    console.log('Added profileImage attribute');
  } catch (err) {
    console.error('Error adding profileImage:', err.message);
  }
}

addAttribute();
