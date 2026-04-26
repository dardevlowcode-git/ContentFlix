/* Commento didattico:
 * Scopo del file: renderizza la pagina tracker con separazione tra video da vedere e video già visti.
 * Moduli richiamati: `next`, `next/link`, `next-intl/server`, `next/navigation`, `@/lib/auth/provider`, `@/lib/services/videos`
 * Flusso: carica sessione e lista video server-side, partiziona per stato visto e mostra card con azione rapida.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import SeenStatusButton from './SeenStatusButton'
import { getCurrentSession } from '@/lib/auth/provider'
import { getVideosForUser } from '@/lib/services/videos'

export const metadata: Metadata = {
  title: 'Tracker Video',
}

export default async function TrackerPage() {
  const session = await getCurrentSession()
  if (!session) {
    redirect('/login')
  }

  const t = await getTranslations()
  const locale = await getLocale()

  const { items } = await getVideosForUser({
    userId: session.userId,
    languageCode: session.preferredLanguage,
    limit: 48,
    page: 1,
  })

  const unseenItems = items.filter((item) => item.userState.seenStatus !== 'seen')
  const seenItems = items.filter((item) => item.userState.seenStatus === 'seen')
  const watchlistCount = items.filter((item) => item.userState.isInWatchlist).length

  return (
    <div className="p-8 max-w-6xl">
      <header className="mb-10">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2">
          {t('tracker.title')}
        </h1>
        <p className="text-on-surface-variant text-lg">
          {t('tracker.subtitle')}
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <MetricCard label={t('tracker.metrics.toWatch')} value={unseenItems.length} tone="primary" />
        <MetricCard label={t('tracker.metrics.watched')} value={seenItems.length} tone="neutral" />
        <MetricCard label={t('tracker.metrics.inWatchlist')} value={watchlistCount} tone="tertiary" />
      </section>

      {items.length === 0 ? (
        <div className="bg-surface-container-low rounded-2xl p-10 text-center">
          <p className="text-on-surface-variant mb-3">{t('tracker.empty')}</p>
          <Link href="/channels" className="text-primary font-semibold hover:underline">
            {t('tracker.addChannels')}
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-headline text-2xl font-bold text-on-surface">
                {t('tracker.sections.toWatch', { count: unseenItems.length })}
              </h2>
            </div>
            {unseenItems.length === 0 ? (
              <p className="text-sm text-on-surface-variant">{t('tracker.allCaughtUp')}</p>
            ) : (
              <div className="space-y-4">
                {unseenItems.map((item) => (
                  <TrackerCard
                    key={item.video.id}
                    item={item}
                    isSeen={false}
                    locale={locale}
                    labels={{
                      unseen: t('tracker.badges.unseen'),
                      seen: t('tracker.badges.seen'),
                      watchlist: t('tracker.badges.watchlist'),
                      viewSummary: t('tracker.viewSummary'),
                      markSeen: t('dashboard.markSeen'),
                      markUnseen: t('dashboard.markUnseen'),
                      error: t('common.error'),
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-headline text-2xl font-bold text-on-surface">
                {t('tracker.sections.watched', { count: seenItems.length })}
              </h2>
            </div>
            {seenItems.length === 0 ? (
              <p className="text-sm text-on-surface-variant">{t('tracker.noneWatchedYet')}</p>
            ) : (
              <div className="space-y-4">
                {seenItems.map((item) => (
                  <TrackerCard
                    key={item.video.id}
                    item={item}
                    isSeen
                    locale={locale}
                    labels={{
                      unseen: t('tracker.badges.unseen'),
                      seen: t('tracker.badges.seen'),
                      watchlist: t('tracker.badges.watchlist'),
                      viewSummary: t('tracker.viewSummary'),
                      markSeen: t('dashboard.markSeen'),
                      markUnseen: t('dashboard.markUnseen'),
                      error: t('common.error'),
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'primary' | 'neutral' | 'tertiary'
}) {
  const toneClasses = {
    primary: 'bg-primary-fixed text-on-primary-fixed',
    neutral: 'bg-surface-container-lowest text-on-surface',
    tertiary: 'bg-tertiary-fixed text-on-tertiary-fixed',
  }

  return (
    <article className={`rounded-2xl p-5 shadow-ambient ${toneClasses[tone]}`}>
      <p className="text-xs uppercase tracking-[0.05em] font-black opacity-80">{label}</p>
      <p className="font-headline text-3xl font-extrabold mt-2">{value}</p>
    </article>
  )
}

function TrackerCard({
  item,
  isSeen,
  locale,
  labels,
}: {
  item: Awaited<ReturnType<typeof getVideosForUser>>['items'][number]
  isSeen: boolean
  locale: string
  labels: {
    unseen: string
    seen: string
    watchlist: string
    viewSummary: string
    markSeen: string
    markUnseen: string
    error: string
  }
}) {
  const publishedLabel = formatPublishedDate(item.video.published_at, locale)
  const durationLabel = formatDuration(item.video.duration_seconds)
  const hasCompletedAnalysis = item.analysis?.analysis_status === 'completed'

  return (
    <article className={`group flex flex-col md:flex-row gap-5 p-5 rounded-[1.75rem] transition-all ${
      isSeen ? 'bg-surface-container-low/70' : 'bg-surface-container-lowest'
    }`}>
      <Link
        href={`/video/${item.video.id}`}
        className={`relative w-full md:w-72 lg:w-80 aspect-video rounded-2xl overflow-hidden shrink-0 ${
          isSeen ? 'grayscale-[0.4]' : ''
        }`}
      >
        {item.video.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.video.thumbnail_url}
            alt={item.video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-surface-container flex items-center justify-center">
            <svg className="w-12 h-12 text-on-surface-variant opacity-30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
        {durationLabel ? (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-md">
            {durationLabel}
          </div>
        ) : null}
      </Link>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
              isSeen
                ? 'bg-surface-container-high text-on-surface-variant'
                : 'bg-primary-fixed text-on-primary-fixed'
            }`}>
              {isSeen ? labels.seen : labels.unseen}
            </span>
            {item.userState.isInWatchlist ? (
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-tertiary-fixed text-on-tertiary-fixed">
                {labels.watchlist}
              </span>
            ) : null}
            <span className="text-xs text-on-surface-variant">{publishedLabel}</span>
          </div>

          <h3 className="font-headline text-xl font-bold text-on-surface leading-tight line-clamp-2">
            {item.video.title}
          </h3>
          <p className="text-sm text-secondary font-semibold mt-1">
            {item.channel.title}
          </p>
          {item.localizedContent?.short_summary ? (
            <p className="text-sm text-on-surface-variant mt-2 line-clamp-2 ai-content">
              {item.localizedContent.short_summary}
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <SeenStatusButton
            videoId={item.video.id}
            initialSeen={isSeen}
            labels={{
              markSeen: labels.markSeen,
              markUnseen: labels.markUnseen,
              error: labels.error,
            }}
          />
          {hasCompletedAnalysis ? (
            <Link
              href={`/video/${item.video.id}`}
              className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-full gradient-primary text-on-primary"
            >
              {labels.viewSummary}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatPublishedDate(date: string, locale: string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffH = Math.floor(diffMs / (1000 * 60 * 60))
  const diffD = Math.floor(diffH / 24)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (diffH < 1) return rtf.format(0, 'hour')
  if (diffH < 24) return rtf.format(-diffH, 'hour')
  if (diffD < 7) return rtf.format(-diffD, 'day')

  return then.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: now.getFullYear() === then.getFullYear() ? undefined : 'numeric',
  })
}
