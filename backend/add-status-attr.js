import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const db = new Databases(client);

async function addStatusAttribute() {
  try {
    console.log('Adding status attribute to COLLEGES...');
    const dbId = process.env.APPWRITE_DB_ID || 'ecogamify_db';
    const collId = process.env.APPWRITE_COLLEGES_COLLECTION || 'colleges';
    await db.createStringAttribute(
      dbId,
      collId,
      'status',
      20,
      false, // required
      'active' // default
    );
    console.log('Successfully added status attribute. It might take a moment to be available.');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('Attribute already exists.');
    } else {
      console.error('Error adding attribute:', err.message);
    }
  }
}

addStatusAttribute();
