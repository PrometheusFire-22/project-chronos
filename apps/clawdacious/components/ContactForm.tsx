'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Send } from 'lucide-react'

const inputClass =
  'w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all'

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to send message')

      setStatus('success')
      setFormData({ name: '', email: '', company: '', subject: '', message: '' })
    } catch {
      setStatus('error')
      setErrorMessage(
        'Failed to send message. Please try emailing us directly at geoff@clawdacious.com'
      )
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  if (status === 'success') {
    return (
      <div className="p-8 rounded-xl bg-card border border-border">
        <div className="p-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <h3 className="text-emerald-500 dark:text-emerald-400 font-semibold mb-2">
            Message Sent!
          </h3>
          <p className="text-muted-foreground">
            Thank you. I'll get back to you within 24 hours.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-4 text-sm text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 transition-colors"
          >
            Send another message
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 rounded-xl bg-card border border-border">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="cf-name" className="block text-sm font-medium text-foreground mb-2">
              Name *
            </label>
            <input
              type="text"
              id="cf-name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className={inputClass}
              placeholder="Your full name"
            />
          </div>
          <div>
            <label htmlFor="cf-email" className="block text-sm font-medium text-foreground mb-2">
              Email *
            </label>
            <input
              type="email"
              id="cf-email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="cf-company"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Company
            </label>
            <input
              type="text"
              id="cf-company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className={inputClass}
              placeholder="Your business name"
            />
          </div>
          <div>
            <label
              htmlFor="cf-subject"
              className="block text-sm font-medium text-foreground mb-2"
            >
              I&apos;m interested in... *
            </label>
            <select
              id="cf-subject"
              name="subject"
              required
              value={formData.subject}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select a topic</option>
              <option value="ai-setup">AI Assistant Setup</option>
              <option value="ongoing-support">Ongoing Support</option>
              <option value="custom-integration">Custom Integration</option>
              <option value="general">General Inquiry</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="cf-message"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Message *
          </label>
          <textarea
            id="cf-message"
            name="message"
            required
            value={formData.message}
            onChange={handleChange}
            rows={5}
            className={`${inputClass} resize-none`}
            placeholder="Tell me about your business and what you're looking for..."
          />
        </div>

        {status === 'error' && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-sm">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full px-6 py-4 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {status === 'loading' ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Message
            </>
          )}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          By submitting, you agree to our{' '}
          <Link href="/privacy" className="text-red-400 hover:text-red-300">
            Privacy Policy
          </Link>
        </p>
      </form>
    </div>
  )
}
