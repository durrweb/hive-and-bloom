'use client'
// components/articles/ArticleCard.tsx
import Link from 'next/link'
import type { ArticleWithMeta } from '@/types/database'

interface Props {
  article: ArticleWithMeta
  variant?: 'default' | 'featured' | 'compact'
}

export default function ArticleCard({ article, variant = 'default' }: Props) {
  const catStyle = article.category_color
    ? { background: `${article.category_color}22`, color: article.category_color }
    : { background: 'var(--honey-pale)', color: 'var(--honey-deep)' }

  return (
    <Link href={`/articles/${article.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <article
        style={{ background: 'white', borderRadius: 12, border: '1px solid var(--cream-dark)', overflow: 'hidden', transition: 'box-shadow 0.25s, transform 0.25s', display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)'; el.style.transform = 'translateY(-3px)' }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = ''; el.style.transform = '' }}
      >
        {/* Cover image or color band */}
        {article.cover_image_url ? (
          <div style={{ height: 180, backgroundImage: `url(${article.cover_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
        ) : (
          <div style={{ height: 120, background: article.category_color ?? 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '2.5rem', opacity: 0.6 }}>{article.category_icon ?? '📰'}</span>
          </div>
        )}

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
          {article.category_name && (
            <span style={{ ...catStyle, fontFamily: 'var(--font-dm-sans)', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.2rem 0.65rem', borderRadius: 2, display: 'inline-block', marginBottom: '0.6rem', alignSelf: 'flex-start' }}>
              {article.category_icon} {article.category_name}
            </span>
          )}

          <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--forest)', lineHeight: 1.3, marginBottom: '0.4rem', flex: 1 }}>
            {article.title}
          </h3>

          {variant !== 'compact' && article.excerpt && (
            <p style={{ fontSize: '0.9rem', color: 'var(--mist)', fontWeight: 300, lineHeight: 1.55, marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {article.excerpt}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'var(--mist)', marginTop: 'auto' }}>
            {article.author_avatar && (
              <img src={article.author_avatar} alt={article.author_name} style={{ width: 20, height: 20, borderRadius: '50%' }} />
            )}
            <span>{article.author_name}</span>
            {article.read_time_mins && (
              <><span style={{ opacity: 0.4 }}>·</span><span>{article.read_time_mins} min</span></>
            )}
            {article.difficulty && (
              <><span style={{ opacity: 0.4 }}>·</span><span style={{ textTransform: 'capitalize', color: 'var(--honey-deep)' }}>{article.difficulty}</span></>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
