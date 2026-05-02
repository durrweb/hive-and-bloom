import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — Hive & Bloom',
  description: 'Terms governing your use of Hive & Bloom, the beekeeping management platform by Dreamybee.',
}

const LAST_UPDATED = 'May 2, 2026'

const SECTION: React.CSSProperties = {
  marginBottom: '2.5rem',
}

const H2: React.CSSProperties = {
  fontFamily: 'var(--font-playfair), Georgia, serif',
  fontSize: '1.35rem',
  fontWeight: 700,
  color: 'var(--forest)',
  marginBottom: '0.75rem',
  marginTop: 0,
}

const P: React.CSSProperties = {
  fontFamily: 'var(--font-crimson), Georgia, serif',
  fontSize: '1.05rem',
  lineHeight: 1.75,
  color: 'var(--ink)',
  margin: '0 0 1rem',
}

const UL: React.CSSProperties = {
  fontFamily: 'var(--font-crimson), Georgia, serif',
  fontSize: '1.05rem',
  lineHeight: 1.75,
  color: 'var(--ink)',
  paddingLeft: '1.5rem',
  margin: '0 0 1rem',
}

export default function TermsPage() {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      {/* Hero */}
      <div className="page-hero">
        <div className="container mx-auto px-5 lg:px-8" style={{ textAlign: 'center', paddingTop: '1rem', paddingBottom: '0.5rem' }}>
          <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Legal</span>
          <h1>Terms of Service</h1>
          <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', marginTop: '0.5rem' }}>
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-5 lg:px-8" style={{ paddingTop: '3rem', paddingBottom: '5rem', maxWidth: 760 }}>

        <div className="card" style={{ padding: '2.5rem 2.75rem' }}>

          <p style={{ ...P, color: 'var(--mist)', fontSize: '0.95rem', borderBottom: '1px solid var(--cream-dark)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
            These Terms of Service ("Terms") govern your access to and use of{' '}
            <strong style={{ color: 'var(--ink)' }}>Hive &amp; Bloom</strong> operated by Dreamybee ("we", "us", or "our").
            By creating an account or using the service you agree to be bound by these Terms.
            If you do not agree, please do not use the service.
          </p>

          <div style={SECTION}>
            <h2 style={H2}>1. Eligibility</h2>
            <p style={P}>You must be at least 13 years old to use Hive &amp; Bloom. By using the service you represent that you meet this requirement. If you are using the service on behalf of an organisation, you represent that you have the authority to bind that organisation to these Terms.</p>
          </div>

          <div style={SECTION}>
            <h2 style={H2}>2. Your Account</h2>
            <p style={P}>You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. Notify us immediately at <a href="mailto:hello@dreamybee.com" style={{ color: 'var(--honey)', textDecoration: 'none' }}>hello@dreamybee.com</a> if you believe your account has been compromised.</p>
            <p style={P}>You may not create an account using a false identity, impersonate another person, or use automated means to create accounts in bulk.</p>
          </div>

          <div style={SECTION}>
            <h2 style={H2}>3. Free and Pro Plans</h2>
            <p style={P}><strong>Free plan.</strong> Free accounts may manage up to three active hives and access all core features described on our pricing page at no charge.</p>
            <p style={P}><strong>Pro plan — founding member beta.</strong> During the current beta period, Pro features are available to all accounts at no cost. This is a time-limited offer. We will provide reasonable notice before any changes to billing terms.</p>
            <p style={P}><strong>Future billing.</strong> When Pro billing launches, you will be asked to provide payment information before charges begin. Founding members who joined during beta will receive a discounted rate communicated at that time.</p>
          </div>

          <div style={SECTION}>
            <h2 style={H2}>4. Your Content</h2>
            <p style={P}>You retain ownership of all data, notes, and photos you upload to Hive &amp; Bloom ("Your Content"). By uploading content you grant us a limited licence to store, process, and display it solely to provide the service to you.</p>
            <p style={P}>You are solely responsible for Your Content. You must not upload content that:</p>
            <ul style={UL}>
              <li>Infringes the intellectual property rights of any third party</li>
              <li>Is unlawful, defamatory, obscene, or harmful</li>
              <li>Contains malware, viruses, or malicious code</li>
            </ul>
            <p style={P}>We reserve the right to remove content that violates these Terms.</p>
          </div>

          <div style={SECTION}>
            <h2 style={H2}>5. Acceptable Use</h2>
            <p style={P}>You agree not to:</p>
            <ul style={UL}>
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to gain unauthorised access to any part of the service or another user's account</li>
              <li>Interfere with or disrupt the service or servers connected to it</li>
              <li>Scrape, crawl, or extract data from the service by automated means without our prior written consent</li>
              <li>Reverse engineer, decompile, or attempt to derive source code from the service</li>
            </ul>
          </div>

          <div style={SECTION}>
            <h2 style={H2}>6. Intellectual Property</h2>
            <p style={P}>All content, design, code, and trademarks on Hive &amp; Bloom — other than Your Content — are the property of Dreamybee or our licensors and are protected by copyright and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.</p>
          </div>

          <div style={SECTION}>
            <h2 style={H2}>7. Data &amp; Privacy</h2>
            <p style={P}>Our collection and use of your personal information is governed by our <Link href="/privacy" style={{ color: 'var(--honey)', textDecoration: 'none' }}>Privacy Policy</Link>, which is incorporated into these Terms by reference.</p>
            <p style={P}>You can export your hive data at any time using the JSON export feature available on Pro accounts. If you delete your account, we will delete your data within 30 days as described in the Privacy Policy.</p>
          </div>

          <div style={SECTION}>
            <h2 style={H2}>8. Disclaimer of Warranties</h2>
            <p style={P}>Hive &amp; Bloom is provided <strong>"as is"</strong> and <strong>"as available"</strong> without warranty of any kind. We disclaim all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
            <p style={P}>We do not warrant that the service will be uninterrupted, error-free, or free of harmful components. Beekeeping involves real-world risks; information in the app is for record-keeping and reference purposes only and does not constitute professional veterinary or agricultural advice.</p>
          </div>

          <div style={SECTION}>
            <h2 style={H2}>9. Limitation of Liability</h2>
            <p style={P}>To the maximum extent permitted by applicable law, Dreamybee and its officers, directors, employees, and agents will not be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of data, profits, or goodwill — arising out of or in connection with your use of the service, even if advised of the possibility of such damages.</p>
            <p style={P}>Our total cumulative liability to you for any claims arising out of these Terms or the service shall not exceed the greater of (a) the amount you paid us in the twelve months preceding the claim, or (b) $10 USD.</p>
          </div>

          <div style={SECTION}>
            <h2 style={H2}>10. Termination</h2>
            <p style={P}>You may stop using the service and delete your account at any time. We may suspend or terminate your access if you violate these Terms, at our reasonable discretion, with or without notice.</p>
            <p style={P}>On termination, your right to use the service ceases immediately. Sections 4, 6, 8, 9, and 11 of these Terms survive termination.</p>
          </div>

          <div style={SECTION}>
            <h2 style={H2}>11. Governing Law</h2>
            <p style={P}>These Terms are governed by and construed in accordance with the laws of the jurisdiction in which Dreamybee operates, without regard to conflict of law principles. Any disputes arising from these Terms shall be resolved in the courts of that jurisdiction.</p>
          </div>

          <div style={SECTION}>
            <h2 style={H2}>12. Changes to These Terms</h2>
            <p style={P}>We may revise these Terms from time to time. When we do, we will update the "last updated" date above. For material changes we will notify you by email or an in-app notice at least 14 days before the changes take effect. Continued use of the service after that period constitutes acceptance of the revised Terms.</p>
          </div>

          <div style={{ ...SECTION, marginBottom: 0 }}>
            <h2 style={H2}>13. Contact Us</h2>
            <p style={{ ...P, marginBottom: 0 }}>
              Questions about these Terms? Email us at{' '}
              <a href="mailto:hello@dreamybee.com" style={{ color: 'var(--honey)', textDecoration: 'none' }}>
                hello@dreamybee.com
              </a>.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2.5rem', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.85rem', color: 'var(--mist)', display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          <Link href="/privacy" style={{ color: 'var(--mist)', textDecoration: 'underline' }}>Privacy Policy</Link>
          <Link href="/" style={{ color: 'var(--mist)', textDecoration: 'underline' }}>Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
