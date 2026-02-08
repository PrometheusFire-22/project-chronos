'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, User, LogOut, Settings } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@chronos/ui/components/button'
import { useSession, signOut, CustomUser } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

const NAV_LINKS = [
  { href: '/features', label: 'Features' },
  { href: '/solutions', label: 'Solutions' },
  {
    label: 'Analytics',
    children: [
      { href: '/analytics/economic', label: 'Economic' },
      { href: '/analytics/geospatial', label: 'Geospatial' }
    ]
  },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  const { data: session, isPending } = useSession()
  const user = session?.user as unknown as CustomUser | undefined
  const router = useRouter()

  const handleSignOut = async () => {
      await signOut()
      router.push('/')
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-slate-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/10 shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="container mx-auto px-4 h-24 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          {/* Using full wordmark, h-16 for maximum size. */}
          <img
            src="/logos/final/logo-wordmark-full.svg"
            alt="Automatonic AI"
            className="h-16 w-auto dark:brightness-0 dark:invert"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <div key={link.label} className="relative group">
              {link.children ? (
                <div
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                  >
                    {link.label}
                    <ChevronDown size={14} />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-1 w-48 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-3 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {isPending ? (
             <div className="h-10 w-24 bg-muted/20 animate-pulse rounded-md" />
          ) : session ? (
                     <div className="relative">
                <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 pr-3 rounded-full border border-border bg-background hover:bg-muted/50 transition-colors"
                >
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold uppercase text-base">
                        {(user?.firstName || user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{user?.firstName || user?.name?.split(' ')[0] || 'User'}</span>
                    <ChevronDown size={14} className={`text-muted-foreground transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown - Click-based */}
                {userDropdownOpen && (
                  <>
                    {/* Backdrop to close on click outside */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-xl overflow-hidden p-2">
                            <div className="px-3 py-2 border-b border-border/50 mb-2">
                                <p className="text-sm font-medium truncate">{user?.firstName || user?.name?.split(' ')[0]} {user?.lastName || user?.name?.split(' ').slice(1).join(' ')}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setUserDropdownOpen(false)
                                    window.location.href = '/settings/overview'
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors mb-1"
                            >
                                <User size={16} />
                                Overview
                            </button>
                            <button
                                onClick={() => {
                                    setUserDropdownOpen(false)
                                    window.location.href = '/settings/profile'
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors mb-1"
                            >
                                <Settings size={16} />
                                Settings
                            </button>
                            <button
                                onClick={() => {
                                    setUserDropdownOpen(false)
                                    handleSignOut()
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                  </>
                )}
             </div>
          ) : (
            <>
                <Link href="/sign-in">
                    <Button variant="ghost" className="font-medium text-muted-foreground hover:text-foreground">
                        Sign In
                    </Button>
                </Link>
                <Link href="/sign-up">
                    <Button variant="default" className="font-semibold shadow-lg shadow-primary/20">
                        Get Started
                    </Button>
                </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-border bg-background"
          >
            <div className="container px-4 py-4 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <div key={link.label}>
                  {link.children ? (
                    <div className="space-y-2">
                       <div className="text-base font-medium text-foreground py-2">{link.label}</div>
                       <div className="pl-4 border-l border-border space-y-2">
                          {link.children.map(child => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block text-sm text-muted-foreground hover:text-primary py-1"
                            >
                              {child.label}
                            </Link>
                          ))}
                       </div>
                    </div>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-base font-medium text-foreground hover:text-primary py-2"
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
              <div className="pt-4 border-t border-border space-y-3">
                  {session ? (
                      <div className="space-y-3">
                        <Link href="/settings/overview" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                          <span className="relative z-10 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-white/10">
                              {user?.image ? (
                                   <img src={user.image} alt={user.firstName || 'User'} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                  <span className="text-xs font-bold text-purple-400">
                                    {(user?.firstName || user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                                  </span>
                              )}
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium text-gray-200">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-gray-500 truncate max-w-[100px]">{user?.email}</p>
                            </div>
                          </span>
                        </Link>
                          <Link href="/settings/overview" onClick={() => setIsMobileMenuOpen(false)}>
                             <Button variant="outline" className="w-full justify-start gap-2">
                                <User size={16} /> Dashboard
                             </Button>
                          </Link>
                          <Link href="/settings/profile" onClick={() => setIsMobileMenuOpen(false)}>
                             <Button variant="outline" className="w-full justify-start gap-2">
                                <Settings size={16} /> Settings
                             </Button>
                          </Link>
                          <Button variant="destructive" className="w-full justify-start gap-2" onClick={handleSignOut}>
                             <LogOut size={16} /> Sign Out
                          </Button>
                      </div>
                  ) : (
                      <div className="grid grid-cols-2 gap-3">
                           <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
                               <Button variant="outline" className="w-full">Sign In</Button>
                           </Link>
                           <Link href="/sign-up" onClick={() => setIsMobileMenuOpen(false)}>
                               <Button className="w-full">Get Started</Button>
                           </Link>
                      </div>
                  )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
