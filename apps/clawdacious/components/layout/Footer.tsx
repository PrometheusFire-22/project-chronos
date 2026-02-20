import Link from 'next/link'
import { Github, Linkedin } from 'lucide-react'

const XIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
)

const FOOTER_LINKS = {
  services: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  resources: [
    { label: 'Blog', href: '/blog' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
}

export function Footer() {
  return (
    <footer className="relative z-10 overflow-hidden bg-[#0F1117] text-slate-200">
      {/* Red/pink glow gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-red-900/30 via-transparent to-transparent pointer-events-none" />

      <div className="relative container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3 font-bold text-xl text-white">
              <img
                src="/logos/cornelius-consierge.png"
                alt="Clawdacious"
                className="h-10 w-10 rounded-full"
              />
              <span>Clawdacious</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              AI assistant setup and automation consulting for businesses. The AI that actually does things.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <Link href="https://github.com/PrometheusFire-22/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-400 transition-colors" aria-label="Github">
                <Github size={20} />
              </Link>
              <Link href="https://x.com/AutomatonicAI" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-400 transition-colors" aria-label="X (Twitter)">
                <XIcon size={20} />
              </Link>
              <Link href="https://www.linkedin.com/in/geoffbevans/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-400 transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Services</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-red-400 transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-red-400 transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-red-400 transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Clawdacious. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
