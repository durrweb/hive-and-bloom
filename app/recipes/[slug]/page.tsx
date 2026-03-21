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

  // Group ingredients by section
  const ingredientSections = (recipe.ingredients ?? []).reduce<Record<string, typeof recipe.ingredients>>((acc, ing) => {
    const section = ing!.section ?? 'Ingredients'
    if (!acc[section]) acc[section] = []
    acc[section]!.push(ing)
    return acc
  }, {})

  return (
    <div className="recipe-page">
      {/* Hero */}
      <div className="recipe-hero" style={recipe.cover_image_url ? { backgroundImage: `url(${recipe.cover_image_url})` } : {}}>
        <div className="recipe-hero-overlay" />
        <div className="container mx-auto px-5 lg:px-8" style={{ position: 'relative', zIndex: 1 }}>
          <nav className="breadcrumb">
            <Link href="/recipes">Recipes</Link>
            {recipe.honey_variety && <><span> / </span><Link href={`/recipes?honey=${recipe.honey_variety}`}>{recipe.honey_variety.replace('_', ' ')}</Link></>}
          </nav>
          <h1 className="recipe-title">{recipe.title}</h1>
          {recipe.subtitle && <p className="recipe-subtitle">{recipe.subtitle}</p>}
          <div className="recipe-meta-row">
            {recipe.author_avatar && <img src={recipe.author_avatar} alt={recipe.author_name} className="author-avatar" />}
            <span>By {recipe.author_name}</span>
            {recipe.published_at && <><span className="dot">·</span><time>{new Date(recipe.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time></>}
          </div>
        </div>
      </div>

      {/* Quick stats bar */}
      <div className="recipe-stats-bar">
        <div className="container mx-auto px-5 lg:px-8">
          <div className="recipe-stats">
            {recipe.prep_time_mins  && <div className="stat-item"><span className="stat-label">Prep</span><span className="stat-val">{recipe.prep_time_mins} min</span></div>}
            {recipe.cook_time_mins  && <div className="stat-item"><span className="stat-label">Cook</span><span className="stat-val">{recipe.cook_time_mins} min</span></div>}
            {recipe.total_time_mins && <div className="stat-item"><span className="stat-label">Total</span><span className="stat-val">{recipe.total_time_mins} min</span></div>}
            {recipe.servings        && <div className="stat-item"><span className="stat-label">Serves</span><span className="stat-val">{recipe.servings}</span></div>}
            {recipe.difficulty      && <div className="stat-item"><span className="stat-label">Level</span><span className="stat-val" style={{ color: DIFF_COLOR[recipe.difficulty], textTransform: 'capitalize' }}>{recipe.difficulty}</span></div>}
            {recipe.honey_variety   && <div className="stat-item"><span className="stat-label">Honey</span><span className="stat-val">🍯 {recipe.honey_variety.replace('_', ' ')}</span></div>}
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

              {/* Honey info card */}
              {recipe.honey_variety && (
                <div style={{ background: 'var(--honey-pale)', borderRadius: 12, padding: '1.25rem', marginTop: '1rem', border: '1px solid var(--cream-dark)' }}>
                  <h3 style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--honey-deep)', marginBottom: '0.5rem' }}>
                    🍯 About {recipe.honey_variety.replace('_', ' ')} honey
                  </h3>
                  <Link href={`/articles?category=hive-products`} style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--honey)', fontWeight: 500, textDecoration: 'none' }}>
                    Learn about honey varieties →
                  </Link>
                </div>
              )}
            </aside>

            {/* Steps / method */}
            <div className="steps-col">
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
                  {(recipe.steps ?? []).map((step) => (
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

      <style jsx>{`
        .recipe-hero {
          min-height: 380px; background: var(--forest); background-size: cover; background-position: center;
          position: relative; display: flex; align-items: flex-end; padding: 4rem 0 3rem;
        }
        .recipe-hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(20,40,20,0.92) 0%, rgba(20,40,20,0.5) 60%, transparent 100%); }
        .breadcrumb { font-family: var(--font-dm-sans); font-size: 0.8rem; color: rgba(255,255,255,0.55); margin-bottom: 0.75rem; }
        .breadcrumb a { color: rgba(255,255,255,0.55); text-decoration: none; }
        .breadcrumb a:hover { color: var(--honey-light); }
        .recipe-title { font-family: var(--font-playfair); font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 700; color: white; line-height: 1.2; margin-bottom: 0.6rem; }
        .recipe-subtitle { font-size: 1.1rem; color: rgba(255,255,255,0.72); font-weight: 300; margin-bottom: 1rem; }
        .recipe-meta-row { display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-dm-sans); font-size: 0.85rem; color: rgba(255,255,255,0.65); }
        .author-avatar { width: 28px; height: 28px; border-radius: 50%; }
        .dot { opacity: 0.4; }
        .recipe-stats-bar { background: white; border-bottom: 1px solid var(--cream-dark); }
        .recipe-stats { display: flex; gap: 0; overflow-x: auto; }
        .stat-item { padding: 1rem 2rem; border-right: 1px solid var(--cream-dark); text-align: center; flex-shrink: 0; }
        .stat-label { font-family: var(--font-dm-sans); font-size: 0.7rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--mist); display: block; margin-bottom: 0.2rem; }
        .stat-val { font-family: var(--font-playfair); font-size: 1.1rem; font-weight: 600; color: var(--forest); display: block; }
        .recipe-body-wrap { padding: 3rem 0 4rem; }
        .recipe-layout { display: grid; grid-template-columns: 280px 1fr; gap: 4rem; align-items: start; }
        .ingredients-col { position: sticky; top: 80px; }
        .ingredients-card { background: white; border-radius: 12px; border: 1px solid var(--cream-dark); padding: 1.5rem; }
        .card-heading { font-family: var(--font-playfair); font-size: 1.2rem; font-weight: 700; color: var(--forest); margin-bottom: 1rem; }
        @media (max-width: 900px) {
          .recipe-layout { grid-template-columns: 1fr; }
          .ingredients-col { position: static; }
        }
      `}</style>
    </div>
  )
}
