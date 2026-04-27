/* Commento didattico:
 * Scopo del file: renderizza il tracker lato client con filtri a flag e aggiornamento immediato dello stato video.
 * Moduli richiamati: `next/link`, `react`, `./SeenStatusButton`, `@/lib/types/domain`
 * Flusso: mantiene lista e filtri in stato locale, filtra i video visibili e aggiorna le card dopo ogni azione utente.
 */

'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import SeenStatusButton from './SeenStatusButton'
import type { VideoWithContext } from '@/lib/types/domain'

interface TrackerClientProps {
  items: VideoWithContext[]
  locale: string
  labels: {
    title: string
    subtitle: string
    empty: string
    addChannels: string
    allCaughtUp: string
    noneWatchedYet: string
    noVideosForFilters: string
    viewSummary: string
    badges: {
      unseen: string
      seen: string
      hidden: string
      watchlist: string
    }
    filters: {
      seen: string
      unseen: string
      hidden: string
    }
    metrics: {
      toWatch: string
      watched: string
      hidden: string
    }
    actions: {
      markSeen: string
      markUnseen: string
      hide: string
      unhide: string
    }
    error: string
  }
}

export default function TrackerClient({ items, locale, labels }: TrackerClientProps) {
  const [videos, setVideos] = useState(items)
  const [filters, setFilters] = useState({
    seen: false,
    unseen: true,
    hidden: false,
  })

  const counts = useMemo(() => {
    return {
      unseen: videos.filter((item) => item.userState.seenStatus === 'unseen').length,
      seen: videos.filter((item) => item.userState.seenStatus === 'seen').length,
      hidden: videos.filter((item) => item.userState.seenStatus === 'hidden').length,
    }
  }, [videos])

  const filteredItems = useMemo(() => {
    return videos.filter((item) => filters[item.userState.seenStatus])
  }, [videos, filters])

  function toggleFilter(filterKey: 'seen' | 'unseen' | 'hidden') {
    setFilters((current) => ({ ...current, [filterKey]: !current[filterKey] }))
  }

  function updateVideoStatus(videoId: string, nextStatus: 'seen' | 'unseen' | 'hidden') {
    setVideos((current) =>
      current.map((item) => {
        if (item.video.id !== videoId) return item
        return {
          ...item,
          userState: {
            ...item.userState,
            seenStatus: nextStatus,
          },
        }
      })
    )
  }

  return (
    <div className="p-8 max-w-6xl">
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2">
          {labels.title}
        </h1>
        <p className="text-on-surface-variant text-lg mb-5">
          {labels.subtitle}
        </p>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <MetricCard label={labels.metrics.toWatch} value={counts.unseen} tone="primary" />
          <MetricCard label={labels.metrics.watched} value={counts.seen} tone="neutral" />
          <MetricCard label={labels.metrics.hidden} value={counts.hidden} tone="danger" />
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <FilterPill
            label={labels.filters.unseen}
            checked={filters.unseen}
            onToggle={() => toggleFilter('unseen')}
          />
          <FilterPill
            label={labels.filters.seen}
            checked={filters.seen}
            onToggle={() => toggleFilter('seen')}
          />
          <FilterPill
            label={labels.filters.hidden}
            checked={filters.hidden}
            onToggle={() => toggleFilter('hidden')}
          />
        </div>
      </header>

      {videos.length === 0 ? (
        <div className="bg-surface-container-low rounded-2xl p-10 text-center">
          <p className="text-on-surface-variant mb-3">{labels.empty}</p>
          <Link href="/channels" className="text-primary font-semibold hover:underline">
            {labels.addChannels}
          </Link>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-surface-container-low rounded-2xl p-10 text-center">
          <p className="text-on-surface-variant">{labels.noVideosForFilters}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <TrackerCard
              key={item.video.id}
              item={item}
              locale={locale}
              labels={labels}
              onStatusChange={(nextStatus) => updateVideoStatus(item.video.id, nextStatus)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterPill({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onToggle}
      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.04em] transition-colors ${
        checked
          ? 'bg-primary-fixed text-on-primary-fixed'
          : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
      }`}
    >
      {label}
    </button>
  )
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'primary' | 'neutral' | 'danger'
}) {
  const toneClasses = {
    primary: 'bg-primary-fixed text-on-primary-fixed',
    neutral: 'bg-surface-container-lowest text-on-surface',
    danger: 'bg-error text-white',
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
  locale,
  labels,
  onStatusChange,
}: {
  item: VideoWithContext
  locale: string
  labels: TrackerClientProps['labels']
  onStatusChange: (nextStatus: 'seen' | 'unseen' | 'hidden') => void
}) {
  const isSeen = item.userState.seenStatus === 'seen'
  const isHidden = item.userState.seenStatus === 'hidden'
  const publishedLabel = formatPublishedDate(item.video.published_at, locale)
  const durationLabel = formatDuration(item.video.duration_seconds)
  const hasCompletedAnalysis = item.analysis?.analysis_status === 'completed'

  return (
    <article className={`group flex flex-col md:flex-row gap-5 p-5 rounded-[1.75rem] transition-all ${
      isHidden
        ? 'bg-surface-container-high/70 opacity-85'
        : isSeen
          ? 'bg-surface-container-low/70'
          : 'bg-surface-container-lowest'
    }`}>
      <Link
        href={`/video/${item.video.id}`}
        className={`relative w-full md:w-72 lg:w-80 aspect-video rounded-2xl overflow-hidden shrink-0 ${
          isSeen || isHidden ? 'grayscale-[0.4]' : ''
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
            <SeenStatusButton
              videoId={item.video.id}
              initialStatus={item.userState.seenStatus}
              variant="badge"
              onStatusChange={onStatusChange}
              labels={{
                seen: labels.badges.seen,
                unseen: labels.badges.unseen,
                hidden: labels.badges.hidden,
                markSeen: labels.actions.markSeen,
                markUnseen: labels.actions.markUnseen,
                hide: labels.actions.hide,
                unhide: labels.actions.unhide,
                error: labels.error,
              }}
            />
            {item.userState.isInWatchlist ? (
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-tertiary-fixed text-on-tertiary-fixed">
                {labels.badges.watchlist}
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
