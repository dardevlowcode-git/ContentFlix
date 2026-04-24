/* Commento didattico:
 * Scopo del file: definisce una pagina o layout amministrativo, usato per operazioni di controllo e gestione avanzata.
 * Moduli richiamati: `next`, `@/lib/supabase/admin`, `next-intl/server`
 * Flusso: Questa pagina/layout richiama componenti e servizi: i dati arrivano da API o funzioni server, poi vengono passati alla UI per il rendering.
 */

import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { getLocale, getTranslations } from 'next-intl/server'

export const metadata: Metadata = { title: 'Admin — Job' }

export default async function AdminJobsPage() {
  const supabase = createAdminClient()
  const t = await getTranslations()
  const locale = await getLocale()

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, job_attempts(*)')
    .order('created_at', { ascending: false })
    .limit(50)

  const statusColor: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    running: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-error-container text-error',
  }

  const statusLabel: Record<string, string> = {
    pending: t('admin.jobs.status.pending'),
    running: t('admin.jobs.status.running'),
    completed: t('admin.jobs.status.completed'),
    failed: t('admin.jobs.status.failed'),
  }

  return (
    <div className="p-8 max-w-6xl">
      <header className="mb-10">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-1">
          {t('admin.jobs.title')}
        </h1>
        <p className="text-on-surface-variant text-sm">
          {t('admin.jobs.subtitle')}
        </p>
      </header>

      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-ambient">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-container-low">
          <div className="col-span-3 text-label-caps text-on-surface-variant">{t('admin.jobs.type')}</div>
          <div className="col-span-2 text-label-caps text-on-surface-variant">{t('admin.users.status')}</div>
          <div className="col-span-2 text-label-caps text-on-surface-variant">{t('admin.jobs.priority')}</div>
          <div className="col-span-2 text-label-caps text-on-surface-variant">{t('admin.jobs.createdAt')}</div>
          <div className="col-span-2 text-label-caps text-on-surface-variant">{t('admin.jobs.error')}</div>
          <div className="col-span-1 text-label-caps text-on-surface-variant">{t('admin.users.actions')}</div>
        </div>

        {!jobs || jobs.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            {t('admin.jobs.empty')}
          </div>
        ) : (
          jobs.map((job, i) => (
            <div
              key={job.id}
              className={`grid grid-cols-12 gap-4 px-6 py-4 items-center
                           ${i % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low'}
                           hover:bg-surface-container transition-colors`}
            >
              <div className="col-span-3">
                <p className="text-sm font-mono font-semibold text-on-surface truncate">{job.job_type}</p>
              </div>
              <div className="col-span-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[job.status] ?? ''}`}>
                  {statusLabel[job.status] ?? job.status}
                </span>
              </div>
              <div className="col-span-2 text-sm text-on-surface-variant">{job.priority}</div>
              <div className="col-span-2 text-sm text-on-surface-variant">
                {new Date(job.created_at).toLocaleDateString(locale)}
              </div>
              <div className="col-span-2 text-xs text-error truncate">
                {job.error_message ?? '—'}
              </div>
              <div className="col-span-1">
                {job.status === 'failed' && (
                  <button
                        title={t('admin.jobs.retry')}
                    className="p-1.5 text-primary hover:bg-primary-fixed rounded-lg transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
