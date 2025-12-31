#!/usr/bin/env node

/**
 * Convert Markdown-style content to HTML in Directus
 *
 * This script:
 * 1. Logs in to Directus with admin credentials
 * 2. Fetches all cms_features from Directus
 * 3. Detects which have markdown syntax (\n\n, **, etc.)
 * 4. Converts markdown to HTML
 * 5. Updates the items in Directus
 *
 * Usage:
 *   DIRECTUS_EMAIL=your@email.com DIRECTUS_PASSWORD=yourpass node scripts/convert-markdown-to-html.cjs
 */

const https = require('https')

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://admin.automatonicai.com'
const DIRECTUS_EMAIL = process.env.DIRECTUS_EMAIL
const DIRECTUS_PASSWORD = process.env.DIRECTUS_PASSWORD

if (!DIRECTUS_EMAIL || !DIRECTUS_PASSWORD) {
  console.error('❌ Error: DIRECTUS_EMAIL and DIRECTUS_PASSWORD environment variables are required')
  console.error('')
  console.error('Usage:')
  console.error('  DIRECTUS_EMAIL=your@email.com DIRECTUS_PASSWORD=yourpass node scripts/convert-markdown-to-html.cjs')
  process.exit(1)
}

let authToken = null

/**
 * Convert markdown to HTML
 */
function markdownToHtml(markdown) {
  if (!markdown) return ''

  // If already HTML, return as-is
  if (markdown.includes('<p>') || markdown.includes('<strong>')) {
    return markdown
  }

  let html = markdown

  // Convert **bold** to <strong>bold</strong>
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

  // Convert *italic* to <em>italic</em>
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')

  // Split by double newlines (paragraphs)
  const paragraphs = html.split(/\n\n+/)

  // Wrap each paragraph in <p> tags
  html = paragraphs
    .map(para => {
      // Replace single newlines with <br>
      para = para.replace(/\n/g, '<br>')
      return `<p>${para.trim()}</p>`
    })
    .join('\n')

  return html
}

/**
 * Make HTTP request
 */
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

/**
 * Login to Directus
 */
async function login() {
  console.log('🔐 Logging in to Directus...')

  try {
    const response = await request('POST', '/auth/login', {
      email: DIRECTUS_EMAIL,
      password: DIRECTUS_PASSWORD,
    }, false) // Don't use auth for login request

    authToken = response.data.access_token
    console.log('✅ Logged in successfully\n')
  } catch (error) {
    console.error('❌ Login failed:', error.message)
    console.error('   Check your DIRECTUS_EMAIL and DIRECTUS_PASSWORD')
    process.exit(1)
  }
}

/**
 * Main function
 */
async function main() {
  // Login first
  await login()

  console.log('🔍 Fetching features from Directus...\n')

  // Fetch all features
  const response = await request('GET', '/items/cms_features?fields=id,title,description,category')
  const features = response.data

  console.log(`Found ${features.length} features\n`)

  // Find features with markdown-style content
  const toConvert = features.filter(feature => {
    const desc = feature.description || ''
    return (
      desc.includes('\\n\\n') ||
      desc.includes('**') ||
      (!desc.includes('<p>') && desc.includes('\n\n'))
    )
  })

  if (toConvert.length === 0) {
    console.log('✅ All features already have HTML formatting!')
    return
  }

  console.log(`Found ${toConvert.length} features to convert:\n`)
  toConvert.forEach(f => console.log(`  - ${f.title}`))
  console.log('')

  // Convert and update each feature
  for (const feature of toConvert) {
    const htmlDescription = markdownToHtml(feature.description)

    console.log(`Converting: ${feature.title}`)
    console.log(`  Before: ${feature.description.substring(0, 80)}...`)
    console.log(`  After:  ${htmlDescription.substring(0, 80)}...\n`)

    try {
      await request('PATCH', `/items/cms_features/${feature.id}`, {
        description: htmlDescription
      })
      console.log(`  ✅ Updated\n`)
    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}\n`)
    }
  }

  console.log('✨ Done! Your Directus webhook will trigger a rebuild automatically.')
  console.log('   Wait 2-3 minutes and check your site.')
}

// Run the script
main().catch(error => {
  console.error('❌ Error:', error.message)
  process.exit(1)
})
