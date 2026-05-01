'use client'
import { useActionState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { logTreatment } from '@/app/apiary/actions'

const LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans), sans-serif',
  fontSize: '0.78rem', fontWeight: 600,
  letterSpacing: '0.05em', textTransform: 'uppercase',
  color: 'var(--forest)',
}

const TREATMENT_TYPES = [
  'Oxalic Acid (Vaporisation)',
  'Oxalic Acid (Dribble)',
  'Apiguard (Thymol)',
  'ApiLife VAR (Thymol)',
  'MAQS (Formic Acid)',
  'Apistan (Tau-Fluvalinate)',
  'Bayvarol (Flumethrin)',
  'Apivar (Amitraz)',
  'Sugar Syrup (Feeding)',
  'Fondant (Feeding)',
  'Pollen Substitute',
  'Other',
]

export default function NewTreatmentPage() {
  const { hiveId } = useParams<{ hiveId: string }>()
  const [state, formAction, pending] = useActionState(logTreatment, null)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <div className="page-hero">
        <div className="container mx-auto px-5 lg:px-8">
          <Link
            href={`/apiary/${hiveId}?tab=treatments`}
            style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem' }}
          >
            ← Back to hive
          </Link>
          <h1>Log Treatment</h1>
        </div>
      </div>

      <div className="container mx-auto px-5 lg:px-8" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
        <div className="card" style={{ maxWidth: 620, padding: '2rem' }}>
          <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <input type="hidden" name="hiveId" value={hiveId} />

            {state?.error && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem 1rem', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.88rem', color: 'var(--coral)' }}>
                {state.error}
              </div>
            )}

            {/* Treatment type */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="type" style={LABEL}>
                Treatment type <span style={{ color: 'var(--coral)' }}>*</span>
              </label>
              <select id="type" name="type" required className="auth-field">
                <option value="">Select treatment…</option>
                {TREATMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label htmlFor="applied_at" style={LABEL}>
                  Applied <span style={{ color: 'var(--coral)' }}>*</span>
                </label>
                <input id="applied_at" name="applied_at" type="date" required className="auth-field" defaultValue={today} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label htmlFor="completed_at" style={LABEL}>Completed</label>
                <input id="completed_at" name="completed_at" type="date" className="auth-field" />
              </div>
            </div>

            {/* Dose */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="dose" style={LABEL}>Dose / quantity</label>
              <input id="dose" name="dose" className="auth-field" placeholder="e.g. 2.5g, 1 strip, 50ml" />
            </div>

            {/* PRO: Varroa before / after */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label htmlFor="varroa_before" style={LABEL}>Varroa before (%)</label>
                <input id="varroa_before" name="varroa_before" type="number" min="0" max="100" step="0.1" className="auth-field" placeholder="e.g. 3.5" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label htmlFor="varroa_after" style={LABEL}>Varroa after (%)</label>
                <input id="varroa_after" name="varroa_after" type="number" min="0" max="100" step="0.1" className="auth-field" placeholder="e.g. 0.5" />
              </div>
            </div>

            {/* Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="notes" style={LABEL}>Notes</label>
              <textarea
                id="notes" name="notes" rows={3}
                className="auth-field"
                style={{ resize: 'vertical' }}
                placeholder="Observations, side effects, next steps…"
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
              <Link href={`/apiary/${hiveId}?tab=treatments`} className="btn" style={{ background: 'var(--cream-dark)', color: 'var(--forest)' }}>
                Cancel
              </Link>
              <button type="submit" disabled={pending} className="btn btn-primary">
                {pending ? 'Saving…' : 'Log Treatment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
