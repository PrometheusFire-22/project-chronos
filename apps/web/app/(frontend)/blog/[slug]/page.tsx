import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { fetchDirectus, buildQuery } from '@/lib/directus/client'
import { BlogPost, DirectusCollectionResponse } from '@/lib/directus/types'
import { renderRichText } from '@/lib/content-renderer'
import { Calendar, Clock, ArrowLeft, User } from 'lucide-react'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

// Allow pages to be generated beyond those returned by generateStaticParams
// Set to true to enable runtime generation on Cloudflare Pages
export const dynamicParams = true

// Generate static paths for all published blog posts
export async function generateStaticParams() {
  try {
    const query = buildQuery({
      filter: {
        status: { _eq: 'published' },
      },
      fields: ['slug'],
      limit: -1, // Get all posts
    })

    const { data: posts } = await fetchDirectus<DirectusCollectionResponse<BlogPost>>(
      `/items/cms_blog_posts${query}`,
      {
        revalidate: 0, // Always fetch fresh data during build
      }
    )

    // If no posts exist, return empty array
    // The blog listing will show "No posts yet" message
    return posts.map((post) => ({
      slug: post.slug,
    }))
  } catch (error) {
    console.warn('Failed to fetch blog posts during build:', error)
    // Return empty array if fetch fails - blog listing will still work
    return []
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    return {
      title: 'Post Not Found | Chronos',
    }
  }

  return {
    title: `${post.title} | Chronos Blog`,
    description: post.excerpt || post.meta_description || `Read ${post.title} on the Chronos blog`,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || undefined,
      type: 'article',
      publishedTime: post.published_at || post.created_at,
      authors: post.author ? [post.author] : undefined,
      images: post.og_image || post.featured_image ? [
        {
          url: post.og_image || post.featured_image || '',
          alt: post.title,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || undefined,
      images: post.og_image || post.featured_image ? [post.og_image || post.featured_image || ''] : undefined,
    },
  }
}

async function getPost(slug: string): Promise<BlogPost | null> {
  const query = buildQuery({
    filter: {
      slug: { _eq: slug },
      status: { _eq: 'published' },
      published_at: { _lte: '$NOW' },
    },
    fields: ['*'],
    limit: 1,
  })

  const { data: posts } = await fetchDirectus<DirectusCollectionResponse<BlogPost>>(
    `/items/cms_blog_posts${query}`,
    {
      revalidate: 3600, // 1 hour
      tags: [`blog-post-${slug}`],
    }
  )

  return posts[0] || null
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date(post.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Back to Blog Link */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>
      </div>

      {/* Article Header */}
      <article className="relative py-12 sm:py-20">
        <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Category Badge */}
            {post.category && (
              <div className="mb-6">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  {post.category}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-zinc-400 mb-8">
                {post.excerpt}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500 pb-8 border-b border-white/10">
              {post.author && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{publishedDate}</span>
              </div>
              {post.read_time_minutes && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{post.read_time_minutes} min read</span>
                </div>
              )}
            </div>

            {/* Featured Image */}
            {post.featured_image && (
              <div className="my-12 rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Article Content */}
            <div
              className="prose prose-invert prose-lg max-w-none
                prose-headings:font-bold prose-headings:tracking-tight
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-zinc-300 prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-white prose-strong:font-semibold
                prose-code:text-primary prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-slate-800 prose-pre:border prose-pre:border-white/10
                prose-blockquote:border-l-primary prose-blockquote:text-zinc-400
                prose-img:rounded-xl prose-img:border prose-img:border-white/10
                prose-ul:text-zinc-300
                prose-ol:text-zinc-300
                prose-li:marker:text-primary"
              dangerouslySetInnerHTML={{ __html: renderRichText(post.content) }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-white/10">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-xs text-zinc-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author Bio */}
            {post.author && (
              <div className="mt-12 p-6 rounded-2xl border border-white/10 bg-slate-900/50">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {post.author}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      Author
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to all posts
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
