'use client'
// app/auth/signup/page.tsx
import { useActionState } from 'react'
import Link from 'next/link'
import { signUp } from '@/app/actions'

type State = { error?: string } | null

const PERKS = [
  '🐝 Weekly seasonal hive-management tips',
  '🍯 Exclusive honey recipes & techniques',
  '🦋 Butterfly & pollinator garden guides',
  '💬 Access to member comments & forum',
  '🔖 Bookmark articles & recipes',
]

export default function SignupPage() {
  const [state, action, isPending] = useActionState<State, FormData>(signUp, null)

  return (
    <div className="auth-split-page">
      <div className="auth-split">
        {/* Left pane — perks */}
        <div className="auth-perks">
          <Link href="/" className="auth-logo-white">
            Hive <span>&amp;</span> Bloom
          </Link>
          <h2>Join 8,400+ people who love pollinators</h2>
          <ul className="perks-list">
            {PERKS.map(p => <li key={p}>{p}</li>)}
          </ul>
          <p className="perks-note">Free forever. No spam. Unsubscribe any time.</p>
        </div>

        {/* Right pane — form */}
        <div className="auth-form-pane">
          <h1>Create your account</h1>
          <p className="auth-sub">It&apos;s free and always will be</p>

          <form action={action} className="auth-form">
            <div className="auth-field">
              <label htmlFor="username">Username</label>
              <input
                id="username" name="username" type="text" required
                placeholder="beekeeper_ada" autoComplete="username"
                pattern="[a-zA-Z0-9_]{3,30}"
                title="3–30 characters, letters, numbers and underscores only"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" required placeholder="ada@example.com" autoComplete="email" />
            </div>
            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required placeholder="At least 8 characters" autoComplete="new-password" minLength={8} />
            </div>
            <p className="terms-note">
              By joining, you agree to our{' '}
              <Link href="/terms">Terms of Service</Link> and{' '}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>

            {state?.error && (
              <p style={{ color: '#C0392B', fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem' }}>
                {state.error}
              </p>
            )}

            <button type="submit" className="auth-btn" disabled={isPending}>
              {isPending ? 'Creating account…' : "Join the Hive — it's free →"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link href="/auth/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
