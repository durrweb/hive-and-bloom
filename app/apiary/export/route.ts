import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: hives } = await (supabase as any)
    .from('hive_summary')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!hives || hives.length === 0) {
    return exportResponse({ exportedAt: new Date().toISOString(), hives: [] })
  }

  const hiveIds = hives.map((h: any) => h.id)

  const [queens, inspections, supers, treatments] = await Promise.all([
    (supabase as any).from('queens').select('*').in('hive_id', hiveIds).eq('user_id', user.id),
    (supabase as any).from('inspections').select('*').in('hive_id', hiveIds).eq('user_id', user.id).order('inspected_at', { ascending: false }),
    (supabase as any).from('supers').select('*').in('hive_id', hiveIds).eq('user_id', user.id).order('date_added', { ascending: false }),
    (supabase as any).from('treatments').select('*').in('hive_id', hiveIds).eq('user_id', user.id).order('applied_at', { ascending: false }),
  ])

  const byHive = (rows: any[] | null) =>
    (rows ?? []).reduce<Record<string, any[]>>((acc, row) => {
      ;(acc[row.hive_id] ??= []).push(row)
      return acc
    }, {})

  const queensMap     = byHive(queens.data)
  const inspMap       = byHive(inspections.data)
  const supersMap     = byHive(supers.data)
  const treatmentsMap = byHive(treatments.data)

  const payload = {
    exportedAt: new Date().toISOString(),
    hives: hives.map((hive: any) => ({
      ...hive,
      queen:        (queensMap[hive.id] ?? [])[0] ?? null,
      inspections:  inspMap[hive.id]       ?? [],
      supers:       supersMap[hive.id]     ?? [],
      treatments:   treatmentsMap[hive.id] ?? [],
    })),
  }

  return exportResponse(payload)
}

function exportResponse(payload: unknown) {
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="my-apiary-export.json"',
    },
  })
}
