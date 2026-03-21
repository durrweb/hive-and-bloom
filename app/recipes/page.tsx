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
  { value: 'spring', label: '🌱 Spring', },
  { value: 'summer', label: '☀️ Summer', },
  { value: 'autumn', label: '🍂 Autumn', },
  { value: 'winter', label: '❄️ Winter', },
]
const CATEGORIES = [
  { label: '🍞 Breads & Baking',   tag: 'baking' },
  { label: '🫖 Drinks & Tonics',   tag: 'drinks' },
  { label: '🥗 Dressings & Sauces',tag: 'savory' },
  { label: '🍮 Sweets & Desserts', tag: 'sweets' },
  { label: '💊 Remedies & Wellness', tag: 'wellness' },
  { label: '🥫 Preserves & Ferments', tag: 'preserves' },
]

interface Props {
  searchParams: Promise<{ honey?: string; season?: string }>
}

export default async function RecipesPage({ searchParams }: Props) {
  const params = await searchParams
  const honeyFilter  = params.honey
  const recipes = await getLatestRecipes(24, honeyFilter)

  return (
    <div className="recipes-page">
      {/* Hero */}
      <div className="page-hero">
        <div className="container mx-auto px-5 lg:px-8">
          <span className="eyebrow">From the Hive to Your Table</span>
          <h1>Honey & Herb Recipes</h1>
          <p>Raw honey, beeswax, propolis, herbs, and wild-foraged flavors — {recipes.length > 0 ? `${recipes.length}+ recipes` : 'recipes'} for every season.</p>
        </div>
      </div>

      <div className="container mx-auto px-5 lg:px-8" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
        <div className="recipes-layout">

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
          </div>
        </div>
      </div>

      <style jsx>{`
        .page-hero { background: var(--forest); padding: 4rem 0 3rem; border-bottom: 3px solid var(--honey); }
        .page-hero h1 { font-family: var(--font-playfair); font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; color: white; margin-bottom: 0.75rem; }
        .page-hero p { color: rgba(255,255,255,0.7); font-weight: 300; max-width: 600px; }
        .recipes-layout { display: grid; grid-template-columns: 220px 1fr; gap: 3rem; align-items: start; }
        .recipes-sidebar { position: sticky; top: 80px; }
        .filter-block { background: white; border-radius: 12px; border: 1px solid var(--cream-dark); padding: 1.25rem; margin-bottom: 1rem; }
        .filter-heading { font-family: var(--font-dm-sans); font-size: 0.75rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--mist); margin-bottom: 0.75rem; }
        .filter-link { font-family: var(--font-dm-sans); font-size: 0.85rem; color: var(--mist); text-decoration: none; display: block; padding: 0.2rem 0; transition: color 0.15s; }
        .filter-link:hover, .filter-link.active { color: var(--honey-deep); font-weight: 500; }
        @media (max-width: 768px) {
          .recipes-layout { grid-template-columns: 1fr; }
          .recipes-sidebar { position: static; }
        }
      `}</style>
    </div>
  )
}
