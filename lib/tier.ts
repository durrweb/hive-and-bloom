import { createClient } from '@/lib/supabase/server'

export const FREE_HIVE_LIMIT = 3

export async function getUserTier(userId: string): Promise<'free' | 'pro'> {
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('profile_tier')
    .select('tier')
    .eq('user_id', userId)
    .single()
  if (error) { console.error('getUserTier:', error); return 'free' }
  return data?.tier === 'pro' ? 'pro' : 'free'
}

export async function isPro(userId: string): Promise<boolean> {
  return (await getUserTier(userId)) === 'pro'
}
