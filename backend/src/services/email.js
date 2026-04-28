import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const sendOTP = async (to, otp) => {
  const mailOptions = {
    from: '"EcoGamify Support" <noreply@ecogamify.com>',
    to,
    subject: 'Your EcoGamify Verification Code',
    text: `Your verification code is: ${otp}. This code is valid for 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; text-align: center;">
        <h2 style="color: #22c55e;">EcoGamify Profiler Verification</h2>
        <p>Thank you for verifying your profile! Your one-time password (OTP) is:</p>
        <div style="font-size: 32px; font-weight: bold; padding: 20px; margin: 20px 0; background: #f1f5f9; border-radius: 12px; letter-spacing: 5px;">
          ${otp}
        </div>
        <p style="color: #64748b; font-size: 12px;">This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>
      </div>
    `
  }

  try {
    // Check if SMTP credentials exist, if not, skip sending to avoid crash, but simulate
    if (!process.env.SMTP_USER) {
      console.log(`\n=== SIMULATED EMAIL ===\nTo: ${to}\nOTP: ${otp}\n=======================\n`)
      return { success: true, simulated: true }
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('Message sent: %s', info.messageId)
    // For ethereal email
    if (process.env.SMTP_HOST === 'smtp.ethereal.email') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
    }
    return { success: true }
  } catch (err) {
    console.error('Error sending email:', err)
    // Fallback to simulation if send fails
    console.log(`\n=== FALLBACK SIMULATED EMAIL ===\nTo: ${to}\nOTP: ${otp}\n================================\n`)
    return { success: true, simulated: true }
  }
}
