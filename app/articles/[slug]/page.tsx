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
  const [article, relatedArticles] = await Promise.all([
    getArticleBySlug(slug),
    getLatestArticles(3),
  ])

  if (!article) notFound()

  const [tags, articleComments] = await Promise.all([
    getArticleTags(article.id),
    getComments(article.id),
  ])

  return (
    <div>
      {/* Cover */}
      <div
        className="article-cover"
        style={article.cover_image_url ? { backgroundImage: `url(${article.cover_image_url})` } : {}}
      >
        <div className="article-cover-overlay" />
        <div className="container mx-auto px-5 lg:px-8" style={{ position: 'relative', zIndex: 1 }}>
          <div className="article-cover-inner">
            <div className="article-breadcrumb">
              <Link href="/articles">Articles</Link>
              {article.category_name && (
                <>
                  <span> / </span>
                  <Link href={`/articles?category=${article.category_slug}`}>{article.category_name}</Link>
                </>
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
                  By <span>{article.author_name}</span>
                </span>
                <span className="meta-divider"> · </span>
                {article.published_at && (
                  <time dateTime={article.published_at}>
                    {new Date(article.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </time>
                )}
                {article.read_time_mins && (
                  <><span className="meta-divider"> · </span><span>{article.read_time_mins} min read</span></>
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
              <div dangerouslySetInnerHTML={{ __html: article.body }} />
            </article>

            {/* Sidebar */}
            <aside className="article-sidebar">
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

              <div className="sidebar-block">
                <h3 className="sidebar-heading">More Articles</h3>
                <div className="related-list">
                 {relatedArticles.filter((a: any) => a.id !== article.id).slice(0, 3).map((a: any) => (
                    <Link key={a.id} href={`/articles/${a.slug}`} className="related-item">
                      <span className="related-cat">{a.category_icon} {a.category_name}</span>
                      <span className="related-title">{a.title}</span>
                    </Link>
                  ))}
                </div>
              </div>

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
    </div>
  )
}
