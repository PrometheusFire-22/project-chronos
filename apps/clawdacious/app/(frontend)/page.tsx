import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Bot,
  Zap,
  Shield,
  Check,
  PhoneCall,
  Settings,
  Rocket,
  ChevronDown,
  MapPin,
  Clock,
  Users,
  Mail,
} from 'lucide-react'
import { ContactForm } from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Clawdacious — AI Assistant Setup for GTA Small Businesses',
  description:
    'We set up, host, and support private AI assistants for GTA small businesses and professionals. Done for you. Live in 24–48 hours. From $299.',
  openGraph: {
    title: 'Clawdacious — AI Assistant Setup for GTA Small Businesses',
    description:
      'Done-for-you AI assistants for GTA businesses. Answers leads 24/7, books appointments, handles follow-ups. From $299.',
    type: 'website',
  },
}

const INDUSTRIES = [
  'Realtors', 'Lawyers', 'Accountants', 'Financial Advisors',
  'Contractors', 'Coaches', 'Consultants', 'Clinics',
]

const FEATURES = [
  {
    icon: <Bot className="h-7 w-7" />,
    title: 'Answers Inquiries 24/7',
    description:
      'No more missed leads while you\'re on the job. Your assistant handles incoming messages, responds in your voice, and flags what actually needs you.',
  },
  {
    icon: <Zap className="h-7 w-7" />,
    title: 'Connects to Your Tools',
    description:
      'Calendar, email, CRM, WhatsApp, Slack — your AI plugs into what you already use. No new apps to check. No new passwords to remember.',
  },
  {
    icon: <Shield className="h-7 w-7" />,
    title: 'Keeps Getting Better',
    description:
      'Monthly check-ins, new automations, ongoing optimization. Your assistant evolves with your business — and never calls in sick.',
  },
]

const HOW_IT_WORKS = [
  {
    icon: <PhoneCall className="h-6 w-6" />,
    step: '01',
    title: 'We talk for 15 minutes',
    description:
      'Tell us how your business runs and where you\'re losing time. We\'ll map the right setup for your specific situation — no generic solutions.',
  },
  {
    icon: <Settings className="h-6 w-6" />,
    step: '02',
    title: 'We build everything',
    description:
      'We handle the entire setup remotely. Your assistant gets connected to your tools, trained on your business, and tested before handoff. You don\'t touch a setting.',
  },
  {
    icon: <Rocket className="h-6 w-6" />,
    step: '03',
    title: 'You just use it',
    description:
      'Live within 24–48 hours. We check in monthly to keep improving it. If something ever breaks or needs updating, you call us — not a support ticket system.',
  },
]

const PRICING = [
  {
    name: 'Starter',
    tagline: 'Get up and running fast',
    setup: '$299',
    monthly: '$49',
    highlight: false,
    badge: null,
    features: [
      '1 messaging channel (Telegram or WhatsApp)',
      'Up to 2 integrations (e.g. email + calendar)',
      'Custom assistant identity and tone',
      'Live in 24–48 hours',
      '30-day post-setup support',
      'Remote setup — nothing to install',
    ],
  },
  {
    name: 'Professional',
    tagline: 'For solo professionals and service businesses',
    setup: '$499',
    monthly: '$79',
    highlight: true,
    badge: 'Most Popular',
    features: [
      '2 messaging channels (e.g. email + WhatsApp)',
      'Up to 5 integrations (email, calendar, CRM, and more)',
      'Custom assistant identity and tone',
      'Live in 24–48 hours',
      '90-day post-setup support',
      'Priority response from Geoff directly',
    ],
  },
  {
    name: 'Business',
    tagline: 'For growing teams and complex workflows',
    setup: '$799',
    monthly: '$129',
    highlight: false,
    badge: null,
    features: [
      'Unlimited channels and integrations',
      'Custom workflows and automation flows',
      'Quarterly review and optimization calls',
      'On-demand new automations (add-ons available)',
      'Priority support, always reachable',
      'Multi-tool and multi-platform configuration',
    ],
  },
]

