import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { SettingsNav } from "@/components/layout/SettingsNav"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col font-sans selection:bg-primary/30">
        {/* Background Gradients handled in RootLayout now */}

        <Header />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Sidebar */}
                <aside className="lg:w-64 flex-shrink-0">
                    <div className="sticky top-24">
                        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-sm">
                            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-4">
                                Settings
                            </h2>
                            <SettingsNav />
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {children}
                </div>
            </div>
        </main>

        <Footer />
    </div>
  )
}
