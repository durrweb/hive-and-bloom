import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing — Hive & Bloom',
  description: 'Simple, honest pricing for beekeepers. Free to start, Pro for serious apiaries.',
}

// ── Feature lists ─────────────────────────────────────────────────────────────

const FREE_FEATURES = [
  'Up to 3 active hives',
  'Inspection log with health scoring',
  'Queen records & status tracking',
  'Honey super tracking',
  'Treatment & varroa log',
  'Hive notes, type & location',
  'Colony health dashboard',
  'Seasonal care articles & guides',
  'Recipes & community content',
]

const PRO_FEATURES = [
  'Everything in Free',
  'Unlimited hives',
  'Hive photo galleries',
  'Inspection photo attachments',
  'Smart reminders for inspections & treatments',
  'Weather & hive weight logging',
  'Full data export (JSON)',
  'Hive origin & provenance records',
  'Priority support',
]

const COMPARISON = [
  { feature: 'Active hives',             free: 'Up to 3',  pro: 'Unlimited' },
  { feature: 'Inspection logging',        free: true,       pro: true },
  { feature: 'Queen tracking',           free: true,       pro: true },
  { feature: 'Honey super tracking',     free: true,       pro: true },
  { feature: 'Treatment log',            free: true,       pro: true },
  { feature: 'Colony health dashboard',  free: true,       pro: true },
  { feature: 'Articles & guides',        free: true,       pro: true },
  { feature: 'Hive & inspection photos', free: false,      pro: true },
  { feature: 'Smart reminders',          free: false,      pro: true },
  { feature: 'Weather & weight logging', free: false,      pro: true },
  { feature: 'Data export',             free: false,      pro: true },
  { feature: 'Hive origin records',      free: false,      pro: true },
  { feature: 'Priority support',         free: false,      pro: true },
]

const FAQS = [
  {
    q: 'Is Pro really free right now?',
    a: 'Yes — during our founding member beta, all Pro features are unlocked for every account at no charge. When Pro billing launches, early members lock in a discounted rate.',
  },
  {
    q: 'What will Pro cost when billing launches?',
    a: 'Pro is planned at $7/month or an equivalent annual rate. Founding members who join during beta will receive a permanently reduced rate as a thank-you for being early.',
  },
  {
    q: 'Do I need a credit card to sign up?',
    a: 'No. Creating an account is completely free and requires no payment information. Pro billing is not yet active.',
  },
  {
    q: 'What happens to my data if I downgrade?',
    a: 'Your data is always yours. If you ever move to the free tier, hives above the 3-hive limit become read-only — no data is deleted. You can export everything at any time on Pro.',
  },
  {
    q: 'Can I use Hive & Bloom just for the content — articles, recipes, and calendar?',
    a: 'Absolutely. The knowledge base, recipes, and seasonal calendar are fully free and always will be, no account required.',
  },
  {
    q: 'How many hives can I track on the free plan?',
    a: 'Up to 3 active hives. You can mark hives as inactive or lost without them counting against your limit.',
  },
]

// ── Check icon ────────────────────────────────────────────────────────────────

function Check({ pro = false }: { pro?: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
      background: pro ? 'var(--honey-pale)' : 'var(--forest-pale)',
      color: pro ? 'var(--honey-deep)' : 'var(--forest)',
      fontSize: '0.7rem', fontWeight: 700,
    }}>
      ✓
    </span>
  )
}

