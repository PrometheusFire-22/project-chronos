import type { Metadata } from 'next'
import { Mail, MapPin, Clock, Phone } from 'lucide-react'
import { ContactForm } from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact — Clawdacious',
  description: 'Get in touch with Clawdacious. AI assistant setup for GTA small businesses.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-24">

        <div className="max-w-4xl mx-auto mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-red-400">
              Get in Touch
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Ready to set up your AI assistant? Let&apos;s talk. No pitch, no pressure.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 shrink-0">
                <Mail className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Email</h3>
                <a href="mailto:geoff@clawdacious.com" className="text-muted-foreground hover:text-red-400 transition-colors">
                  geoff@clawdacious.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 shrink-0">
                <Phone className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                <a href="tel:+14168246865" className="text-muted-foreground hover:text-red-400 transition-colors">
                  (416) 824-6865
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 shrink-0">
                <Clock className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Response time</h3>
                <p className="text-muted-foreground">Within 24 hours</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 shrink-0">
                <MapPin className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Location</h3>
                <p className="text-muted-foreground">Greater Toronto Area, Canada</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <ContactForm />

        </div>
      </div>
    </div>
  )
}
