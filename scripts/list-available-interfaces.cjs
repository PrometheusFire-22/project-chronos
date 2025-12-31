#!/usr/bin/env node

/**
 * List all available interfaces in Directus
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

  // Get server info
  try {
    const serverInfo = await request('GET', '/server/info')
    console.log('Directus Version:', serverInfo.data?.project?.directus || 'Unknown')
    console.log('')
  } catch (e) {
    console.log('Could not fetch server info')
  }

  // Try to list extensions/interfaces
  try {
    const extensionsResponse = await request('GET', '/extensions')
    console.log('='.repeat(80))
    console.log('INSTALLED EXTENSIONS:')
    console.log('='.repeat(80))

    if (extensionsResponse.data) {
      const interfaces = extensionsResponse.data.interfaces || []
      console.log(`\nInterfaces (${interfaces.length}):`)
      interfaces.forEach(iface => {
        console.log(`  - ${iface.id}: ${iface.name || 'No name'}`)
      })
    }
  } catch (e) {
    console.log('Could not fetch extensions:', e.message)
  }

  // List all fields across collections to see what interfaces are in use
  console.log('\n' + '='.repeat(80))
  console.log('INTERFACES IN USE ACROSS ALL COLLECTIONS:')
  console.log('='.repeat(80))

  const collectionsResponse = await request('GET', '/collections')
  const collections = collectionsResponse.data

  const interfacesInUse = new Set()

  for (const collection of collections.filter(c => !c.meta?.hidden && !c.collection.startsWith('directus_'))) {
    const fieldsResponse = await request('GET', `/fields/${collection.collection}`)
    const fields = fieldsResponse.data

    fields.forEach(field => {
      if (field.meta?.interface) {
        interfacesInUse.add(field.meta.interface)
      }
    })
  }

  console.log('\nAll unique interfaces currently in use:')
  Array.from(interfacesInUse).sort().forEach(iface => {
    console.log(`  - ${iface}`)
  })
}

main().catch(error => {
  console.error('❌ Error:', error.message)
  process.exit(1)
})
