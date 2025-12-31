#!/usr/bin/env node

/**
 * Verify what's actually in Directus right now
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

    const headers = {
      'Content-Type': 'application/json',
    }

    if (useAuth && authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }

    const options = {
      method,
      headers,
    }

    const req = https.request(url, options, (res) => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body))
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`))
        }
      })
    })

    req.on('error', reject)

    if (data) {
      req.write(JSON.stringify(data))
    }

    req.end()
  })
}

async function login() {
  console.log('🔐 Logging in to Directus...\n')

  try {
    const response = await request('POST', '/auth/login', {
      email: DIRECTUS_EMAIL,
      password: DIRECTUS_PASSWORD,
    }, false)

    authToken = response.data.access_token
    console.log('✅ Logged in successfully\n')
  } catch (error) {
    console.error('❌ Login failed:', error.message)
    process.exit(1)
  }
}

async function main() {
  await login()

  console.log('🔍 Fetching features from Directus...\n')

  const response = await request('GET', '/items/cms_features?fields=id,title,description&limit=5')
  const features = response.data

  console.log(`Found ${features.length} features (showing first 5):\n`)

  features.forEach((feature, index) => {
    console.log(`\n${'='.repeat(80)}`)
    console.log(`Feature ${index + 1}: ${feature.title}`)
    console.log(`${'='.repeat(80)}`)
    console.log('\nDESCRIPTION CONTENT:')
    console.log(feature.description)
    console.log('\nFORMAT CHECK:')
    console.log(`  - Contains <p> tags: ${feature.description.includes('<p>')}`)
    console.log(`  - Contains <strong> tags: ${feature.description.includes('<strong>')}`)
    console.log(`  - Contains ** markdown: ${feature.description.includes('**')}`)
    console.log(`  - Contains \\n\\n newlines: ${feature.description.includes('\n\n')}`)
  })
}

main().catch(error => {
  console.error('❌ Error:', error.message)
  process.exit(1)
})
