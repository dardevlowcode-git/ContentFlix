/* Commento didattico:
 * Scopo del file: definisce una pagina o layout amministrativo, usato per operazioni di controllo e gestione avanzata.
 * Moduli richiamati: `next`, `@/lib/supabase/admin`, `./AdminJobsClient`
 * Flusso: Questa pagina/layout richiama componenti e servizi: i dati arrivano da API o funzioni server, poi vengono passati alla UI per il rendering.
 */

import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminJobsClient from './AdminJobsClient'

export const metadata: Metadata = { title: 'Admin — Job' }

export default async function AdminJobsPage() {
  const supabase = createAdminClient()

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, job_attempts(*)')
    .order('created_at', { ascending: false })
    .limit(50)

  return <AdminJobsClient initialJobs={jobs ?? []} />
}
