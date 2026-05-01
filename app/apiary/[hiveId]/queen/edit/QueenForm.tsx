'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import { upsertQueen } from '@/app/apiary/actions'
import type { Queen } from '@/lib/apiary-queries'

const LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans), sans-serif',
  fontSize: '0.78rem', fontWeight: 600,
  letterSpacing: '0.05em', textTransform: 'uppercase',
  color: 'var(--forest)',
}

const MARK_COLORS = [
  { label: 'White (2026, 2021, 2016)', value: 'white' },
  { label: 'Yellow (2025, 2020, 2015)', value: 'yellow' },
  { label: 'Red (2024, 2019, 2014)', value: 'red' },
  { label: 'Green (2023, 2018, 2013)', value: 'green' },
  { label: 'Blue (2022, 2017, 2012)', value: 'blue' },
]

interface Props {
  hiveId: string
  queen: Queen | null
}

export default function QueenForm({ hiveId, queen }: Props) {
  const [state, formAction, pending] = useActionState(upsertQueen, null)

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <div className="page-hero">
        <div className="container mx-auto px-5 lg:px-8">
          <Link
            href={`/apiary/${hiveId}?tab=queen`}
            style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem' }}
          >
            ← Back to hive
          </Link>
          <h1>{queen ? 'Edit Queen' : 'Add Queen'}</h1>
        </div>
      </div>

      <div className="container mx-auto px-5 lg:px-8" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
        <div className="card" style={{ maxWidth: 580, padding: '2rem' }}>
          <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <input type="hidden" name="hiveId" value={hiveId} />

            {state?.error && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem 1rem', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.88rem', color: 'var(--coral)' }}>
                {state.error}
              </div>
            )}

            {/* Breed + Source */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label htmlFor="breed" style={LABEL}>Breed</label>
                <input id="breed" name="breed" className="auth-field" defaultValue={queen?.breed ?? ''} placeholder="e.g. Italian, Carniolan" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label htmlFor="source" style={LABEL}>Source</label>
                <input id="source" name="source" className="auth-field" defaultValue={queen?.source ?? ''} placeholder="e.g. Local breeder" />
              </div>
            </div>

            {/* Introduced + Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label htmlFor="installed_at" style={LABEL}>Introduced</label>
                <input id="installed_at" name="installed_at" type="date" className="auth-field" defaultValue={queen?.installed_at ?? ''} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label htmlFor="status" style={LABEL}>Status</label>
                <select id="status" name="status" className="auth-field" defaultValue={queen?.status ?? 'present'}>
                  <option value="present">Present</option>
                  <option value="missing">Missing</option>
                  <option value="replaced">Replaced</option>
                </select>
              </div>
            </div>

            {/* Marked checkbox + Mark colour */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={LABEL}>Marking</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.9rem', color: 'var(--forest)', fontWeight: 500 }}>
                <input
                  type="checkbox"
                  name="marked"
                  defaultChecked={queen?.marked ?? false}
                  style={{ width: 16, height: 16, accentColor: 'var(--forest)', cursor: 'pointer' }}
                />
                Queen is marked
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label htmlFor="mark_color" style={LABEL}>Mark colour</label>
                <select id="mark_color" name="mark_color" className="auth-field" defaultValue={queen?.mark_color ?? ''}>
                  <option value="">None / unknown</option>
                  {MARK_COLORS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="notes" style={LABEL}>Notes</label>
              <textarea
                id="notes" name="notes" rows={3}
                className="auth-field"
                style={{ resize: 'vertical' }}
                defaultValue={queen?.notes ?? ''}
                placeholder="Any additional observations…"
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
              <Link href={`/apiary/${hiveId}?tab=queen`} className="btn" style={{ background: 'var(--cream-dark)', color: 'var(--forest)' }}>
                Cancel
              </Link>
              <button type="submit" disabled={pending} className="btn btn-primary">
                {pending ? 'Saving…' : queen ? 'Save Changes' : 'Add Queen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
