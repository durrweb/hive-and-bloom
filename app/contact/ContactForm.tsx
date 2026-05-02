'use client'
import { useActionState } from 'react'
import { submitContact } from './actions'
import type { ContactState } from './actions'

const SUBJECTS = [
  'General enquiry',
  'Account or billing',
  'Bug report',
  'Feature request',
  'Press or partnership',
  'Other',
]

const LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans), sans-serif',
  fontSize: '0.78rem', fontWeight: 600,
  letterSpacing: '0.05em', textTransform: 'uppercase',
  color: 'var(--forest)',
}

export default function ContactForm() {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(submitContact, null)

  if (state?.status === 'success') {
    return (
      <div style={{
        background: 'var(--forest-pale)', border: '1px solid var(--forest-light)',
        borderRadius: 12, padding: '2.5rem', textAlign: 'center',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🐝</div>
        <h2 style={{
          fontFamily: 'var(--font-playfair), Georgia, serif',
          fontSize: '1.5rem', color: 'var(--forest)', margin: '0 0 0.75rem',
        }}>
          Message sent!
        </h2>
        <p style={{
          fontFamily: 'var(--font-crimson), Georgia, serif',
          fontSize: '1.05rem', color: 'var(--ink)', margin: 0, lineHeight: 1.7,
        }}>
          Thanks for reaching out. We'll get back to you at the email you provided, usually within one business day.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {state?.status === 'error' && (
        <div style={{
          background: '#fee2e2', border: '1px solid #fca5a5',
          borderRadius: 8, padding: '0.75rem 1rem',
          fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.88rem', color: 'var(--coral)',
        }}>
          {state.message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label htmlFor="name" style={LABEL}>
            Name <span style={{ color: 'var(--coral)' }}>*</span>
          </label>
          <input id="name" name="name" required placeholder="Your name" className="auth-field" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label htmlFor="email" style={LABEL}>
            Email <span style={{ color: 'var(--coral)' }}>*</span>
          </label>
          <input id="email" name="email" type="email" required placeholder="you@example.com" className="auth-field" />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label htmlFor="subject" style={LABEL}>Subject</label>
        <select id="subject" name="subject" className="auth-field">
          <option value="">Select a topic…</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label htmlFor="message" style={LABEL}>
          Message <span style={{ color: 'var(--coral)' }}>*</span>
        </label>
        <textarea
          id="message" name="message" required rows={6}
          placeholder="How can we help?"
          className="auth-field" style={{ resize: 'vertical' }}
        />
      </div>

      <button
        type="submit" disabled={pending} className="btn btn-primary"
        style={{ alignSelf: 'flex-start', minWidth: 160 }}
      >
        {pending ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}
