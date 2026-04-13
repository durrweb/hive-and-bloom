// app/articles/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { getLatestArticles, getCategories } from '@/lib/queries'
import ArticleCard from '@/components/articles/ArticleCard'

export const metadata: Metadata = {
  title: 'Articles & Guides',
  description: 'Expert beekeeping guides, pollinator gardening tips, hive health articles, and more.',
}

export const revalidate = 3600

interface Props {
  searchParams: Promise<{ category?: string; page?: string }>
}

export default async function ArticlesPage({ searchParams }: Props) {
  const params = await searchParams
  const category = params.category
  const page     = parseInt(params.page ?? '1', 10)
  const pageSize = 12

  const [articles, categories] = await Promise.all([
    getLatestArticles(pageSize, category),
    getCategories(),
  ])

  const activeCategory = categories.find(c => c.slug === category)

  return (
    <div>
      {/* Page header */}
      <div className="page-hero">
        <div className="container mx-auto px-5 lg:px-8">
          <span className="eyebrow">Knowledge Base</span>
          <h1>{activeCategory ? activeCategory.name : 'All Articles & Guides'}</h1>
          <p>{activeCategory?.description ?? 'Expert-written guides on beekeeping, pollinator gardening, hive health, and more.'}</p>
        </div>
      </div>

      <div className="container mx-auto px-5 lg:px-8" style={{ padding: '3rem 0' }}>
        {/* Category filter tabs */}
        <nav className="category-tabs">
          <Link href="/articles" className={`tab-link ${!category ? 'active' : ''}`}>All</Link>
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={`/articles?category=${cat.slug}`}
              className={`tab-link ${category === cat.slug ? 'active' : ''}`}
            >
              <span>{cat.icon}</span> {cat.name}
            </Link>
          ))}
        </nav>

        {/* Article grid */}
        {articles.length > 0 ? (
          <div className="articles-grid" style={{ marginTop: '2rem' }}>
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--mist)' }}>
            <p>No articles found in this category yet. Check back soon!</p>
          </div>
        )}

        {/* Pagination */}
        {articles.length === pageSize && (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link
              href={`/articles?${category ? `category=${category}&` : ''}page=${page + 1}`}
              className="btn btn-primary"
            >
              Load more articles →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
