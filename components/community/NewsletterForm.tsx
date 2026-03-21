// components/community/NewsletterForm.tsx
'use client'
import { useActionState, useRef } from 'react'
import { subscribeNewsletter } from '@/app/actions'

const INTERESTS = [
  { id: 'honeybees', label: '🐝 Honeybee Keeping' },
  { id: 'butterflies', label: '🦋 Butterfly Gardening' },
  { id: 'mason-bees', label: '🌿 Mason & Native Bees' },
  { id: 'recipes', label: '🍯 Honey Recipes' },
  { id: 'plants', label: '🌸 Pollinator Plants' },
  { id: 'hive-health', label: '🔬 Hive Health & Science' },
]

type State = { error?: string; success?: boolean } | null

export default function NewsletterForm() {
  const [state, action, isPending] = useActionState<State, FormData>(subscribeNewsletter, null)

  if (state?.success) {
    return (
      <div style={{
        background: 'white', borderRadius: 12, border: '1px solid var(--cream-dark)',
        padding: '2rem', textAlign: 'center',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎉</div>
        <h3 style={{ fontFamily: 'var(--font-playfair)', color: 'var(--forest)', marginBottom: '0.4rem' }}>You're in the hive!</h3>
        <p style={{ fontSize: '0.95rem', color: 'var(--mist)', fontWeight: 300 }}>
          Check your inbox to confirm your subscription. We'll send your first seasonal tips shortly.
        </p>
      </div>
    )
  }

  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--cream-dark)', padding: '2rem' }}>
      <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--forest)', marginBottom: '0.4rem' }}>
        Join the weekly newsletter
      </h3>
      <p style={{ fontSize: '0.95rem', color: 'var(--mist)', fontWeight: 300, marginBottom: '1.5rem' }}>
        Seasonal hive tips, new recipes, and pollinator news — every Thursday.
      </p>

      <form action={action}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.05em', color: 'var(--mist)', display: 'block', marginBottom: '0.35rem' }}>
            First name
          </label>
          <input
            name="firstName" type="text" placeholder="Ada"
            style={{ width: '100%', fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem', border: '1px solid #DDD', borderRadius: 4, padding: '0.75rem 1rem', background: 'var(--cream)', color: 'var(--ink)', outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.05em', color: 'var(--mist)', display: 'block', marginBottom: '0.35rem' }}>
            Email address *
          </label>
          <input
            name="email" type="email" required placeholder="ada@example.com"
            style={{ width: '100%', fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem', border: '1px solid #DDD', borderRadius: 4, padding: '0.75rem 1rem', background: 'var(--cream)', color: 'var(--ink)', outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.05em', color: 'var(--mist)', display: 'block', marginBottom: '0.5rem' }}>
            I'm interested in... (optional)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
            {INTERESTS.map(i => (
              <label key={i.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', cursor: 'pointer', padding: '0.3rem 0' }}>
                <input type="checkbox" name="interests" value={i.id} style={{ accentColor: 'var(--honey)' }} />
                {i.label}
              </label>
            ))}
          </div>
        </div>

        {state?.error && (
          <p style={{ color: '#C0392B', fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            {state.error}
          </p>
        )}

        <button
          type="submit" disabled={isPending}
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.95rem', opacity: isPending ? 0.7 : 1 }}
        >
          {isPending ? 'Joining…' : 'Join the newsletter — it\'s free →'}
        </button>

        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.75rem', color: 'var(--mist)', textAlign: 'center', marginTop: '0.75rem' }}>
          No spam, ever. Unsubscribe any time.
        </p>
      </form>
    </div>
  )
}
