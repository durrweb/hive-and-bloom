import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/queries'
import { getQueen } from '@/lib/apiary-queries'
import QueenForm from './QueenForm'

interface Props {
  params: Promise<{ hiveId: string }>
}

export default async function QueenEditPage({ params }: Props) {
  const { hiveId } = await params

  const userRaw = await getCurrentUser()
  if (!userRaw) redirect(`/auth/login?redirectTo=/apiary/${hiveId}/queen/edit`)
  const user = userRaw as any

  const queen = await getQueen(hiveId, user.id)

  return <QueenForm hiveId={hiveId} queen={queen} />
}
