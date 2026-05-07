// app/recipes/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { getLatestRecipes } from '@/lib/queries'
import RecipeCard from '@/components/recipes/RecipeCard'

export const metadata: Metadata = {
  title: 'Honey & Herb Recipes',
  description: 'Recipes using raw honey, beeswax, propolis, herbs, and other hive products. From the garden to the table.',
}

export const revalidate = 3600

const HONEY_VARIETIES = ['wildflower', 'lavender', 'clover', 'buckwheat', 'manuka', 'orange_blossom']
const SEASONS = [
  { value: 'spring', label: '🌱 Spring' },
  { value: 'summer', label: '☀️ Summer' },
  { value: 'autumn', label: '🍂 Autumn' },
  { value: 'winter', label: '❄️ Winter' },
]
const CATEGORIES = [
  { label: '🍞 Breads & Baking',      tag: 'baking' },
  { label: '🫖 Drinks & Tonics',      tag: 'drinks' },
  { label: '🥗 Dressings & Sauces',   tag: 'savory' },
  { label: '🍮 Sweets & Desserts',    tag: 'sweets' },
  { label: '💊 Remedies & Wellness',  tag: 'wellness' },
  { label: '🥫 Preserves & Ferments', tag: 'preserves' },
]

interface Props {
  searchParams: Promise<{ honey?: string; season?: string; difficulty?: string; tag?: string; page?: string }>
}

export default async function RecipesPage({ searchParams }: Props) {
  const params = await searchParams
  const honeyFilter      = params.honey
  const seasonFilter     = params.season
  const difficultyFilter = params.difficulty
  const tagFilter        = params.tag
  const page             = parseInt(params.page ?? '1', 10)
  const pageSize         = 12
  const offset           = (page - 1) * pageSize

  const recipes = await getLatestRecipes(pageSize, honeyFilter, offset, seasonFilter, difficultyFilter)

  // Build load-more URL preserving all active filters
  const loadMoreParams = new URLSearchParams()
  if (honeyFilter)      loadMoreParams.set('honey', honeyFilter)
  if (seasonFilter)     loadMoreParams.set('season', seasonFilter)
  if (difficultyFilter) loadMoreParams.set('difficulty', difficultyFilter)
  if (tagFilter)        loadMoreParams.set('tag', tagFilter)
  loadMoreParams.set('page', String(page + 1))
  const loadMoreHref = `/recipes?${loadMoreParams.toString()}`

  return (
    <div>
      {/* Hero */}
      <div className="page-hero">
        <div className="container mx-auto px-5 lg:px-8">
          <span className="eyebrow">From the Hive to Your Table</span>
          <h1>Honey &amp; Herb Recipes</h1>
          <p>Raw honey, beeswax, propolis, herbs, and wild-foraged flavors — recipes for every season.</p>
        </div>
      </div>

      <div className="container mx-auto px-5 lg:px-8" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
        <div className="recipes-page-layout">

          {/* Sidebar filters */}
          <aside className="recipes-sidebar">
            <div className="filter-block">
              <h3 className="filter-heading">By Honey Variety</h3>
              <ul style={{ listStyle: 'none' }}>
                <li style={{ marginBottom: '0.4rem' }}>
                  <Link href="/recipes" className={`filter-link ${!honeyFilter ? 'active' : ''}`}>All varieties</Link>
                </li>
                {HONEY_VARIETIES.map(h => (
                  <li key={h} style={{ marginBottom: '0.4rem' }}>
                    <Link href={`/recipes?honey=${h}`} className={`filter-link ${honeyFilter === h ? 'active' : ''}`}>
                      🍯 {h.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="filter-block">
              <h3 className="filter-heading">By Season</h3>
              <ul style={{ listStyle: 'none' }}>
                {SEASONS.map(s => (
                  <li key={s.value} style={{ marginBottom: '0.4rem' }}>
                    <Link href={`/recipes?season=${s.value}`} className="filter-link">{s.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="filter-block">
              <h3 className="filter-heading">By Type</h3>
              <ul style={{ listStyle: 'none' }}>
                {CATEGORIES.map(c => (
                  <li key={c.tag} style={{ marginBottom: '0.4rem' }}>
                    <Link href={`/recipes?tag=${c.tag}`} className="filter-link">{c.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Grid */}
          <div>
            {recipes.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1.25rem' }}>
                {recipes.map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--mist)' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No recipes found yet.</p>
                <p style={{ fontSize: '0.9rem' }}>New recipes are added weekly — check back soon!</p>
              </div>
            )}

            {/* Pagination */}
            {recipes.length === pageSize && (
              <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <Link href={loadMoreHref} className="btn btn-primary">
                  Load more recipes →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
