#!/usr/bin/env node

/**
 * Get detailed info about flow operations
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

  console.log('🔍 Fetching flow details...\n')

  const flowResponse = await request('GET', '/flows/8e026d9b-081e-4d9a-af45-873521d44797')
  const flow = flowResponse.data

  console.log('='.repeat(80))
  console.log('FULL FLOW DETAILS:')
  console.log('='.repeat(80))
  console.log(JSON.stringify(flow, null, 2))
  console.log('\n')

  // Get operations separately
  console.log('='.repeat(80))
  console.log('OPERATIONS:')
  console.log('='.repeat(80))

  try {
    const opsResponse = await request('GET', '/operations?filter[flow][_eq]=8e026d9b-081e-4d9a-af45-873521d44797')
    const operations = opsResponse.data

    if (!operations || operations.length === 0) {
      console.log('❌ No operations found for this flow!')
    } else {
      console.log(`Found ${operations.length} operations:\n`)
      operations.forEach((op, i) => {
        console.log(`\nOperation ${i + 1}:`)
        console.log(JSON.stringify(op, null, 2))
      })
    }
  } catch (error) {
    console.error('Error fetching operations:', error.message)
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message)
  process.exit(1)
})
