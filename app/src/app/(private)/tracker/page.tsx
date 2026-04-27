/* Commento didattico:
 * Scopo del file: carica dati tracker lato server e delega rendering interattivo al client.
 * Moduli richiamati: `next`, `next-intl/server`, `next/navigation`, `@/lib/auth/provider`, `@/lib/services/videos`
 * Flusso: verifica sessione, legge i video dell'utente e passa tutto a `TrackerClient`.
 */

import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import TrackerClient from './TrackerClient'
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

  return (
    <TrackerClient
      items={items}
      locale={locale}
      labels={{
        title: t('tracker.title'),
        subtitle: t('tracker.subtitle'),
        empty: t('tracker.empty'),
        addChannels: t('tracker.addChannels'),
        allCaughtUp: t('tracker.allCaughtUp'),
        noneWatchedYet: t('tracker.noneWatchedYet'),
        noVideosForFilters: t('tracker.noVideosForFilters'),
        viewSummary: t('tracker.viewSummary'),
        badges: {
          unseen: t('tracker.badges.unseen'),
          seen: t('tracker.badges.seen'),
          hidden: t('tracker.badges.hidden'),
          watchlist: t('tracker.badges.watchlist'),
        },
        filters: {
          seen: t('tracker.filters.seen'),
          unseen: t('tracker.filters.unseen'),
          hidden: t('tracker.filters.hidden'),
        },
        metrics: {
          toWatch: t('tracker.metrics.toWatch'),
          watched: t('tracker.metrics.watched'),
          hidden: t('tracker.metrics.hidden'),
        },
        actions: {
          markSeen: t('dashboard.markSeen'),
          markUnseen: t('dashboard.markUnseen'),
          hide: t('tracker.actions.hide'),
          unhide: t('tracker.actions.unhide'),
        },
        error: t('common.error'),
      }}
    />
  )
}
