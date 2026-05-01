'use client'
import { useActionState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { addReminder } from '@/app/apiary/actions'

const LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans), sans-serif',
  fontSize: '0.78rem', fontWeight: 600,
  letterSpacing: '0.05em', textTransform: 'uppercase',
  color: 'var(--forest)',
}

export default function NewReminderPage() {
  const { hiveId } = useParams<{ hiveId: string }>()
  const [state, formAction, pending] = useActionState(addReminder, null)

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <div className="page-hero">
        <div className="container mx-auto px-5 lg:px-8">
          <Link
            href={`/apiary/${hiveId}?tab=reminders`}
            style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem' }}
          >
            ← Back to hive
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{ margin: 0 }}>Add Reminder</h1>
            <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', padding: '0.2rem 0.55rem', borderRadius: 4, background: 'var(--honey)', color: 'var(--forest)' }}>
              PRO
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-5 lg:px-8" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
        <div className="card" style={{ maxWidth: 520, padding: '2rem' }}>
          <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <input type="hidden" name="hiveId" value={hiveId} />

            {state?.error && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem 1rem', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.88rem', color: 'var(--coral)' }}>
                {state.error}
              </div>
            )}

            {/* Title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="title" style={LABEL}>
                Title <span style={{ color: 'var(--coral)' }}>*</span>
              </label>
              <input
                id="title" name="title" required
                className="auth-field"
                placeholder="e.g. Treat for varroa, Harvest supers"
              />
            </div>

            {/* Due date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="due_at" style={LABEL}>
                Due date <span style={{ color: 'var(--coral)' }}>*</span>
              </label>
              <input id="due_at" name="due_at" type="date" required className="auth-field" />
            </div>

            {/* Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="notes" style={LABEL}>Notes</label>
              <textarea
                id="notes" name="notes" rows={3}
                className="auth-field"
                style={{ resize: 'vertical' }}
                placeholder="Any additional context…"
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
              <Link href={`/apiary/${hiveId}?tab=reminders`} className="btn" style={{ background: 'var(--cream-dark)', color: 'var(--forest)' }}>
                Cancel
              </Link>
              <button type="submit" disabled={pending} className="btn btn-primary">
                {pending ? 'Saving…' : 'Add Reminder'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
