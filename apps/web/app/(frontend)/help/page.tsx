import { Metadata } from 'next'
import Link from 'next/link'
import { LifeBuoy, ArrowLeft, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Help Center - Coming Soon | Chronos',
  description: 'Our comprehensive help center is coming soon. Get in touch if you need assistance.',
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Back to Home Link */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            {/* Icon */}
            <div className="mb-8 inline-flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <div className="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <LifeBuoy className="w-12 h-12 text-primary" />
                </div>
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
              Help Center
              <span className="block text-2xl sm:text-3xl mt-4 text-zinc-400 font-normal">
                Coming Soon
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg text-zinc-400 mb-12 leading-relaxed">
              We're building a comprehensive help center to assist you with all your questions.
              In the meantime, feel free to reach out to us directly.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-primary/90 transition-all"
              >
                <Mail className="h-4 w-4" />
                Contact Us
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/5 transition-all"
              >
                Return Home
              </Link>
            </div>

            {/* Additional Info */}
            <div className="mt-16 pt-8 border-t border-white/10">
              <p className="text-sm text-zinc-500">
                Looking for something specific? Check out our{' '}
                <Link href="/blog" className="text-primary hover:underline">
                  blog
                </Link>
                {' '}for guides and updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
