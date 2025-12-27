#!/usr/bin/env tsx

/**
 * Test Resend Email Sending
 *
 * Quick script to verify Resend is working.
 * Run with: npx tsx scripts/test-resend.ts
 */

import { Resend } from 'resend'

// Get API key from environment variable
const apiKey = process.env.RESEND_API_KEY
if (!apiKey) {
  console.error('❌ RESEND_API_KEY environment variable is required')
  console.log('Usage: RESEND_API_KEY=re_xxx npx tsx scripts/test-resend.ts')
  process.exit(1)
}

const resend = new Resend(apiKey)

async function sendTestEmail() {
  console.log('📧 Sending test email...')

  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'geoff@automatonicai.com',
      subject: 'Hello World from Chronos',
      html: '<p>Congrats on sending your <strong>first email</strong> with Resend!</p>',
    })

    if (error) {
      console.error('❌ Error sending email:', error)
      return
    }

    console.log('✅ Email sent successfully!')
    console.log('📬 Email ID:', data?.id)
    console.log('📥 Check your inbox at geoff@automatonicai.com')
  } catch (error) {
    console.error('❌ Failed to send email:', error)
  }
}

sendTestEmail()
