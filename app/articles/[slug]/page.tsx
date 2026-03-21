// app/articles/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getArticleBySlug, getArticleTags, getLatestArticles, getComments } from '@/lib/queries'
import CommentSection from '@/components/community/CommentSection'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return { title: 'Article Not Found' }
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      images: article.cover_image_url ? [article.cover_image_url] : [],
    },
  }
}

export const revalidate = 3600

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const [article, comments, relatedArticles] = await Promise.all([
    getArticleBySlug(slug),
    getComments(undefined, undefined), // loaded per article below
    getLatestArticles(3),
  ])

  if (!article) notFound()

  const tags = await getArticleTags(article.id)
  const articleComments = await getComments(article.id)

  return (
    <div className="article-page">
      {/* Cover */}
      <div className="article-cover" style={article.cover_image_url ? { backgroundImage: `url(${article.cover_image_url})` } : {}}>
        <div className="article-cover-overlay" />
        <div className="container mx-auto px-5 lg:px-8" style={{ position: 'relative', zIndex: 1 }}>
          <div className="article-cover-inner">
            <div className="article-breadcrumb">
              <Link href="/articles">Articles</Link>
              {article.category_name && (
                <><span> / </span><Link href={`/articles?category=${article.category_slug}`}>{article.category_name}</Link></>
              )}
            </div>
            {article.difficulty && (
              <span className="tag-pill difficulty-badge">{article.difficulty}</span>
            )}
            <h1 className="article-title">{article.title}</h1>
            {article.subtitle && <p className="article-subtitle">{article.subtitle}</p>}
            <div className="article-meta-row">
              {article.author_avatar && (
                <img src={article.author_avatar} alt={article.author_name} className="author-avatar" />
              )}
              <div>
                <span className="author-name">
                  By <Link href={`/community/members/${article.author_username}`}>{article.author_name}</Link>
                </span>
                <span className="meta-divider">·</span>
                {article.published_at && (
                  <time dateTime={article.published_at}>
                    {new Date(article.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </time>
                )}
                {article.read_time_mins && (
                  <><span className="meta-divider">·</span><span>{article.read_time_mins} min read</span></>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="article-body-wrap">
        <div className="container mx-auto px-5 lg:px-8">
          <div className="article-layout">
            {/* Main content */}
            <article className="prose-hive article-content">
              {/* In production: render MDX or parsed markdown here */}
              <div dangerouslySetInnerHTML={{ __html: article.body }} />
            </article>

            {/* Sidebar */}
            <aside className="article-sidebar">
              {/* Tags */}
              {tags.length > 0 && (
                <div className="sidebar-block">
                  <h3 className="sidebar-heading">Tags</h3>
                  <div className="tag-list">
                    {tags.map(tag => (
                      <Link key={tag} href={`/articles?tag=${tag}`} className="tag-chip">{tag}</Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related */}
              <div className="sidebar-block">
                <h3 className="sidebar-heading">More Articles</h3>
                <div className="related-list">
                  {relatedArticles.filter(a => a.id !== article.id).slice(0, 3).map(a => (
                    <Link key={a.id} href={`/articles/${a.slug}`} className="related-item">
                      <span className="related-cat">{a.category_icon} {a.category_name}</span>
                      <span className="related-title">{a.title}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Newsletter CTA */}
              <div className="sidebar-newsletter">
                <h3>Get weekly tips</h3>
                <p>Join 8,400+ beekeepers and pollinator supporters.</p>
                <Link href="/auth/signup" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem' }}>
                  Join for free →
                </Link>
              </div>
            </aside>
          </div>

          {/* Comments */}
          <div className="article-comments">
            <CommentSection articleId={article.id} comments={articleComments} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .article-cover {
          min-height: 400px; background: var(--forest); background-size: cover; background-position: center;
          position: relative; display: flex; align-items: flex-end;
          padding: 4rem 0 3rem;
        }
        .article-cover-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(20,40,20,0.92) 0%, rgba(20,40,20,0.55) 60%, transparent 100%);
        }
        .article-cover-inner { max-width: 780px; }
        .article-breadcrumb {
          font-family: var(--font-dm-sans); font-size: 0.8rem; color: rgba(255,255,255,0.55);
          margin-bottom: 0.75rem;
        }
        .article-breadcrumb a { color: rgba(255,255,255,0.55); text-decoration: none; }
        .article-breadcrumb a:hover { color: var(--honey-light); }
        .difficulty-badge { background: rgba(200,119,30,0.3); color: var(--honey-light); margin-bottom: 0.75rem; }
        .article-title {
          font-family: var(--font-playfair); font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 700; color: white; line-height: 1.2; margin-bottom: 0.75rem;
        }
        .article-subtitle { font-size: 1.15rem; color: rgba(255,255,255,0.72); font-weight: 300; margin-bottom: 1.25rem; }
        .article-meta-row { display: flex; align-items: center; gap: 0.75rem; font-family: var(--font-dm-sans); font-size: 0.85rem; color: rgba(255,255,255,0.65); }
        .author-avatar { width: 36px; height: 36px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); }
        .author-name a { color: var(--honey-light); text-decoration: none; }
        .meta-divider { opacity: 0.4; }
        .article-body-wrap { padding: 4rem 0; }
        .article-layout { display: grid; grid-template-columns: 1fr 300px; gap: 4rem; align-items: start; }
        .article-content { max-width: 700px; }
        .article-sidebar { position: sticky; top: 90px; }
        .sidebar-block { background: white; border-radius: 12px; border: 1px solid var(--cream-dark); padding: 1.25rem; margin-bottom: 1.25rem; }
        .sidebar-heading { font-family: var(--font-dm-sans); font-size: 0.75rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--mist); margin-bottom: 0.75rem; }
        .tag-list { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .tag-chip {
          font-family: var(--font-dm-sans); font-size: 0.75rem; padding: 0.25rem 0.65rem;
          border-radius: 20px; background: var(--honey-pale); color: var(--honey-deep);
          text-decoration: none; transition: background 0.2s;
        }
        .tag-chip:hover { background: var(--honey-light); }
        .related-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .related-item { text-decoration: none; display: block; }
        .related-cat { font-family: var(--font-dm-sans); font-size: 0.72rem; color: var(--mist); display: block; margin-bottom: 0.15rem; }
        .related-title { font-family: var(--font-playfair); font-size: 0.95rem; font-weight: 600; color: var(--forest); line-height: 1.3; }
        .related-item:hover .related-title { color: var(--honey-deep); }
        .sidebar-newsletter { background: var(--forest); border-radius: 12px; padding: 1.5rem; }
        .sidebar-newsletter h3 { font-family: var(--font-playfair); font-size: 1.1rem; color: white; margin-bottom: 0.35rem; }
        .sidebar-newsletter p { font-size: 0.88rem; color: rgba(255,255,255,0.65); font-weight: 300; }
        .article-comments { border-top: 1px solid var(--cream-dark); padding-top: 3rem; margin-top: 3rem; max-width: 700px; }
        @media (max-width: 900px) {
          .article-layout { grid-template-columns: 1fr; }
          .article-sidebar { position: static; }
        }
      `}</style>
    </div>
  )
}