const WHO_ITS_FOR = [
  {
    role: 'Realtors',
    pain: 'Missing leads while showing homes',
    win: 'Never lose a client because you were busy with another one',
  },
  {
    role: 'Lawyers & Law Clerks',
    pain: 'Intake calls, scheduling, repetitive client questions',
    win: 'Intake handled automatically — you only talk to qualified clients',
  },
  {
    role: 'Accountants & Bookkeepers',
    pain: 'Tax season volume, appointment overload',
    win: 'Handles the inquiry flood in busy season so you can focus on the work',
  },
  {
    role: 'Financial Advisors',
    pain: 'Scheduling, follow-ups, compliance-sensitive communication',
    win: 'Automates scheduling and follow-ups while you stay in control of advice',
  },
  {
    role: 'Contractors & Trades',
    pain: 'Missed calls on job sites, quote follow-ups',
    win: 'Quotes follow up themselves — close more jobs without more calls',
  },
  {
    role: 'Coaches & Consultants',
    pain: 'Discovery call booking, qualifying time-wasters',
    win: 'Every call you take is pre-qualified and worth your time',
  },
]

const FAQS = [
  {
    q: 'Do I need to be technical to use this?',
    a: 'No. That\'s the whole point. You\'ll never log into a server, write a line of code, or configure anything. I handle all of it remotely. The only thing you do is use the assistant — same as using WhatsApp.',
  },
  {
    q: 'How is this different from ChatGPT?',
    a: 'ChatGPT is a tool you go to. What I set up works in the background, connected to your actual business — your email, your calendar, your clients. It answers people when you\'re not there. ChatGPT doesn\'t do that.',
  },
  {
    q: 'What if the AI makes a mistake?',
    a: 'It\'s designed to handle the straightforward, repetitive stuff reliably — FAQs, lead collection, reminders, scheduling. Anything nuanced or sensitive still comes to you. Think of it as a filter: it handles 80% of the volume so you can focus on the 20% that actually needs you.',
  },
  {
    q: 'Can I cancel the monthly retainer?',
    a: 'Yes, anytime. There\'s no long-term contract. The setup fee covers the build; the monthly retainer covers hosting, support, and ongoing optimization. If you cancel, you keep the assistant — you\'d just need to handle hosting yourself.',
  },
  {
    q: 'How quickly can I get started?',
    a: 'Once we\'ve had our 15-minute intake call and you\'ve answered a short questionnaire about your business, I start building. Most setups are live within 24–48 hours.',
  },
  {
    q: 'What tools can it connect to?',
    a: 'Email, Google Calendar, WhatsApp, Telegram, Slack, Notion, most CRMs (HubSpot, Pipedrive, and others), and more. During our call I\'ll confirm what\'s compatible with your specific setup.',
  },
]

