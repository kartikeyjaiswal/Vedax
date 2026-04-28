/**
 * Reset passwords for EcoGamify accounts
 * Run: node scripts/reset-passwords.js
 */
import { Client, Users, Query } from 'node-appwrite'
import dotenv from 'dotenv'
dotenv.config()

const c = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const auth = new Users(c)

const ACCOUNTS = [
  { email: 'jaikartik5044@gmail.com', newPassword: 'Kartik@2026', name: 'Jai Kartik (Super Admin)' },
  { email: 'jamit5044@gmail.com', newPassword: 'Kartik@2026', name: 'Jamit Student' },
]

async function main() {
  console.log('\n🔑 EcoGamify – Resetting Account Passwords\n')

  // List all users
  const list = await auth.list()
  console.log('All Appwrite users:')
  list.users.forEach(u => console.log(`  ${u.email} = ${u.$id} | emailVerification: ${u.emailVerification} | status: ${u.status}`))

  for (const account of ACCOUNTS) {
    const found = list.users.find(u => u.email === account.email)
    if (!found) {
      console.log(`❌ Not found: ${account.email}`)
      continue
    }

    try {
      // Update password using server SDK
      await auth.updatePassword(found.$id, account.newPassword)
      console.log(`✅ Password reset for ${account.name} (${account.email})`)

      // Also make sure the account is not blocked
      if (!found.status) {
        await auth.updateStatus(found.$id, true)
        console.log(`  ✅ Activated account`)
      }

      // Verify email (so no email verification is needed)
      await auth.updateEmailVerification(found.$id, true)
      console.log(`  ✅ Email marked as verified`)

    } catch (err) {
      console.error(`❌ Failed for ${account.email}: ${err.message}`)
    }
  }

  console.log('\n✅ Done! Login with:')
  console.log('   Super Admin: jaikartik5044@gmail.com / Kartik@2026')
  console.log('   Student:     jamit5044@gmail.com / Kartik@2026\n')
}

main().catch(console.error)
