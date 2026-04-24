/* Commento didattico:
 * Scopo del file: definisce una pagina o layout amministrativo, usato per operazioni di controllo e gestione avanzata.
 * Moduli richiamati: `react`, `next/navigation`, `next-intl`
 * Flusso: Questa pagina/layout richiama componenti e servizi: i dati arrivano da API o funzioni server, poi vengono passati alla UI per il rendering.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'

interface JobRow {
  id: string
  job_type: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  priority: number
  created_at: string
  error_message: string | null
}

interface AdminJobsClientProps {
  initialJobs: JobRow[]
}

type BusyState =
  | { jobId: string; action: 'delete' | 'retry' }
  | null

export default function AdminJobsClient({ initialJobs }: AdminJobsClientProps) {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()

  const [jobs, setJobs] = useState<JobRow[]>(initialJobs)
  const [busy, setBusy] = useState<BusyState>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const statusColor: Record<JobRow['status'], string> = {
    pending: 'bg-amber-100 text-amber-700',
    running: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-error-container text-error',
  }

  const statusLabel: Record<JobRow['status'], string> = {
    pending: t('admin.jobs.status.pending'),
    running: t('admin.jobs.status.running'),
    completed: t('admin.jobs.status.completed'),
    failed: t('admin.jobs.status.failed'),
  }

  function clearFeedback() {
    setMessage(null)
    setError(null)
  }

  async function handleDeletePendingJob(jobId: string) {
    clearFeedback()

    const confirmed = window.confirm(t('admin.jobs.deleteConfirm'))
    if (!confirmed) return

    setBusy({ jobId, action: 'delete' })

    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'DELETE',
        cache: 'no-store',
      })

      const payload = (await response.json().catch(() => null)) as
        | { data: { message?: string } | null; error: string | null }
        | null

      if (!response.ok) {
        throw new Error(payload?.error ?? t('admin.jobs.deleteError'))
      }

      setJobs((current) => current.filter((job) => job.id !== jobId))
      setMessage(payload?.data?.message ?? t('admin.jobs.deleted'))
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setBusy(null)
    }
  }

  async function handleRetryFailedJob(jobId: string) {
    clearFeedback()

    const confirmed = window.confirm(t('admin.jobs.retryConfirm'))
    if (!confirmed) return

    setBusy({ jobId, action: 'retry' })

    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'POST',
        cache: 'no-store',
      })

      const payload = (await response.json().catch(() => null)) as
        | { data: { message?: string; retriedJob?: JobRow } | null; error: string | null }
        | null

      if (!response.ok) {
        throw new Error(payload?.error ?? t('admin.jobs.retryError'))
      }

      if (payload?.data?.retriedJob) {
        setJobs((current) => [payload.data!.retriedJob!, ...current].slice(0, 50))
      }

      setMessage(payload?.data?.message ?? t('admin.jobs.retried'))
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setBusy(null)
    }
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

      {message && <p className="mb-4 text-sm text-green-700">{message}</p>}
      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-ambient">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-container-low">
          <div className="col-span-3 text-label-caps text-on-surface-variant">{t('admin.jobs.type')}</div>
          <div className="col-span-2 text-label-caps text-on-surface-variant">{t('admin.users.status')}</div>
          <div className="col-span-2 text-label-caps text-on-surface-variant">{t('admin.jobs.priority')}</div>
          <div className="col-span-2 text-label-caps text-on-surface-variant">{t('admin.jobs.createdAt')}</div>
          <div className="col-span-2 text-label-caps text-on-surface-variant">{t('admin.jobs.error')}</div>
          <div className="col-span-1 text-label-caps text-on-surface-variant text-right">{t('admin.users.actions')}</div>
        </div>

        {jobs.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            {t('admin.jobs.empty')}
          </div>
        ) : (
          jobs.map((job, i) => {
            const deleteBusy = busy?.jobId === job.id && busy.action === 'delete'
            const retryBusy = busy?.jobId === job.id && busy.action === 'retry'
            return (
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
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[job.status]}`}>
                    {statusLabel[job.status]}
                  </span>
                </div>
                <div className="col-span-2 text-sm text-on-surface-variant">{job.priority}</div>
                <div className="col-span-2 text-sm text-on-surface-variant">
                  {new Date(job.created_at).toLocaleDateString(locale)}
                </div>
                <div className="col-span-2 text-xs text-error truncate">
                  {job.error_message ?? '—'}
                </div>
                <div className="col-span-1 flex justify-end">
                  {job.status === 'pending' && (
                    <button
                      type="button"
                      disabled={deleteBusy}
                      title={t('admin.jobs.delete')}
                      onClick={() => handleDeletePendingJob(job.id)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-error
                                 hover:bg-error-container/40 transition-all
                                 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {t('admin.jobs.delete')}
                    </button>
                  )}
                  {job.status === 'failed' && (
                    <button
                      type="button"
                      disabled={retryBusy}
                      title={t('admin.jobs.retry')}
                      onClick={() => handleRetryFailedJob(job.id)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-primary
                                 hover:bg-primary-fixed transition-all
                                 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {t('admin.jobs.retry')}
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
