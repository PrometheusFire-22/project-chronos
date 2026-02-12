import { ThemeProvider } from '@/components/providers/ThemeProvider'
import './globals.css'

export const metadata = {
  title: 'Project Chronos',
  description: 'Multi-modal relationship intelligence for private markets',
  icons: {
    icon: '/favicons/android-chrome-192x192.png',
    apple: '/favicons/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__name = function(func, name) { return Object.defineProperty(func, 'name', { value: name, configurable: true }); };`,
          }}
        />

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Global Background Gradients (Harmonized Theme) */}
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-background to-background pointer-events-none dark:opacity-100 opacity-0 z-0" />
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100/20 via-background to-background pointer-events-none dark:opacity-0 opacity-100 z-0" />
          <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] dark:opacity-20 opacity-5 pointer-events-none z-0" />

          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
