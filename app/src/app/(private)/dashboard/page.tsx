import type { Metadata } from 'next'
import { getCurrentSession } from '@/lib/auth/provider'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'I tuoi contenuti YouTube curati dall\'AI.',
}

export default async function DashboardPage() {
  const session = await getCurrentSession()
  const supabase = await createClient()

  // Fetch user's followed channels
  const { data: userChannels } = await supabase
    .from('user_channels')
    .select('*, channels(*)')
    .eq('user_id', session!.userId)
    .eq('is_active', true)
    .order('added_at', { ascending: false })
    .limit(10)

  // Fetch recent unanalyzed + analyzed videos from user's channels
  const channelIds = userChannels?.map((uc) => uc.channel_id) ?? []

  const { data: recentVideos } = channelIds.length > 0
    ? await supabase
        .from('videos')
        .select(`
          *,
          channels(id, title, handle, thumbnail_url),
          video_analysis(id, analysis_status),
          video_localized_content!left(id, short_summary, language_code)
        `)
        .in('channel_id', channelIds)
        .eq('availability_status', 'available')
        .eq('video_type', 'standard')
        .order('published_at', { ascending: false })
        .limit(12)
    : { data: [] }

  const hasChannels = (userChannels?.length ?? 0) > 0
  const newAnalysesCount = recentVideos?.filter(
    (v) => v.video_analysis?.[0]?.analysis_status === 'completed'
  ).length ?? 0

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <header className="mb-12">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2">
          Intelligenza curata
        </h1>
        <p className="text-on-surface-variant text-lg">
          {newAnalysesCount > 0
            ? `Bentornato. ${newAnalysesCount} nuove analisi sono pronte per la tua revisione.`
            : hasChannels
              ? 'Nessuna nuova analisi. Controlla di nuovo più tardi.'
              : 'Aggiungi il tuo primo canale per iniziare.'}
        </p>
      </header>

      {!hasChannels ? (
        /* Empty state */
        <EmptyState />
      ) : (
        /* Video feed — bento grid */
        <VideoBentoGrid videos={recentVideos ?? []} />
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 gradient-ai rounded-3xl flex items-center justify-center mb-6 shadow-tertiary-glow">
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
        </svg>
      </div>
      <h2 className="font-headline text-2xl font-bold text-on-surface mb-3">
        Non stai ancora seguendo nessun canale
      </h2>
      <p className="text-on-surface-variant max-w-sm mb-8 leading-relaxed">
        Aggiungi canali YouTube tramite URL e ContentFlix analizzerà automaticamente i nuovi video.
      </p>
      <a
        href="/channels"
        className="inline-flex items-center gap-2 gradient-primary text-on-primary px-6 py-3
                   rounded-full font-bold hover:shadow-primary-glow transition-all active:scale-95"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Aggiungi il tuo primo canale
      </a>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function VideoBentoGrid({ videos }: { videos: any[] }) {
  if (videos.length === 0) {
    return (
      <div className="bg-surface-container-low rounded-2xl p-12 text-center">
        <p className="text-on-surface-variant">
          I video dei tuoi canali appariranno qui non appena saranno importati.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {videos.slice(0, 6).map((video, index) => {
        const isLarge = index === 0
        const analysis = video.video_analysis?.[0]
        const content = video.video_localized_content?.[0]
        const channel = video.channels

        return (
          <article
            key={video.id}
            className={`bg-surface-container-lowest rounded-2xl p-5 group cursor-pointer
                        hover:bg-surface-container transition-all duration-300 shadow-ambient
                        ${isLarge ? 'lg:col-span-2' : ''}`}
          >
            <a href={`/video/${video.id}`} className="block">
              {/* Thumbnail */}
              <div className={`relative mb-5 rounded-xl overflow-hidden bg-surface-container
                               ${isLarge ? 'aspect-video' : 'aspect-video'}`}>
                {video.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-on-surface-variant opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                    </svg>
                  </div>
                )}

                {/* Status badge */}
                <div className="absolute top-3 left-3">
                  {!analysis || analysis.analysis_status === 'pending' ? (
                    <span className="badge-unseen">NON VISTO</span>
                  ) : analysis.analysis_status === 'completed' ? (
                    <span className="badge-ai">ANALISI COMPLETATA</span>
                  ) : analysis.analysis_status === 'processing' ? (
                    <span className="px-3 py-1 bg-amber-400 text-white text-xs font-bold rounded-full">
                      IN ANALISI...
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Info */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className={`font-headline font-bold text-on-surface leading-tight mb-1 line-clamp-2
                                  ${isLarge ? 'text-xl' : 'text-base'}`}>
                    {video.title}
                  </h3>
                  <p className="text-sm text-secondary font-medium">
                    {channel?.title ?? 'Canale sconosciuto'}
                    {video.published_at && (
                      <> · <RelativeTime date={video.published_at} /></>
                    )}
                  </p>
                  {content?.short_summary && (
                    <p className="mt-2 text-sm text-on-surface-variant line-clamp-2 ai-content">
                      {content.short_summary}
                    </p>
                  )}
                </div>

                {analysis?.analysis_status === 'completed' && (
                  <button
                    className="shrink-0 gradient-ai text-white px-4 py-2 rounded-full text-sm
                               font-semibold hover:shadow-tertiary-glow transition-all active:scale-95"
                  >
                    Vedi riepilogo
                  </button>
                )}
              </div>
            </a>
          </article>
        )
      })}
    </div>
  )
}

function RelativeTime({ date }: { date: string }) {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffH = Math.floor(diffMs / (1000 * 60 * 60))
  const diffD = Math.floor(diffH / 24)

  if (diffH < 1) return <span>ora</span>
  if (diffH < 24) return <span>{diffH} ore fa</span>
  if (diffD === 1) return <span>ieri</span>
  if (diffD < 7) return <span>{diffD} giorni fa</span>
  return <span>{then.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}</span>
}
