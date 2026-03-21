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
    <Link href={`/articles/${article.slug}`} className="article-card-link">
      <article className={`article-card ${variant}`}>
        {/* Cover image or color band */}
        {article.cover_image_url ? (
          <div className="article-card-img" style={{ backgroundImage: `url(${article.cover_image_url})` }} />
        ) : (
          <div className="article-card-color-band" style={{ background: article.category_color ?? 'var(--forest)' }}>
            <span className="article-card-icon">{article.category_icon ?? '📰'}</span>
          </div>
        )}

        <div className="article-card-body">
          {/* Category */}
          {article.category_name && (
            <span className="tag-pill article-cat" style={catStyle}>
              {article.category_icon} {article.category_name}
            </span>
          )}

          <h3 className="article-card-title">{article.title}</h3>

          {variant !== 'compact' && article.excerpt && (
            <p className="article-card-excerpt">{article.excerpt}</p>
          )}

          <div className="article-card-meta">
            {article.author_avatar && (
              <img src={article.author_avatar} alt={article.author_name} className="article-card-avatar" />
            )}
            <span>{article.author_name}</span>
            {article.read_time_mins && (
              <><span className="meta-dot">·</span><span>{article.read_time_mins} min</span></>
            )}
            {article.difficulty && (
              <><span className="meta-dot">·</span>
              <span className="difficulty-label" style={{ textTransform: 'capitalize' }}>{article.difficulty}</span></>
            )}
          </div>
        </div>
      </article>

      <style jsx>{`
        .article-card-link { text-decoration: none; display: block; height: 100%; }
        .article-card {
          background: white; border-radius: 12px; border: 1px solid var(--cream-dark);
          overflow: hidden; transition: box-shadow 0.25s, transform 0.25s;
          display: flex; flex-direction: column; height: 100%;
        }
        .article-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.1); transform: translateY(-3px); }
        .article-card-img {
          height: 180px; background-size: cover; background-position: center;
          flex-shrink: 0;
        }
        .article-card-color-band {
          height: 120px; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .article-card-icon { font-size: 2.5rem; opacity: 0.6; }
        .article-card-body { padding: 1.25rem; display: flex; flex-direction: column; flex: 1; }
        .article-cat { margin-bottom: 0.6rem; }
        .article-card-title {
          font-family: var(--font-playfair); font-size: 1.1rem; font-weight: 700;
          color: var(--forest); line-height: 1.3; margin-bottom: 0.4rem; flex: 1;
        }
        .article-card-excerpt {
          font-size: 0.9rem; color: var(--mist); font-weight: 300;
          line-height: 1.55; margin-bottom: 0.75rem;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .article-card-meta {
          display: flex; align-items: center; gap: 0.4rem;
          font-family: var(--font-dm-sans); font-size: 0.78rem; color: var(--mist);
          margin-top: auto;
        }
        .article-card-avatar { width: 20px; height: 20px; border-radius: 50%; }
        .meta-dot { opacity: 0.4; }
        .difficulty-label { color: var(--honey-deep); }
      `}</style>
    </Link>
  )
}
