// components/layout/Footer.tsx
import Link from 'next/link'

const FOOTER_LINKS = {
  'Pollinators': [
    { href: '/articles?category=honeybee-keeping',    label: 'Honeybee Keeping' },
    { href: '/articles?category=native-bees',          label: 'Mason & Native Bees' },
    { href: '/articles?category=butterfly-gardening',  label: 'Butterfly Gardening' },
    { href: '/articles?category=pollinator-plants',    label: 'Pollinator Plants' },
  ],
  'Resources': [
    { href: '/calendar',                               label: 'Seasonal Calendar' },
    { href: '/recipes',                                label: 'Honey Recipes' },
    { href: '/articles?category=getting-started',      label: 'Beginner Guides' },
    { href: '/articles?category=hive-health',          label: 'Hive Health' },
  ],
  'Community': [
    { href: '/community',                              label: 'Join the Hive' },
    { href: '/auth/signup',                            label: 'Create Account' },
    { href: '/community/members',                      label: 'Member Directory' },
    { href: '/community/forum',                        label: 'Discussion Forum' },
  ],
  'About': [
    { href: '/about',                                  label: 'Our Mission' },
    { href: '/about/team',                             label: 'Our Team' },
    { href: '/contact',                                label: 'Contact Us' },
    { href: '/about/write-for-us',                     label: 'Write for Us' },
  ],
}

const linkStyle = {
  fontSize: '0.9rem',
  color: 'rgba(255,255,255,0.55)',
  textDecoration: 'none',
  fontWeight: 300,
}

export default function Footer() {
  return (
    <footer style={{ background: '#1E1A14', color: 'rgba(255,255,255,0.65)', padding: '3.5rem 0 1.5rem' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 clamp(1.25rem, 4vw, 2.5rem)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
          gap: '2rem',
          marginBottom: '3rem',
        }}>
          {/* Brand */}
          <div>
            <Link href="/" style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'var(--honey-light)',
              textDecoration: 'none',
              display: 'block',
              marginBottom: '0.75rem',
            }}>
              Hive &amp; Bloom
            </Link>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.65, fontWeight: 300, maxWidth: 260 }}>
              Your trusted guide to honeybee keeping, butterfly gardening, pollinator plants,
              and honey recipes. Supporting pollinators, one garden at a time.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem' }}>
              {['🐦', '📸', '▶️', '💬'].map((icon, i) => (
                <a key={i} href="#" style={{
                  width: 36, height: 36, borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', textDecoration: 'none',
                }}>
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.75rem',
                fontWeight: 500,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--honey-light)',
                marginBottom: '1rem',
              }}>
                {heading}
              </h4>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {links.map(link => (
                  <li key={link.href} style={{ marginBottom: '0.5rem' }}>
                    <Link href={link.href} style={linkStyle}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.8rem',
          color: 'rgba(255,255,255,0.3)',
        }}>
          <span>© {new Date().getFullYear()} Hive &amp; Bloom. Made with 🍯 for pollinators everywhere.</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/terms"   style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
