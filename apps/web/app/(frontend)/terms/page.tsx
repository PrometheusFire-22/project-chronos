import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service - Chronos',
  description: 'Terms and conditions for using the Chronos platform and services.',
  keywords: ['terms', 'conditions', 'legal', 'agreement'],
  openGraph: {
    title: 'Terms of Service - Chronos',
    description: 'Terms and conditions governing your use of Chronos.',
    type: 'website',
  },
}

export const dynamic = 'force-static'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-6"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-slate-400 text-lg">
            Last updated: January 5, 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-slate max-w-none">
          <div className="text-slate-300 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Agreement to Terms</h2>
              <p className="leading-relaxed">
                These Terms of Service ("Terms") constitute a legally binding agreement between you and Chronos ("Company," "we," "us," or "our") concerning your access to and use of our website, platform, and consulting services (collectively, the "Services").
              </p>
              <p className="leading-relaxed">
                By accessing or using our Services, you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access or use our Services.
              </p>
            </section>

            {/* Services Description */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Description of Services</h2>
              <p className="leading-relaxed">
                Chronos provides:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Platform Services:</strong> A multi-model intelligence platform combining graph, vector, time-series, and geospatial data for private market analysis</li>
                <li><strong>Consulting Services:</strong> Custom research, data analysis, and relationship intelligence services for investment professionals</li>
                <li><strong>Data Services:</strong> Access to curated market data, relationship mapping, and analytical tools</li>
              </ul>
              <p className="leading-relaxed mt-3">
                Our Services are currently in development and may change as we iterate toward product-market fit. Features and availability may vary.
              </p>
            </section>

            {/* Account Registration */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Account Registration and Security</h2>
              <p className="leading-relaxed">
                To access certain features of our Services, you may be required to register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
              <p className="leading-relaxed mt-3">
                You must be at least 18 years old to create an account. We reserve the right to refuse service or terminate accounts at our discretion.
              </p>
            </section>

            {/* Acceptable Use */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Acceptable Use Policy</h2>
              <p className="leading-relaxed">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Use the Services for any illegal or unauthorized purpose</li>
                <li>Violate any laws, regulations, or third-party rights</li>
                <li>Interfere with or disrupt the Services or servers</li>
                <li>Attempt to gain unauthorized access to any portion of the Services</li>
                <li>Upload viruses, malware, or malicious code</li>
                <li>Scrape, harvest, or collect data from the Services without permission</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Use the Services to compete with us or build similar products</li>
                <li>Misrepresent your identity or affiliation</li>
                <li>Share access credentials with unauthorized parties</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Intellectual Property Rights</h2>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Our Content</h3>
              <p className="leading-relaxed">
                The Services and all content, features, and functionality (including but not limited to software, text, displays, images, video, audio, design, and data compilations) are owned by Chronos and are protected by copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Your Content</h3>
              <p className="leading-relaxed">
                You retain ownership of any content you submit, upload, or provide through the Services ("User Content"). By providing User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such content solely to provide and improve our Services.
              </p>
              <p className="leading-relaxed mt-3">
                You represent and warrant that you own or have the necessary rights to provide User Content and that it does not violate any third-party rights or applicable laws.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Feedback</h3>
              <p className="leading-relaxed">
                Any feedback, suggestions, or ideas you provide about our Services become our property, and we may use them without restriction or compensation to you.
              </p>
            </section>

            {/* Consulting Services */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Consulting Services Terms</h2>
              <p className="leading-relaxed">
                For consulting engagements, additional terms may apply as outlined in a Statement of Work (SOW) or service agreement. These Terms supplement any such agreements unless expressly stated otherwise.
              </p>
              <p className="leading-relaxed">
                Consulting deliverables, timelines, and fees will be specified in the applicable SOW. Work product created specifically for you under a consulting engagement will be governed by the intellectual property provisions in the SOW.
              </p>
            </section>

            {/* Payment Terms */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Payment and Billing</h2>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Fees</h3>
              <p className="leading-relaxed">
                Some Services may require payment. You agree to pay all fees associated with your use of paid Services. Fees are non-refundable except as required by law or as otherwise specified.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Subscriptions</h3>
              <p className="leading-relaxed">
                For subscription-based Services:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Billing occurs on a recurring basis (monthly, annually, etc.)</li>
                <li>Subscriptions automatically renew unless canceled</li>
                <li>You must cancel before the renewal date to avoid charges</li>
                <li>Price changes will be communicated with advance notice</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Taxes</h3>
              <p className="leading-relaxed">
                All fees are exclusive of applicable taxes, which you are responsible for paying.
              </p>
            </section>

            {/* Data and Confidentiality */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Data Use and Confidentiality</h2>
              <p className="leading-relaxed">
                Our collection and use of your data is governed by our <Link href="/privacy" className="text-violet-400 hover:text-violet-300">Privacy Policy</Link>. By using the Services, you acknowledge and agree to such collection and use.
              </p>
              <p className="leading-relaxed mt-3">
                For consulting engagements, we may require execution of a Non-Disclosure Agreement (NDA) to protect confidential information exchanged during the engagement.
              </p>
            </section>

            {/* Disclaimers */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Disclaimers and Limitations</h2>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Service Availability</h3>
              <p className="leading-relaxed">
                THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THAT THE SERVICES WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Investment Advice</h3>
              <p className="leading-relaxed">
                CHRONOS IS NOT A REGISTERED INVESTMENT ADVISOR. INFORMATION PROVIDED THROUGH THE SERVICES IS FOR INFORMATIONAL PURPOSES ONLY AND DOES NOT CONSTITUTE INVESTMENT, FINANCIAL, OR LEGAL ADVICE. YOU ARE SOLELY RESPONSIBLE FOR YOUR INVESTMENT DECISIONS.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Data Accuracy</h3>
              <p className="leading-relaxed">
                While we strive for accuracy, we do not warrant that data or information provided through the Services is complete, accurate, or current. You should independently verify any data before relying on it for important decisions.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Third-Party Content</h3>
              <p className="leading-relaxed">
                The Services may include data or content from third parties. We are not responsible for the accuracy or reliability of third-party content.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Limitation of Liability</h2>
              <p className="leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, CHRONOS AND ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Your use or inability to use the Services</li>
                <li>Any unauthorized access to or use of our servers or personal information</li>
                <li>Any interruption or cessation of the Services</li>
                <li>Any bugs, viruses, or other harmful code transmitted through the Services</li>
                <li>Any errors or omissions in content or data</li>
                <li>Investment decisions made based on information from the Services</li>
              </ul>
              <p className="leading-relaxed mt-3">
                OUR TOTAL LIABILITY SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID US IN THE 12 MONTHS BEFORE THE CLAIM AROSE OR (B) $100.
              </p>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Indemnification</h2>
              <p className="leading-relaxed">
                You agree to indemnify, defend, and hold harmless Chronos and its affiliates, officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses (including legal fees) arising out of or related to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Your use of the Services</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Your User Content</li>
              </ul>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Termination</h2>
              <p className="leading-relaxed">
                We may terminate or suspend your access to the Services immediately, without prior notice, for any reason, including breach of these Terms. You may terminate your account at any time by contacting us.
              </p>
              <p className="leading-relaxed mt-3">
                Upon termination, your right to use the Services will immediately cease. Provisions that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
              </p>
            </section>

            {/* Dispute Resolution */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Dispute Resolution</h2>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Informal Resolution</h3>
              <p className="leading-relaxed">
                If a dispute arises, please contact us first to attempt an informal resolution.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Arbitration</h3>
              <p className="leading-relaxed">
                Any dispute that cannot be resolved informally shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. The arbitration shall be conducted in [Your Jurisdiction], and judgment on the award may be entered in any court having jurisdiction.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Class Action Waiver</h3>
              <p className="leading-relaxed">
                You agree that any arbitration or proceeding shall be limited to the dispute between you and Chronos individually. CLASS ACTIONS, CLASS ARBITRATIONS, AND REPRESENTATIVE ACTIONS ARE NOT PERMITTED.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Governing Law and Jurisdiction</h2>
              <p className="leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of [Your State/Country], without regard to its conflict of law provisions. Any legal action or proceeding shall be brought exclusively in the courts located in [Your Jurisdiction].
              </p>
            </section>

            {/* Modifications */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Changes to Terms</h2>
              <p className="leading-relaxed">
                We reserve the right to modify these Terms at any time. We will provide notice of material changes by posting the updated Terms on this page and updating the "Last updated" date. Your continued use of the Services after changes become effective constitutes acceptance of the revised Terms.
              </p>
            </section>

            {/* Severability */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Severability</h2>
              <p className="leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.
              </p>
            </section>

            {/* Entire Agreement */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Entire Agreement</h2>
              <p className="leading-relaxed">
                These Terms, together with our Privacy Policy and any additional agreements for specific Services, constitute the entire agreement between you and Chronos regarding the Services and supersede all prior agreements and understandings.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Contact Information</h2>
              <p className="leading-relaxed">
                If you have questions about these Terms, please contact us:
              </p>
              <div className="mt-4 p-6 rounded-lg bg-slate-900/50 border border-slate-800">
                <p className="leading-relaxed">
                  <strong>Email:</strong> legal@chronos.com<br />
                  <strong>Address:</strong> [Your Business Address]
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Link
              href="/privacy"
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              ← Privacy Policy
            </Link>
            <Link
              href="/contact"
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              Contact Us →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
