#!/usr/bin/env node

/**
 * Check the field configuration for cms_features in Directus
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
          resolve(JSON.parse(body))
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

  console.log('🔍 Fetching field configuration for cms_features...\n')

  try {
    // Get the collection fields
    const response = await request('GET', '/fields/cms_features')
    const fields = response.data

    console.log('Fields in cms_features collection:\n')

    // Look for the description field
    const descriptionField = fields.find(f => f.field === 'description')

    if (descriptionField) {
      console.log('='.repeat(80))
      console.log('DESCRIPTION FIELD CONFIGURATION:')
      console.log('='.repeat(80))
      console.log(JSON.stringify(descriptionField, null, 2))
      console.log('\n')
      console.log('Interface Type:', descriptionField.meta?.interface || 'NOT SET')
      console.log('Display:', descriptionField.meta?.display || 'NOT SET')
      console.log('Field Type:', descriptionField.type)
      console.log('Options:', JSON.stringify(descriptionField.meta?.options || {}, null, 2))
    } else {
      console.log('❌ Description field not found!')
    }

    // List all fields and their interfaces
    console.log('\n' + '='.repeat(80))
    console.log('ALL FIELDS:')
    console.log('='.repeat(80))
    fields.forEach(field => {
      console.log(`- ${field.field}: ${field.meta?.interface || 'no interface'} (${field.type})`)
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message)
  process.exit(1)
})
