// components/calendar/SeasonalPreview.tsx
import Link from 'next/link'
import { getTasksBySeason } from '@/lib/queries'
import type { Season } from '@/types/database'

function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1 // 1–12
  if (month >= 3 && month <= 5)  return 'spring'
  if (month >= 6 && month <= 8)  return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

const SEASON_META: Record<Season, { label: string; emoji: string; color: string; bg: string }> = {
  spring: { label: 'Spring', emoji: '🌱', color: '#3D6B3A', bg: '#EBF4E6' },
  summer: { label: 'Summer', emoji: '☀️', color: '#8A4F0A', bg: '#FBF0D9' },
  autumn: { label: 'Autumn', emoji: '🍂', color: '#7A3520', bg: '#FAF0EB' },
  winter: { label: 'Winter', emoji: '❄️', color: '#1A4A6A', bg: '#EBF3FA' },
}

const CAT_COLOR: Record<string, string> = {
  hive:        '#C8771E',
  garden:      '#3D6B3A',
  'mason-bee': '#8A7BAF',
}

export default async function SeasonalPreview() {
  const currentSeason = getCurrentSeason()
  const tasks = await getTasksBySeason(currentSeason)
  const meta = SEASON_META[currentSeason]

  return (
    <div>
      {/* Season tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {(Object.entries(SEASON_META) as [Season, typeof meta][]).map(([s, m]) => (
          <div key={s} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.4rem 1rem', borderRadius: 20,
            background: s === currentSeason ? meta.color : 'white',
            color: s === currentSeason ? 'white' : 'var(--mist)',
            fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', fontWeight: 500,
            border: `1px solid ${s === currentSeason ? meta.color : 'var(--cream-dark)'}`,
          }}>
            <span>{m.emoji}</span>
            <span>{m.label}</span>
            {s === currentSeason && <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>← now</span>}
          </div>
        ))}
      </div>

      {/* Current season heading */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '2.5rem' }}>{meta.emoji}</span>
        <div>
          <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', fontWeight: 700, color: meta.color, marginBottom: '0.1rem' }}>
            {meta.label} Tasks
          </h3>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem', color: 'var(--mist)' }}>
            What to do in your hive and garden right now
          </p>
        </div>
      </div>

      {/* Task cards — show up to 6 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {tasks.slice(0, 6).map(task => {
          const catColor = CAT_COLOR[task.category] ?? '#8A8478'
          return (
            <div key={task.id} style={{ background: 'white', borderRadius: 12, padding: '1.25rem 1.4rem', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span style={{ background: `${catColor}22`, color: catColor, fontFamily: 'var(--font-dm-sans)', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.06em', padding: '0.2rem 0.6rem', borderRadius: 20 }}>
                  {task.category === 'hive' ? '🐝 Hive' : task.category === 'garden' ? '🌿 Garden' : '🔴 Mason Bee'}
                </span>
                {task.difficulty && (
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', color: 'var(--mist)', textTransform: 'capitalize' }}>
                    {task.difficulty}
                  </span>
                )}
              </div>
              <h4 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.05rem', fontWeight: 600, color: 'var(--forest)', lineHeight: 1.3, marginBottom: '0.4rem' }}>
                {task.title}
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--mist)', fontWeight: 300, lineHeight: 1.55 }}>
                {task.description}
              </p>
              {task.related_article_id && (
                <Link href={`/articles/${task.related_article_id}`} style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'var(--honey)', fontWeight: 500, marginTop: '0.65rem', display: 'inline-block', textDecoration: 'none' }}>
                  Read the guide →
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
