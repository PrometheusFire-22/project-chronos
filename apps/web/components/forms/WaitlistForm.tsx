'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@chronos/ui/components/button'
import { Turnstile } from '@marsidev/react-turnstile'

// Form validation schema
const waitlistFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  company: z.string().max(255).optional(),
  role: z.string().max(255).optional(),
  heardFrom: z.string().max(255).optional(),
})

type WaitlistFormData = z.infer<typeof waitlistFormSchema>

type SubmissionState = 'idle' | 'submitting' | 'success' | 'error'

export function WaitlistForm() {
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistFormSchema),
  })

  const onSubmit = async (data: WaitlistFormData) => {
    // Validate CAPTCHA token
    if (!captchaToken) {
      setErrorMessage('Please complete the CAPTCHA verification')
      return
    }

    setSubmissionState('submitting')
    setErrorMessage('')

    try {
      // Capture UTM parameters from URL if present
      const urlParams = new URLSearchParams(window.location.search)
      const utmSource = urlParams.get('utm_source')
      const utmMedium = urlParams.get('utm_medium')
      const utmCampaign = urlParams.get('utm_campaign')

      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          company: data.company || null,
          role: data.role || null,
          heard_from: data.heardFrom || null,
          source: 'website',
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          captcha_token: captchaToken,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit form')
      }

      setSubmissionState('success')
      reset()
      setCaptchaToken(null) // Reset CAPTCHA
    } catch (error) {
      console.error('Waitlist submission error:', error)
      setSubmissionState('error')
      setErrorMessage(
        error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
      )
      setCaptchaToken(null) // Reset CAPTCHA on error
    }
  }

  // Success state
  if (submissionState === 'success') {
    return (
      <div className="max-w-md mx-auto p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">You're on the list!</h3>
          <p className="text-slate-400 mb-6">
            Thank you for your interest in Chronos. We'll be in touch soon with early access details.
          </p>
          <Button
            onClick={() => setSubmissionState('idle')}
            variant="outline"
            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
          >
            Submit Another
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto">
      <div className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
            Email Address <span className="text-red-400">*</span>
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            placeholder="your.email@example.com"
            disabled={submissionState === 'submitting'}
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* First Name & Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-slate-300 mb-2">
              First Name <span className="text-red-400">*</span>
            </label>
            <input
              {...register('firstName')}
              type="text"
              id="firstName"
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              placeholder="John"
              disabled={submissionState === 'submitting'}
            />
            {errors.firstName && (
              <p className="mt-2 text-sm text-red-400">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-slate-300 mb-2">
              Last Name <span className="text-red-400">*</span>
            </label>
            <input
              {...register('lastName')}
              type="text"
              id="lastName"
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              placeholder="Smith"
              disabled={submissionState === 'submitting'}
            />
            {errors.lastName && (
              <p className="mt-2 text-sm text-red-400">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-slate-300 mb-2">
            Company
          </label>
          <input
            {...register('company')}
            type="text"
            id="company"
            className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            placeholder="Acme Capital"
            disabled={submissionState === 'submitting'}
          />
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">
            Role
          </label>
          <input
            {...register('role')}
            type="text"
            id="role"
            className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            placeholder="Investment Partner"
            disabled={submissionState === 'submitting'}
          />
        </div>

        {/* How did you hear about us */}
        <div>
          <label htmlFor="heardFrom" className="block text-sm font-medium text-slate-300 mb-2">
            How did you hear about us?
          </label>
          <select
            {...register('heardFrom')}
            id="heardFrom"
            className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            disabled={submissionState === 'submitting'}
          >
            <option value="">Select an option</option>
            <option value="search">Search Engine</option>
            <option value="social">Social Media</option>
            <option value="referral">Referral</option>
            <option value="conference">Conference/Event</option>
            <option value="article">Article/Blog</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Turnstile CAPTCHA */}
        <div className="flex justify-center">
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
            onSuccess={(token) => setCaptchaToken(token)}
            onError={() => setCaptchaToken(null)}
            onExpire={() => setCaptchaToken(null)}
            options={{
              theme: 'dark',
              size: 'normal',
            }}
          />
        </div>

        {/* Error Message */}
        {submissionState === 'error' && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={submissionState === 'submitting'}
          className="w-full bg-gradient-to-r from-violet-500 to-sky-500 text-white font-semibold py-3 h-auto hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submissionState === 'submitting' ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Joining Waitlist...
            </>
          ) : (
            'Join the Waitlist'
          )}
        </Button>

        {/* Privacy Notice */}
        <p className="text-xs text-slate-500 text-center">
          By joining the waitlist, you agree to receive updates about Chronos. We respect your privacy
          and will never share your information.
        </p>
      </div>
    </form>
  )
}
