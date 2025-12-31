import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

/**
 * Render rich text content that may be in HTML or Markdown format
 * Handles both formats gracefully and sanitizes output
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
    html = marked(content) as string
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

    html = marked(cleanedContent) as string
  } else {
    // Pure HTML - use as is
    html = content
  }

  // Sanitize HTML to prevent XSS attacks
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'b', 'i', 'u', 'a',
      'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre', 'hr', 'span', 'div'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
  })
}
