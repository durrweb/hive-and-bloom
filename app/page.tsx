// app/page.tsx
import Link from 'next/link'
import { getFeaturedArticles, getLatestArticles, getFeaturedRecipes, getCategories } from '@/lib/queries'
import ArticleCard from '@/components/articles/ArticleCard'
import RecipeCard from '@/components/recipes/RecipeCard'
import CategoryGrid from '@/components/articles/CategoryGrid'
import SeasonalPreview from '@/components/calendar/SeasonalPreview'
import NewsletterForm from '@/components/community/NewsletterForm'
import HeroStats from '@/components/layout/HeroStats'

export const revalidate = 3600 // ISR: revalidate every hour

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
        <div className="hero-bg-pattern" aria-hidden />
        <div className="container mx-auto px-5 lg:px-8">
          <div className="hero-grid">
            <div className="hero-text">
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

      <style jsx>{`
        .hero-section {
          background: var(--forest);
          position: relative;
          overflow: hidden;
          padding: clamp(4rem, 10vw, 8rem) 0 clamp(3rem, 7vw, 6rem);
        }
        .hero-bg-pattern {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 80% at 65% 40%, rgba(200,119,30,0.18) 0%, transparent 70%),
                      radial-gradient(ellipse 50% 60% at 20% 80%, rgba(107,158,101,0.15) 0%, transparent 60%);
          pointer-events: none;
        }
        .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center; }
        .hero-tag {
          display: inline-block;
          font-family: var(--font-dm-sans); font-size: 0.75rem; font-weight: 500;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--honey-light); background: rgba(200,119,30,0.2);
          border: 1px solid rgba(200,119,30,0.4);
          padding: 0.3rem 0.9rem; border-radius: 2px; margin-bottom: 1.25rem;
        }
        .hero-heading {
          font-family: var(--font-playfair);
          font-size: clamp(2.4rem, 5vw, 3.8rem); font-weight: 700; line-height: 1.12;
          color: white; letter-spacing: -0.02em; margin-bottom: 1.25rem;
        }
        .hero-heading em { color: var(--honey-light); }
        .hero-desc { font-size: 1.1rem; font-weight: 300; color: rgba(255,255,255,0.75); line-height: 1.65; margin-bottom: 2rem; }
        .hero-btns { display: flex; gap: 1rem; flex-wrap: wrap; }
        .hero-featured-card {
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px; padding: 2rem; backdrop-filter: blur(4px);
        }
        .hero-featured-title {
          font-family: var(--font-playfair); font-size: 1.5rem; font-weight: 700;
          color: white; line-height: 1.25; margin: 0.75rem 0;
        }
        .hero-featured-excerpt { font-size: 0.95rem; color: rgba(255,255,255,0.65); font-weight: 300; margin-bottom: 1.25rem; }
        .hero-featured-link {
          font-family: var(--font-dm-sans); font-size: 0.85rem; font-weight: 500;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--honey-light); text-decoration: none;
        }
        .section-white     { padding: clamp(4rem, 8vw, 7rem) 0; background: white; }
        .section-cream     { padding: clamp(4rem, 8vw, 7rem) 0; background: var(--cream); }
        .section-forest    { padding: clamp(4rem, 8vw, 7rem) 0; background: var(--forest); }
        .section-honey-pale{ padding: clamp(4rem, 8vw, 7rem) 0; background: var(--honey-pale); }
        .section-header-center { text-align: center; margin-bottom: clamp(2rem, 5vw, 3.5rem); }
        .section-header-center h2 { font-size: clamp(1.9rem, 4vw, 2.8rem); font-weight: 700; color: var(--forest); }
        .section-subtitle { font-size: 1.05rem; color: var(--mist); max-width: 560px; margin: 0.8rem auto 0; font-weight: 300; }
        .section-header-split { display: flex; align-items: flex-end; justify-content: space-between; gap: 1.5rem; margin-bottom: clamp(2rem, 4vw, 3rem); flex-wrap: wrap; }
        .section-header-split h2 { font-size: clamp(1.75rem, 3.5vw, 2.4rem); font-weight: 700; color: var(--forest); }
        .articles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem; }
        .recipes-grid  { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
        .callout-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
        .callout-cards { display: flex; flex-direction: column; gap: 1rem; }
        .callout-card {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 1.2rem 1.4rem;
          display: flex; align-items: flex-start; gap: 1rem;
        }
        .callout-card-icon {
          font-size: 1.5rem; flex-shrink: 0; width: 44px; height: 44px;
          background: rgba(200,119,30,0.2); border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .community-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start; }
        .community-grid h2 { font-size: clamp(1.8rem, 3.5vw, 2.5rem); font-weight: 700; color: var(--forest); margin-bottom: 1rem; }
        .community-perks { list-style: none; margin-bottom: 2rem; }
        .community-perks li { display: flex; align-items: flex-start; gap: 0.9rem; padding: 0.55rem 0; border-bottom: 1px solid var(--cream-dark); font-size: 0.98rem; font-weight: 300; }
        .community-perks li:last-child { border-bottom: none; }
        .perk-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--honey); flex-shrink: 0; margin-top: 0.55rem; }
        .final-cta-section {
          padding: clamp(4rem, 8vw, 7rem) 0;
          background: var(--honey);
          position: relative; overflow: hidden;
        }
        .final-cta-section::before {
          content: '🌸'; font-size: 12rem; position: absolute;
          left: -3rem; top: 50%; transform: translateY(-50%); opacity: 0.12; pointer-events: none;
        }
        .final-cta-section::after {
          content: '🌻'; font-size: 12rem; position: absolute;
          right: -3rem; top: 50%; transform: translateY(-50%); opacity: 0.12; pointer-events: none;
        }
        @media (max-width: 900px) {
          .hero-grid, .callout-grid, .community-grid { grid-template-columns: 1fr; }
          .hero-featured-card { display: none; }
        }
      `}</style>
    </>
  )
}
