'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import { addHive } from '@/app/apiary/actions'

const HIVE_TYPES = ['Langstroth', 'Top-bar', 'Warré', 'Horizontal', 'Other']

const LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans), sans-serif',
  fontSize: '0.78rem', fontWeight: 600,
  letterSpacing: '0.05em', textTransform: 'uppercase',
  color: 'var(--forest)',
}

export default function NewHivePage() {
  const [state, formAction, pending] = useActionState(addHive, null)

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <div className="page-hero">
        <div className="container mx-auto px-5 lg:px-8">
          <Link
            href="/apiary"
            style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem' }}
          >
            ← My Apiary
          </Link>
          <h1>Add Hive</h1>
        </div>
      </div>

      <div className="container mx-auto px-5 lg:px-8" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
        <div className="card" style={{ maxWidth: 560, padding: '2rem' }}>
          <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {state?.error && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem 1rem', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.88rem', color: 'var(--coral)' }}>
                {state.error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="name" style={LABEL}>
                Hive name <span style={{ color: 'var(--coral)' }}>*</span>
              </label>
              <input id="name" name="name" required placeholder="e.g. Garden Hive #1" className="auth-field" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="location" style={LABEL}>Location</label>
              <input id="location" name="location" placeholder="e.g. Back garden, south-facing" className="auth-field" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="hive_type" style={LABEL}>Hive type</label>
              <select id="hive_type" name="hive_type" className="auth-field">
                <option value="">Select type…</option>
                {HIVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="notes" style={LABEL}>Notes</label>
              <textarea id="notes" name="notes" rows={3} placeholder="Any additional notes…" className="auth-field" style={{ resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
              <Link href="/apiary" className="btn" style={{ background: 'var(--cream-dark)', color: 'var(--forest)' }}>
                Cancel
              </Link>
              <button type="submit" disabled={pending} className="btn btn-primary">
                {pending ? 'Adding…' : 'Add Hive'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
