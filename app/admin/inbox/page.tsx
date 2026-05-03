import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getConversations } from './actions'
import InboxClient from './InboxClient'

export const metadata: Metadata = {
  title: 'Inbox — Dreamybee Admin',
}

export default async function InboxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirectTo=/admin/inbox')

  const conversations = await getConversations()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--cream)' }}>
      {/* Admin header */}
      <header style={{
        background: 'var(--forest)',
        borderBottom: '2px solid var(--honey)',
        padding: '0 1.5rem',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: '1.05rem', fontWeight: 700,
            color: 'var(--honey-light)', textDecoration: 'none',
          }}>
            Hive &amp; Bloom
          </Link>
          <span style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: '0.7rem', fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)',
          }}>
            / Inbox
          </span>
        </div>
        <Link href="/apiary" style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)',
          textDecoration: 'none',
        }}>
          ← Back to app
        </Link>
      </header>

      <InboxClient initialConversations={conversations} />
    </div>
  )
}
