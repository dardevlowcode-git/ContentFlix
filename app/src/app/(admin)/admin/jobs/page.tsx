/* Commento didattico:
 * Scopo del file: definisce una pagina o layout amministrativo, usato per operazioni di controllo e gestione avanzata.
 * Moduli richiamati: `next`, `@/lib/supabase/admin`, `./AdminJobsClient`
 * Flusso: Questa pagina/layout richiama componenti e servizi: i dati arrivano da API o funzioni server, poi vengono passati alla UI per il rendering.
 */

import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminJobsClient from './AdminJobsClient'
import { buildJobLabel, collectJobChannelIds, collectJobUserIds } from '@/lib/utils/job-label'

export const metadata: Metadata = { title: 'Admin — Job' }

export default async function AdminJobsPage() {
  const supabase = createAdminClient()

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, job_attempts(*)')
    .order('created_at', { ascending: false })
    .limit(50)

  // Tipizzazione difensiva: le query annidate possono essere inferite in modo troppo restrittivo.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jobRows = (jobs ?? []) as any[]

  const userIds = collectJobUserIds(jobRows)
  const channelIds = collectJobChannelIds(jobRows)

  const [usersResult, channelsResult] = await Promise.all([
    userIds.length === 0
      ? Promise.resolve({ data: [] as Array<{ id: string; display_name: string | null; email: string }> })
      : supabase
        .from('users')
        .select('id, display_name, email')
        .in('id', userIds),
    channelIds.length === 0
      ? Promise.resolve({ data: [] as Array<{ id: string; title: string }> })
      : supabase
        .from('channels')
        .select('id, title')
        .in('id', channelIds),
  ])

  const usersById = Object.fromEntries(
    (usersResult.data ?? []).map((u) => [u.id, u.display_name ?? u.email])
  )
  const channelsById = Object.fromEntries(
    (channelsResult.data ?? []).map((c) => [c.id, c.title])
  )

  const jobsWithLabel = jobRows.map((job) => ({
    ...job,
    job_label: buildJobLabel(job, usersById, channelsById),
  }))

  return <AdminJobsClient initialJobs={jobsWithLabel} />
}
