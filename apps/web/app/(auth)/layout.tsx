import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-start justify-center pt-16 pb-12 md:pt-24 md:pb-20 px-4">
        {/* 'pt-16' reduced top padding to bring content higher up as requested */}
        {children}
      </main>
      <Footer />
    </div>
  )
}
