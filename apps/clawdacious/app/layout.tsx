import { ThemeProvider } from '@/components/providers/ThemeProvider'
import './globals.css'

export const metadata = {
  title: 'Clawdacious - AI Assistant Setup & Automation Consulting',
  description: 'Expert AI assistant setup, automation consulting, and custom integrations for businesses. The AI that actually does things.',
  icons: {
    icon: '/logos/cornelius-consierge.png',
    apple: '/logos/cornelius-consierge.png',
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
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Global Background Gradients */}
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-background to-background pointer-events-none dark:opacity-100 opacity-0 z-0" />
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-100/20 via-background to-background pointer-events-none dark:opacity-0 opacity-100 z-0" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
