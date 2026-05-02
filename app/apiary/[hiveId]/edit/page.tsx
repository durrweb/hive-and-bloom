import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/queries'
import { getHive } from '@/lib/apiary-queries'
import EditHiveForm from './EditHiveForm'

interface Props { params: Promise<{ hiveId: string }> }

export default async function EditHivePage({ params }: Props) {
  const { hiveId } = await params
  const userRaw = await getCurrentUser()
  if (!userRaw) redirect(`/auth/login?redirectTo=/apiary/${hiveId}/edit`)
  const user = userRaw as any

  const hive = await getHive(hiveId, user.id)
  if (!hive) redirect('/apiary')

  return <EditHiveForm hive={hive} />
}
