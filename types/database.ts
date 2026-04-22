// types/database.ts
// Updated: 2026-04-22 — many-to-many article categories via article_categories junction table

export type ContentStatus   = 'draft' | 'published' | 'archived'
export type AccessTier      = 'free' | 'member' | 'pro'
export type MembershipTier  = 'free' | 'member' | 'pro'
export type PollinatorType  = 'honeybee' | 'mason_bee' | 'bumblebee' | 'butterfly' | 'moth' | 'hoverfly' | 'beetle' | 'other'
export type Season          = 'spring' | 'summer' | 'autumn' | 'winter'
export type Difficulty      = 'beginner' | 'intermediate' | 'advanced'
export type CommentStatus   = 'pending' | 'approved' | 'flagged' | 'removed'
export type UserRole        = 'member' | 'author' | 'moderator' | 'admin'

// ── Category types ─────────────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  parent_id: string | null
  sort_order: number
  created_at: string
}

/** A category as it appears in the article's categories JSON array */
export interface ArticleCategory {
  id: string
  name: string
  slug: string
  color: string | null
  icon: string | null
  is_primary: boolean
}

// ── Profile ────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
  hive_count: number
  member_since: string
  is_expert: boolean
  role: UserRole
  website_url: string | null
  membership_tier: MembershipTier
  membership_expires: string | null
  stripe_customer_id: string | null
  updated_at: string
}

// ── Article ────────────────────────────────────────────────────────────────

export interface Article {
  id: string
  slug: string
  title: string
  subtitle: string | null
  excerpt: string | null
  body: string
  cover_image_url: string | null
  author_id: string
  category_id: string | null          // primary category (convenience field)
  status: ContentStatus
  difficulty: Difficulty | null
  read_time_mins: number | null
  featured: boolean
  views: number
  likes: number
  is_premium: boolean
  access_tier: AccessTier
  published_at: string | null
  created_at: string
  updated_at: string
}

/** Returned by the published_articles view — includes author, primary category, and full categories array */
export interface ArticleWithMeta extends Article {
  // Author
  author_name: string
  author_avatar: string | null
  author_username: string

  // Primary category (for card badges — backwards compatible)
  category_name: string | null
  category_slug: string | null
  category_color: string | null
  category_icon: string | null

  // All categories (primary + secondary)
  categories: ArticleCategory[]

  tags?: string[]
}

// ── Recipe ─────────────────────────────────────────────────────────────────

