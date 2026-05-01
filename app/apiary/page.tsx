import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/queries'
import { getUserHives, type Hive } from '@/lib/apiary-queries'
import { getUserTier, FREE_HIVE_LIMIT } from '@/lib/tier'
import { createClient } from '@/lib/supabase/server'
import ProBanner from './ProBanner'
import AddHiveButton from './AddHiveButton'

export const metadata: Metadata = {
  title: 'My Apiary — Dreamybee',
  description: 'Track your hives, inspections, queens, and honey supers.',
}

// ── Health helpers ────────────────────────────────────────────────────────────
// Approximates colony health from hive_summary fields; replace with a dedicated
// health_score column in the view for richer per-inspection computation.

function healthScore(hive: Hive): number {
  let score = 100
  if (!hive.last_inspection_at) {
    score -= 30
  } else {
    const days = (Date.now() - new Date(hive.last_inspection_at).getTime()) / 86_400_000
    if (days > 30) score -= 40
    else if (days > 14) score -= 20
  }
  if (hive.queen_status === 'missing')  score -= 30
  if (hive.queen_status === 'replaced') score -= 5
  if ((hive.active_treatment_count ?? 0) > 0) score -= 10
  return Math.max(0, Math.min(100, score))
}

function healthMeta(score: number): { color: string; label: string } {
  if (score >= 75) return { color: 'var(--forest-light)', label: 'Good' }
  if (score >= 45) return { color: 'var(--honey)',        label: 'Fair' }
  return              { color: 'var(--coral)',             label: 'Needs attention' }
}

function relativeDate(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7)   return `${days}d ago`
  if (days < 30)  return `${Math.floor(days / 7)}wk ago`
  return `${Math.floor(days / 30)}mo ago`
}

