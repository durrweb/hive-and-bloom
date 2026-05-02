import type { Metadata } from 'next'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us — Hive & Bloom',
  description: 'Get in touch with the Hive & Bloom team. We\'d love to hear from you.',
}

const CONTACT_ITEMS = [
  {
    icon: '✉️',
    label: 'Email',
    value: 'hello@dreamybee.com',
    href: 'mailto:hello@dreamybee.com',
  },
  {
    icon: '🐝',
    label: 'Community',
    value: 'Join the discussion forum',
    href: '/community',
  },
  {
    icon: '📖',
    label: 'Help & guides',
    value: 'Browse our articles',
    href: '/articles',
  },
]

export default function ContactPage() {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      {/* Hero */}
      <div className="page-hero">
        <div className="container mx-auto px-5 lg:px-8" style={{ textAlign: 'center', paddingTop: '1rem', paddingBottom: '0.5rem' }}>
          <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Get in touch</span>
          <h1>Contact Us</h1>
          <p style={{
            fontFamily: 'var(--font-crimson), Georgia, serif',
            fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)',
            maxWidth: 480, margin: '0.75rem auto 0', lineHeight: 1.65,
          }}>
            Questions, feedback, or just want to say hello? We'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-5 lg:px-8" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '2.5rem',
          maxWidth: 920,
          margin: '0 auto',
          alignItems: 'start',
        }}
          className="contact-grid"
        >
          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card" style={{ padding: '1.75rem' }}>
              <h2 style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: '1.15rem', color: 'var(--forest)',
                margin: '0 0 1.25rem',
              }}>
                Other ways to reach us
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {CONTACT_ITEMS.map(item => (
                  <a
                    key={item.label}
                    href={item.href}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                      textDecoration: 'none', color: 'inherit',
                    }}
                  >
                    <span style={{
                      fontSize: '1.2rem', lineHeight: 1,
                      marginTop: '0.1rem', flexShrink: 0,
                    }}>
                      {item.icon}
                    </span>
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-dm-sans), sans-serif',
                        fontSize: '0.75rem', fontWeight: 600,
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                        color: 'var(--mist)', marginBottom: '0.15rem',
                      }}>
                        {item.label}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-crimson), Georgia, serif',
                        fontSize: '1rem', color: 'var(--honey)',
                      }}>
                        {item.value}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <h2 style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: '1.15rem', color: 'var(--forest)',
                margin: '0 0 0.75rem',
              }}>
                Response time
              </h2>
              <p style={{
                fontFamily: 'var(--font-crimson), Georgia, serif',
                fontSize: '0.98rem', color: 'var(--mist)',
                margin: 0, lineHeight: 1.7,
              }}>
                We typically respond within one business day. For urgent account issues,
                please include your account email in the message.
              </p>
            </div>
          </div>

          {/* Form card */}
          <div className="card" style={{ padding: '2rem 2.25rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: '1.3rem', color: 'var(--forest)',
              margin: '0 0 1.5rem',
            }}>
              Send us a message
            </h2>
            <ContactForm />
          </div>
        </div>
      </div>

      {/* Responsive: stack on mobile */}
      <style>{`
        @media (max-width: 680px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
