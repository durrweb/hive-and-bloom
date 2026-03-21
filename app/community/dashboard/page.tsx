// app/community/dashboard/page.tsx
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/queries'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'My Hive — Dashboard' }

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login?redirectTo=/community/dashboard')

  const supabase = await createClient()

  // Fetch user's bookmarks and recent comments in parallel
  const [{ data: bookmarks }, { data: recentComments }] = await Promise.all([
    supabase.from('bookmarks').select('*, articles(*), recipes(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(6),
    supabase.from('comments').select('*, articles(title, slug), recipes(title, slug)').eq('author_id', user.id).order('created_at', { ascending: false }).limit(5),
  ])

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'var(--forest)', padding: '3rem 0 2.5rem', borderBottom: '3px solid var(--honey)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 clamp(1.25rem, 4vw, 2.5rem)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--honey)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--forest)', overflow: 'hidden', flexShrink: 0 }}>
              {user.avatar_url
                ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (user.display_name?.[0] ?? user.username[0]).toUpperCase()
              }
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', fontWeight: 700, color: 'white', marginBottom: '0.15rem' }}>
                Welcome back, {user.display_name ?? user.username}
              </h1>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                @{user.username}
                {user.location && <> · 📍 {user.location}</>}
                {user.hive_count > 0 && <> · 🐝 {user.hive_count} {user.hive_count === 1 ? 'hive' : 'hives'}</>}
              </p>
            </div>
            <Link href="/community/settings" style={{ marginLeft: 'auto', fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4, padding: '0.4rem 0.9rem' }}>
              Edit profile
            </Link>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '3rem clamp(1.25rem, 4vw, 2.5rem)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

          {/* Saved content */}
          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--forest)', marginBottom: '1rem' }}>
              🔖 Saved Content
            </h2>
            {bookmarks && bookmarks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {bookmarks.map((b: any) => {
                  const item = b.articles ?? b.recipes
                  const href = b.articles ? `/articles/${item.slug}` : `/recipes/${item.slug}`
                  const type = b.articles ? 'Article' : 'Recipe'
                  return (
                    <Link key={b.id} href={href} style={{ background: 'white', borderRadius: 10, border: '1px solid var(--cream-dark)', padding: '0.9rem 1.1rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                      <div>
                        <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.7rem', color: 'var(--honey)', fontWeight: 500, display: 'block', marginBottom: '0.2rem' }}>{type}</span>
                        <span style={{ fontFamily: 'var(--font-playfair)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--forest)' }}>{item?.title}</span>
                      </div>
                      <span style={{ color: 'var(--mist)', fontSize: '0.9rem' }}>→</span>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: 10, border: '1px solid var(--cream-dark)', padding: '2rem', textAlign: 'center', color: 'var(--mist)' }}>
                <p style={{ marginBottom: '0.75rem' }}>No saved content yet.</p>
                <Link href="/articles" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1.1rem' }}>Browse articles →</Link>
              </div>
            )}
          </section>

          {/* Recent comments */}
          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--forest)', marginBottom: '1rem' }}>
              💬 Your Recent Comments
            </h2>
            {recentComments && recentComments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentComments.map((c: any) => {
                  const target = c.articles ?? c.recipes
                  const href   = c.articles ? `/articles/${target?.slug}` : `/recipes/${target?.slug}`
                  return (
                    <Link key={c.id} href={href ?? '#'} style={{ background: 'white', borderRadius: 10, border: '1px solid var(--cream-dark)', padding: '0.9rem 1.1rem', textDecoration: 'none', display: 'block' }}>
                      <p style={{ fontFamily: 'var(--font-crimson)', fontSize: '0.95rem', color: 'var(--ink)', lineHeight: 1.5, marginBottom: '0.35rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        "{c.body}"
                      </p>
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.75rem', color: 'var(--mist)' }}>
                        On: {target?.title} · {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: 10, border: '1px solid var(--cream-dark)', padding: '2rem', textAlign: 'center', color: 'var(--mist)' }}>
                <p>You haven't commented yet.</p>
              </div>
            )}
          </section>
        </div>

        {/* Quick links */}
        <section style={{ marginTop: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--forest)', marginBottom: '1rem' }}>
            Quick Links
          </h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { href: '/articles', label: '📰 Browse Articles' },
              { href: '/recipes',  label: '🍯 Browse Recipes' },
              { href: '/calendar', label: '📅 Seasonal Calendar' },
              { href: '/community/settings', label: '⚙️ Edit Profile' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="btn btn-forest" style={{ fontSize: '0.85rem', padding: '0.5rem 1.1rem' }}>
                {l.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