export interface Recipe {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string | null
  cover_image_url: string | null
  author_id: string
  status: ContentStatus
  difficulty: Difficulty | null
  honey_variety: string | null
  season_best: string | null
  prep_time_mins: number | null
  cook_time_mins: number | null
  total_time_mins: number | null
  servings: number | null
  featured: boolean
  views: number
  likes: number
  is_premium: boolean
  access_tier: AccessTier
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface RecipeIngredient {
  id: string
  recipe_id: string
  section: string | null
  name: string
  amount: number | null
  unit: string | null
  sort_order: number
}

export interface RecipeStep {
  id: string
  recipe_id: string
  step_number: number
  title: string | null
  body: string
  tip: string | null
  timer_secs: number | null
}

export interface RecipeWithMeta extends Recipe {
  author_name: string
  author_avatar: string | null
  author_username: string
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
}

// ── SeasonalTask ───────────────────────────────────────────────────────────

export interface SeasonalTask {
  id: string
  season: Season
  month_start: number | null
  month_end: number | null
  title: string
  description: string | null
  category: string | null
  difficulty: Difficulty | null
  priority: 'low' | 'medium' | 'high' | null
  related_article_id: string | null
  sort_order: number
  created_at: string
}

// ── Pollinator ─────────────────────────────────────────────────────────────

export interface Pollinator {
  id: string
  name: string
  slug: string
  type: PollinatorType
  description: string | null
  image_url: string | null
  active_seasons: Season[]
  created_at: string
}

// ── Plant ──────────────────────────────────────────────────────────────────

export interface Plant {
  id: string
  name: string
  slug: string
  scientific_name: string | null
  description: string | null
  image_url: string | null
  bloom_seasons: Season[]
  native: boolean
  created_at: string
}

// ── Comment ────────────────────────────────────────────────────────────────

export interface Comment {
  id: string
  article_id: string | null
  recipe_id: string | null
  author_id: string
  parent_id: string | null
  body: string
  status: CommentStatus
  likes: number
  created_at: string
  updated_at: string
  // Joined fields
  author?: Pick<Profile, 'username' | 'display_name' | 'avatar_url' | 'is_expert'>
  replies?: Comment[]
}

// ── Bookmark ───────────────────────────────────────────────────────────────

export interface Bookmark {
  id: string
  user_id: string
  article_id: string | null
  recipe_id: string | null
  created_at: string
}

// ── Newsletter subscriber ──────────────────────────────────────────────────

export interface NewsletterSubscriber {
  id: string
  email: string
  first_name: string | null
  interests: string[] | null
  confirmed: boolean
  subscribed_at: string
}

// ── Junction table ─────────────────────────────────────────────────────────

export interface ArticleCategoryRow {
  article_id: string
  category_id: string
  is_primary: boolean
}

// ── Insert types ───────────────────────────────────────────────────────────

export type InsertArticle = Omit<Article, 'id' | 'created_at' | 'updated_at' | 'views' | 'likes'>
export type InsertRecipe  = Omit<Recipe,  'id' | 'created_at' | 'updated_at' | 'views' | 'likes' | 'total_time_mins'>

// ── Utility: client-side access check ─────────────────────────────────────

export function userCanAccess(
  userTier: MembershipTier,
  membershipExpires: string | null,
  contentTier: AccessTier
): boolean {
  if (contentTier === 'free') return true
  if (membershipExpires && new Date(membershipExpires) < new Date()) return false
  if (userTier === 'pro') return true
  if (userTier === 'member') return contentTier === 'free' || contentTier === 'member'
  return false
}

// ── Utility: get primary category from article ────────────────────────────

export function getPrimaryCategory(article: ArticleWithMeta): ArticleCategory | null {
  if (!article.categories?.length) return null
  return article.categories.find(c => c.is_primary) ?? article.categories[0]
}

// ── Utility: get secondary categories ────────────────────────────────────

export function getSecondaryCategories(article: ArticleWithMeta): ArticleCategory[] {
  if (!article.categories?.length) return []
  return article.categories.filter(c => !c.is_primary)
}

// ── Database root type (for createClient generic) ──────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile>
        Update: Partial<Profile>
      }
      categories: {
        Row: Category
        Insert: Partial<Category>
        Update: Partial<Category>
      }
      articles: {
        Row: Article
        Insert: InsertArticle
        Update: Partial<Article>
      }
      article_categories: {
        Row: ArticleCategoryRow
        Insert: ArticleCategoryRow
        Update: Partial<ArticleCategoryRow>
      }
      article_tags: {
        Row: { article_id: string; tag: string }
        Insert: { article_id: string; tag: string }
        Update: never
      }
      recipes: {
        Row: Recipe
        Insert: InsertRecipe
        Update: Partial<Recipe>
      }
      bookmarks: {
        Row: Bookmark
        Insert: Omit<Bookmark, 'id' | 'created_at'>
        Update: never
      }
      comments: {
        Row: Comment
        Insert: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'likes' | 'author' | 'replies'>
        Update: Partial<Comment>
      }
      seasonal_tasks: {
        Row: SeasonalTask
        Insert: Omit<SeasonalTask, 'id' | 'created_at'>
        Update: Partial<SeasonalTask>
      }
      pollinators: {
        Row: Pollinator
        Insert: Omit<Pollinator, 'id' | 'created_at'>
        Update: Partial<Pollinator>
      }
      plants: {
        Row: Plant
        Insert: Omit<Plant, 'id' | 'created_at'>
        Update: Partial<Plant>
      }
      newsletter_subscribers: {
        Row: NewsletterSubscriber
        Insert: Omit<NewsletterSubscriber, 'id' | 'subscribed_at'>
        Update: never
      }
    }
    Views: {
      published_articles: { Row: ArticleWithMeta }
      published_recipes:  { Row: RecipeWithMeta }
    }
  }
}
