// components/recipes/RecipeCard.tsx
import Link from 'next/link'
import type { RecipeWithMeta } from '@/types/database'

const HONEY_COLORS: Record<string, string> = {
  wildflower: '#C8771E', lavender: '#8A7BAF', clover: '#6B9E65',
  buckwheat: '#7A5C38', manuka: '#C96B4A', orange_blossom: '#E8A020',
}
const SEASON_BADGE: Record<string, string> = {
  spring: '🌱 Spring', summer: '☀️ Summer', autumn: '🍂 Autumn', winter: '❄️ Winter',
}

export default function RecipeCard({ recipe }: { recipe: RecipeWithMeta }) {
  const honeyColor = recipe.honey_variety ? (HONEY_COLORS[recipe.honey_variety] ?? '#C8771E') : '#C8771E'

  return (
    <Link href={`/recipes/${recipe.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article style={{
        background: 'var(--cream)', borderRadius: 12, overflow: 'hidden',
        border: '1px solid var(--cream-dark)', transition: 'transform 0.22s, box-shadow 0.22s',
        cursor: 'pointer',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 28px rgba(0,0,0,0.09)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}
      >
        {/* Image area */}
        <div style={{
          height: 160, background: recipe.cover_image_url
            ? `url(${recipe.cover_image_url}) center/cover`
            : `linear-gradient(135deg, ${honeyColor}33, ${honeyColor}11)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem',
        }}>
          {!recipe.cover_image_url && '🍯'}
        </div>
        <div style={{ padding: '1.2rem 1.3rem 1.4rem' }}>
          {/* Badges */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
            {recipe.honey_variety && (
              <span style={{ background: `${honeyColor}22`, color: honeyColor, padding: '0.2rem 0.6rem', borderRadius: 2, fontSize: '0.7rem', fontFamily: 'var(--font-dm-sans)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'capitalize' }}>
                {recipe.honey_variety.replace('_', ' ')} honey
              </span>
            )}
            {recipe.season_best && (
              <span style={{ background: 'var(--honey-pale)', color: 'var(--honey-deep)', padding: '0.2rem 0.6rem', borderRadius: 2, fontSize: '0.7rem', fontFamily: 'var(--font-dm-sans)', fontWeight: 500 }}>
                {SEASON_BADGE[recipe.season_best]}
              </span>
            )}
          </div>
          <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--forest)', lineHeight: 1.3, marginBottom: '0.35rem' }}>
            {recipe.title}
          </h3>
          {recipe.description && (
            <p style={{ fontSize: '0.9rem', color: 'var(--mist)', fontWeight: 300, lineHeight: 1.5, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {recipe.description}
            </p>
          )}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.8rem', fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'var(--mist)' }}>
            {recipe.total_time_mins && <span>⏱ {recipe.total_time_mins} min</span>}
            {recipe.servings && <span>🍽 {recipe.servings} servings</span>}
            {recipe.difficulty && <span style={{ textTransform: 'capitalize' }}>{recipe.difficulty}</span>}
          </div>
        </div>
      </article>
    </Link>
  )
}