function Cross() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
      background: 'var(--cream-dark)', color: 'var(--mist)',
      fontSize: '0.7rem', fontWeight: 700,
    }}>
      –
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <div style={{ background: 'var(--cream)' }}>

      {/* Hero */}
      <div className="page-hero">
        <div className="container mx-auto px-5 lg:px-8" style={{ textAlign: 'center' }}>
          <span className="eyebrow">Plans &amp; Pricing</span>
          <h1 style={{ maxWidth: 560, margin: '0 auto 1rem' }}>
            Simple, honest pricing for beekeepers
          </h1>
          <p style={{
            fontFamily: 'var(--font-crimson), Georgia, serif',
            fontSize: '1.2rem', color: 'rgba(255,255,255,0.75)',
            maxWidth: 480, margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Free to start. Pro for the beekeepers who want to go deeper.
          </p>
        </div>
      </div>

      {/* Founding member beta banner */}
      <div style={{
        background: 'var(--honey)',
        borderBottom: '1px solid var(--honey-deep)',
        padding: '0.9rem 1.5rem',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: '0.9rem', fontWeight: 500,
          color: 'var(--forest)', margin: 0, lineHeight: 1.5,
        }}>
          🐝 <strong>Founding Member Beta</strong> — Pro features are free for everyone right now.
          Join today and lock in a permanently reduced rate when billing launches.
        </p>
      </div>

      {/* Pricing cards */}
      <section className="section-white" style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
        <div className="container mx-auto px-5 lg:px-8">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            maxWidth: 800,
            margin: '0 auto',
          }}>

            {/* Free card */}
            <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '1.75rem' }}>
                <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mist)', marginBottom: '0.5rem' }}>
                  Free
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '2.75rem', fontWeight: 700, color: 'var(--forest)', lineHeight: 1 }}>
                    $0
                  </span>
                  <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.85rem', color: 'var(--mist)' }}>
                    / month
                  </span>
                </div>
                <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.88rem', color: 'var(--mist)', margin: 0, lineHeight: 1.5 }}>
                  Everything you need to get started with your first hives.
                </p>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                {FREE_FEATURES.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.88rem', color: 'var(--forest)', lineHeight: 1.4 }}>
                    <Check />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/signup"
                className="btn btn-forest"
                style={{ textAlign: 'center', display: 'block', fontSize: '0.9rem' }}
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro card */}
            <div className="card" style={{
              padding: '2rem',
              display: 'flex', flexDirection: 'column',
              border: '2px solid var(--honey)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Featured ribbon */}
              <div style={{
                position: 'absolute', top: 16, right: -28,
                background: 'var(--honey)', color: 'var(--forest)',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '0.3rem 2.5rem',
                transform: 'rotate(45deg)',
                transformOrigin: 'center',
              }}>
                Beta Free
              </div>

              <div style={{ marginBottom: '1.75rem' }}>
                <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--honey-deep)', marginBottom: '0.5rem' }}>
                  Pro
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '2.75rem', fontWeight: 700, color: 'var(--forest)', lineHeight: 1 }}>
                    Free
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: '0.85rem', color: 'var(--mist)',
                    textDecoration: 'line-through',
                  }}>
                    $7/mo
                  </span>
                </div>
                <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.82rem', color: 'var(--honey-deep)', margin: '0 0 0.5rem', fontWeight: 500 }}>
                  during founding member beta
                </p>
                <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.88rem', color: 'var(--mist)', margin: 0, lineHeight: 1.5 }}>
                  For serious beekeepers who want photos, reminders, and the full toolkit.
                </p>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                {PRO_FEATURES.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.88rem', color: 'var(--forest)', lineHeight: 1.4 }}>
                    <Check pro />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/signup"
                className="btn btn-primary"
                style={{ textAlign: 'center', display: 'block', fontSize: '0.9rem' }}
              >
                Join Free — Pro Included
              </Link>
              <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.75rem', color: 'var(--mist)', textAlign: 'center', margin: '0.65rem 0 0' }}>
                No credit card required
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="section-cream" style={{ paddingTop: '3rem', paddingBottom: '3.5rem' }}>
        <div className="container mx-auto px-5 lg:px-8">
          <div className="section-header-center" style={{ marginBottom: '2rem' }}>
            <span className="eyebrow">Compare plans</span>
            <h2>Everything side by side</h2>
          </div>

          <div style={{ maxWidth: 680, margin: '0 auto', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: 'var(--mist)',
                    textAlign: 'left', padding: '0.75rem 1rem',
                    borderBottom: '2px solid var(--cream-dark)',
                  }}>
                    Feature
                  </th>
                  <th style={{
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: 'var(--mist)',
                    textAlign: 'center', padding: '0.75rem 1rem',
                    borderBottom: '2px solid var(--cream-dark)',
                    width: 100,
                  }}>
                    Free
                  </th>
                  <th style={{
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: 'var(--honey-deep)',
                    textAlign: 'center', padding: '0.75rem 1rem',
                    borderBottom: '2px solid var(--honey)',
                    width: 100,
                  }}>
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature} style={{ background: i % 2 === 0 ? 'white' : 'transparent' }}>
                    <td style={{
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                      fontSize: '0.88rem', color: 'var(--forest)',
                      padding: '0.7rem 1rem',
                      borderBottom: '1px solid var(--cream-dark)',
                    }}>
                      {row.feature}
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.7rem 1rem', borderBottom: '1px solid var(--cream-dark)' }}>
                      {typeof row.free === 'string' ? (
                        <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.82rem', color: 'var(--forest)', fontWeight: 500 }}>
                          {row.free}
                        </span>
                      ) : row.free ? <Check /> : <Cross />}
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.7rem 1rem', borderBottom: '1px solid var(--cream-dark)' }}>
                      {typeof row.pro === 'string' ? (
                        <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.82rem', color: 'var(--forest)', fontWeight: 500 }}>
                          {row.pro}
                        </span>
                      ) : row.pro ? <Check pro /> : <Cross />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-white" style={{ paddingTop: '3rem', paddingBottom: '3.5rem' }}>
        <div className="container mx-auto px-5 lg:px-8">
          <div className="section-header-center" style={{ marginBottom: '2.5rem' }}>
            <span className="eyebrow">Questions</span>
            <h2>Frequently asked</h2>
          </div>

          <div style={{
            maxWidth: 680, margin: '0 auto',
            display: 'flex', flexDirection: 'column', gap: '1rem',
          }}>
            {FAQS.map(({ q, a }) => (
              <div key={q} className="card" style={{ padding: '1.4rem 1.6rem' }}>
                <p style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontSize: '1rem', fontWeight: 700,
                  color: 'var(--forest)', margin: '0 0 0.5rem',
                }}>
                  {q}
                </p>
                <p style={{
                  fontFamily: 'var(--font-crimson), Georgia, serif',
                  fontSize: '1rem', color: 'var(--mist)',
                  margin: 0, lineHeight: 1.6,
                }}>
                  {a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section">
        <div className="container mx-auto px-5 lg:px-8" style={{ textAlign: 'center' }}>
          <span className="eyebrow" style={{ color: 'var(--forest)' }}>Get started today</span>
          <h2 style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 700, color: 'var(--forest)',
            marginBottom: '0.75rem',
          }}>
            Your apiary records, all in one place
          </h2>
          <p style={{
            fontFamily: 'var(--font-crimson), Georgia, serif',
            fontSize: '1.15rem', color: 'var(--honey-deep)',
            maxWidth: 460, margin: '0 auto 2rem', lineHeight: 1.6,
          }}>
            Join during beta and keep Pro features free — no credit card, no commitment.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/signup" className="btn btn-forest" style={{ fontSize: '0.95rem', padding: '0.75rem 1.75rem' }}>
              Create Free Account
            </Link>
            <Link href="/apiary" className="btn" style={{ background: 'rgba(42,74,42,0.1)', color: 'var(--forest)', fontSize: '0.95rem', padding: '0.75rem 1.75rem' }}>
              Go to My Apiary →
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
