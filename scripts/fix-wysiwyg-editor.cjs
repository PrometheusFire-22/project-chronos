#!/usr/bin/env node

/**
 * Fix the description field to use proper WYSIWYG editor
 *
 * The current interface is "input-rich-text-html" which shows HTML code.
 * We need to change it to "input-rich-text-md" or another WYSIWYG option.
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

  console.log('🔍 Current field configuration:\n')

  const currentResponse = await request('GET', '/fields/cms_features/description')
  const currentField = currentResponse.data

  console.log('Interface:', currentField.meta?.interface || 'NOT SET')
  console.log('Display:', currentField.meta?.display || 'NOT SET')
  console.log('')

  // List of possible WYSIWYG interfaces to try
  const interfacesToTry = [
    { name: 'input-rich-text-md', desc: 'Markdown WYSIWYG Editor' },
    { name: 'wysiwyg', desc: 'WYSIWYG Editor' },
    { name: 'input-code', desc: 'Code Editor (with options for HTML)' }
  ]

  console.log('Available WYSIWYG interface options:')
  interfacesToTry.forEach((iface, i) => {
    console.log(`  ${i + 1}. ${iface.name} - ${iface.desc}`)
  })
  console.log('')

  // Let's try updating to WYSIWYG interface
  console.log('🔧 Attempting to update to proper WYSIWYG editor...\n')

  // First, try the standard WYSIWYG interface
  try {
    const updateData = {
      meta: {
        ...currentField.meta,
        interface: 'wysiwyg',
        options: {
          toolbar: [
            'bold',
            'italic',
            'underline',
            'removeformat',
            'bullist',
            'numlist',
            'link',
            'code',
            'blockquote'
          ]
        }
      }
    }

    console.log('Trying "wysiwyg" interface...')
    await request('PATCH', '/fields/cms_features/description', updateData)
    console.log('✅ Updated to wysiwyg interface!\n')

    // Verify the update
    const verifyResponse = await request('GET', '/fields/cms_features/description')
    console.log('New configuration:')
    console.log('  Interface:', verifyResponse.data.meta?.interface)
    console.log('  Options:', JSON.stringify(verifyResponse.data.meta?.options || {}, null, 2))

  } catch (error) {
    console.error('❌ Failed to update with wysiwyg interface:', error.message)
    console.log('\nLet me try input-rich-text-md instead...\n')

    try {
      const updateData = {
        meta: {
          ...currentField.meta,
          interface: 'input-rich-text-md',
          options: {}
        }
      }

      await request('PATCH', '/fields/cms_features/description', updateData)
      console.log('✅ Updated to input-rich-text-md interface!\n')

      const verifyResponse = await request('GET', '/fields/cms_features/description')
      console.log('New configuration:')
      console.log('  Interface:', verifyResponse.data.meta?.interface)

    } catch (error2) {
      console.error('❌ Also failed with input-rich-text-md:', error2.message)
      console.log('\nThe current "input-rich-text-html" interface might be the best available option.')
      console.log('This interface shows HTML code, not a visual editor.')
    }
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message)
  process.exit(1)
})
