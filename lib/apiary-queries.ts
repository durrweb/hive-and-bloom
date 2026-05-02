import { createClient } from '@/lib/supabase/server'

// ── Types ──────────────────────────────────────────────────────────────────

export type HiveStatus = 'active' | 'inactive' | 'lost'
export type QueenStatus = 'present' | 'missing' | 'replaced'
export type HealthRating = 'excellent' | 'good' | 'fair' | 'poor'

export interface Hive {
  id: string
  user_id: string
  name: string
  location: string | null
  hive_type: string | null
  status: HiveStatus
  notes: string | null
  created_at: string
  updated_at: string
  // aggregated fields from hive_summary view
  last_inspection_at: string | null
  super_count: number
  active_treatment_count: number
  queen_status: QueenStatus | null
}

export interface Inspection {
  id: string
  hive_id: string
  user_id: string
  inspected_at: string
  overall_health: HealthRating | null
  queen_seen: boolean | null
  eggs_seen: boolean | null
  brood_pattern: string | null
  population: string | null
  temperament: string | null
  varroa_count: number | null
  notes: string | null
  created_at: string
  // PRO fields
  weather?: string | null
  weight_kg?: number | null
}

export interface Queen {
  id: string
  hive_id: string
  user_id: string
  marked: boolean
  mark_color: string | null
  installed_at: string | null
  source: string | null
  breed: string | null
  status: QueenStatus | null
  notes: string | null
  created_at: string
}

export interface Super {
  id: string
  hive_id: string
  user_id: string
  position: number | null
  frames_count: number | null
  date_added: string | null
  date_removed: string | null
  notes: string | null
  created_at: string
  // PRO field
  estimated_kg?: number | null
}

export interface Treatment {
  id: string
  hive_id: string
  user_id: string
  type: string
  applied_at: string
  completed_at: string | null
  dose: string | null
  notes: string | null
  created_at: string
  // PRO fields
  varroa_before?: number | null
  varroa_after?: number | null
  efficacy_pct?: number | null
}

export interface Reminder {
  id: string
  hive_id: string
  user_id: string
  title: string
  due_at: string
  completed: boolean
  notes: string | null
  created_at: string
}

// ── Queries ────────────────────────────────────────────────────────────────

export async function getUserHives(userId: string): Promise<Hive[]> {
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('hive_summary')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) { console.error('getUserHives:', error); return [] }
  return (data as Hive[]) ?? []
}

export async function getHive(hiveId: string, userId: string): Promise<Hive | null> {
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('hive_summary')
    .select('*')
    .eq('id', hiveId)
    .eq('user_id', userId)
    .single()
  if (error) { console.error('getHive:', error); return null }
  return (data as Hive) ?? null
}

export async function getInspections(hiveId: string, userId: string): Promise<Inspection[]> {
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('inspections')
    .select('*')
    .eq('hive_id', hiveId)
    .eq('user_id', userId)
    .order('inspected_at', { ascending: false })
  if (error) { console.error('getInspections:', error); return [] }
  return (data as Inspection[]) ?? []
}

export async function getQueen(hiveId: string, userId: string): Promise<Queen | null> {
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('queens')
    .select('*')
    .eq('hive_id', hiveId)
    .eq('user_id', userId)
    .single()
  if (error) { console.error('getQueen:', error); return null }
  return (data as Queen) ?? null
}

export async function getSupers(hiveId: string, userId: string): Promise<Super[]> {
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('supers')
    .select('*')
    .eq('hive_id', hiveId)
    .eq('user_id', userId)
    .order('date_added', { ascending: false })
  if (error) { console.error('getSupers:', error); return [] }
  return (data as Super[]) ?? []
}

export async function getTreatments(hiveId: string, userId: string): Promise<Treatment[]> {
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('treatments')
    .select('*')
    .eq('hive_id', hiveId)
    .eq('user_id', userId)
    .order('applied_at', { ascending: false })
  if (error) { console.error('getTreatments:', error); return [] }
  return (data as Treatment[]) ?? []
}

export async function getReminders(hiveId: string, userId: string): Promise<Reminder[]> {
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('reminders')
    .select('*')
    .eq('hive_id', hiveId)
    .eq('user_id', userId)
    .eq('completed', false)
    .order('due_at', { ascending: true })
  if (error) { console.error('getReminders:', error); return [] }
  return (data as Reminder[]) ?? []
}

export async function getUserHiveCount(userId: string): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await (supabase as any)
    .from('hives')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'active')
  if (error) { console.error('getUserHiveCount:', error); return 0 }
  return count ?? 0
}

// ── Photos ──────────────────────────────────────────────────────────────────

export interface HivePhoto {
  id: string
  hive_id: string
  user_id: string
  url: string
  storage_path: string
  created_at: string
}

export interface InspectionPhoto {
  id: string
  inspection_id: string
  hive_id: string
  user_id: string
  url: string
  storage_path: string
  created_at: string
}

export async function getHivePhotos(hiveId: string, userId: string): Promise<HivePhoto[]> {
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('hive_photos')
    .select('*')
    .eq('hive_id', hiveId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) { console.error('getHivePhotos:', error); return [] }
  return (data as HivePhoto[]) ?? []
}

export async function getInspectionPhotosByHive(hiveId: string, userId: string): Promise<Record<string, InspectionPhoto[]>> {
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('inspection_photos')
    .select('*')
    .eq('hive_id', hiveId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) { console.error('getInspectionPhotos:', error); return {} }
  const result: Record<string, InspectionPhoto[]> = {}
  for (const photo of (data as InspectionPhoto[]) ?? []) {
    if (!result[photo.inspection_id]) result[photo.inspection_id] = []
    result[photo.inspection_id].push(photo)
  }
  return result
}