function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return true
  return (Date.now() - new Date(dateStr).getTime()) / 86_400_000 > 14
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ApiaryPage() {
  const userRaw = await getCurrentUser()
  if (!userRaw) redirect('/auth/login?redirectTo=/apiary')
  const user = userRaw as any

  const supabase = await createClient()
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [hives, tier, { count: inspectionsThisMonth }] = await Promise.all([
    getUserHives(user.id),
    getUserTier(user.id),
    (supabase as any)
      .from('inspections')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('inspected_at', startOfMonth),
  ])

  const activeCount  = hives.filter(h => h.status === 'active').length
  const atFreeLimit  = tier === 'free' && hives.length >= FREE_HIVE_LIMIT

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>

      {/* Hero */}
      <div className="page-hero">
        <div className="container mx-auto px-5 lg:px-8">
          <span className="eyebrow">Apiary Tracker</span>
          <h1>My Apiary</h1>
          <p>Track hives, inspections, queens, honey supers, and treatments — all in one place.</p>
        </div>
      </div>

      <div className="container mx-auto px-5 lg:px-8" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>

        {/* Pro founding-member banner (dismissed state stored in localStorage) */}
        {tier === 'pro' && <ProBanner />}

        {/* Stats row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          background: 'var(--cream-dark)',
          gap: 1,
          border: '1px solid var(--cream-dark)',
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: '2.5rem',
        }}>
          {[
            { label: 'Total Hives',            value: hives.length },
            { label: 'Active',                 value: activeCount },
            { label: 'Inspections This Month', value: inspectionsThisMonth ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'white', padding: '1.25rem 1rem', textAlign: 'center' }}>
              <span style={{
                display: 'block',
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--forest)',
                lineHeight: 1.1,
              }}>
                {value}
              </span>
              <span style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: '0.7rem',
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--mist)',
                marginTop: '0.3rem',
                display: 'block',
              }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Section header + actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--forest)',
            margin: 0,
          }}>
            Your Hives
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Export button */}
            <a
              href="/apiary/export"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: '0.82rem', fontWeight: 500,
                color: 'var(--forest)',
                background: 'var(--honey-pale)',
                border: '1px solid var(--honey-light)',
                borderRadius: 6, padding: '0.48rem 0.95rem',
                textDecoration: 'none',
                letterSpacing: '0.01em',
              }}
            >
              Export My Data ↓
              <span style={{
                fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.08em',
                padding: '0.1rem 0.35rem', borderRadius: 3,
                background: 'var(--honey)', color: 'var(--forest)',
              }}>
                PRO
              </span>
            </a>

            {/* Add Hive (handles free-tier modal internally) */}
            <AddHiveButton atFreeLimit={atFreeLimit} />
          </div>
        </div>

        {/* Hive grid */}
        {hives.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {hives.map(hive => {
              const score      = healthScore(hive)
              const { color, label } = healthMeta(score)
              const overdue    = isOverdue(hive.last_inspection_at)
              const lastSeen   = relativeDate(hive.last_inspection_at)

              return (
                <Link
                  key={hive.id}
                  href={`/apiary/${hive.id}`}
                  className="card"
                  style={{ textDecoration: 'none', display: 'block', padding: '1.4rem 1.5rem' }}
                >
                  {/* Name + badges */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{
                        fontFamily: 'var(--font-playfair), Georgia, serif',
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        color: 'var(--forest)',
                        lineHeight: 1.2,
                        marginBottom: '0.2rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {hive.name}
                      </h3>
                      {hive.location && (
                        <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.8rem', color: 'var(--mist)' }}>
                          📍 {hive.location}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem', flexShrink: 0 }}>
                      {hive.hive_type && (
                        <span className="tag-pill" style={{ background: 'var(--forest-pale)', color: 'var(--forest-mid)', fontSize: '0.63rem' }}>
                          {hive.hive_type}
                        </span>
                      )}
                      {hive.status !== 'active' && (
                        <span className="tag-pill" style={{
                          background: hive.status === 'lost' ? '#fee2e2' : 'var(--cream-dark)',
                          color:      hive.status === 'lost' ? 'var(--coral)' : 'var(--mist)',
                          fontSize: '0.63rem',
                        }}>
                          {hive.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Health bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.3rem' }}>
                      <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--mist)' }}>
                        Colony Health
                      </span>
                      <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.72rem', fontWeight: 600, color }}>
                        {label}
                      </span>
                    </div>
                    <div style={{ height: 5, background: 'var(--cream-dark)', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 3 }} />
                    </div>
                  </div>

                  {/* Stats mini-row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    background: 'var(--cream)',
                    borderRadius: 8,
                    overflow: 'hidden',
                    marginBottom: '1rem',
                  }}>
                    {/* Last inspection */}
                    <div style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>
                      <span style={{ display: 'block', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--mist)', marginBottom: '0.2rem' }}>
                        Last Check
                      </span>
                      <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.8rem', fontWeight: 600, color: overdue ? 'var(--coral)' : 'var(--forest)' }}>
                        {lastSeen}
                      </span>
                    </div>

                    {/* Supers */}
                    <div style={{ padding: '0.6rem 0.5rem', textAlign: 'center', borderLeft: '1px solid var(--cream-dark)', borderRight: '1px solid var(--cream-dark)' }}>
                      <span style={{ display: 'block', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--mist)', marginBottom: '0.2rem' }}>
                        Supers
                      </span>
                      <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.8rem', fontWeight: 600, color: 'var(--forest)' }}>
                        {hive.super_count ?? 0}
                      </span>
                    </div>

                    {/* Queen */}
                    <div style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>
                      <span style={{ display: 'block', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--mist)', marginBottom: '0.2rem' }}>
                        Queen
                      </span>
                      <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.8rem', fontWeight: 600, color: hive.queen_status === 'missing' ? 'var(--coral)' : 'var(--forest)' }}>
                        {hive.queen_status === 'present'  ? '✓ Present'
                          : hive.queen_status === 'missing'  ? '✗ Missing'
                          : hive.queen_status === 'replaced' ? 'Replaced'
                          : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Footer arrow */}
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.8rem', color: 'var(--honey)', fontWeight: 500 }}>
                      View hive →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="empty-state" style={{ padding: '3.5rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐝</div>
            <h3 style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'var(--forest)',
              marginBottom: '0.5rem',
            }}>
              No hives yet
            </h3>
            <p style={{ color: 'var(--mist)', maxWidth: 360, margin: '0 auto 1.5rem', textAlign: 'center' }}>
              Add your first hive to start tracking inspections, queens, honey supers, and treatments.
            </p>
            <Link href="/apiary/new" className="btn btn-primary">
              + Add Your First Hive
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
