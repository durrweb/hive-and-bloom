'use client'
// app/auth/login/page.tsx
import { useActionState } from 'react'
import Link from 'next/link'
import { signIn } from '@/app/actions'

type State = { error?: string } | null

export default function LoginPage() {
  const [state, action, isPending] = useActionState<State, FormData>(signIn, null)

  // Read redirectTo from URL on the client
  const redirectTo = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('redirectTo') ?? ''
    : ''

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-logo">
          Hive <span>&amp;</span> Bloom
        </Link>
        <h1>Welcome back</h1>
        <p className="auth-sub">Sign in to your account</p>

        <form action={action} className="auth-form">
          {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required placeholder="you@example.com" autoComplete="email" />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required placeholder="••••••••" autoComplete="current-password" />
          </div>
          <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <Link href="/auth/forgot-password" className="forgot-link">Forgot password?</Link>
          </div>

          {state?.error && (
            <p style={{ color: '#C0392B', fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              {state.error}
            </p>
          )}

          <button type="submit" className="auth-btn" disabled={isPending}>
            {isPending ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account? <Link href="/auth/signup">Join for free</Link>
        </p>
      </div>
    </div>
  )
}
