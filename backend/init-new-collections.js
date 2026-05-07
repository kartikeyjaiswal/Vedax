import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const db = new Databases(client);

async function initAll() {
  const dbId = process.env.APPWRITE_DB_ID || 'ecogamify_db';
  const collegesId = process.env.APPWRITE_COLLEGES_COLLECTION || 'colleges';
  
  // 1. Add subscription attributes to colleges
  try {
    await db.createStringAttribute(dbId, collegesId, 'subscriptionPlan', 50, false, 'free');
    console.log('Added subscriptionPlan');
  } catch (e) { console.log('subscriptionPlan:', e.message); }

  try {
    await db.createStringAttribute(dbId, collegesId, 'paymentStatus', 50, false, 'active');
    console.log('Added paymentStatus');
  } catch (e) { console.log('paymentStatus:', e.message); }

  // 2. Create Platform Settings collection
  const settingsId = process.env.APPWRITE_PLATFORM_SETTINGS_COLLECTION || 'platform_settings';
  try {
    await db.createCollection(dbId, settingsId, 'Platform Settings');
    console.log('Created platform_settings collection');
    
    // Add attributes
    await db.createBooleanAttribute(dbId, settingsId, 'isGlobalServiceActive', false, true);
    await db.createStringAttribute(dbId, settingsId, 'globalSuspensionReason', 255, false, null);
    await db.createBooleanAttribute(dbId, settingsId, 'isChatbotEnabled', false, true);
    console.log('Added attributes to platform_settings');
  } catch (e) { console.log('Platform settings:', e.message); }

  // 3. Create Tickets collection
  const ticketsId = process.env.APPWRITE_TICKETS_COLLECTION || 'tickets';
  try {
    await db.createCollection(dbId, ticketsId, 'Tickets');
    console.log('Created tickets collection');

    // Add attributes
    await db.createStringAttribute(dbId, ticketsId, 'subject', 255, true);
    await db.createStringAttribute(dbId, ticketsId, 'description', 5000, true);
    await db.createStringAttribute(dbId, ticketsId, 'status', 50, false, 'open');
    await db.createStringAttribute(dbId, ticketsId, 'priority', 50, false, 'medium');
    await db.createStringAttribute(dbId, ticketsId, 'reportedBy', 50, true);
    await db.createStringAttribute(dbId, ticketsId, 'collegeId', 50, true);
    console.log('Added attributes to tickets');
  } catch (e) { console.log('Tickets:', e.message); }
}

initAll();
