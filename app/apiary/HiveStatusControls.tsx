'use client'
import { useState } from 'react'
import { updateHiveStatus, deleteHive } from '@/app/apiary/actions'
import type { HiveStatus } from '@/lib/apiary-queries'

const BTN: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans), sans-serif',
  fontSize: '0.82rem', fontWeight: 500,
  padding: '0.45rem 1rem', borderRadius: 4,
  background: 'transparent', cursor: 'pointer',
}

const HEAD: React.CSSProperties = {
  fontFamily: 'var(--font-playfair), Georgia, serif',
  fontSize: '1rem', fontWeight: 700,
  color: 'var(--forest)', margin: '0 0 0.3rem',
}

const META: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans), sans-serif',
  fontSize: '0.85rem', color: 'var(--mist)',
  margin: '0 0 1rem',
}

export default function HiveStatusControls({ hiveId, currentStatus }: {
  hiveId: string
  currentStatus: HiveStatus
}) {
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting]   = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await deleteHive(hiveId)
  }

  return (
    <div className="card" style={{ padding: '1.5rem', marginTop: '2.5rem' }}>

      {/* Status controls */}
      <h3 style={HEAD}>Hive Status</h3>
      <p style={META}>
        Current status: <strong style={{ color: 'var(--forest)', textTransform: 'capitalize' }}>{currentStatus}</strong>
      </p>
      <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
        {currentStatus !== 'active' && (
          <form action={updateHiveStatus.bind(null, hiveId, 'active')}>
            <button type="submit" style={{ ...BTN, border: '1px solid var(--forest-light)', color: 'var(--forest)' }}>
              ✓ Mark Active
            </button>
          </form>
        )}
        {currentStatus !== 'inactive' && (
          <form action={updateHiveStatus.bind(null, hiveId, 'inactive')}>
            <button type="submit" style={{ ...BTN, border: '1px solid var(--mist)', color: 'var(--mist)' }}>
              Pause (Inactive)
            </button>
          </form>
        )}
        {currentStatus !== 'lost' && (
          <form action={updateHiveStatus.bind(null, hiveId, 'lost')}>
            <button type="submit" style={{ ...BTN, border: '1px solid var(--coral)', color: 'var(--coral)' }}>
              Mark as Lost
            </button>
          </form>
        )}
      </div>

      {/* Danger zone */}
      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--cream-dark)' }}>
        <h3 style={HEAD}>Danger Zone</h3>
        <p style={META}>
          Permanently delete this hive and all its records — inspections, treatments, queen history, supers, photos, and reminders. This cannot be undone.
        </p>
        <button
          onClick={() => setShowModal(true)}
          style={{ ...BTN, border: '1px solid var(--coral)', color: 'var(--coral)' }}
        >
          Delete Hive…
        </button>
      </div>

      {/* Confirmation modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-hive-title"
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
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
            <h2
              id="delete-hive-title"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.35rem', fontWeight: 700, color: 'var(--forest)', marginBottom: '0.75rem' }}
            >
              Delete this hive?
            </h2>
            <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.92rem', color: 'var(--mist)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              All inspections, treatments, queen history, supers, photos, and reminders will be permanently deleted. This cannot be undone.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ ...BTN, background: 'var(--coral)', border: 'none', color: 'white', padding: '0.65rem 1.25rem', fontSize: '0.9rem', opacity: deleting ? 0.7 : 1, cursor: deleting ? 'not-allowed' : 'pointer' }}
              >
                {deleting ? 'Deleting…' : 'Yes, delete hive'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{ ...BTN, border: 'none', color: 'var(--mist)', padding: '0.4rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
