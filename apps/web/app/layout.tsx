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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof globalThis !== 'undefined') {
                if (!(globalThis).__name) {
                  globalThis.__name = function(target, value) {
                    Object.defineProperty(target, 'name', { value: value, configurable: true });
                    return target;
                  };
                }
              }
            `,
          }}
        />
      </head>
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
