// types/database.ts
// Auto-maintained alongside supabase/schema.sql
// For generated types run: npx supabase gen types typescript --local > types/database.ts

export type ContentStatus = 'draft' | 'published' | 'archived'
export type PollinatorType = 'honeybee' | 'mason_bee' | 'bumblebee' | 'butterfly' | 'moth' | 'hoverfly' | 'beetle' | 'other'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type CommentStatus = 'pending' | 'approved' | 'flagged' | 'removed'
export type UserRole = 'member' | 'author' | 'moderator' | 'admin'

// ── Row types (what Supabase returns) ─────────────────────────────────────

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
  updated_at: string
}

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

export interface Article {
  id: string
  slug: string
  title: string
  subtitle: string | null
  excerpt: string | null
  body: string
  cover_image_url: string | null
  author_id: string
  category_id: string | null
  status: ContentStatus
  difficulty: Difficulty | null
  read_time_mins: number | null
  featured: boolean
  views: number
  likes: number
  published_at: string | null
  created_at: string
  updated_at: string
}

// Joined view type
export interface ArticleWithMeta extends Article {
  author_name: string
  author_avatar: string | null
  author_username: string
  category_name: string | null
  category_slug: string | null
  category_color: string | null
  category_icon: string | null
  tags?: string[]
}

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
  prep_time_mins: number | null
  cook_time_mins: number | null
  total_time_mins: number | null
  servings: number | null
  honey_variety: string | null
  season_best: Season | null
  tags: string[] | null
  featured: boolean
  views: number
  likes: number
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface RecipeWithMeta extends Recipe {
  author_name: string
  author_avatar: string | null
  author_username: string
  ingredients?: RecipeIngredient[]
  steps?: RecipeStep[]
}

export interface RecipeIngredient {
  id: string
  recipe_id: string
  section: string | null
  name: string
  amount: number | null
  unit: string | null
  notes: string | null
  sort_order: number
}

export interface RecipeStep {
  id: string
  recipe_id: string
  step_number: number
  title: string | null
  body: string
  tip: string | null
  image_url: string | null
  timer_secs: number | null
}

export interface SeasonalTask {
  id: string
  title: string
  description: string | null
  category: string
  season: Season
  month_start: number | null
  month_end: number | null
  difficulty: Difficulty | null
  pollinator_type: PollinatorType | null
  region: string | null
  related_article_id: string | null
  sort_order: number
  created_at: string
}

export interface Comment {
  id: string
  author_id: string
  article_id: string | null
  recipe_id: string | null
  parent_id: string | null
  body: string
  status: CommentStatus
  likes: number
  created_at: string
  updated_at: string
  // joined
  author?: Pick<Profile, 'username' | 'display_name' | 'avatar_url' | 'is_expert'>
  replies?: Comment[]
}

export interface Bookmark {
  id: string
  user_id: string
  article_id: string | null
  recipe_id: string | null
  created_at: string
}

export interface Pollinator {
  id: string
  common_name: string
  scientific_name: string | null
  type: PollinatorType
  description: string | null
  image_url: string | null
  habitat: string[] | null
  active_seasons: Season[] | null
  range_description: string | null
  conservation_status: string | null
  fun_fact: string | null
  created_at: string
}

export interface Plant {
  id: string
  common_name: string
  scientific_name: string | null
  description: string | null
  image_url: string | null
  bloom_seasons: Season[] | null
  pollinators_attracted: PollinatorType[] | null
  is_native: boolean
  hardiness_zones: string | null
  height_inches: number | null
  sun_requirement: string | null
  water_needs: string | null
  notes: string | null
  created_at: string
}

// ── Insert types ───────────────────────────────────────────────────────────

export type InsertArticle = Omit<Article, 'id' | 'created_at' | 'updated_at' | 'views' | 'likes'>
export type InsertRecipe  = Omit<Recipe,  'id' | 'created_at' | 'updated_at' | 'views' | 'likes' | 'total_time_mins'>
export type InsertComment = Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'likes' | 'status' | 'author' | 'replies'>

// ── Database root type (for createClient generic) ──────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles:              { Row: Profile;           Insert: Partial<Profile>;    Update: Partial<Profile> }
      categories:            { Row: Category;          Insert: Partial<Category>;   Update: Partial<Category> }
      articles:              { Row: Article;           Insert: InsertArticle;       Update: Partial<Article> }
      article_tags:          { Row: { article_id: string; tag: string }; Insert: { article_id: string; tag: string }; Update: never }
      recipes:               { Row: Recipe;            Insert: InsertRecipe;        Update: Partial<Recipe> }
      recipe_ingredients:    { Row: RecipeIngredient;  Insert: Omit<RecipeIngredient, 'id'>; Update: Partial<RecipeIngredient> }
      recipe_steps:          { Row: RecipeStep;        Insert: Omit<RecipeStep, 'id'>;       Update: Partial<RecipeStep> }
      seasonal_tasks:        { Row: SeasonalTask;      Insert: Omit<SeasonalTask, 'id' | 'created_at'>; Update: Partial<SeasonalTask> }
      comments:              { Row: Comment;           Insert: InsertComment;       Update: Partial<Comment> }
      bookmarks:             { Row: Bookmark;          Insert: Omit<Bookmark, 'id' | 'created_at'>; Update: never }
      pollinators:           { Row: Pollinator;        Insert: Omit<Pollinator, 'id' | 'created_at'>; Update: Partial<Pollinator> }
      plants:                { Row: Plant;             Insert: Omit<Plant, 'id' | 'created_at'>; Update: Partial<Plant> }
      newsletter_subscribers:{ Row: { id: string; email: string; first_name: string | null; interests: string[] | null; confirmed: boolean; subscribed_at: string }; Insert: { email: string; first_name?: string; interests?: string[] }; Update: never }
    }
    Views: {
      published_articles: { Row: ArticleWithMeta }
      published_recipes:  { Row: RecipeWithMeta }
    }
  }
}
