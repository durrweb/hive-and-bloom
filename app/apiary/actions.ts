'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserHiveCount } from '@/lib/apiary-queries'
import { getUserTier, FREE_HIVE_LIMIT } from '@/lib/tier'
import type { HiveStatus } from '@/lib/apiary-queries'

type ActionState = { error: string } | null

// Verify a hive belongs to the authenticated user; returns hiveId or null.
async function assertHiveOwner(supabase: any, hiveId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('hives').select('id').eq('id', hiveId).eq('user_id', userId).single()
  return !!data
}

// ── Hive ──────────────────────────────────────────────────────────────────────

export async function addHive(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const tier = await getUserTier(user.id)
  if (tier === 'free') {
    const count = await getUserHiveCount(user.id)
    if (count >= FREE_HIVE_LIMIT)
      return { error: `Free plan is limited to ${FREE_HIVE_LIMIT} hives. Upgrade to Pro to add more.` }
  }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Hive name is required.' }

  const { data, error } = await (supabase as any)
    .from('hives')
    .insert({
      name,
      location:      (formData.get('location')      as string)?.trim() || null,
      hive_type:     (formData.get('hive_type')     as string) || null,
      notes:         (formData.get('notes')         as string)?.trim() || null,
      origin_type:   (formData.get('origin_type')   as string) || null,
      origin_source: (formData.get('origin_source') as string)?.trim() || null,
      origin_date:   (formData.get('origin_date')   as string) || null,
      origin_notes:  (formData.get('origin_notes')  as string)?.trim() || null,
      user_id:       user.id,
      status:        'active',
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/apiary')
  redirect(`/apiary/${data.id}`)
}

export async function updateHive(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const hiveId = formData.get('hiveId') as string
  if (!await assertHiveOwner(supabase as any, hiveId, user.id))
    return { error: 'Hive not found.' }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Hive name is required.' }

  const { error } = await (supabase as any)
    .from('hives')
    .update({
      name,
      location:      (formData.get('location')      as string)?.trim() || null,
      hive_type:     (formData.get('hive_type')     as string) || null,
      notes:         (formData.get('notes')         as string)?.trim() || null,
      origin_type:   (formData.get('origin_type')   as string) || null,
      origin_source: (formData.get('origin_source') as string)?.trim() || null,
      origin_date:   (formData.get('origin_date')   as string) || null,
      origin_notes:  (formData.get('origin_notes')  as string)?.trim() || null,
    })
    .eq('id', hiveId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/apiary')
  revalidatePath(`/apiary/${hiveId}`)
  redirect(`/apiary/${hiveId}`)
}

export async function updateHiveStatus(hiveId: string, status: HiveStatus): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await (supabase as any)
    .from('hives')
    .update({ status })
    .eq('id', hiveId)
    .eq('user_id', user.id)

  revalidatePath('/apiary')
  revalidatePath(`/apiary/${hiveId}`)
}

// ── Inspections ───────────────────────────────────────────────────────────────

export async function logInspection(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const hiveId = formData.get('hiveId') as string
  if (!await assertHiveOwner(supabase as any, hiveId, user.id))
    return { error: 'Hive not found.' }

  const inspected_at = formData.get('inspected_at') as string
  if (!inspected_at) return { error: 'Inspection date is required.' }

  const toFloat = (key: string) => {
    const v = formData.get(key) as string
    return v ? parseFloat(v) : null
  }

  const { data: inspData, error } = await (supabase as any).from('inspections').insert({
    hive_id:        hiveId,
    user_id:        user.id,
    inspected_at,
    overall_health: formData.get('overall_health') || null,
    queen_seen:     formData.get('queen_seen')  === 'on',
    eggs_seen:      formData.get('eggs_seen')   === 'on',
    brood_pattern:  formData.get('brood_pattern') || null,
    population:     formData.get('population')    || null,
    temperament:    formData.get('temperament')   || null,
    varroa_count:   toFloat('varroa_count'),
    weather:        formData.get('weather') || null,
    weight_kg:      toFloat('weight_kg'),
    notes:          (formData.get('notes') as string)?.trim() || null,
  }).select('id').single()

  if (error) return { error: error.message }

  // Save inspection photos (Pro only)
  const photoUrls  = formData.getAll('photo_urls')  as string[]
  const photoPaths = formData.getAll('photo_paths') as string[]
  if (photoUrls.length > 0) {
    const tier = await getUserTier(user.id)
    if (tier === 'pro') {
      const rows = photoUrls
        .map((url, i) => ({ inspection_id: inspData.id, hive_id: hiveId, user_id: user.id, url, storage_path: photoPaths[i] ?? '' }))
        .filter(r => r.url && r.storage_path)
      if (rows.length) await (supabase as any).from('inspection_photos').insert(rows)
    }
  }

  revalidatePath('/apiary')
  revalidatePath(`/apiary/${hiveId}`)
  redirect(`/apiary/${hiveId}?tab=inspections`)
}

// ── Queen ─────────────────────────────────────────────────────────────────────

export async function upsertQueen(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const hiveId = formData.get('hiveId') as string
  if (!await assertHiveOwner(supabase as any, hiveId, user.id))
    return { error: 'Hive not found.' }

  const payload = {
    hive_id:      hiveId,
    user_id:      user.id,
    breed:        (formData.get('breed')        as string) || null,
    installed_at: (formData.get('installed_at') as string) || null,
    source:       (formData.get('source')       as string) || null,
    marked:       formData.get('marked') === 'on',
    mark_color:   (formData.get('mark_color')   as string) || null,
    status:       (formData.get('status')       as string) || 'present',
    notes:        (formData.get('notes')        as string)?.trim() || null,
  }

  const { data: existing } = await (supabase as any)
    .from('queens')
    .select('id')
    .eq('hive_id', hiveId)
    .eq('user_id', user.id)
    .maybeSingle()

  const { error } = existing
    ? await (supabase as any).from('queens').update(payload).eq('id', existing.id)
    : await (supabase as any).from('queens').insert(payload)

  if (error) return { error: error.message }

  revalidatePath('/apiary')
  revalidatePath(`/apiary/${hiveId}`)
  redirect(`/apiary/${hiveId}?tab=queen`)
}

// ── Supers ────────────────────────────────────────────────────────────────────

export async function addSuper(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const hiveId = formData.get('hiveId') as string
  if (!await assertHiveOwner(supabase as any, hiveId, user.id))
    return { error: 'Hive not found.' }

  const toInt   = (k: string) => { const v = formData.get(k) as string; return v ? parseInt(v, 10)   : null }
  const toFloat = (k: string) => { const v = formData.get(k) as string; return v ? parseFloat(v)      : null }

  const { error } = await (supabase as any).from('supers').insert({
    hive_id:      hiveId,
    user_id:      user.id,
    position:     toInt('position'),
    frames_count: toInt('frames_count'),
    date_added:   (formData.get('date_added') as string) || new Date().toISOString().split('T')[0],
    estimated_kg: toFloat('estimated_kg'),
    notes:        (formData.get('notes') as string)?.trim() || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/apiary')
  revalidatePath(`/apiary/${hiveId}`)
  redirect(`/apiary/${hiveId}?tab=supers`)
}

export async function removeSuper(superId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: row } = await (supabase as any)
    .from('supers').select('hive_id').eq('id', superId).eq('user_id', user.id).single()
  if (!row) return

  await (supabase as any)
    .from('supers')
    .update({ date_removed: new Date().toISOString().split('T')[0] })
    .eq('id', superId)
    .eq('user_id', user.id)

  revalidatePath('/apiary')
  revalidatePath(`/apiary/${row.hive_id}`)
}

// ── Treatments ────────────────────────────────────────────────────────────────

export async function logTreatment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const hiveId = formData.get('hiveId') as string
  if (!await assertHiveOwner(supabase as any, hiveId, user.id))
    return { error: 'Hive not found.' }

  const type       = (formData.get('type')       as string)
  const applied_at = (formData.get('applied_at') as string)
  if (!type)       return { error: 'Treatment type is required.' }
  if (!applied_at) return { error: 'Application date is required.' }

  const toFloat = (k: string) => { const v = formData.get(k) as string; return v ? parseFloat(v) : null }

  const { error } = await (supabase as any).from('treatments').insert({
    hive_id:       hiveId,
    user_id:       user.id,
    type,
    applied_at,
    completed_at:  (formData.get('completed_at') as string) || null,
    dose:          (formData.get('dose')         as string) || null,
    varroa_before: toFloat('varroa_before'),
    varroa_after:  toFloat('varroa_after'),
    notes:         (formData.get('notes') as string)?.trim() || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/apiary')
  revalidatePath(`/apiary/${hiveId}`)
  redirect(`/apiary/${hiveId}?tab=treatments`)
}

// ── Reminders ─────────────────────────────────────────────────────────────────

export async function addReminder(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  // PRO gate — all users are currently Pro in beta
  const tier = await getUserTier(user.id)
  if (tier !== 'pro') return { error: 'Reminders are a Pro feature. Upgrade to unlock.' }

  const hiveId = formData.get('hiveId') as string
  if (!await assertHiveOwner(supabase as any, hiveId, user.id))
    return { error: 'Hive not found.' }

  const title  = (formData.get('title')  as string)?.trim()
  const due_at = (formData.get('due_at') as string)
  if (!title)  return { error: 'Title is required.' }
  if (!due_at) return { error: 'Due date is required.' }

  const { error } = await (supabase as any).from('reminders').insert({
    hive_id:   hiveId,
    user_id:   user.id,
    title,
    due_at,
    completed: false,
    notes:     (formData.get('notes') as string)?.trim() || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/apiary')
  revalidatePath(`/apiary/${hiveId}`)
  redirect(`/apiary/${hiveId}?tab=reminders`)
}

export async function deleteHive(hiveId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  if (!await assertHiveOwner(supabase as any, hiveId, user.id)) return

  // Clean up storage files before deleting DB rows
  const [{ data: hivePhotos }, { data: inspPhotos }] = await Promise.all([
    (supabase as any).from('hive_photos').select('storage_path').eq('hive_id', hiveId).eq('user_id', user.id),
    (supabase as any).from('inspection_photos').select('storage_path').eq('hive_id', hiveId).eq('user_id', user.id),
  ])

  const paths = [
    ...(hivePhotos ?? []).map((p: any) => p.storage_path),
    ...(inspPhotos ?? []).map((p: any) => p.storage_path),
  ]
  if (paths.length > 0) {
    await (supabase as any).storage.from('hive-photos').remove(paths)
  }

  await (supabase as any).from('hives').delete().eq('id', hiveId).eq('user_id', user.id)

  revalidatePath('/apiary')
  redirect('/apiary')
}

// ── Photos ────────────────────────────────────────────────────────────────────

type PhotoResult = { id: string; url: string; storage_path: string; created_at: string } | { error: string }

export async function saveHivePhoto(hiveId: string, url: string, storagePath: string): Promise<PhotoResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const tier = await getUserTier(user.id)
  if (tier !== 'pro') return { error: 'Photos are a Pro feature. Upgrade to unlock.' }

  if (!await assertHiveOwner(supabase as any, hiveId, user.id))
    return { error: 'Hive not found.' }

  const { data, error } = await (supabase as any)
    .from('hive_photos')
    .insert({ hive_id: hiveId, user_id: user.id, url, storage_path: storagePath })
    .select('id, url, storage_path, created_at')
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/apiary/${hiveId}`)
  return data
}

export async function deleteHivePhoto(photoId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { data: photo } = await (supabase as any)
    .from('hive_photos')
    .select('hive_id, storage_path')
    .eq('id', photoId)
    .eq('user_id', user.id)
    .single()

  if (!photo) return { error: 'Photo not found.' }

  await (supabase as any).storage.from('hive-photos').remove([photo.storage_path])
  await (supabase as any).from('hive_photos').delete().eq('id', photoId).eq('user_id', user.id)

  revalidatePath(`/apiary/${photo.hive_id}`)
  return {}
}

export async function completeReminder(reminderId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: row } = await (supabase as any)
    .from('reminders').select('hive_id').eq('id', reminderId).eq('user_id', user.id).single()
  if (!row) return

  await (supabase as any)
    .from('reminders')
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq('id', reminderId)
    .eq('user_id', user.id)

  revalidatePath('/apiary')
  revalidatePath(`/apiary/${row.hive_id}`)
}
