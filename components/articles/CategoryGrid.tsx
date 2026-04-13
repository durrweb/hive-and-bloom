'use client'
// components/articles/CategoryGrid.tsx
import Link from 'next/link'
import type { Category } from '@/types/database'

const FALLBACK_BG: Record<string, string> = {
  'honeybee-keeping':    '#FBF0D9',
  'native-bees':         '#EBF4E6',
  'butterfly-gardening': '#F2EEFA',
  'pollinator-plants':   '#FAF0EB',
  'hive-health':         '#EBF3FA',
  'hive-products':       '#F5EDE2',
  'getting-started':     '#EBF4E6',
  'conservation':        '#EBF4E6',
}

const FALLBACK_TEXT: Record<string, string> = {
  'honeybee-keeping':    '#8A4F0A',
  'native-bees':         '#2A4A2A',
  'butterfly-gardening': '#4A3980',
  'pollinator-plants':   '#7A3520',
  'hive-health':         '#1A4A6A',
  'hive-products':       '#8A4F0A',
  'getting-started':     '#2A4A2A',
  'conservation':        '#2A4A2A',
}

interface Props { categories: Category[] }

export default function CategoryGrid({ categories }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
      {categories.slice(0, 6).map(cat => {
        const bg   = FALLBACK_BG[cat.slug]   ?? '#FAF5EC'
        const text = FALLBACK_TEXT[cat.slug] ?? '#2A4A2A'
        const link = cat.color ?? text

        return (
          <Link key={cat.id} href={`/articles?category=${cat.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
            <div
              style={{ background: bg, borderRadius: 12, padding: '1.5rem 1.4rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'transform 0.25s, box-shadow 0.25s' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}>{cat.icon}</span>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, color: text, marginBottom: '0.4rem' }}>
                {cat.name}
              </h3>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.55, fontWeight: 300, color: text, opacity: 0.75, marginBottom: '0.9rem' }}>
                {cat.description}
              </p>
              <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: link }}>
                Browse guides →
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
