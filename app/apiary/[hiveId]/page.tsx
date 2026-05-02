import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/queries'
import {
  getHive, getQueen, getInspections, getSupers, getTreatments, getReminders,
  getHivePhotos, getInspectionPhotosByHive,
  type Hive, type Inspection, type Queen, type Super, type Treatment, type Reminder,
  type HivePhoto, type InspectionPhoto,
} from '@/lib/apiary-queries'
import { getUserTier } from '@/lib/tier'
import { removeSuper, completeReminder } from '@/app/apiary/actions'
import HivePhotoManager from '@/app/apiary/HivePhotoManager'
import HiveStatusControls from '@/app/apiary/HiveStatusControls'

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = { title: 'Hive Detail — Dreamybee' }

// ── Route types ───────────────────────────────────────────────────────────────

interface Props {
  params:       Promise<{ hiveId: string }>
  searchParams: Promise<{ tab?: string }>
}

const TABS = ['inspections', 'queen', 'supers', 'treatments', 'reminders', 'photos'] as const
type Tab = typeof TABS[number]

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmt(dateStr: string | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', opts ?? { month: 'short', day: 'numeric', year: 'numeric' })
}

function relativeDue(dateStr: string): { label: string; overdue: boolean } {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
  if (diff < 0)  return { label: `${Math.abs(diff)}d overdue`, overdue: true }
  if (diff === 0) return { label: 'Due today',                  overdue: true }
  if (diff === 1) return { label: 'Due tomorrow',               overdue: false }
  if (diff < 7)  return { label: `Due in ${diff}d`,             overdue: false }
  return { label: `Due ${fmt(dateStr, { month: 'short', day: 'numeric' })}`, overdue: false }
}

// ── Badge helpers ─────────────────────────────────────────────────────────────

function popStyle(pop: string | null): { bg: string; color: string } {
  const v = (pop ?? '').toLowerCase()
  if (v.includes('strong') || v.includes('large') || v.includes('high'))
    return { bg: 'var(--forest-pale)', color: 'var(--forest)' }
  if (v.includes('medium') || v.includes('build') || v.includes('grow') || v.includes('moderate'))
    return { bg: 'var(--honey-pale)', color: 'var(--honey-deep)' }
  if (v.includes('weak') || v.includes('small') || v.includes('declin') || v.includes('low'))
    return { bg: '#fee2e2', color: 'var(--coral)' }
  return { bg: 'var(--cream-dark)', color: 'var(--mist)' }
}

function varroaStyle(count: number | null): { bg: string; color: string } | null {
  if (count === null) return null
  if (count <= 1) return { bg: 'var(--forest-pale)', color: 'var(--forest)' }
  if (count <= 3) return { bg: 'var(--honey-pale)',  color: 'var(--honey-deep)' }
  return                  { bg: '#fee2e2',            color: 'var(--coral)' }
}

// ── Shared sub-components ────────────────────────────────────────────────────

const PILL: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans), sans-serif',
  fontSize: '0.68rem', fontWeight: 600,
  letterSpacing: '0.05em', textTransform: 'uppercase',
  padding: '0.2rem 0.55rem', borderRadius: 4, display: 'inline-block',
}

const LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans), sans-serif',
  fontSize: '0.68rem', fontWeight: 500,
  letterSpacing: '0.09em', textTransform: 'uppercase',
  color: 'var(--mist)', display: 'block', marginBottom: '0.2rem',
}

const VAL: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans), sans-serif',
  fontSize: '0.92rem', fontWeight: 600, color: 'var(--forest)',
}

