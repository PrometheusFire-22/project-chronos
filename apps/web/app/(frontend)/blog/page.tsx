import { Metadata } from 'next'
import Link from 'next/link'
import { fetchDirectus, buildQuery } from '@/lib/directus/client'
import { BlogPost, DirectusCollectionResponse } from '@/lib/directus/types'
import { renderRichText } from '@/lib/content-renderer'
import { Calendar, Clock, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog | Chronos',
  description: 'Insights, updates, and best practices for relationship intelligence in private markets.',
  openGraph: {
    title: 'Blog | Chronos',
    description: 'Insights, updates, and best practices for relationship intelligence in private markets.',
  },
}

export default async function BlogListingPage() {
  // Fetch published blog posts from Directus
  let posts: BlogPost[] = []

  try {
    const query = buildQuery({
      filter: {
        status: { _eq: 'published' },
        published_at: { _lte: '$NOW' },
      },
      sort: ['-published_at', '-created_at'],
      fields: ['*'],
      limit: 50,
    })

    const { data } = await fetchDirectus<DirectusCollectionResponse<BlogPost>>(
      `/items/cms_blog_posts${query}`,
      {
        revalidate: 0, // No cache on error
        tags: ['blog-posts'],
      }
    )
    posts = data
  } catch (error) {
    console.error('Failed to fetch blog posts from Directus:', error)
    // Fallback to empty list so build succeeds
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-32">
        <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
              Blog
            </h1>
            <p className="text-lg sm:text-xl text-zinc-400">
              Insights, updates, and best practices for relationship intelligence in private markets.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="pb-20 sm:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center py-16">
              <p className="text-zinc-400 text-lg">
                No blog posts yet. Check back soon for insights and updates!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {posts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function BlogPostCard({ post }: { post: BlogPost }) {
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
    <Link
      href={`/blog/${post.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur transition-all hover:border-primary/50 hover:bg-slate-900/70 hover:shadow-2xl hover:shadow-primary/10"
    >
      {/* Featured Image */}
      {post.featured_image && (
        <div className="aspect-video overflow-hidden bg-slate-800">
          <img
            src={post.featured_image}
            alt={post.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        {/* Category Badge */}
        {post.category && (
          <div className="mb-3">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {post.category}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="mb-2 text-xl font-semibold text-white group-hover:text-primary transition-colors">
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="mb-4 text-sm text-zinc-400 line-clamp-3">
            {post.excerpt}
          </p>
        )}

        {/* Meta Info */}
        <div className="mt-auto flex flex-wrap items-center gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{publishedDate}</span>
          </div>
          {post.read_time_minutes && (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{post.read_time_minutes} min read</span>
            </div>
          )}
        </div>

        {/* Read More Arrow */}
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
          Read more
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>

      {/* Featured Badge */}
      {post.featured && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow-lg">
            Featured
          </span>
        </div>
      )}
    </Link>
  )
}
