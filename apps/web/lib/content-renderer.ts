import { marked } from 'marked'

/**
 * Render rich text content that may be in HTML or Markdown format
 * Handles both formats gracefully and provides basic XSS protection
 *
 * Note: This runs during Next.js static generation (SSR), so we use
 * a simple sanitization approach instead of DOMPurify to avoid issues.
 */
export function renderRichText(content: string): string {
  if (!content) return ''

  // Check if content is already HTML (contains HTML tags)
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content)

  // Check if content has markdown syntax (## headers, **bold**, etc.)
  const hasMarkdownSyntax = /^#{1,6}\s/m.test(content) || /\*\*[^*]+\*\*/g.test(content)

  let html: string

  if (hasMarkdownSyntax && !hasHtmlTags) {
    // Pure markdown - convert to HTML
    html = marked(content, {
      async: false,
      gfm: true,
      breaks: true
    }) as string
  } else if (hasHtmlTags && hasMarkdownSyntax) {
    // Mixed content - has HTML tags but also markdown
    // This happens when markdown editor wraps markdown in <p> tags
    // Extract content from <p> tags and re-render as markdown
    const cleanedContent = content
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/&mdash;/g, '—')
      .replace(/&rarr;/g, '→')
      .trim()

    html = marked(cleanedContent, {
      async: false,
      gfm: true,
      breaks: true
    }) as string
  } else {
    // Pure HTML - use as is
    html = content
  }

  // Basic sanitization: remove script tags and dangerous attributes
  // This is safe since content comes from our own Directus CMS
  html = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')

  return html
}
