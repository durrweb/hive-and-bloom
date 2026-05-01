// components/layout/Navbar.tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions'

const NAV_LINKS = [
  { href: '/articles', label: 'Articles' },
  { href: '/recipes',  label: 'Recipes' },
  { href: '/calendar', label: 'Seasonal Guide' },
]

const navLinkStyle = {
  fontFamily: 'var(--font-dm-sans)',
  fontSize: '0.85rem',
  fontWeight: 400,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: 'rgba(255,255,255,0.78)',
  textDecoration: 'none',
  padding: '0.5rem 0.85rem',
  borderRadius: 4,
}

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'var(--forest)',
      borderBottom: '3px solid var(--honey)',
    }}>
      <div style={{
        maxWidth: 1140,
        margin: '0 auto',
        paddingRight: 'clamp(1.25rem, 4vw, 2.5rem)',
        paddingLeft: '2.5rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.9rem 0',
        }}>
          {/* Logo */}
          <Link href="/" style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.55rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--honey-light)',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}>
            Hive <span style={{ color: 'white', fontWeight: 400, fontStyle: 'italic' }}>&amp;</span> Bloom
          </Link>

          {/* Nav links */}
          <ul style={{
            display: 'flex',
            gap: '0.25rem',
            alignItems: 'center',
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}>
            {NAV_LINKS.map(link => (
              <li key={link.href}>
                <Link href={link.href} style={navLinkStyle}>
                  {link.label}
                </Link>
              </li>
            ))}

            {user ? (
              <>
                <li>
                  <Link href="/apiary" style={navLinkStyle}>
                    My Apiary
                  </Link>
                </li>
                <li>
                  <Link href="/community/dashboard" style={navLinkStyle}>
                    My Hive
                  </Link>
                </li>
                <li>
                  <form action={signOut}>
                    <button type="submit" style={{
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.25)',
                      color: 'rgba(255,255,255,0.65)',
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.82rem',
                      padding: '0.45rem 0.9rem',
                      borderRadius: 4,
                      cursor: 'pointer',
                      letterSpacing: '0.04em',
                    }}>
                      Sign out
                    </button>
                  </form>
                </li>
              </>
            ) : (
              <li>
                <Link href="/auth/signup" style={{
                  background: 'var(--honey)',
                  color: 'var(--forest)',
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  padding: '0.5rem 1.1rem',
                  borderRadius: 4,
                  textDecoration: 'none',
                  letterSpacing: '0.04em',
                }}>
                  Join Free
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
