// app/auth/login/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { signIn } from '@/app/actions'

export const metadata: Metadata = { title: 'Sign In' }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirectTo?: string }> }) {
  const { redirectTo } = await searchParams

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-logo">Hive <span>&</span> Bloom</Link>
        <h1>Welcome back</h1>
        <p className="auth-sub">Sign in to your account</p>

        <form action={signIn} className="auth-form">
          {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required placeholder="you@example.com" autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required placeholder="••••••••" autoComplete="current-password" />
          </div>
          <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <Link href="/auth/forgot-password" className="forgot-link">Forgot password?</Link>
          </div>
          <button type="submit" className="auth-btn">Sign in →</button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link href="/auth/signup">Join for free</Link>
        </p>
      </div>

      <style jsx>{`
        .auth-page { min-height: 100vh; background: var(--forest); display: flex; align-items: center; justify-content: center; padding: 2rem; }
        .auth-card { background: white; border-radius: 16px; padding: 2.5rem; width: 100%; max-width: 420px; }
        .auth-logo { font-family: var(--font-playfair); font-size: 1.4rem; font-weight: 700; color: var(--forest); text-decoration: none; display: block; margin-bottom: 1.75rem; }
        .auth-logo span { font-style: italic; font-weight: 400; }
        h1 { font-family: var(--font-playfair); font-size: 1.8rem; font-weight: 700; color: var(--forest); margin-bottom: 0.25rem; }
        .auth-sub { color: var(--mist); font-size: 0.95rem; font-weight: 300; margin-bottom: 1.75rem; }
        .auth-form { display: flex; flex-direction: column; gap: 1rem; }
        .field { display: flex; flex-direction: column; gap: 0.35rem; }
        label { font-family: var(--font-dm-sans); font-size: 0.78rem; font-weight: 500; letter-spacing: 0.05em; color: var(--mist); }
        input { font-family: var(--font-dm-sans); font-size: 0.9rem; border: 1px solid #DDD; border-radius: 4px; padding: 0.75rem 1rem; background: var(--cream); color: var(--ink); outline: none; transition: border-color 0.2s; }
        input:focus { border-color: var(--honey); }
        .auth-btn { margin-top: 0.5rem; background: var(--honey); color: var(--forest); font-family: var(--font-dm-sans); font-size: 0.95rem; font-weight: 500; border: none; border-radius: 4px; padding: 0.85rem; cursor: pointer; transition: background 0.2s; }
        .auth-btn:hover { background: var(--honey-light); }
        .forgot-link { font-family: var(--font-dm-sans); font-size: 0.8rem; color: var(--mist); text-decoration: none; }
        .forgot-link:hover { color: var(--honey); }
        .auth-switch { text-align: center; font-family: var(--font-dm-sans); font-size: 0.88rem; color: var(--mist); margin-top: 1.5rem; }
        .auth-switch a { color: var(--honey-deep); font-weight: 500; text-decoration: none; }
      `}</style>
    </div>
  )
}
