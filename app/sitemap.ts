import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dreamybee.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const [
    { data: articles },
    { data: categories },
    { data: tags },
  ] = await Promise.all([
    supabase
      .from('published_articles')
      .select('slug, updated_at'),
    supabase
      .from('categories')
      .select('slug'),
    supabase
      .from('article_tags')
      .select('tag'),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,              changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/articles`, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/recipes`,  changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/calendar`, changeFrequency: 'monthly', priority: 0.7 },
  ]

  const articlePages: MetadataRoute.Sitemap = (articles ?? []).map(a => ({
    url:             `${BASE_URL}/articles/${a.slug}`,
    lastModified:    a.updated_at ? new Date(a.updated_at) : undefined,
    changeFrequency: 'weekly',
    priority:        0.8,
  }))

  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).map(c => ({
    url:             `${BASE_URL}/articles?category=${c.slug}`,
    changeFrequency: 'weekly',
    priority:        0.6,
  }))

  const uniqueTags = [...new Set((tags ?? []).map(t => t.tag))]
  const tagPages: MetadataRoute.Sitemap = uniqueTags.map(tag => ({
    url:             `${BASE_URL}/articles?tag=${encodeURIComponent(tag)}`,
    changeFrequency: 'monthly',
    priority:        0.4,
  }))

  return [...staticPages, ...articlePages, ...categoryPages, ...tagPages]
}