export default async function HomePage() {
  // Try to fetch CMS hero — falls back to static copy below
  let hero = null
  try {
    const { getHomepageHero } = await import('@/lib/directus')
    hero = await getHomepageHero().catch(() => null)
  } catch {
    // Directus not available
  }

  const headline = hero?.headline || 'Your Business Never Misses Another Lead'
  const subheadline =
    hero?.subheadline ||
    'We set up a private AI assistant — connected to your email, calendar, and tools — that handles inquiries, books appointments, and follows up with leads. You focus on the work. It handles the rest.'
  const ctaPrimaryLink = hero?.cta_primary_link || '/#contact'
  const ctaSecondaryLink = hero?.cta_secondary_link || '#pricing'

  return (
    <div className="min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative py-24 sm:py-36">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">

            {/* Trust pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium mb-8">
              <MapPin className="h-3.5 w-3.5" />
              GTA-based · Live in 24–48 hours · From $299
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-red-600 dark:to-red-400">
                {headline}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-800 dark:text-slate-100 max-w-2xl mx-auto mb-10">
              {subheadline}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href={ctaPrimaryLink}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
              >
                Get a Quote
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href={ctaSecondaryLink}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors"
              >
                See Pricing
                <ChevronDown className="h-4 w-4" />
              </Link>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Less than the cost of 4 hours of admin help — and it works around the clock.
            </p>
          </div>
        </div>
      </section>

      {/* ── INDUSTRY STRIP ───────────────────────────────────── */}
      <div className="border-y border-border bg-muted/30 py-4 overflow-hidden">
        <div className="flex items-center gap-2 justify-center flex-wrap px-4">
          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium uppercase tracking-wider mr-2">
            Serving GTA
          </span>
          {INDUSTRIES.map((industry, i) => (
            <span key={industry} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              {i > 0 && <span className="text-border">·</span>}
              {industry}
            </span>
          ))}
        </div>
      </div>

      {/* ── WHAT IT DOES ─────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Not a Chatbot. Your Business, Running 24/7.
            </h2>
            <p className="text-lg text-slate-800 dark:text-slate-100">
              A private AI assistant configured specifically for how you work — connected to your tools, trained on your business, always on.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="p-8 rounded-2xl border border-border bg-card backdrop-blur hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/5 transition-all"
              >
                <div className="mb-4 text-red-400">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Up and Running in 24–48 Hours
            </h2>
            <p className="text-lg text-slate-800 dark:text-slate-100">
              You don't need to know anything technical. That's exactly what we're here for.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.step}
                className="p-8 rounded-2xl border border-border bg-card backdrop-blur"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 text-red-400">
                    {step.icon}
                  </div>
                  <span className="text-xs font-bold tracking-widest text-slate-600 dark:text-slate-300 uppercase">
                    Step {step.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ─────────────────────────────────────── */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Is This For You?
            </h2>
            <p className="text-lg text-slate-800 dark:text-slate-100">
              If you run a service business in the GTA and handle a lot of the same communication over and over — yes.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {WHO_ITS_FOR.map((item) => (
              <div
                key={item.role}
                className="p-6 rounded-xl border border-border bg-card backdrop-blur hover:border-red-500/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-red-400 shrink-0" />
                  <span className="font-semibold text-sm">{item.role}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Pain: </span>{item.pain}
                </p>
                <div className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.win}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 border-t border-border" id="pricing">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-800 dark:text-slate-100">
              One-time setup fee. Low monthly retainer. No hidden costs. Cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-2xl border transition-all ${
                  plan.highlight
                    ? 'border-red-500 bg-card shadow-2xl shadow-red-500/10 md:scale-[1.03]'
                    : 'border-border bg-card'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1 rounded-full bg-red-500 text-white text-xs font-bold tracking-wide uppercase">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{plan.tagline}</p>
                </div>

                <div className="mb-6 pb-6 border-b border-border">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold">{plan.setup}</span>
                    <span className="text-slate-600 dark:text-slate-300 text-sm">setup</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mt-1.5">
                    then{' '}
                    <span className="text-foreground font-semibold">{plan.monthly}/month</span>
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/#contact"
                  className={`flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg font-semibold transition-colors text-sm ${
                    plan.highlight
                      ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'
                      : 'border border-border text-foreground hover:bg-muted'
                  }`}
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>

          {/* Pricing footnotes */}
          <div className="max-w-2xl mx-auto mt-10 space-y-2 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Not sure which plan fits? Most clients start with Professional.{' '}
              <Link href="/#contact" className="text-red-400 hover:text-red-300 underline underline-offset-2">
                Get in touch
              </Link>{' '}
              and we'll figure it out together.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              API and LLM usage costs (typically $20–60/month) are billed directly to you by the provider — not bundled in. We'll set it up and explain it during onboarding.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Common Questions
              </h2>
              <p className="text-lg text-slate-800 dark:text-slate-100">
                Honest answers. No fluff.
              </p>
            </div>
            <div className="space-y-4">
              {FAQS.map((faq) => (
                <div
                  key={faq.q}
                  className="p-6 rounded-xl border border-border bg-card"
                >
                  <h3 className="font-semibold text-foreground mb-3">{faq.q}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────── */}
      <section id="contact" className="py-20 sm:py-28 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">

            {/* Left: Headline + trust signals */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Ready to Stop Doing Admin Manually?
              </h2>
              <p className="text-lg text-slate-800 dark:text-slate-100 mb-10">
                Tell me about your business. I'll tell you exactly what your AI assistant would do — and what it'll cost. No pitch, no pressure.
              </p>

              <div className="space-y-5">
                <a
                  href="tel:+14168246865"
                  className="flex items-center gap-4 group"
                >
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 shrink-0">
                    <PhoneCall className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Call directly</p>
                    <p className="text-slate-600 dark:text-slate-300 group-hover:text-red-400 transition-colors">(416) 824-6865</p>
                  </div>
                </a>

                <a
                  href="mailto:geoff@clawdacious.com"
                  className="flex items-center gap-4 group"
                >
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 shrink-0">
                    <Mail className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Email</p>
                    <p className="text-slate-600 dark:text-slate-300 group-hover:text-red-400 transition-colors">geoff@clawdacious.com</p>
                  </div>
                </a>

                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 shrink-0">
                    <MapPin className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Location</p>
                    <p className="text-slate-600 dark:text-slate-300">Greater Toronto Area, Canada</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 shrink-0">
                    <Clock className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Response time</p>
                    <p className="text-slate-600 dark:text-slate-300">Within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Contact form */}
            <ContactForm />

          </div>
        </div>
      </section>

    </div>
  )
}
