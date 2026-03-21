// app/auth/signup/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { signUp } from '@/app/actions'

export const metadata: Metadata = { title: 'Join the Hive' }

const PERKS = [
  '🐝 Weekly seasonal hive-management tips',
  '🍯 Exclusive honey recipes & techniques',
  '🦋 Butterfly & pollinator garden guides',
  '💬 Access to member comments & forum',
  '🔖 Bookmark articles & recipes',
]

export default function SignupPage() {
  return (
    <div className="auth-page">
      <div className="auth-split">
        {/* Left pane — perks */}
        <div className="auth-perks">
          <Link href="/" className="auth-logo-white">Hive <span>&</span> Bloom</Link>
          <h2>Join 8,400+ people who love pollinators</h2>
          <ul className="perks-list">
            {PERKS.map(p => <li key={p}>{p}</li>)}
          </ul>
          <p className="perks-note">Free forever. No spam. Unsubscribe any time.</p>
        </div>

        {/* Right pane — form */}
        <div className="auth-card">
          <h1>Create your account</h1>
          <p className="auth-sub">It's free and always will be</p>

          <form action={signUp} className="auth-form">
            <div className="field">
              <label htmlFor="username">Username</label>
              <input id="username" name="username" type="text" required placeholder="beekeeper_ada" autoComplete="username" pattern="[a-zA-Z0-9_]{3,30}" title="3–30 characters, letters, numbers and underscores only" />
            </div>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" required placeholder="ada@example.com" autoComplete="email" />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required placeholder="At least 8 characters" autoComplete="new-password" minLength={8} />
            </div>
            <p className="terms-note">
              By joining, you agree to our{' '}
              <Link href="/terms">Terms of Service</Link> and{' '}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
            <button type="submit" className="auth-btn">Join the Hive — it's free →</button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link href="/auth/login">Sign in</Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .auth-page { min-height: 100vh; background: var(--cream); display: flex; align-items: stretch; }
        .auth-split { display: grid; grid-template-columns: 1fr 1fr; width: 100%; }
        .auth-perks { background: var(--forest); padding: 4rem 3rem; display: flex; flex-direction: column; justify-content: center; }
        .auth-logo-white { font-family: var(--font-playfair); font-size: 1.4rem; font-weight: 700; color: var(--honey-light); text-decoration: none; display: block; margin-bottom: 2.5rem; }
        .auth-logo-white span { font-style: italic; font-weight: 400; color: white; }
        .auth-perks h2 { font-family: var(--font-playfair); font-size: 1.75rem; font-weight: 700; color: white; line-height: 1.25; margin-bottom: 1.75rem; }
        .perks-list { list-style: none; margin-bottom: 2rem; }
        .perks-list li { color: rgba(255,255,255,0.82); font-size: 0.95rem; font-weight: 300; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .perks-note { font-family: var(--font-dm-sans); font-size: 0.8rem; color: rgba(255,255,255,0.45); }
        .auth-card { background: white; padding: 4rem 3rem; display: flex; flex-direction: column; justify-content: center; }
        h1 { font-family: var(--font-playfair); font-size: 1.8rem; font-weight: 700; color: var(--forest); margin-bottom: 0.25rem; }
        .auth-sub { color: var(--mist); font-size: 0.95rem; font-weight: 300; margin-bottom: 1.75rem; }
        .auth-form { display: flex; flex-direction: column; gap: 1rem; }
        .field { display: flex; flex-direction: column; gap: 0.35rem; }
        label { font-family: var(--font-dm-sans); font-size: 0.78rem; font-weight: 500; letter-spacing: 0.05em; color: var(--mist); }
        input { font-family: var(--font-dm-sans); font-size: 0.9rem; border: 1px solid #DDD; border-radius: 4px; padding: 0.75rem 1rem; background: var(--cream); color: var(--ink); outline: none; transition: border-color 0.2s; }
        input:focus { border-color: var(--honey); }
        .terms-note { font-family: var(--font-dm-sans); font-size: 0.78rem; color: var(--mist); }
        .terms-note a { color: var(--honey-deep); text-decoration: none; }
        .auth-btn { background: var(--honey); color: var(--forest); font-family: var(--font-dm-sans); font-size: 0.95rem; font-weight: 500; border: none; border-radius: 4px; padding: 0.85rem; cursor: pointer; transition: background 0.2s; }
        .auth-btn:hover { background: var(--honey-light); }
        .auth-switch { text-align: center; font-family: var(--font-dm-sans); font-size: 0.88rem; color: var(--mist); margin-top: 1.5rem; }
        .auth-switch a { color: var(--honey-deep); font-weight: 500; text-decoration: none; }
        @media (max-width: 768px) { .auth-split { grid-template-columns: 1fr; } .auth-perks { display: none; } }
      `}</style>
    </div>
  )
}