function EmptyState({ icon, heading, sub, cta }: { icon: string; heading: string; sub: string; cta?: React.ReactNode }) {
  return (
    <div className="empty-state" style={{ padding: '3rem 2rem' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.2rem', fontWeight: 700, color: 'var(--forest)', marginBottom: '0.4rem' }}>
        {heading}
      </h3>
      <p style={{ color: 'var(--mist)', fontSize: '0.9rem', maxWidth: 340, margin: '0 auto 1.25rem' }}>{sub}</p>
      {cta}
    </div>
  )
}

// ── Tab: Inspections ─────────────────────────────────────────────────────────

function InspectionsTab({ hiveId, inspections, inspectionPhotos }: { hiveId: string; inspections: Inspection[]; inspectionPhotos: Record<string, InspectionPhoto[]> }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.25rem', fontWeight: 700, color: 'var(--forest)', margin: 0 }}>
          Inspection Log
        </h2>
        <Link href={`/apiary/${hiveId}/inspect/new`} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}>
          + Log Inspection
        </Link>
      </div>

      {inspections.length === 0 ? (
        <EmptyState
          icon="🔍"
          heading="No inspections yet"
          sub="Regular inspections are the foundation of good hive management."
          cta={<Link href={`/apiary/${hiveId}/inspect/new`} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}>Log first inspection</Link>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {inspections.map(insp => {
            const pop    = popStyle(insp.population)
            const varroa = varroaStyle(insp.varroa_count)
            const hasProData = insp.weather || insp.weight_kg != null
            return (
              <div key={insp.id} className="card" style={{ padding: '1.1rem 1.4rem' }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1rem', fontWeight: 700, color: 'var(--forest)' }}>
                    {fmt(insp.inspected_at)}
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {insp.overall_health && (
                      <span style={{ ...PILL, background: insp.overall_health === 'excellent' || insp.overall_health === 'good' ? 'var(--forest-pale)' : insp.overall_health === 'fair' ? 'var(--honey-pale)' : '#fee2e2', color: insp.overall_health === 'excellent' || insp.overall_health === 'good' ? 'var(--forest)' : insp.overall_health === 'fair' ? 'var(--honey-deep)' : 'var(--coral)' }}>
                        {insp.overall_health}
                      </span>
                    )}
                    {insp.population && (
                      <span style={{ ...PILL, background: pop.bg, color: pop.color }}>
                        {insp.population}
                      </span>
                    )}
                    {varroa && insp.varroa_count != null && (
                      <span style={{ ...PILL, background: varroa.bg, color: varroa.color }}>
                        {insp.varroa_count}% varroa
                      </span>
                    )}
                  </div>
                </div>

                {/* Data row */}
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: insp.notes || hasProData ? '0.75rem' : 0 }}>
                  <div>
                    <span style={LABEL}>Queen seen</span>
                    <span style={{ ...VAL, color: insp.queen_seen ? 'var(--forest)' : 'var(--mist)' }}>
                      {insp.queen_seen === true ? '✓ Yes' : insp.queen_seen === false ? '✗ No' : '—'}
                    </span>
                  </div>
                  {insp.eggs_seen != null && (
                    <div>
                      <span style={LABEL}>Eggs</span>
                      <span style={{ ...VAL, color: insp.eggs_seen ? 'var(--forest)' : 'var(--mist)' }}>
                        {insp.eggs_seen ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                  )}
                  {insp.brood_pattern && (
                    <div>
                      <span style={LABEL}>Brood pattern</span>
                      <span style={VAL}>{insp.brood_pattern}</span>
                    </div>
                  )}
                  {insp.temperament && (
                    <div>
                      <span style={LABEL}>Temperament</span>
                      <span style={VAL}>{insp.temperament}</span>
                    </div>
                  )}
                  {/* PRO: weather + weight */}
                  {insp.weather && (
                    <div>
                      <span style={LABEL}>Weather</span>
                      <span style={VAL}>{insp.weather}</span>
                    </div>
                  )}
                  {insp.weight_kg != null && (
                    <div>
                      <span style={LABEL}>Hive weight</span>
                      <span style={VAL}>{insp.weight_kg} kg</span>
                    </div>
                  )}
                </div>

                {insp.notes && (
                  <p style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: '0.95rem', color: 'var(--mist)', margin: 0, lineHeight: 1.5, borderTop: '1px solid var(--cream-dark)', paddingTop: '0.65rem' }}>
                    {insp.notes}
                  </p>
                )}

                {inspectionPhotos[insp.id]?.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid var(--cream-dark)' }}>
                    {inspectionPhotos[insp.id].map(p => (
                      <img key={p.id} src={p.url} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 5, display: 'block' }} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Tab: Queen ────────────────────────────────────────────────────────────────

function QueenTab({ hiveId, queen }: { hiveId: string; queen: Queen | null }) {
  if (!queen) {
    return (
      <EmptyState
        icon="👑"
        heading="No queen recorded"
        sub="Track your queen's breed, introduction date, mark, and status."
        cta={<Link href={`/apiary/${hiveId}/queen/edit`} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}>Add queen info</Link>}
      />
    )
  }

  const statusColor = queen.status === 'present'  ? { bg: 'var(--forest-pale)', color: 'var(--forest)' }
                    : queen.status === 'missing'   ? { bg: '#fee2e2',            color: 'var(--coral)' }
                    : queen.status === 'replaced'  ? { bg: 'var(--honey-pale)',  color: 'var(--honey-deep)' }
                    :                                { bg: 'var(--cream-dark)',   color: 'var(--mist)' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.25rem', fontWeight: 700, color: 'var(--forest)', margin: 0 }}>
          Queen
        </h2>
        <Link href={`/apiary/${hiveId}/queen/edit`} className="btn btn-forest" style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}>
          Edit queen
        </Link>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.4rem', fontWeight: 700, color: 'var(--forest)', marginBottom: '0.35rem' }}>
              {queen.breed ?? 'Queen'}
            </h3>
            {queen.source && (
              <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.82rem', color: 'var(--mist)' }}>
                Source: {queen.source}
              </span>
            )}
          </div>
          <span style={{ ...PILL, background: statusColor.bg, color: statusColor.color, fontSize: '0.75rem' }}>
            {queen.status === 'present' ? '✓ Present' : queen.status === 'missing' ? '✗ Missing' : queen.status ?? 'Unknown'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1.25rem', marginBottom: queen.notes ? '1.25rem' : 0 }}>
          <div>
            <span style={LABEL}>Introduced</span>
            <span style={VAL}>{fmt(queen.installed_at)}</span>
          </div>
          <div>
            <span style={LABEL}>Marked</span>
            <span style={{ ...VAL, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {queen.marked ? '✓ Yes' : '✗ No'}
              {queen.marked && queen.mark_color && (
                <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: queen.mark_color, border: '1px solid rgba(0,0,0,0.15)', flexShrink: 0 }} title={queen.mark_color} />
              )}
            </span>
          </div>
          {queen.mark_color && (
            <div>
              <span style={LABEL}>Mark colour</span>
              <span style={VAL}>{queen.mark_color}</span>
            </div>
          )}
          {queen.breed && (
            <div>
              <span style={LABEL}>Breed</span>
              <span style={VAL}>{queen.breed}</span>
            </div>
          )}
        </div>

        {queen.notes && (
          <p style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: '0.95rem', color: 'var(--mist)', margin: 0, lineHeight: 1.5, borderTop: '1px solid var(--cream-dark)', paddingTop: '1rem' }}>
            {queen.notes}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Tab: Supers ───────────────────────────────────────────────────────────────

function SupersTab({ hiveId, supers }: { hiveId: string; supers: Super[] }) {
  const active  = supers.filter(s => !s.date_removed)
  const removed = supers.filter(s =>  s.date_removed)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.25rem', fontWeight: 700, color: 'var(--forest)', margin: 0 }}>
          Honey Supers
          {active.length > 0 && (
            <span style={{ ...PILL, background: 'var(--honey-pale)', color: 'var(--honey-deep)', marginLeft: '0.6rem', fontSize: '0.65rem' }}>
              {active.length} on hive
            </span>
          )}
        </h2>
        <Link href={`/apiary/${hiveId}/super/new`} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}>
          + Add Super
        </Link>
      </div>

      {supers.length === 0 ? (
        <EmptyState
          icon="🍯"
          heading="No supers logged"
          sub="Track your honey supers — when they went on, frames, and estimated yield."
          cta={<Link href={`/apiary/${hiveId}/super/new`} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}>Add first super</Link>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {supers.map(s => {
            const isActive = !s.date_removed
            return (
              <div key={s.id} className="card" style={{ padding: '1.1rem 1.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    {s.position != null && (
                      <div>
                        <span style={LABEL}>Position</span>
                        <span style={VAL}>#{s.position}</span>
                      </div>
                    )}
                    {s.frames_count != null && (
                      <div>
                        <span style={LABEL}>Frames</span>
                        <span style={VAL}>{s.frames_count}</span>
                      </div>
                    )}
                    <div>
                      <span style={LABEL}>Added</span>
                      <span style={VAL}>{fmt(s.date_added)}</span>
                    </div>
                    {s.date_removed && (
                      <div>
                        <span style={LABEL}>Removed</span>
                        <span style={VAL}>{fmt(s.date_removed)}</span>
                      </div>
                    )}
                    {/* PRO: estimated yield */}
                    {s.estimated_kg != null && (
                      <div>
                        <span style={LABEL}>Est. yield</span>
                        <span style={{ ...VAL, color: 'var(--honey-deep)' }}>{s.estimated_kg} kg</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <span style={{ ...PILL, background: isActive ? 'var(--forest-pale)' : 'var(--cream-dark)', color: isActive ? 'var(--forest)' : 'var(--mist)' }}>
                      {isActive ? '🟢 On hive' : 'Removed'}
                    </span>
                    {isActive && (
                      <form action={removeSuper.bind(null, s.id)}>
                        <button
                          type="submit"
                          style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.78rem', fontWeight: 500, padding: '0.3rem 0.75rem', borderRadius: 4, border: '1px solid var(--coral)', background: 'transparent', color: 'var(--coral)', cursor: 'pointer' }}
                        >
                          Remove
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {s.notes && (
                  <p style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: '0.9rem', color: 'var(--mist)', margin: '0.65rem 0 0', paddingTop: '0.65rem', borderTop: '1px solid var(--cream-dark)' }}>
                    {s.notes}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Tab: Treatments ───────────────────────────────────────────────────────────

function TreatmentsTab({ hiveId, treatments }: { hiveId: string; treatments: Treatment[] }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.25rem', fontWeight: 700, color: 'var(--forest)', margin: 0 }}>
          Treatments
        </h2>
        <Link href={`/apiary/${hiveId}/treatment/new`} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}>
          + Log Treatment
        </Link>
      </div>

      {treatments.length === 0 ? (
        <EmptyState
          icon="💊"
          heading="No treatments logged"
          sub="Log varroa treatments, supplemental feeding, and other interventions."
          cta={<Link href={`/apiary/${hiveId}/treatment/new`} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}>Log first treatment</Link>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {treatments.map(t => {
            const ongoing  = !t.completed_at
            const hasProData = t.varroa_before != null || t.varroa_after != null || t.efficacy_pct != null
            return (
              <div key={t.id} className="card" style={{ padding: '1.1rem 1.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1rem', fontWeight: 700, color: 'var(--forest)' }}>
                      {t.type}
                    </span>
                    <span style={{ ...PILL, background: ongoing ? 'var(--honey-pale)' : 'var(--forest-pale)', color: ongoing ? 'var(--honey-deep)' : 'var(--forest)' }}>
                      {ongoing ? 'Ongoing' : 'Completed'}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.82rem', color: 'var(--mist)', flexShrink: 0 }}>
                    {fmt(t.applied_at)}
                    {t.completed_at && <> → {fmt(t.completed_at)}</>}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: t.notes || hasProData ? '0.75rem' : 0 }}>
                  {t.dose && (
                    <div>
                      <span style={LABEL}>Dose</span>
                      <span style={VAL}>{t.dose}</span>
                    </div>
                  )}
                  {/* PRO: varroa before/after/efficacy */}
                  {t.varroa_before != null && (
                    <div>
                      <span style={LABEL}>Varroa before</span>
                      <span style={{ ...VAL, color: 'var(--coral)' }}>{t.varroa_before}%</span>
                    </div>
                  )}
                  {t.varroa_after != null && (
                    <div>
                      <span style={LABEL}>Varroa after</span>
                      <span style={{ ...VAL, color: t.varroa_after <= 1 ? 'var(--forest)' : 'var(--honey-deep)' }}>
                        {t.varroa_after}%
                      </span>
                    </div>
                  )}
                  {t.efficacy_pct != null && (
                    <div>
                      <span style={LABEL}>Efficacy</span>
                      <span style={{ ...VAL, color: t.efficacy_pct >= 90 ? 'var(--forest)' : t.efficacy_pct >= 70 ? 'var(--honey-deep)' : 'var(--coral)' }}>
                        {t.efficacy_pct}%
                      </span>
                    </div>
                  )}
                </div>

                {t.notes && (
                  <p style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: '0.9rem', color: 'var(--mist)', margin: 0, lineHeight: 1.5, borderTop: '1px solid var(--cream-dark)', paddingTop: '0.65rem' }}>
                    {t.notes}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Tab: Reminders ────────────────────────────────────────────────────────────

function RemindersTab({ hiveId, reminders }: { hiveId: string; reminders: Reminder[] }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.25rem', fontWeight: 700, color: 'var(--forest)', margin: 0 }}>
          Reminders
        </h2>
        <Link href={`/apiary/${hiveId}/reminder/new`} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}>
          + Add Reminder
        </Link>
      </div>

      {reminders.length === 0 ? (
        <EmptyState
          icon="🔔"
          heading="No upcoming reminders"
          sub="Set reminders for treatments, inspections, and seasonal hive tasks."
          cta={<Link href={`/apiary/${hiveId}/reminder/new`} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}>Add reminder</Link>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {reminders.map(r => {
            const { label: dueLabel, overdue } = relativeDue(r.due_at)
            return (
              <div key={r.id} className="card" style={{ padding: '1.1rem 1.4rem', borderLeft: overdue ? '3px solid var(--coral)' : '3px solid transparent' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1rem', fontWeight: 600, color: 'var(--forest)', margin: '0 0 0.25rem' }}>
                      {r.title}
                    </p>
                    <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.8rem', fontWeight: 600, color: overdue ? 'var(--coral)' : 'var(--forest-light)' }}>
                      {dueLabel}
                    </span>
                    {r.notes && (
                      <p style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: '0.88rem', color: 'var(--mist)', margin: '0.35rem 0 0', lineHeight: 1.4 }}>
                        {r.notes}
                      </p>
                    )}
                  </div>

                  <form action={completeReminder.bind(null, r.id)} style={{ flexShrink: 0 }}>
                    <button
                      type="submit"
                      style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.78rem', fontWeight: 500, padding: '0.35rem 0.85rem', borderRadius: 4, border: '1px solid var(--forest-light)', background: 'transparent', color: 'var(--forest)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      ✓ Done
                    </button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HivePage({ params, searchParams }: Props) {
  const { hiveId }  = await params
  const { tab: tabParam } = await searchParams

  const activeTab: Tab = (TABS as readonly string[]).includes(tabParam ?? '')
    ? (tabParam as Tab)
    : 'inspections'

  // Auth
  const userRaw = await getCurrentUser()
  if (!userRaw) redirect(`/auth/login?redirectTo=/apiary/${hiveId}`)
  const user = userRaw as any

  // Always fetch hive (ownership check) + queen (needed by two tabs)
  // Fetch tab-specific data in the same round-trip
  const [hive, queen, inspections, supers, treatments, reminders, hivePhotos, inspectionPhotos, tier] = await Promise.all([
    getHive(hiveId, user.id),
    getQueen(hiveId, user.id),
    activeTab === 'inspections' ? getInspections(hiveId, user.id)            : Promise.resolve([]),
    activeTab === 'supers'      ? getSupers(hiveId, user.id)                 : Promise.resolve([]),
    activeTab === 'treatments'  ? getTreatments(hiveId, user.id)             : Promise.resolve([]),
    activeTab === 'reminders'   ? getReminders(hiveId, user.id)              : Promise.resolve([]),
    activeTab === 'photos'      ? getHivePhotos(hiveId, user.id)             : Promise.resolve([] as HivePhoto[]),
    activeTab === 'inspections' ? getInspectionPhotosByHive(hiveId, user.id) : Promise.resolve({} as Record<string, InspectionPhoto[]>),
    activeTab === 'photos'      ? getUserTier(user.id)                       : Promise.resolve('free' as const),
  ])
  const isPro = tier === 'pro'

  // Ownership check: getHive filters by user_id; null means not found or not owned
  if (!hive) redirect('/apiary')

  // Status badge colours
  const statusBadge =
    hive.status === 'active'   ? { bg: 'var(--forest-pale)', color: 'var(--forest)' }   :
    hive.status === 'lost'     ? { bg: '#fee2e2',            color: 'var(--coral)' }     :
                                 { bg: 'var(--cream-dark)',   color: 'var(--mist)' }

  const tabDef = [
    { id: 'inspections', label: 'Inspections' },
    { id: 'queen',       label: 'Queen' },
    { id: 'supers',      label: 'Supers' },
    { id: 'treatments',  label: 'Treatments' },
    { id: 'reminders',   label: 'Reminders', pro: true },
    { id: 'photos',      label: 'Photos',    pro: true },
  ] as const

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>

      {/* Hero / header */}
      <div className="page-hero">
        <div className="container mx-auto px-5 lg:px-8">
          <Link
            href="/apiary"
            style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem' }}
          >
            ← My Apiary
          </Link>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 style={{ marginBottom: '0.5rem' }}>{hive.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                {hive.location && (
                  <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>
                    📍 {hive.location}
                  </span>
                )}
                {hive.hive_type && (
                  <span style={{ ...PILL, background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }}>
                    {hive.hive_type}
                  </span>
                )}
                <span style={{ ...PILL, background: statusBadge.bg, color: statusBadge.color, fontSize: '0.7rem' }}>
                  {hive.status}
                </span>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Supers',     value: hive.super_count ?? 0 },
                { label: 'Last check', value: hive.last_inspection_at
                    ? new Date(hive.last_inspection_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'Never' },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.3rem', fontWeight: 700, color: 'white', lineHeight: 1.1 }}>
                    {value}
                  </span>
                  <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--cream-dark)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div className="container mx-auto px-5 lg:px-8">
          <nav style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
            {tabDef.map(t => (
              <Link
                key={t.id}
                href={`/apiary/${hiveId}?tab=${t.id}`}
                style={{
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: '0.82rem', fontWeight: 500,
                  padding: '0.9rem 1.1rem',
                  textDecoration: 'none',
                  borderBottom: activeTab === t.id ? '2px solid var(--honey)' : '2px solid transparent',
                  color: activeTab === t.id ? 'var(--forest)' : 'var(--mist)',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  transition: 'color 0.15s',
                }}
              >
                {t.label}
                {'pro' in t && t.pro && (
                  <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.08em', padding: '0.1rem 0.4rem', borderRadius: 3, background: 'var(--honey)', color: 'var(--forest)', verticalAlign: 'middle' }}>
                    PRO
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab content */}
      <div className="container mx-auto px-5 lg:px-8" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {activeTab === 'inspections' && <InspectionsTab hiveId={hiveId} inspections={inspections} inspectionPhotos={inspectionPhotos} />}
        {activeTab === 'queen'       && <QueenTab       hiveId={hiveId} queen={queen} />}
        {activeTab === 'supers'      && <SupersTab      hiveId={hiveId} supers={supers} />}
        {activeTab === 'treatments'  && <TreatmentsTab  hiveId={hiveId} treatments={treatments} />}
        {activeTab === 'reminders'   && <RemindersTab   hiveId={hiveId} reminders={reminders} />}
        {activeTab === 'photos'      && <HivePhotoManager hiveId={hiveId} userId={user.id} initialPhotos={hivePhotos} isPro={isPro} />}

        <HiveStatusControls hiveId={hiveId} currentStatus={hive.status} />
      </div>
    </div>
  )
}
