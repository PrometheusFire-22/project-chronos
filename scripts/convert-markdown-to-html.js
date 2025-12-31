#!/usr/bin/env node

/**
 * Convert Markdown-style content to HTML in Directus
 *
 * This script:
 * 1. Fetches all cms_features from Directus
 * 2. Detects which have markdown syntax (\n\n, **, etc.)
 * 3. Converts markdown to HTML
 * 4. Updates the items in Directus
 *
 * Usage:
 *   DIRECTUS_TOKEN=your_token node scripts/convert-markdown-to-html.js
 *
 * Get your token from: Directus → Settings → Access Tokens
 */

const https = require('https')

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://admin.automatonicai.com'
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN

if (!DIRECTUS_TOKEN) {
  console.error('❌ Error: DIRECTUS_TOKEN environment variable is required')
  console.error('')
  console.error('Get your token from: Directus → Settings → Access Tokens → Create New Token')
  console.error('')
  console.error('Then run:')
  console.error('  DIRECTUS_TOKEN=your_token node scripts/convert-markdown-to-html.js')
  process.exit(1)
}

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
function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, DIRECTUS_URL)

    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
        'Content-Type': 'application/json',
      },
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
 * Main function
 */
async function main() {
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
