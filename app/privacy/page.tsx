import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — Hive & Bloom',
  description: 'How Hive & Bloom collects, uses, and protects your personal information.',
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

export default function PrivacyPage() {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      {/* Hero */}
      <div className="page-hero">
        <div className="container mx-auto px-5 lg:px-8" style={{ textAlign: 'center', paddingTop: '1rem', paddingBottom: '0.5rem' }}>
          <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Legal</span>
          <h1>Privacy Policy</h1>
          <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', marginTop: '0.5rem' }}>
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-5 lg:px-8" style={{ paddingTop: '3rem', paddingBottom: '5rem', maxWidth: 760 }}>

        <div className="card" style={{ padding: '2.5rem 2.75rem' }}>

          <p style={{ ...P, color: 'var(--mist)', fontSize: '0.95rem', borderBottom: '1px solid var(--cream-dark)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
            This Privacy Policy explains how Dreamybee ("we", "us", or "our") collects, uses, and safeguards information
            when you use <strong style={{ color: 'var(--ink)' }}>Hive &amp; Bloom</strong> at dreamybee.com. By using our
            service you agree to the practices described here.
          </p>

          <div style={SECTION}>
            <h2 style={H2}>1. Information We Collect</h2>
            <p style={P}><strong>Account information.</strong> When you create an account we collect your email address and, optionally, a display name. We use Supabase for authentication; passwords are hashed and never stored in plain text.</p>
            <p style={P}><strong>Apiary &amp; hive data.</strong> Records you enter — hives, inspections, treatments, queen notes, honey supers — are stored in your account and used solely to provide the service to you.</p>
            <p style={P}><strong>Photos.</strong> Pro users may upload photos to hives and inspections. Images are stored in Supabase Storage under a path scoped to your user ID.</p>
            <p style={P}><strong>Usage data.</strong> We may collect anonymised, aggregated data about how features are used (page views, feature interactions) to improve the product. This data cannot be used to identify you individually.</p>
            <p style={P}><strong>Cookies &amp; sessions.</strong> We use a session cookie to keep you signed in. No third-party advertising or tracking cookies are set.</p>
          </div>

          <div style={SECTION}>
            <h2 style={H2}>2. How We Use Your Information</h2>
            <ul style={UL}>
              <li>To create and manage your account</li>
              <li>To provide, operate, and improve the Hive &amp; Bloom service</li>
              <li>To send transactional emails (password reset, account verification)</li>
              <li>To respond to support requests or enquiries you send us</li>
              <li>To detect and prevent abuse or security incidents</li>
            </ul>
            <p style={P}>We do not sell, rent, or trade your personal information to third parties. We do not use your data to serve advertising.</p>
          </div>

          <div style={SECTION}>
            <h2 style={H2}>3. Data Storage &amp; Security</h2>
            <p style={P}>Your data is stored on Supabase infrastructure, which uses industry-standard encryption at rest and in transit (TLS). Access to production data is restricted to authorised personnel only.</p>
            <p style={P}>No method of transmission over the internet is 100% secure. While we take reasonable precautions, we cannot guarantee absolute security. Please use a strong, unique password and keep it confidential.</p>
          </div>

          <div style={SECTION}>
            <h2 style={H2}>4. Data Retention</h2>
            <p style={P}>We retain your account data for as long as your account is active. If you delete your account, we will delete your personal information and associated apiary data within 30 days, except where retention is required by law.</p>
            <p style={P}>Uploaded photos are deleted from storage when the associated hive or account is deleted.</p>
          </div>

          <div style={SECTION}>
            <h2 style={H2}>5. Third-Party Services</h2>
            <p style={P}>We use the following sub-processors to operate the service:</p>
            <ul style={UL}>
              <li><strong>Supabase</strong> — database, authentication, and file storage</li>
              <li><strong>Vercel</strong> — application hosting and edge delivery</li>
            </ul>
            <p style={P}>Each provider has its own privacy policy. We share only the data necessary for them to provide their services to us.</p>
          </div>

          <div style={SECTION}>
            <h2 style={H2}>6. Your Rights</h2>
            <p style={P}>Depending on where you live, you may have the right to access, correct, export, or delete your personal data. To exercise any of these rights, email us at the address below. We will respond within 30 days.</p>
            <p style={P}>You can export your hive data at any time from the Apiary Tracker on a Pro account (JSON export). You can delete your account from your account settings page.</p>
          </div>

          <div style={SECTION}>
            <h2 style={H2}>7. Children's Privacy</h2>
            <p style={P}>Hive &amp; Bloom is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with their data, please contact us and we will delete it promptly.</p>
          </div>

          <div style={SECTION}>
            <h2 style={H2}>8. Changes to This Policy</h2>
            <p style={P}>We may update this policy from time to time. When we do, we will update the "last updated" date at the top of this page and, for material changes, notify you by email or an in-app notice. Continued use of the service after changes constitutes acceptance of the revised policy.</p>
          </div>

          <div style={{ ...SECTION, marginBottom: 0 }}>
            <h2 style={H2}>9. Contact Us</h2>
            <p style={P}>
              Questions about this policy? Email us at{' '}
              <a href="mailto:hello@dreamybee.com" style={{ color: 'var(--honey)', textDecoration: 'none' }}>
                hello@dreamybee.com
              </a>.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2.5rem', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.85rem', color: 'var(--mist)', display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          <Link href="/terms" style={{ color: 'var(--mist)', textDecoration: 'underline' }}>Terms of Service</Link>
          <Link href="/" style={{ color: 'var(--mist)', textDecoration: 'underline' }}>Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
