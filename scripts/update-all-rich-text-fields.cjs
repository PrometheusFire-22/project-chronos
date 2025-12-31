#!/usr/bin/env node

/**
 * Update all rich text HTML fields to markdown interface
 * for better user experience
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

  console.log('🔍 Finding all fields using input-rich-text-html...\n')

  // Collections that likely have rich text fields
  const collectionsToCheck = [
    'cms_announcements',
    'cms_blog_posts',
    'cms_docs_pages',
    'cms_features',
    'cms_homepage_hero',
    'cms_legal_pages'
  ]

  const fieldsToUpdate = []

  for (const collection of collectionsToCheck) {
    try {
      const fieldsResponse = await request('GET', `/fields/${collection}`)
      const fields = fieldsResponse.data

      fields.forEach(field => {
        if (field.meta?.interface === 'input-rich-text-html') {
          fieldsToUpdate.push({
            collection,
            field: field.field,
            currentInterface: field.meta.interface
          })
        }
      })
    } catch (error) {
      console.log(`⚠️  Could not check ${collection}: ${error.message}`)
    }
  }

  if (fieldsToUpdate.length === 0) {
    console.log('✅ No fields found using input-rich-text-html (all already updated!)')
    return
  }

  console.log(`Found ${fieldsToUpdate.length} fields to update:\n`)
  fieldsToUpdate.forEach(f => {
    console.log(`  - ${f.collection}.${f.field}`)
  })
  console.log('')

  console.log('🔧 Updating fields to input-rich-text-md...\n')

  for (const fieldInfo of fieldsToUpdate) {
    try {
      const currentResponse = await request('GET', `/fields/${fieldInfo.collection}/${fieldInfo.field}`)
      const currentField = currentResponse.data

      await request('PATCH', `/fields/${fieldInfo.collection}/${fieldInfo.field}`, {
        meta: {
          ...currentField.meta,
          interface: 'input-rich-text-md'
        }
      })

      console.log(`✅ ${fieldInfo.collection}.${fieldInfo.field}`)
    } catch (error) {
      console.log(`❌ ${fieldInfo.collection}.${fieldInfo.field}: ${error.message}`)
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('DONE!')
  console.log('='.repeat(80))
  console.log('\nAll rich text fields have been updated to use the Markdown editor.')
  console.log('This provides a much better editing experience with:')
  console.log('  - Visual toolbar with formatting buttons')
  console.log('  - Live preview of formatted text')
  console.log('  - Support for both HTML and Markdown syntax')
  console.log('\nYou can now edit content in Directus with a user-friendly interface!')
}

main().catch(error => {
  console.error('❌ Error:', error.message)
  process.exit(1)
})
