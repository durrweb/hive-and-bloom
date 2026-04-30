-- Migration: add p_offset to get_articles_by_category
-- Run in Supabase SQL Editor (Dashboard → SQL Editor)

CREATE OR REPLACE FUNCTION get_articles_by_category(
  p_category_slug text,
  p_limit         int,
  p_offset        int DEFAULT 0
)
RETURNS SETOF published_articles
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT pa.*
  FROM   published_articles pa
  WHERE  EXISTS (
    SELECT 1
    FROM   article_categories ac
    JOIN   categories c ON c.id = ac.category_id
    WHERE  ac.article_id = pa.id
      AND  c.slug = p_category_slug
  )
  ORDER  BY pa.published_at DESC NULLS LAST, pa.id DESC
  LIMIT  p_limit
  OFFSET p_offset;
$$;
