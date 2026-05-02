'use client'
import { useState, useActionState } from 'react'
import Link from 'next/link'
import { updateHive } from '@/app/apiary/actions'
import type { Hive } from '@/lib/apiary-queries'

const HIVE_TYPES = ['Langstroth', 'Top-bar', 'Warré', 'Horizontal', 'Other']

const ORIGIN_TYPES = [
  { value: 'swarm',    label: 'Caught swarm',           sourceLabel: 'Source hive (if known)' },
  { value: 'split',    label: 'Split from another hive', sourceLabel: 'Source hive' },
  { value: 'package',  label: 'Purchased package',       sourceLabel: 'Purchased from' },
  { value: 'nuc',      label: 'Purchased nucleus (nuc)',  sourceLabel: 'Purchased from' },
  { value: 'cutout',   label: 'Cutout',                  sourceLabel: 'Location / structure' },
  { value: 'transfer', label: 'Gift / transfer',         sourceLabel: 'From' },
  { value: 'other',    label: 'Other',                   sourceLabel: 'Source' },
]

const LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans), sans-serif',
  fontSize: '0.78rem', fontWeight: 600,
  letterSpacing: '0.05em', textTransform: 'uppercase',
  color: 'var(--forest)',
}

export default function EditHiveForm({ hive }: { hive: Hive }) {
  const [state, formAction, pending] = useActionState(updateHive, null)
  const [originType, setOriginType] = useState(hive.origin_type ?? '')

  const sourceLabel = ORIGIN_TYPES.find(o => o.value === originType)?.sourceLabel ?? 'Source'

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <div className="page-hero">
        <div className="container mx-auto px-5 lg:px-8">
          <Link
            href={`/apiary/${hive.id}`}
            style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem' }}
          >
            ← Back to hive
          </Link>
          <h1>Edit Hive</h1>
        </div>
      </div>

      <div className="container mx-auto px-5 lg:px-8" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
        <div className="card" style={{ maxWidth: 560, padding: '2rem' }}>
          <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <input type="hidden" name="hiveId" value={hive.id} />

            {state?.error && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem 1rem', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.88rem', color: 'var(--coral)' }}>
                {state.error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="name" style={LABEL}>
                Hive name <span style={{ color: 'var(--coral)' }}>*</span>
              </label>
              <input id="name" name="name" required defaultValue={hive.name} className="auth-field" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="location" style={LABEL}>Location</label>
              <input id="location" name="location" defaultValue={hive.location ?? ''} placeholder="e.g. Back garden, south-facing" className="auth-field" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="hive_type" style={LABEL}>Hive type</label>
              <select id="hive_type" name="hive_type" defaultValue={hive.hive_type ?? ''} className="auth-field">
                <option value="">Select type…</option>
                {HIVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Origin section */}
            <div style={{ borderTop: '1px solid var(--cream-dark)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span style={{ ...LABEL, color: 'var(--mist)' }}>Origin</span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label htmlFor="origin_type" style={LABEL}>How did you acquire this hive?</label>
                <select
                  id="origin_type" name="origin_type" className="auth-field"
                  value={originType} onChange={e => setOriginType(e.target.value)}
                >
                  <option value="">Select…</option>
                  {ORIGIN_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {originType && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label htmlFor="origin_source" style={LABEL}>{sourceLabel}</label>
                      <input id="origin_source" name="origin_source" defaultValue={hive.origin_source ?? ''} placeholder="Optional" className="auth-field" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label htmlFor="origin_date" style={LABEL}>Date acquired</label>
                      <input id="origin_date" name="origin_date" type="date" defaultValue={hive.origin_date ?? ''} className="auth-field" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label htmlFor="origin_notes" style={LABEL}>Origin notes</label>
                    <textarea
                      id="origin_notes" name="origin_notes" rows={2}
                      defaultValue={hive.origin_notes ?? ''}
                      placeholder="Any additional details about where this colony came from…"
                      className="auth-field" style={{ resize: 'vertical' }}
                    />
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="notes" style={LABEL}>General notes</label>
              <textarea id="notes" name="notes" rows={3} defaultValue={hive.notes ?? ''} placeholder="Any additional notes…" className="auth-field" style={{ resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
              <Link href={`/apiary/${hive.id}`} className="btn" style={{ background: 'var(--cream-dark)', color: 'var(--forest)' }}>
                Cancel
              </Link>
              <button type="submit" disabled={pending} className="btn btn-primary">
                {pending ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
