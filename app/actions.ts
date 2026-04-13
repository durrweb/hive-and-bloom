// app/actions.ts
'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ── AUTH ──────────────────────────────────────────────────────────────────

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const email    = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, full_name: username },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })
  if (error) return { error: error.message }
  redirect('/')
}

export async function signIn(formData: FormData) {
  const supabase  = await createClient()
  const email     = formData.get('email') as string
  const password  = formData.get('password') as string
  const redirectTo = formData.get('redirectTo') as string | null

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

// ── COMMENTS ─────────────────────────────────────────────────────────────

export async function postComment(formData: FormData) {
  const supabase   = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to comment.' }

  const body      = (formData.get('body') as string)?.trim()
  const articleId = formData.get('articleId') as string | null
  const recipeId  = formData.get('recipeId')  as string | null
  const parentId  = formData.get('parentId')  as string | null

  if (!body || body.length < 3) return { error: 'Comment is too short.' }
  if (body.length > 2000)       return { error: 'Comment is too long (max 2000 chars).' }

 const { error } = await supabase.from('comments').insert({
  author_id: user.id,
  body,
  article_id: articleId || null,
  recipe_id:  recipeId  || null,
  parent_id:  parentId  || null,
} as any)
  if (error) return { error: error.message }

  if (articleId) revalidatePath(`/articles/${formData.get('slug')}`)
  if (recipeId)  revalidatePath(`/recipes/${formData.get('slug')}`)
  return { success: true }
}

// ── BOOKMARKS ────────────────────────────────────────────────────────────

export async function toggleBookmark(formData: FormData) {
  const supabase   = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sign in to bookmark content.' }

  const articleId = formData.get('articleId') as string | null
  const recipeId  = formData.get('recipeId')  as string | null

  // Check if already bookmarked
  let query = supabase.from('bookmarks').select('id').eq('user_id', user.id)
  if (articleId) query = query.eq('article_id', articleId)
  if (recipeId)  query = query.eq('recipe_id',  recipeId)
 const { data: existing } = await query.maybeSingle()

if (existing) {
  await supabase.from('bookmarks').delete().eq('id', (existing as any).id)
  return { bookmarked: false }
} else {
  await supabase.from('bookmarks').insert({
    user_id: user.id,
    article_id: articleId || null,
    recipe_id:  recipeId  || null,
  } as any)
  return { bookmarked: true }
}
}

// ── NEWSLETTER ────────────────────────────────────────────────────────────

export async function subscribeNewsletter(formData: FormData) {
  const supabase   = await createClient()
  const email      = (formData.get('email') as string)?.trim().toLowerCase()
  const firstName  = (formData.get('firstName') as string)?.trim()
  const interests  = formData.getAll('interests') as string[]

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please enter a valid email address.' }
  }

  const { error } = await supabase.from('newsletter_subscribers').upsert(
    { email, first_name: firstName || null, interests, confirmed: false } as any,
    { onConflict: 'email', ignoreDuplicates: false }
  )
  if (error) return { error: error.message }
  return { success: true }
}

// ── PROFILE UPDATE ────────────────────────────────────────────────────────

export async function updateProfile(formData: FormData) {
  const supabase   = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

const { error } = await (supabase.from('profiles') as any).update({
  display_name: formData.get('display_name') as string,
  bio:          formData.get('bio')          as string,
  location:     formData.get('location')     as string,
  website_url:  formData.get('website_url')  as string,
  hive_count:   parseInt(formData.get('hive_count') as string ?? '0', 10),
}).eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/community/settings')
  return { success: true }
}
