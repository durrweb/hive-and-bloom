// app/recipes/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getRecipeBySlug, getComments } from '@/lib/queries'
import CommentSection from '@/components/community/CommentSection'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const recipe = await getRecipeBySlug(slug)
  if (!recipe) return { title: 'Recipe Not Found' }
  return {
    title: recipe.title,
    description: recipe.description ?? undefined,
    openGraph: {
      title: recipe.title,
      description: recipe.description ?? undefined,
      images: recipe.cover_image_url ? [recipe.cover_image_url] : [],
    },
  }
}

export const revalidate = 3600

const DIFF_COLOR: Record<string, string> = {
  beginner: '#3D6B3A', intermediate: '#8A4F0A', advanced: '#7A3520',
}

export default async function RecipePage({ params }: Props) {
  const { slug } = await params
  const recipe = await getRecipeBySlug(slug)
  if (!recipe) notFound()

  const comments = await getComments(undefined, recipe.id)

  const ingredientSections = (recipe.ingredients ?? []).reduce<Record<string, typeof recipe.ingredients>>((acc, ing) => {
    const section = ing!.section ?? 'Ingredients'
    if (!acc[section]) acc[section] = []
    acc[section]!.push(ing)
    return acc
  }, {})

  return (
    <div>
      {/* Hero */}
      <div
        className="recipe-hero"
        style={recipe.cover_image_url ? { backgroundImage: `url(${recipe.cover_image_url})` } : {}}
      >
        <div className="recipe-hero-overlay" />
        <div className="container mx-auto px-5 lg:px-8" style={{ position: 'relative', zIndex: 1 }}>
          <nav className="breadcrumb">
            <Link href="/recipes">Recipes</Link>
            {recipe.honey_variety && (
              <>
                <span> / </span>
                <Link href={`/recipes?honey=${recipe.honey_variety}`}>
                  {recipe.honey_variety.replace('_', ' ')}
                </Link>
              </>
            )}
          </nav>
          <h1 className="recipe-title">{recipe.title}</h1>
          {recipe.subtitle && <p className="recipe-subtitle">{recipe.subtitle}</p>}
          <div className="recipe-meta-row">
            {recipe.author_avatar && (
              <img src={recipe.author_avatar} alt={recipe.author_name} className="author-avatar" />
            )}
            <span>By {recipe.author_name}</span>
            {recipe.published_at && (
              <>
                <span className="meta-divider"> · </span>
                <time>{new Date(recipe.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick stats bar */}
      <div className="recipe-stats-bar">
        <div className="container mx-auto px-5 lg:px-8">
          <div className="recipe-stats">
            {recipe.prep_time_mins  && <div className="recipe-stat-item"><span className="recipe-stat-label">Prep</span><span className="recipe-stat-val">{recipe.prep_time_mins} min</span></div>}
            {recipe.cook_time_mins  && <div className="recipe-stat-item"><span className="recipe-stat-label">Cook</span><span className="recipe-stat-val">{recipe.cook_time_mins} min</span></div>}
            {recipe.total_time_mins && <div className="recipe-stat-item"><span className="recipe-stat-label">Total</span><span className="recipe-stat-val">{recipe.total_time_mins} min</span></div>}
            {recipe.servings        && <div className="recipe-stat-item"><span className="recipe-stat-label">Serves</span><span className="recipe-stat-val">{recipe.servings}</span></div>}
            {recipe.difficulty      && <div className="recipe-stat-item"><span className="recipe-stat-label">Level</span><span className="recipe-stat-val" style={{ color: DIFF_COLOR[recipe.difficulty], textTransform: 'capitalize' }}>{recipe.difficulty}</span></div>}
            {recipe.honey_variety   && <div className="recipe-stat-item"><span className="recipe-stat-label">Honey</span><span className="recipe-stat-val">🍯 {recipe.honey_variety.replace('_', ' ')}</span></div>}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="recipe-body-wrap">
        <div className="container mx-auto px-5 lg:px-8">
          <div className="recipe-layout">

            {/* Ingredients sidebar */}
            <aside className="ingredients-col">
              <div className="ingredients-card">
                <h2 className="card-heading">Ingredients</h2>
                {Object.entries(ingredientSections).map(([section, ings]) => (
                  <div key={section} style={{ marginBottom: '1.25rem' }}>
                    {section !== 'Ingredients' && (
                      <h3 style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mist)', marginBottom: '0.6rem' }}>
                        {section}
                      </h3>
                    )}
                    <ul style={{ listStyle: 'none' }}>
                      {(ings ?? []).map(ing => (
                        <li key={ing!.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.35rem 0', borderBottom: '1px solid var(--cream-dark)', fontSize: '0.95rem' }}>
                          <span style={{ color: 'var(--ink)' }}>{ing!.name}</span>
                          <span style={{ color: 'var(--mist)', fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem', marginLeft: '0.5rem', flexShrink: 0 }}>
                            {ing!.amount != null ? `${ing!.amount} ${ing!.unit ?? ''}`.trim() : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {(recipe.ingredients ?? []).length === 0 && (
                  <p style={{ color: 'var(--mist)', fontSize: '0.9rem' }}>Ingredients coming soon.</p>
                )}
              </div>

              {recipe.honey_variety && (
                <div style={{ background: 'var(--honey-pale)', borderRadius: 12, padding: '1.25rem', marginTop: '1rem', border: '1px solid var(--cream-dark)' }}>
                  <h3 style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--honey-deep)', marginBottom: '0.5rem' }}>
                    🍯 About {recipe.honey_variety.replace('_', ' ')} honey
                  </h3>
                  <Link href="/articles?category=hive-products" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--honey)', fontWeight: 500, textDecoration: 'none' }}>
                    Learn about honey varieties →
                  </Link>
                </div>
              )}
            </aside>

            {/* Steps */}
            <div>
              {recipe.description && (
                <p style={{ fontFamily: 'var(--font-crimson)', fontSize: '1.15rem', color: 'var(--mist)', fontWeight: 300, marginBottom: '2rem', lineHeight: 1.7, fontStyle: 'italic', borderLeft: '4px solid var(--honey)', paddingLeft: '1.25rem' }}>
                  {recipe.description}
                </p>
              )}

              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--forest)', marginBottom: '1.5rem' }}>
                Method
              </h2>

              {(recipe.steps ?? []).length > 0 ? (
                <ol style={{ listStyle: 'none', padding: 0 }}>
                  {(recipe.steps ?? []).map(step => (
                    <li key={step.id} style={{ display: 'flex', gap: '1.25rem', marginBottom: '2rem', alignItems: 'flex-start' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--honey)', color: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '0.95rem', flexShrink: 0, marginTop: '0.15rem' }}>
                        {step.step_number}
                      </div>
                      <div style={{ flex: 1 }}>
                        {step.title && (
                          <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--forest)', marginBottom: '0.4rem' }}>
                            {step.title}
                          </h3>
                        )}
                        <p style={{ fontFamily: 'var(--font-crimson)', fontSize: '1.05rem', color: 'var(--ink)', lineHeight: 1.7 }}>
                          {step.body}
                        </p>
                        {step.tip && (
                          <div style={{ background: 'var(--honey-pale)', borderRadius: 8, padding: '0.65rem 1rem', marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--honey-deep)', fontStyle: 'italic' }}>
                            💡 {step.tip}
                          </div>
                        )}
                        {step.timer_secs && (
                          <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'var(--mist)', marginTop: '0.4rem' }}>
                            ⏱ {Math.floor(step.timer_secs / 60)} min {step.timer_secs % 60 > 0 ? `${step.timer_secs % 60} sec` : ''}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p style={{ color: 'var(--mist)', fontStyle: 'italic' }}>Method coming soon.</p>
              )}
            </div>
          </div>

          {/* Comments */}
          <div style={{ borderTop: '1px solid var(--cream-dark)', paddingTop: '3rem', marginTop: '3rem', maxWidth: 700 }}>
            <CommentSection recipeId={recipe.id} comments={comments} />
          </div>
        </div>
      </div>
    </div>
  )
}
