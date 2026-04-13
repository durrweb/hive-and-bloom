// app/page.tsx
import Link from 'next/link'
import { getFeaturedArticles, getLatestArticles, getFeaturedRecipes, getCategories } from '@/lib/queries'
import ArticleCard from '@/components/articles/ArticleCard'
import RecipeCard from '@/components/recipes/RecipeCard'
import CategoryGrid from '@/components/articles/CategoryGrid'
import SeasonalPreview from '@/components/calendar/SeasonalPreview'
import NewsletterForm from '@/components/community/NewsletterForm'
import HeroStats from '@/components/layout/HeroStats'
import HeroBackground from '@/components/layout/HeroBackground'

export const revalidate = 3600

export default async function HomePage() {
  const [featuredArticles, latestArticles, featuredRecipes, categories] = await Promise.all([
    getFeaturedArticles(1),
    getLatestArticles(4),
    getFeaturedRecipes(3),
    getCategories(),
  ])

  const heroArticle = featuredArticles[0] ?? null

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="hero-section">
        {/* Rotating background images */}
        <HeroBackground />

        <div className="container mx-auto px-5 lg:px-8" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-grid">
            <div>
              <span className="hero-tag">For Pollinators &amp; the People Who Love Them</span>
              <h1 className="hero-heading">
                Where the <em>bees thrive,</em><br /> the garden blooms.
              </h1>
              <p className="hero-desc">
                Your trusted guide to honeybee keeping, butterfly gardening, mason bee habitats,
                honey recipes, and everything that helps pollinators flourish — for hobbyists,
                gardeners, and nature lovers everywhere.
              </p>
              <div className="hero-btns">
                <Link href="/articles" className="btn btn-primary">Explore Articles →</Link>
                <Link href="/auth/signup" className="btn btn-outline">Join Our Hive</Link>
              </div>
            </div>

            {heroArticle && (
              <div className="hero-featured-card">
                <span className="tag-pill" style={{ background: 'rgba(200,119,30,0.25)', color: 'var(--honey-light)' }}>
                  Featured
                </span>
                <h2 className="hero-featured-title">{heroArticle.title}</h2>
                <p className="hero-featured-excerpt">{heroArticle.excerpt}</p>
                <Link href={`/articles/${heroArticle.slug}`} className="hero-featured-link">
                  Read the guide →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── STAT BAR ─────────────────────────────────────── */}
      <HeroStats />

      {/* ── CATEGORIES ───────────────────────────────────── */}
      <section className="section-white" id="topics">
        <div className="container mx-auto px-5 lg:px-8">
          <div className="section-header-center">
            <span className="eyebrow">Explore by Topic</span>
            <h2>Everything in the <em style={{ color: 'var(--honey-deep)', fontStyle: 'italic' }}>pollinator world</em></h2>
            <p className="section-subtitle">
              From first hive to master beekeeper, from butterfly garden to wild meadow — we cover it all.
            </p>
            <div className="section-rule" />
          </div>
          <CategoryGrid categories={categories} />
        </div>
      </section>

      {/* ── LATEST ARTICLES ──────────────────────────────── */}
      <section className="section-cream" id="articles">
        <div className="container mx-auto px-5 lg:px-8">
          <div className="section-header-split">
            <div>
              <span className="eyebrow">Latest Insights</span>
              <h2>From our <em style={{ color: 'var(--honey-deep)', fontStyle: 'italic' }}>expert contributors</em></h2>
            </div>
            <Link href="/articles" className="btn btn-primary">View all articles →</Link>
          </div>
          <div className="articles-grid">
            {latestArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* ── POLLINATOR HEALTH CALLOUT ─────────────────────── */}
      <section className="section-forest">
        <div className="container mx-auto px-5 lg:px-8">
          <div className="callout-grid">
            <div>
              <span className="eyebrow" style={{ color: 'var(--honey-light)' }}>Why It Matters</span>
              <h2 style={{ color: 'white', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', marginBottom: '1rem' }}>
                Pollinators are in <em style={{ color: 'var(--honey-light)' }}>crisis.</em> You can help.
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.72)', fontWeight: 300, marginBottom: '1.25rem' }}>
                Wild bee populations have declined by over 30% in the last decade. Monarch butterfly
                numbers have dropped by more than 80%. But hobbyist beekeepers and pollinator gardeners
                make a measurable difference — a single well-managed backyard can support thousands of
                pollinator visits per day during peak bloom.
              </p>
              <Link href="/articles/category/conservation" className="btn btn-primary">
                Learn how to help →
              </Link>
            </div>
            <div className="callout-cards">
              {[
                { icon: '🏡', title: 'Backyard Habitats', desc: 'Even a small garden with native plants can support dozens of pollinator species.' },
                { icon: '🧪', title: 'Treatment-Free Methods', desc: 'Organic and integrated approaches that protect bees from varroa without harsh chemicals.' },
                { icon: '🌍', title: 'Advocacy & Conservation', desc: 'Policy, habitat restoration, and how to connect with local conservation efforts.' },
              ].map(c => (
                <div key={c.title} className="callout-card">
                  <div className="callout-card-icon">{c.icon}</div>
                  <div>
                    <h4 style={{ color: 'white', fontFamily: 'var(--font-dm-sans)', fontSize: '0.95rem', marginBottom: '0.2rem' }}>{c.title}</h4>
                    <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: '0.88rem', fontWeight: 300 }}>{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── RECIPES ──────────────────────────────────────── */}
      <section className="section-white" id="recipes">
        <div className="container mx-auto px-5 lg:px-8">
          <div className="section-header-split">
            <div>
              <span className="eyebrow">Honey & Herb Recipes</span>
              <h2>From the <em style={{ color: 'var(--honey-deep)', fontStyle: 'italic' }}>hive to your table</em></h2>
            </div>
            <Link href="/recipes" className="btn btn-primary">Browse all recipes →</Link>
          </div>
          <div className="recipes-grid">
            {featuredRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SEASONAL CALENDAR PREVIEW ─────────────────────── */}
      <section className="section-honey-pale" id="calendar">
        <div className="container mx-auto px-5 lg:px-8">
          <div className="section-header-center">
            <span className="eyebrow">Seasonal Beekeeper's Calendar</span>
            <h2>Know what to do, <em style={{ color: 'var(--honey-deep)', fontStyle: 'italic' }}>when to do it</em></h2>
            <p className="section-subtitle">
              A month-by-month guide to hive management, garden tasks, and pollinator care through every season.
            </p>
            <div className="section-rule" />
          </div>
          <SeasonalPreview />
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link href="/calendar" className="btn btn-primary">Full seasonal calendar →</Link>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY / NEWSLETTER ────────────────────────── */}
      <section className="section-cream" id="community">
        <div className="container mx-auto px-5 lg:px-8">
          <div className="community-grid">
            <div>
              <span className="eyebrow">Our Community</span>
              <h2>Join <em style={{ color: 'var(--honey)', fontStyle: 'italic' }}>8,400+ beekeepers</em> and pollinator supporters</h2>
              <p className="section-subtitle" style={{ textAlign: 'left', margin: '0.8rem 0 1.5rem' }}>
                Get weekly articles, seasonal reminders, new recipes, and expert tips delivered straight to your inbox.
              </p>
              <ul className="community-perks">
                {[
                  'Weekly newsletter with seasonal hive-management tips',
                  'Early access to new articles and guides',
                  'Exclusive honey recipes and preservation techniques',
                  'Monthly Q&A with expert beekeepers',
                  'Community forum access and local club directory',
                ].map(perk => (
                  <li key={perk}>
                    <span className="perk-dot" aria-hidden />
                    {perk}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="btn btn-forest">
                Create free account →
              </Link>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section className="final-cta-section">
        <div className="container mx-auto px-5 lg:px-8" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 700, color: 'var(--forest)', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Ready to start your journey?
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--honey-deep)', fontWeight: 300, marginBottom: '2rem' }}>
            Everything you need to keep bees, grow habitat, and live in harmony with pollinators.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/articles/category/getting-started" className="btn btn-forest">Start learning →</Link>
            <Link href="/auth/signup" className="btn" style={{ background: 'transparent', color: 'var(--forest)', border: '2px solid var(--forest)' }}>
              Join for free
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
