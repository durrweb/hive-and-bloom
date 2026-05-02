'use client'
import { useState } from 'react'
import Link from 'next/link'
import { FREE_HIVE_LIMIT } from '@/lib/apiary-constants'

export default function AddHiveButton({ atFreeLimit }: { atFreeLimit: boolean }) {
  const [showModal, setShowModal] = useState(false)

  if (!atFreeLimit) {
    return (
      <Link href="/apiary/new" className="btn btn-primary">
        + Add Hive
      </Link>
    )
  }

  return (
    <>
      <button onClick={() => setShowModal(true)} className="btn btn-primary">
        + Add Hive
      </button>

      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="upgrade-modal-title"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div style={{
            background: 'white', borderRadius: 14,
            padding: '2.25rem 2rem',
            maxWidth: 420, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🐝</div>

            <h2
              id="upgrade-modal-title"
              style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: '1.35rem', fontWeight: 700,
                color: 'var(--forest)', marginBottom: '0.75rem',
              }}
            >
              Free tier limit reached
            </h2>

            <p style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: '0.92rem', color: 'var(--mist)',
              lineHeight: 1.6, marginBottom: '1.75rem',
            }}>
              You&apos;ve reached the free tier limit of {FREE_HIVE_LIMIT} hives.
              Upgrade to Pro to add unlimited hives and unlock advanced features.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <Link
                href="/pricing"
                className="btn btn-primary"
                style={{ textAlign: 'center', display: 'block' }}
              >
                Upgrade to Pro
              </Link>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: '0.85rem', color: 'var(--mist)',
                  padding: '0.4rem',
                }}
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
