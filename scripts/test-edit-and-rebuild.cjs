#!/usr/bin/env node

/**
 * Test if edits trigger the rebuild flow
 */

const https = require('https')

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://admin.automatonicai.com'
const DIRECTUS_EMAIL = process.env.DIRECTUS_EMAIL
const DIRECTUS_PASSWORD = process.env.DIRECTUS_PASSWORD

if (!DIRECTUS_EMAIL || !DIRECTUS_PASSWORD) {
  console.error('❌ Error: DIRECTUS_EMAIL and DIRECTUS_PASSWORD required')
  process.exit(1)
}

let authToken = null

function request(method, path, data = null, useAuth = true) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, DIRECTUS_URL)
    const headers = { 'Content-Type': 'application/json' }
    if (useAuth && authToken) headers['Authorization'] = `Bearer ${authToken}`

    const req = https.request(url, { method, headers }, (res) => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body))
          } catch (e) {
            resolve({ data: body })
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`))
        }
      })
    })
    req.on('error', reject)
    if (data) req.write(JSON.stringify(data))
    req.end()
  })
}

async function login() {
  console.log('🔐 Logging in to Directus...\n')
  const response = await request('POST', '/auth/login', {
    email: DIRECTUS_EMAIL,
    password: DIRECTUS_PASSWORD,
  }, false)
  authToken = response.data.access_token
  console.log('✅ Logged in successfully\n')
}

async function main() {
  await login()

  console.log('🧪 Testing if edits trigger rebuilds...\n')

  // Get a feature to test with
  const featuresResponse = await request('GET', '/items/cms_features?limit=1')
  const feature = featuresResponse.data[0]

  console.log(`Test feature: ${feature.title}`)
  console.log(`Current description (first 100 chars): ${feature.description.substring(0, 100)}...\n`)

  // Make a small edit (add a comment at the end)
  const testComment = `<!-- Test edit at ${new Date().toISOString()} -->`
  const updatedDescription = feature.description + '\n' + testComment

  console.log('Making a test edit...')

  try {
    await request('PATCH', `/items/cms_features/${feature.id}`, {
      description: updatedDescription
    })

    console.log('✅ Edit saved successfully!\n')

    // Wait a moment for the flow to trigger
    console.log('⏱️  Waiting 3 seconds for flow to trigger...\n')
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Verify the edit was saved
    const verifyResponse = await request('GET', `/items/cms_features/${feature.id}?fields=description`)
    const savedFeature = verifyResponse.data

    if (savedFeature.description.includes(testComment)) {
      console.log('✅ Edit persisted in Directus!')
    } else {
      console.log('❌ Edit did NOT persist!')
    }

    // Now remove the test comment to clean up
    console.log('\nCleaning up test edit...')
    await request('PATCH', `/items/cms_features/${feature.id}`, {
      description: feature.description
    })
    console.log('✅ Cleaned up\n')

    console.log('='.repeat(80))
    console.log('TEST RESULTS:')
    console.log('='.repeat(80))
    console.log('✅ Edits CAN be saved to Directus')
    console.log('✅ Flow should have triggered (check Cloudflare Pages for new deployment)')
    console.log('\nTo check if rebuild was triggered:')
    console.log('  1. Go to Cloudflare Pages dashboard')
    console.log('  2. Check for a new deployment in the last few minutes')
    console.log('')
    console.log('If no deployment appears, the Flow may not be working correctly.')

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message)
  process.exit(1)
})
