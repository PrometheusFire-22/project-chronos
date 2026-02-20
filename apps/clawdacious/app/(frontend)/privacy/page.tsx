import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy - Clawdacious',
  description: 'Learn how Clawdacious collects, uses, and protects your personal information.',
  keywords: ['privacy', 'data protection', 'GDPR', 'security'],
  openGraph: {
    title: 'Privacy Policy - Clawdacious',
    description: 'Our commitment to protecting your privacy and data.',
    type: 'website',
  },
}

export const dynamic = 'force-static'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center text-slate-600 dark:text-slate-300 hover:text-foreground transition-colors mb-6"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Last updated: January 5, 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-slate max-w-none">
          <div className="text-foreground/80 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Introduction</h2>
              <p className="leading-relaxed">
                Clawdacious ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our platform, or engage our consulting services.
              </p>
              <p className="leading-relaxed">
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site or use our services.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Information We Collect</h2>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Personal Information</h3>
              <p className="leading-relaxed">
                We may collect personally identifiable information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Register for our waitlist</li>
                <li>Create an account on our platform</li>
                <li>Engage our consulting services</li>
                <li>Contact us for support or inquiries</li>
                <li>Subscribe to our newsletter or updates</li>
              </ul>
              <p className="leading-relaxed mt-3">
                This information may include: name, email address, company name, job title, phone number, and any other information you choose to provide.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Usage Data</h3>
              <p className="leading-relaxed">
                We automatically collect certain information when you visit, use, or navigate our platform. This information may include:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Device and browser information</li>
                <li>IP address and location data</li>
                <li>Pages visited and features used</li>
                <li>Time spent on pages</li>
                <li>Referring URLs</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Business Data</h3>
              <p className="leading-relaxed">
                When you use our platform or consulting services, we may collect and process:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Market research and intelligence data</li>
                <li>Deal flow information you provide</li>
                <li>Relationship mapping data</li>
                <li>Investment activity data</li>
                <li>Files and documents you upload</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">How We Use Your Information</h2>
              <p className="leading-relaxed">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Provide, operate, and maintain our platform and services</li>
                <li>Process your requests and manage your account</li>
                <li>Deliver consulting services and customized intelligence</li>
                <li>Communicate with you about updates, features, and support</li>
                <li>Analyze usage patterns to improve our platform</li>
                <li>Detect and prevent fraud or security issues</li>
                <li>Comply with legal obligations</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Data Security</h2>
              <p className="leading-relaxed">
                We implement industry-standard security measures to protect your personal information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure database infrastructure with PostgreSQL</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection</li>
              </ul>
              <p className="leading-relaxed mt-3">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security.
              </p>
            </section>

            {/* Data Sharing and Disclosure */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Data Sharing and Disclosure</h2>
              <p className="leading-relaxed">
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf (e.g., hosting, analytics, email delivery)</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
              </ul>
            </section>

            {/* Your Data Rights */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Your Data Rights</h2>
              <p className="leading-relaxed">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Objection:</strong> Object to certain processing of your data</li>
                <li><strong>Withdrawal:</strong> Withdraw consent at any time</li>
              </ul>
              <p className="leading-relaxed mt-3">
                To exercise these rights, please contact us at geoff@clawdacious.com.
              </p>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Cookies and Tracking Technologies</h2>
              <p className="leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience. These include:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Essential Cookies:</strong> Required for the platform to function</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use our platform</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and choices</li>
              </ul>
              <p className="leading-relaxed mt-3">
                You can control cookies through your browser settings, though this may limit platform functionality.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Data Retention</h2>
              <p className="leading-relaxed">
                We retain your personal information only as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. When we no longer need your information, we will securely delete or anonymize it.
              </p>
            </section>

            {/* International Data Transfers */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">International Data Transfers</h2>
              <p className="leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy and applicable laws.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Children's Privacy</h2>
              <p className="leading-relaxed">
                Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            {/* Changes to This Policy */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Changes to This Privacy Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            {/* Contact Us */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Contact Us</h2>
              <p className="leading-relaxed">
                If you have questions or concerns about this Privacy Policy, please contact us:
              </p>
              <div className="mt-4 p-6 rounded-lg bg-card/50 border border-border">
                <p className="leading-relaxed">
                  <strong>Email:</strong> geoff@clawdacious.com<br />
                  <strong>Address:</strong> Greater Toronto Area, Canada
                </p>
              </div>
            </section>

            {/* GDPR & CCPA Specific */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Additional Rights for EU and California Residents</h2>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">GDPR (EU Residents)</h3>
              <p className="leading-relaxed">
                If you are located in the European Economic Area, you have additional rights under the General Data Protection Regulation (GDPR), including the right to lodge a complaint with your local supervisory authority.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">CCPA (California Residents)</h3>
              <p className="leading-relaxed">
                California residents have specific rights under the California Consumer Privacy Act (CCPA), including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Right to know what personal information is collected</li>
                <li>Right to know if personal information is sold or disclosed</li>
                <li>Right to opt-out of the sale of personal information</li>
                <li>Right to non-discrimination for exercising CCPA rights</li>
              </ul>
              <p className="leading-relaxed mt-3">
                Note: Clawdacious does not sell personal information.
              </p>
            </section>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Link
              href="/terms"
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              Terms of Service →
            </Link>
            <Link
              href="/contact"
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              Contact Us →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
