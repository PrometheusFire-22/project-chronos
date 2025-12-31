#!/usr/bin/env node

/**
 * Fix literal \n\n characters in Directus descriptions
 * Converts them to proper HTML <p> tags
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

function convertLiteralNewlines(text) {
  if (!text) return ''

  // Already has proper HTML? Skip it
  if (text.includes('<p>') && !text.includes('\\n')) {
    return text
  }

  let html = text

  // Replace literal \n\n (the four characters: backslash-n-backslash-n) with paragraph breaks
  // This handles the case where someone typed \n\n as text
  html = html.replace(/\\n\\n/g, '\n\n')

  // Now split by actual newlines to create paragraphs
  const paragraphs = html.split(/\n\n+/)

  // Wrap each paragraph in <p> tags
  html = paragraphs
    .map(para => {
      para = para.trim()
      if (!para) return ''

      // Replace single literal \n with <br>
      para = para.replace(/\\n/g, '<br>')

      // If it's already wrapped in <p>, don't double-wrap
      if (para.startsWith('<p>')) return para

      return `<p>${para}</p>`
    })
    .filter(p => p) // Remove empty paragraphs
    .join('\n')

  return html
}

async function main() {
  await login()

  console.log('🔍 Fetching all features...\n')
  const response = await request('GET', '/items/cms_features?fields=id,title,description&limit=-1')
  const features = response.data

  console.log(`Found ${features.length} features\n`)

  // Find features with literal \n\n text
  const toFix = features.filter(f => {
    return f.description && f.description.includes('\\n')
  })

  if (toFix.length === 0) {
    console.log('✅ No features with literal \\n found!')
    return
  }

  console.log(`Found ${toFix.length} features with literal \\n characters:\n`)
  toFix.forEach(f => console.log(`  - ${f.title}`))
  console.log('')

  // Convert each feature
  for (const feature of toFix) {
    const fixedDescription = convertLiteralNewlines(feature.description)

    console.log(`Converting: ${feature.title}`)
    console.log(`  Before: ${feature.description.substring(0, 100)}...`)
    console.log(`  After:  ${fixedDescription.substring(0, 100)}...`)

    try {
      await request('PATCH', `/items/cms_features/${feature.id}`, {
        description: fixedDescription
      })
      console.log(`  ✅ Updated\n`)
    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}\n`)
    }
  }

  console.log('✨ Conversion complete!')
  console.log('')
  console.log('🚀 Triggering Cloudflare Pages rebuild...')

  // Trigger rebuild
  try {
    const rebuildUrl = 'https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/bbb1dec2-0e0e-4963-880e-9b91454f6d2c'
    await new Promise((resolve, reject) => {
      const req = https.request(rebuildUrl, { method: 'POST' }, (res) => {
        let body = ''
        res.on('data', chunk => body += chunk)
        res.on('end', () => {
          if (res.statusCode === 200) {
            const result = JSON.parse(body)
            console.log(`✅ Rebuild triggered! Deployment ID: ${result.result.id}`)
            resolve()
          } else {
            reject(new Error(`Failed: ${res.statusCode}`))
          }
        })
      })
      req.on('error', reject)
      req.end()
    })
  } catch (error) {
    console.error('⚠️  Failed to trigger rebuild:', error.message)
  }

  console.log('')
  console.log('⏱️  Wait 2-3 minutes, then check https://automatonicai.com/')
}

main().catch(error => {
  console.error('❌ Error:', error.message)
  process.exit(1)
})
