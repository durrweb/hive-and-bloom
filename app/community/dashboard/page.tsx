// app/community/dashboard/page.tsx
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/queries'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'My Hive — Dashboard' }

export default async function DashboardPage() {
 const userRaw = await getCurrentUser()
if (!userRaw) redirect('/auth/login?redirectTo=/community/dashboard')
const user = userRaw as any

  const supabase = await createClient()

const [{ data: bookmarks }, { data: recentComments }] = await Promise.all([
  (supabase.from('bookmarks') as any)
    .select('*, articles(*), recipes(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(6),
  (supabase.from('comments') as any)
    .select('*, articles(title, slug), recipes(title, slug)')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5),
])

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      {/* Header */}
      <div className="dashboard-header">
        <div className="container mx-auto px-5 lg:px-8">
          <div className="dashboard-header-inner">
            <div className="dashboard-avatar">
              {user.avatar_url
                ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (user.display_name?.[0] ?? user.username[0]).toUpperCase()
              }
            </div>
            <div>
              <h1 className="dashboard-name">
                Welcome back, {user.display_name ?? user.username}
              </h1>
              <p className="dashboard-meta">
                @{user.username}
                {user.location && <> · 📍 {user.location}</>}
                {user.hive_count > 0 && <> · 🐝 {user.hive_count} {user.hive_count === 1 ? 'hive' : 'hives'}</>}
              </p>
            </div>
            <Link
              href="/community/settings"
              style={{ marginLeft: 'auto', fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4, padding: '0.4rem 0.9rem' }}
            >
              Edit profile
            </Link>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="dashboard-body">
        <div className="dashboard-grid">

          {/* Saved content */}
          <section>
            <h2 className="dashboard-section-title">🔖 Saved Content</h2>
            {bookmarks && bookmarks.length > 0 ? (
              <div>
                {bookmarks.map((b: any) => {
                  const item = b.articles ?? b.recipes
                  const href = b.articles ? `/articles/${item.slug}` : `/recipes/${item.slug}`
                  const type = b.articles ? 'Article' : 'Recipe'
                  return (
                    <Link key={b.id} href={href} className="bookmark-item">
                      <div>
                        <span className="bookmark-type">{type}</span>
                        <span className="bookmark-title">{item?.title}</span>
                      </div>
                      <span style={{ color: 'var(--mist)', fontSize: '0.9rem' }}>→</span>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="empty-state">
                <p style={{ marginBottom: '0.75rem' }}>No saved content yet.</p>
                <Link href="/articles" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1.1rem' }}>
                  Browse articles →
                </Link>
              </div>
            )}
          </section>

          {/* Recent comments */}
          <section>
            <h2 className="dashboard-section-title">💬 Your Recent Comments</h2>
            {recentComments && recentComments.length > 0 ? (
              <div>
                {recentComments.map((c: any) => {
                  const target = c.articles ?? c.recipes
                  const href   = c.articles ? `/articles/${target?.slug}` : `/recipes/${target?.slug}`
                  return (
                    <Link key={c.id} href={href ?? '#'} className="comment-item">
                      <p className="comment-body">"{c.body}"</p>
                      <span className="comment-meta">
                        On: {target?.title} · {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="empty-state">
                <p>You haven&apos;t commented yet.</p>
              </div>
            )}
          </section>
        </div>

        {/* Quick links */}
        <section style={{ marginTop: '2.5rem' }}>
          <h2 className="dashboard-section-title">Quick Links</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { href: '/apiary',   label: '🐝 My Apiary' },
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
