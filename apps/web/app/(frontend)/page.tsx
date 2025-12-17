import { Button } from '@chronos/ui/components/button'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Project Chronos
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
          Advanced financial analytics powered by graph-based intelligence.
          Make data-driven decisions with confidence.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Button size="lg" className="font-semibold shadow-lg shadow-primary/20">
            Get Started
          </Button>
          <Button size="lg" variant="outline" className="font-semibold">
            Learn More
          </Button>
        </div>

        <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">🚀 Fast & Reliable</h3>
            <p className="text-sm text-muted-foreground">
              Built with Next.js 15 and React 19 for optimal performance.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">🎨 Modern Design</h3>
            <p className="text-sm text-muted-foreground">
              Beautiful UI components with Tailwind CSS and dark mode support.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">📊 Data-Driven</h3>
            <p className="text-sm text-muted-foreground">
              Powerful analytics and insights for your financial data.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
