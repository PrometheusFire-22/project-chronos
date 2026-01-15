import { ThemeProvider } from '@/components/providers/ThemeProvider'
import ClientPolyfills from '@/components/ClientPolyfills'
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
        <ClientPolyfills />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
