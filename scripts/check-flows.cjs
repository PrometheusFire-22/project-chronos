#!/usr/bin/env node

/**
 * Check Directus flows and webhooks
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

  console.log('🔍 Checking Directus flows...\n')

  try {
    const response = await request('GET', '/flows')
    const flows = response.data

    if (!flows || flows.length === 0) {
      console.log('⚠️  No flows configured in Directus')
    } else {
      console.log(`Found ${flows.length} flows:\n`)
      flows.forEach(flow => {
        console.log('='.repeat(80))
        console.log(`Flow: ${flow.name}`)
        console.log(`ID: ${flow.id}`)
        console.log(`Status: ${flow.status}`)
        console.log(`Trigger: ${flow.trigger}`)
        console.log(`Options:`, JSON.stringify(flow.options, null, 2))
        console.log(`Operations: ${flow.operations?.length || 0}`)
        if (flow.operations && flow.operations.length > 0) {
          flow.operations.forEach((op, i) => {
            console.log(`  ${i + 1}. ${op.name || op.type}`)
          })
        }
        console.log('')
      })
    }

    // Check webhooks
    console.log('\n' + '='.repeat(80))
    console.log('Checking webhooks...\n')

    const webhooksResponse = await request('GET', '/webhooks')
    const webhooks = webhooksResponse.data

    if (!webhooks || webhooks.length === 0) {
      console.log('⚠️  No webhooks configured in Directus')
    } else {
      console.log(`Found ${webhooks.length} webhooks:\n`)
      webhooks.forEach(webhook => {
        console.log('='.repeat(80))
        console.log(`Webhook: ${webhook.name}`)
        console.log(`URL: ${webhook.url}`)
        console.log(`Method: ${webhook.method}`)
        console.log(`Status: ${webhook.status}`)
        console.log(`Actions: ${webhook.actions.join(', ')}`)
        console.log(`Collections: ${webhook.collections.join(', ')}`)
        console.log('')
      })
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message)
  process.exit(1)
})
