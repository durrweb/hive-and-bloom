'use client'
import { useActionState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { logInspection } from '@/app/apiary/actions'

const LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans), sans-serif',
  fontSize: '0.78rem', fontWeight: 600,
  letterSpacing: '0.05em', textTransform: 'uppercase',
  color: 'var(--forest)',
}

function Field({ label, name, required, ...rest }: { label: string; name: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <label htmlFor={name} style={LABEL}>
        {label}{required && <span style={{ color: 'var(--coral)' }}> *</span>}
      </label>
      <input id={name} name={name} required={required} className="auth-field" {...rest} />
    </div>
  )
}

function SelectField({ label, name, options, required }: { label: string; name: string; options: string[]; required?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <label htmlFor={name} style={LABEL}>
        {label}{required && <span style={{ color: 'var(--coral)' }}> *</span>}
      </label>
      <select id={name} name={name} className="auth-field">
        <option value="">—</option>
        {options.map(o => <option key={o} value={o.toLowerCase()}>{o}</option>)}
      </select>
    </div>
  )
}

function CheckboxField({ label, name }: { label: string; name: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.9rem', color: 'var(--forest)', fontWeight: 500 }}>
      <input type="checkbox" name={name} style={{ width: 16, height: 16, accentColor: 'var(--forest)', cursor: 'pointer' }} />
      {label}
    </label>
  )
}

export default function NewInspectionPage() {
  const { hiveId } = useParams<{ hiveId: string }>()
  const [state, formAction, pending] = useActionState(logInspection, null)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <div className="page-hero">
        <div className="container mx-auto px-5 lg:px-8">
          <Link
            href={`/apiary/${hiveId}?tab=inspections`}
            style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem' }}
          >
            ← Back to hive
          </Link>
          <h1>Log Inspection</h1>
        </div>
      </div>

      <div className="container mx-auto px-5 lg:px-8" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
        <div className="card" style={{ maxWidth: 640, padding: '2rem' }}>
          <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <input type="hidden" name="hiveId" value={hiveId} />

            {state?.error && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem 1rem', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.88rem', color: 'var(--coral)' }}>
                {state.error}
              </div>
            )}

            {/* Date + Health */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Inspection date" name="inspected_at" type="date" defaultValue={today} required />
              <SelectField label="Overall health" name="overall_health" options={['Excellent', 'Good', 'Fair', 'Poor']} />
            </div>

            {/* Checkboxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <span style={LABEL}>Observations</span>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <CheckboxField label="Queen seen" name="queen_seen" />
                <CheckboxField label="Eggs seen" name="eggs_seen" />
              </div>
            </div>

            {/* Brood + Population */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <SelectField label="Brood pattern" name="brood_pattern" options={['Solid', 'Spotty', 'Scattered']} />
              <SelectField label="Population" name="population" options={['Strong', 'Medium', 'Building', 'Weak']} />
            </div>

            {/* Temperament + Varroa */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <SelectField label="Temperament" name="temperament" options={['Calm', 'Defensive', 'Aggressive']} />
              <Field label="Varroa count (%)" name="varroa_count" type="number" min="0" max="100" step="0.1" placeholder="e.g. 1.5" />
            </div>

            {/* PRO: Weather + Weight */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Weather" name="weather" placeholder="e.g. Sunny, 18°C" />
              <Field label="Hive weight (kg)" name="weight_kg" type="number" min="0" step="0.1" placeholder="e.g. 32.5" />
            </div>

            {/* Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="notes" style={LABEL}>Notes</label>
              <textarea
                id="notes" name="notes" rows={4}
                className="auth-field"
                style={{ resize: 'vertical' }}
                placeholder="Observations, concerns, actions taken…"
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
              <Link href={`/apiary/${hiveId}?tab=inspections`} className="btn" style={{ background: 'var(--cream-dark)', color: 'var(--forest)' }}>
                Cancel
              </Link>
              <button type="submit" disabled={pending} className="btn btn-primary">
                {pending ? 'Saving…' : 'Log Inspection'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
