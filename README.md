# 🐝 Hive & Bloom

A full-stack pollinator resource hub built with **Next.js 15 App Router**, **Supabase**, and **Vercel** — the same stack as zenbird.com.

---

## Tech Stack

| Layer        | Technology                            |
|--------------|---------------------------------------|
| Frontend     | Next.js 15 (App Router, RSC)          |
| Styling      | Tailwind CSS + CSS custom properties  |
| Database     | Supabase (Postgres)                   |
| Auth         | Supabase Auth (email/password + OAuth)|
| Storage      | Supabase Storage (cover images)       |
| Deployment   | Vercel                                |
| Language     | TypeScript                            |

---

## Project Structure

```
hive-and-bloom/
├── app/
│   ├── page.tsx                   # Homepage
│   ├── layout.tsx                 # Root layout (fonts, nav, footer)
│   ├── globals.css                # Design tokens + global styles
│   ├── actions.ts                 # Server Actions (auth, comments, bookmarks)
│   ├── articles/
│   │   ├── page.tsx               # Article listing with category filter
│   │   └── [slug]/page.tsx        # Article detail with comments
│   ├── recipes/
│   │   ├── page.tsx               # Recipe listing with sidebar filters
│   │   └── [slug]/page.tsx        # Recipe detail (ingredients, steps)
│   ├── calendar/
│   │   └── page.tsx               # Full seasonal calendar
│   ├── community/
│   │   └── dashboard/page.tsx     # Protected member dashboard
│   └── auth/
│       ├── login/page.tsx
│       ├── signup/page.tsx
│       └── callback/route.ts      # Supabase email confirmation handler
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx             # Sticky nav, auth-aware
│   │   ├── Footer.tsx
│   │   ├── HeroStats.tsx
│   ├── articles/
│   │   ├── ArticleCard.tsx
│   │   └── CategoryGrid.tsx
│   ├── recipes/
│   │   └── RecipeCard.tsx
│   ├── calendar/
│   │   └── SeasonalPreview.tsx    # Server component, current-season tasks
│   └── community/
│       ├── CommentSection.tsx     # Client component
│       └── NewsletterForm.tsx     # Client component with Server Action
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser client
│   │   └── server.ts              # Server + admin client
│   └── queries.ts                 # All Supabase data fetching
├── supabase/
│   └── schema.sql                 # Full DB schema — run once in Supabase SQL editor
├── types/
│   └── database.ts                # TypeScript types mirroring schema
├── middleware.ts                  # Session refresh + route protection
├── next.config.ts
├── tailwind.config.ts
└── .env.example
```

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/your-org/hive-and-bloom.git
cd hive-and-bloom
npm install
```

### 2. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL Editor, run the full contents of **`supabase/schema.sql`**
3. Copy your project URL and API keys

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in your values in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Supabase Setup Details

### Storage buckets

Create two public buckets in **Supabase Dashboard → Storage**:

| Bucket name    | Public | Purpose                     |
|----------------|--------|-----------------------------|
| `article-covers` | ✅   | Article cover images        |
| `recipe-covers`  | ✅   | Recipe cover images         |
| `avatars`        | ✅   | User profile pictures       |

### Auth providers (optional)

In **Supabase Dashboard → Authentication → Providers**, enable:
- **Google** — recommended, many users prefer OAuth
- **GitHub** — good for tech-savvy users

Set your redirect URL to: `https://your-domain.com/auth/callback`

### Email templates

In **Supabase Dashboard → Authentication → Email Templates**, customize:
- **Confirm signup** — use Hive & Bloom branding
- **Reset password** — update with your site URL

---

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Add environment variables in **Vercel Dashboard → Settings → Environment Variables** — copy all three from `.env.local`.

The Vercel build command is `next build` and output directory is `.next` (defaults).

---

## Adding Content

### Articles

Insert directly via Supabase Dashboard or build an admin UI:

```sql
INSERT INTO articles (slug, title, excerpt, body, author_id, category_id, status, published_at, read_time_mins, featured)
VALUES (
  'your-first-hive-guide',
  'Your First Hive: A Complete Spring Startup Guide',
  'Everything you need to start your first honeybee colony this spring.',
  '## Getting Started\n\nYour hive content here in markdown...',
  'your-user-uuid',
  (SELECT id FROM categories WHERE slug = 'getting-started'),
  'published',
  now(),
  12,
  true
);
```

### Recipes

```sql
INSERT INTO recipes (slug, title, description, author_id, status, published_at, honey_variety, prep_time_mins, cook_time_mins, servings, difficulty)
VALUES (
  'lavender-honey-shortbread',
  'Lavender Honey Shortbread',
  'Buttery, fragrant shortbread kissed with local lavender honey.',
  'your-user-uuid',
  'published',
  now(),
  'lavender',
  20, 15, 24, 'beginner'
);
```

---

## Features Roadmap

- [ ] Admin panel for content management (Supabase + custom UI or Payload CMS)
- [ ] MDX support for rich article content
- [ ] Plant & pollinator field guides
- [ ] Local beekeeping club directory with map
- [ ] Hive inspection log (authenticated feature)
- [ ] Image upload for article/recipe covers
- [ ] Full-text search with Supabase `pg_trgm`
- [ ] RSS feed for articles
- [ ] Social sharing cards (OG image generation with `@vercel/og`)

---

## Design System

The design uses three font families loaded via `next/font/google`:

| Variable            | Font              | Used for               |
|---------------------|-------------------|------------------------|
| `--font-playfair`   | Playfair Display  | Headings, titles, logo |
| `--font-crimson`    | Crimson Pro       | Body text, articles    |
| `--font-dm-sans`    | DM Sans           | UI labels, meta, CTAs  |

Core color tokens are defined as CSS custom properties in `app/globals.css` and replicated in `tailwind.config.ts`.

---

## License

MIT — built with 🍯 for pollinators everywhere.
