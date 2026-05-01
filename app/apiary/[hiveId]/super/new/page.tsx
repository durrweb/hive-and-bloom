'use client'
import { useActionState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { addSuper } from '@/app/apiary/actions'

const LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans), sans-serif',
  fontSize: '0.78rem', fontWeight: 600,
  letterSpacing: '0.05em', textTransform: 'uppercase',
  color: 'var(--forest)',
}

export default function NewSuperPage() {
  const { hiveId } = useParams<{ hiveId: string }>()
  const [state, formAction, pending] = useActionState(addSuper, null)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <div className="page-hero">
        <div className="container mx-auto px-5 lg:px-8">
          <Link
            href={`/apiary/${hiveId}?tab=supers`}
            style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem' }}
          >
            ← Back to hive
          </Link>
          <h1>Add Super</h1>
        </div>
      </div>

      <div className="container mx-auto px-5 lg:px-8" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
        <div className="card" style={{ maxWidth: 560, padding: '2rem' }}>
          <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <input type="hidden" name="hiveId" value={hiveId} />

            {state?.error && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem 1rem', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.88rem', color: 'var(--coral)' }}>
                {state.error}
              </div>
            )}

            {/* Date + Position */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label htmlFor="date_added" style={LABEL}>Date added</label>
                <input id="date_added" name="date_added" type="date" className="auth-field" defaultValue={today} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label htmlFor="position" style={LABEL}>Position (from bottom)</label>
                <input id="position" name="position" type="number" min="1" className="auth-field" placeholder="e.g. 1" />
              </div>
            </div>

            {/* Frames + Estimated yield */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label htmlFor="frames_count" style={LABEL}>Frames</label>
                <input id="frames_count" name="frames_count" type="number" min="1" max="30" className="auth-field" placeholder="e.g. 10" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label htmlFor="estimated_kg" style={LABEL}>Est. yield (kg)</label>
                <input id="estimated_kg" name="estimated_kg" type="number" min="0" step="0.1" className="auth-field" placeholder="e.g. 15" />
              </div>
            </div>

            {/* Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="notes" style={LABEL}>Notes</label>
              <textarea
                id="notes" name="notes" rows={3}
                className="auth-field"
                style={{ resize: 'vertical' }}
                placeholder="Any additional notes…"
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
              <Link href={`/apiary/${hiveId}?tab=supers`} className="btn" style={{ background: 'var(--cream-dark)', color: 'var(--forest)' }}>
                Cancel
              </Link>
              <button type="submit" disabled={pending} className="btn btn-primary">
                {pending ? 'Adding…' : 'Add Super'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
