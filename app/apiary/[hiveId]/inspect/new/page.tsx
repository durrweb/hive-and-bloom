import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/queries'
import { getHive } from '@/lib/apiary-queries'
import { getUserTier } from '@/lib/tier'
import InspectionForm from './InspectionForm'

interface Props { params: Promise<{ hiveId: string }> }

export default async function NewInspectionPage({ params }: Props) {
  const { hiveId } = await params
  const userRaw = await getCurrentUser()
  if (!userRaw) redirect(`/auth/login?redirectTo=/apiary/${hiveId}/inspect/new`)
  const user = userRaw as any

  const [hive, tier] = await Promise.all([
    getHive(hiveId, user.id),
    getUserTier(user.id),
  ])
  if (!hive) redirect('/apiary')

  return <InspectionForm hiveId={hiveId} userId={user.id} isPro={tier === 'pro'} />
}
