import Link from 'next/link'

interface PlaceholderPageProps {
  title: string
  description: string
  icon?: string
}

export function PlaceholderPage({ title, description, icon = '🚧' }: PlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8 text-6xl">{icon}</div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          {title}
        </h1>
        <p className="text-xl text-slate-400 mb-8 leading-relaxed">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-block px-8 py-4 rounded-lg bg-violet-500 text-white font-medium hover:bg-violet-600 transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/features"
            className="inline-block px-8 py-4 rounded-lg border border-slate-700 text-white font-medium hover:bg-slate-800 transition-colors"
          >
            View Features
          </Link>
        </div>
      </div>
    </div>
  )
}
