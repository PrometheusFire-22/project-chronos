#!/usr/bin/env node

/**
 * Try to update description field to use WYSIWYG editor
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

async function updateFieldInterface(collectionName, fieldName, interfaceType) {
  console.log(`Attempting to update ${collectionName}.${fieldName} to ${interfaceType}...`)

  try {
    // Get current field config
    const currentResponse = await request('GET', `/fields/${collectionName}/${fieldName}`)
    const currentField = currentResponse.data

    // Update the interface
    const updateData = {
      meta: {
        ...currentField.meta,
        interface: interfaceType,
        options: interfaceType === 'input-rich-text-md' ? {} : currentField.meta.options
      }
    }

    await request('PATCH', `/fields/${collectionName}/${fieldName}`, updateData)
    console.log(`✅ Updated to ${interfaceType}!`)
    return true
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`)
    return false
  }
}

async function main() {
  await login()

  console.log('Current interface: input-rich-text-html (shows raw HTML code)\n')
  console.log('='.repeat(80))
  console.log('TESTING DIFFERENT INTERFACES:\n')
  console.log('='.repeat(80))

  // Try different interfaces in order of preference
  const interfacesToTry = [
    'input-rich-text-md', // Markdown with WYSIWYG toolbar - most likely to work
  ]

  for (const iface of interfacesToTry) {
    console.log(`\n${'-'.repeat(80)}`)
    const success = await updateFieldInterface('cms_features', 'description', iface)

    if (success) {
      console.log('\n' + '='.repeat(80))
      console.log('✅ SUCCESS!')
      console.log('='.repeat(80))
      console.log(`\nThe description field has been updated to: ${iface}`)
      console.log('\nNOTE: Your content is currently in HTML format.')
      console.log('With input-rich-text-md, you can still edit HTML but also use Markdown syntax.')
      console.log('\nThe editor will show a toolbar with formatting buttons (Bold, Italic, etc.)')
      console.log('instead of raw HTML code.\n')

      // Verify
      const verifyResponse = await request('GET', '/fields/cms_features/description')
      console.log('Verified interface:', verifyResponse.data.meta?.interface)

      break
    }
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message)
  process.exit(1)
})
