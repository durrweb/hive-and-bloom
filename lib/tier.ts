import { createClient } from '@/lib/supabase/server'
export { FREE_HIVE_LIMIT } from '@/lib/apiary-constants'

export async function getUserTier(userId: string): Promise<'free' | 'pro'> {
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('profile_tier')
    .select('tier, pro_granted_reason')
    .eq('user_id', userId)
    .single()
  if (error || !data) return 'free'
  if (data.pro_granted_reason === 'founding_member') return 'pro'
  return data.tier === 'pro' ? 'pro' : 'free'
}

export async function isPro(userId: string): Promise<boolean> {
  return (await getUserTier(userId)) === 'pro'
}
