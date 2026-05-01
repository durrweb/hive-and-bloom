'use client'
import { useState, useEffect } from 'react'

const BANNER_KEY = 'db_pro_banner_dismissed'

export default function ProBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(BANNER_KEY)) setVisible(true)
  }, [])

  if (!visible) return null

  return (
    <div style={{
      background: 'var(--honey-pale)',
      border: '1px solid var(--honey-light)',
      borderRadius: 10,
      padding: '0.9rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      marginBottom: '2rem',
    }}>
      <p style={{
        fontFamily: 'var(--font-dm-sans), sans-serif',
        fontSize: '0.88rem',
        color: 'var(--honey-deep)',
        margin: 0,
        lineHeight: 1.5,
      }}>
        🐝 <strong>Founding Member — Pro features are FREE</strong> while we&apos;re in beta.
        Normally $7/month — locked in free for you as an early member.
      </p>
      <button
        onClick={() => { localStorage.setItem(BANNER_KEY, '1'); setVisible(false) }}
        aria-label="Dismiss"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--honey-deep)',
          fontSize: '1.4rem',
          lineHeight: 1,
          flexShrink: 0,
          padding: '0 0.25rem',
          opacity: 0.6,
        }}
      >
        ×
      </button>
    </div>
  )
}
