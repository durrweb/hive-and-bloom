// lib/queries.ts
// All Supabase data fetching — keep components thin, queries here
import { createClient } from '@/lib/supabase/server'
import type { ArticleWithMeta, RecipeWithMeta, Season, SeasonalTask, Category } from '@/types/database'

// ── Articles ──────────────────────────────────────────────────────────────

export async function getFeaturedArticles(limit = 3): Promise<ArticleWithMeta[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('published_articles')
    .select('*')
    .eq('featured', true)
    .limit(limit)
  if (error) { console.error('getFeaturedArticles:', error); return [] }
  return data ?? []
}

export async function getLatestArticles(limit = 12, categorySlug?: string): Promise<ArticleWithMeta[]> {
  const supabase = await createClient()
  let query = supabase.from('published_articles').select('*').limit(limit)
  if (categorySlug) query = query.eq('category_slug', categorySlug)
  const { data, error } = await query
  if (error) { console.error('getLatestArticles:', error); return [] }
  return data ?? []
}

export async function getArticleBySlug(slug: string): Promise<ArticleWithMeta | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('published_articles')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) { console.error('getArticleBySlug:', error); return null }

  // Increment view count (fire-and-forget)
  supabase.from('articles').update({ views: (data?.views ?? 0) + 1 }).eq('slug', slug)

  return data
}

export async function getArticleTags(articleId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('article_tags')
    .select('tag')
    .eq('article_id', articleId)
  return data?.map(r => r.tag) ?? []
}

export async function searchArticles(query: string, limit = 20): Promise<ArticleWithMeta[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      profiles!author_id(display_name, avatar_url, username),
      categories!category_id(name, slug, color, icon)
    `)
    .eq('status', 'published')
    .textSearch('title', query, { type: 'websearch', config: 'english' })
    .limit(limit)
  if (error) { console.error('searchArticles:', error); return [] }
  return (data ?? []).map(normalizeArticle)
}

// ── Recipes ───────────────────────────────────────────────────────────────

export async function getFeaturedRecipes(limit = 3): Promise<RecipeWithMeta[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('published_recipes')
    .select('*')
    .eq('featured', true)
    .limit(limit)
  if (error) { console.error('getFeaturedRecipes:', error); return [] }
  return data ?? []
}

export async function getLatestRecipes(limit = 12, honeyVariety?: string): Promise<RecipeWithMeta[]> {
  const supabase = await createClient()
  let query = supabase.from('published_recipes').select('*').limit(limit)
  if (honeyVariety) query = query.eq('honey_variety', honeyVariety)
  const { data, error } = await query
  if (error) { console.error('getLatestRecipes:', error); return [] }
  return data ?? []
}

export async function getRecipeBySlug(slug: string): Promise<RecipeWithMeta | null> {
  const supabase = await createClient()
  const { data: recipe, error } = await supabase
    .from('published_recipes')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error || !recipe) return null

  const [{ data: ingredients }, { data: steps }] = await Promise.all([
    supabase.from('recipe_ingredients').select('*').eq('recipe_id', recipe.id).order('sort_order'),
    supabase.from('recipe_steps').select('*').eq('recipe_id', recipe.id).order('step_number'),
  ])

  supabase.from('recipes').update({ views: (recipe.views ?? 0) + 1 }).eq('slug', slug)

  return { ...recipe, ingredients: ingredients ?? [], steps: steps ?? [] }
}

// ── Calendar ──────────────────────────────────────────────────────────────

export async function getTasksBySeason(season: Season): Promise<SeasonalTask[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('seasonal_tasks')
    .select('*')
    .eq('season', season)
    .order('sort_order')
  if (error) { console.error('getTasksBySeason:', error); return [] }
  return data ?? []
}

export async function getAllSeasonalTasks(): Promise<Record<Season, SeasonalTask[]>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('seasonal_tasks')
    .select('*')
    .order('sort_order')
  if (error) { console.error('getAllSeasonalTasks:', error) }
  const tasks = data ?? []
  return {
    spring: tasks.filter(t => t.season === 'spring'),
    summer: tasks.filter(t => t.season === 'summer'),
    autumn: tasks.filter(t => t.season === 'autumn'),
    winter: tasks.filter(t => t.season === 'winter'),
  }
}

// ── Categories ────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')
  if (error) { console.error('getCategories:', error); return [] }
  return data ?? []
}

// ── Comments ──────────────────────────────────────────────────────────────

export async function getComments(articleId?: string, recipeId?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('comments')
    .select(`*, profiles!author_id(username, display_name, avatar_url, is_expert)`)
    .eq('status', 'approved')
    .is('parent_id', null)
    .order('created_at', { ascending: false })
  if (articleId) query = query.eq('article_id', articleId)
  if (recipeId)  query = query.eq('recipe_id',  recipeId)
  const { data } = await query
  return data ?? []
}

// ── Auth helpers ──────────────────────────────────────────────────────────

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  return profile
}

// ── Utility ───────────────────────────────────────────────────────────────

function normalizeArticle(raw: any): ArticleWithMeta {
  return {
    ...raw,
    author_name:     raw.profiles?.display_name ?? '',
    author_avatar:   raw.profiles?.avatar_url   ?? null,
    author_username: raw.profiles?.username      ?? '',
    category_name:   raw.categories?.name        ?? null,
    category_slug:   raw.categories?.slug        ?? null,
    category_color:  raw.categories?.color       ?? null,
    category_icon:   raw.categories?.icon        ?? null,
  }
}
