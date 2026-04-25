/* Commento didattico:
 * Scopo del file: incapsula la logica di accesso ai dati e le operazioni di dominio, separandole dalla UI.
 * Moduli richiamati: `@/lib/supabase/server`, `@/lib/utils/errors`, `@/lib/types/domain`, `@/lib/types/database`, `@/lib/services/integrations`
 * Flusso: Le funzioni del servizio vengono chiamate da API route o pagine server: qui avviene l'orchestrazione delle query e delle trasformazioni dati.
 */

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AppError } from '@/lib/utils/errors'
import type { VideoWithContext } from '@/lib/types/domain'
import type { Database, Json } from '@/lib/types/database'
import { getProviderApiKeyForUser, getProviderApiKeyForUserAsAdmin } from '@/lib/services/integrations'

type AnalysisStatus = Database['public']['Tables']['video_analysis']['Row']['analysis_status']

export interface GetVideosForUserParams {
  userId: string
  channelId?: string
  analysisStatus?: AnalysisStatus
  seenStatus?: 'seen' | 'unseen'
  onlyWatchlist?: boolean
  search?: string
  languageCode?: string
  limit?: number
  page?: number
}

export interface VideoListResponse {
  items: VideoWithContext[]
  page: number
  limit: number
  total: number
}

/**
 * Applica limiti di sicurezza per paginazione (anti valori eccessivi o negativi).
 */
function normalizePagination(limit?: number, page?: number) {
  const safeLimit = Math.min(Math.max(limit ?? 20, 1), 50)
  const safePage = Math.max(page ?? 1, 1)
  return { safeLimit, safePage }
}

/**
 * Mappa una riga query `videos + join` in `VideoWithContext` usato dalla UI.
 */
function mapVideoWithContext(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  row: any,
  preferredLanguage: string,
  userSeenMap: Map<string, 'seen' | 'unseen'>,
  watchlistVideoIds: Set<string>
): VideoWithContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const analysis = row.video_analysis?.[0] ?? null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const localized = row.video_localized_content?.find((item: any) => item.language_code === preferredLanguage)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ?? row.video_localized_content?.[0]
    ?? null

  const seenStatus = userSeenMap.get(row.id) ?? 'unseen'

  return {
    video: {
      id: row.id,
      channel_id: row.channel_id,
      youtube_video_id: row.youtube_video_id,
      title: row.title,
      description: row.description,
      thumbnail_url: row.thumbnail_url,
      published_at: row.published_at,
      duration_seconds: row.duration_seconds,
      video_url: row.video_url,
      video_type: row.video_type,
      availability_status: row.availability_status,
      youtube_metadata: row.youtube_metadata,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
    channel: {
      id: row.channels.id,
      youtube_channel_id: row.channels.youtube_channel_id,
      handle: row.channels.handle,
      title: row.channels.title,
      description: row.channels.description,
      thumbnail_url: row.channels.thumbnail_url,
      subscriber_count: row.channels.subscriber_count,
      video_count: row.channels.video_count,
      custom_url: row.channels.custom_url,
      youtube_metadata: row.channels.youtube_metadata,
      status: row.channels.status,
      created_at: row.channels.created_at,
      updated_at: row.channels.updated_at,
    },
    analysis,
    localizedContent: localized,
    userState: {
      seenStatus,
      isInWatchlist: watchlistVideoIds.has(row.id),
    },
  }
}

/**
 * Restituisce i video visibili all'utente con filtri, paginazione e stato utente.
 * La funzione applica il perimetro canali seguito dall'utente prima di ogni query.
 */
export async function getVideosForUser(params: GetVideosForUserParams): Promise<VideoListResponse> {
  const supabase = await createClient()

  const { data: followedChannels, error: channelsError } = await supabase
    .from('user_channels')
    .select('channel_id')
    .eq('user_id', params.userId)
    .eq('is_active', true)

  if (channelsError) {
    throw new AppError('Impossibile caricare i canali utente', 'unknown', 500, { cause: channelsError.message })
  }

  const allowedChannelIds = new Set((followedChannels ?? []).map((row) => row.channel_id))
  if (allowedChannelIds.size === 0) {
    const { safeLimit, safePage } = normalizePagination(params.limit, params.page)
    return { items: [], total: 0, page: safePage, limit: safeLimit }
  }

  if (params.channelId && !allowedChannelIds.has(params.channelId)) {
    throw new AppError('Canale non disponibile per questo utente', 'forbidden', 403)
  }

  const targetChannelIds = params.channelId ? [params.channelId] : Array.from(allowedChannelIds)
  const { safeLimit, safePage } = normalizePagination(params.limit, params.page)

  let query = supabase
    .from('videos')
    .select(`
      *,
      channels(*),
      video_analysis(id, analysis_status, model_used, analyzed_at, analyzed_by_user_id, error_message, created_at, prompt_profile_id, video_id),
      video_localized_content(*)
    `, { count: 'exact' })
    .in('channel_id', targetChannelIds)
    .eq('availability_status', 'available')
    .eq('video_type', 'standard')

  if (params.search?.trim()) {
    query = query.ilike('title', `%${params.search.trim()}%`)
  }

  const from = (safePage - 1) * safeLimit
  const to = from + safeLimit - 1

  const { data: rows, count, error: videosError } = await query
    .order('published_at', { ascending: false })
    .range(from, to)

  if (videosError) {
    throw new AppError('Impossibile caricare i video', 'unknown', 500, { cause: videosError.message })
  }

  const videoIds = (rows ?? []).map((row) => row.id)

  const { data: states } = videoIds.length
    ? await supabase
      .from('user_video_states')
      .select('video_id, seen_status')
      .eq('user_id', params.userId)
      .in('video_id', videoIds)
    : { data: [] as Array<{ video_id: string; seen_status: 'seen' | 'unseen' }> }

  const userSeenMap = new Map<string, 'seen' | 'unseen'>()
  for (const state of states ?? []) {
    userSeenMap.set(state.video_id, state.seen_status)
  }

  const { data: watchlistRows } = videoIds.length
    ? await supabase
      .from('watchlist_items')
      .select('video_id, watchlists!inner(user_id)')
      .in('video_id', videoIds)
      .eq('watchlists.user_id', params.userId)
    : { data: [] as Array<{ video_id: string }> }

  const watchlistVideoIds = new Set((watchlistRows ?? []).map((row) => row.video_id))

  const preferredLanguage = params.languageCode?.trim() || 'it'

  let items = (rows ?? []).map((row) => mapVideoWithContext(row, preferredLanguage, userSeenMap, watchlistVideoIds))

  if (params.analysisStatus) {
    items = items.filter((item) => item.analysis?.analysis_status === params.analysisStatus)
  }

  if (params.seenStatus) {
    items = items.filter((item) => item.userState.seenStatus === params.seenStatus)
  }

  if (params.onlyWatchlist) {
    items = items.filter((item) => item.userState.isInWatchlist)
  }

  return {
    items,
    total: count ?? items.length,
    page: safePage,
    limit: safeLimit,
  }
}

interface YouTubePlaylistItem {
  contentDetails?: {
    videoId?: string
    videoPublishedAt?: string
  }
  snippet?: {
    title?: string
    description?: string
    publishedAt?: string
    thumbnails?: {
      maxres?: { url?: string }
      high?: { url?: string }
      medium?: { url?: string }
      default?: { url?: string }
    }
  }
}

/**
 * Seleziona la thumbnail migliore disponibile seguendo priorita` decrescente.
 */
function getBestThumbnail(item: YouTubePlaylistItem): string | null {
  return item.snippet?.thumbnails?.maxres?.url
    ?? item.snippet?.thumbnails?.high?.url
    ?? item.snippet?.thumbnails?.medium?.url
    ?? item.snippet?.thumbnails?.default?.url
    ?? null
}

/**
 * Helper fetch JSON con errore strutturato per risposte non-2xx.
 */
async function fetchJson<T>(url: URL): Promise<T> {
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new AppError(`YouTube API error (${response.status}) ${text.slice(0, 180)}`, 'structural', 422)
  }

  return response.json() as Promise<T>
}

/**
 * Recupera l'uploads playlist di un canale YouTube.
 */
async function getUploadsPlaylistId(youtubeApiKey: string, youtubeChannelId: string): Promise<string> {
  const url = new URL('https://www.googleapis.com/youtube/v3/channels')
  url.searchParams.set('part', 'contentDetails')
  url.searchParams.set('id', youtubeChannelId)
  url.searchParams.set('key', youtubeApiKey)

  type ChannelsResponse = {
    items?: Array<{ contentDetails?: { relatedPlaylists?: { uploads?: string } } }>
  }

  const json = await fetchJson<ChannelsResponse>(url)
  const uploads = json.items?.[0]?.contentDetails?.relatedPlaylists?.uploads

  if (!uploads) {
    throw new AppError('Impossibile trovare playlist uploads del canale', 'not_found', 404)
  }

  return uploads
}

/**
 * Elenca gli ultimi elementi della playlist uploads del canale.
 */
async function listRecentPlaylistItems(youtubeApiKey: string, playlistId: string, maxResults: number): Promise<YouTubePlaylistItem[]> {
  const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems')
  url.searchParams.set('part', 'snippet,contentDetails')
  url.searchParams.set('playlistId', playlistId)
  url.searchParams.set('maxResults', String(Math.min(Math.max(maxResults, 1), 50)))
  url.searchParams.set('key', youtubeApiKey)

  type PlaylistItemsResponse = { items?: YouTubePlaylistItem[] }

  const json = await fetchJson<PlaylistItemsResponse>(url)
  return json.items ?? []
}

/**
 * Risolve un handle `@name` nel relativo channel ID canonico `UC...`.
 */
async function resolveChannelIdFromHandle(youtubeApiKey: string, handle: string): Promise<{ channelId: string; title: string | null }> {
  const normalizedHandle = handle.replace(/^@/, '').trim().toLowerCase()
  if (!normalizedHandle) {
    throw new AppError('Handle canale non valido', 'validation', 400)
  }

  const url = new URL('https://www.googleapis.com/youtube/v3/channels')
  url.searchParams.set('part', 'id,snippet')
  url.searchParams.set('forHandle', normalizedHandle)
  url.searchParams.set('key', youtubeApiKey)

  type HandleResolveResponse = {
    items?: Array<{
      id?: string
      snippet?: { title?: string }
    }>
  }

  const json = await fetchJson<HandleResolveResponse>(url)
  const item = json.items?.[0]
  const resolvedId = item?.id

  if (!resolvedId) {
    throw new AppError(`Impossibile risolvere @${normalizedHandle} in channel ID`, 'not_found', 404)
  }

  return {
    channelId: resolvedId,
    title: item?.snippet?.title?.trim() ?? null,
  }
}

/**
 * Importa i video recenti del canale nell'archivio canonico.
 * Se il canale e` in forma `handle:*`, prova prima la risoluzione verso ID `UC...`.
 */
export async function importChannelVideos(params: {
  userId: string
  channelId: string
  maxResults?: number
  bypassUserChannelGuard?: boolean
}): Promise<{ channelId: string; importedCount: number; scannedCount: number }> {
  const supabase = await createClient()
  const admin = createAdminClient()

  const queryClient = params.bypassUserChannelGuard ? admin : supabase
  const { data: userChannel, error: ucError } = await queryClient
    .from('user_channels')
    .select('id')
    .eq('user_id', params.userId)
    .eq('channel_id', params.channelId)
    .eq('is_active', true)
    .maybeSingle()

  if (ucError || !userChannel) {
    throw new AppError('Canale non disponibile per questo utente', 'forbidden', 403, { cause: ucError?.message })
  }

  const { data: channel, error: channelError } = await queryClient
    .from('channels')
    .select('*')
    .eq('id', params.channelId)
    .single()

  if (channelError || !channel) {
    throw new AppError('Canale non trovato', 'not_found', 404, { cause: channelError?.message })
  }

  const youtubeApiKey = params.bypassUserChannelGuard
    ? await getProviderApiKeyForUserAsAdmin(params.userId, 'youtube')
    : await getProviderApiKeyForUser(params.userId, 'youtube')
  if (!youtubeApiKey) {
    throw new AppError('Configura prima la chiave YouTube API', 'validation', 400)
  }

  if (channel.youtube_channel_id.startsWith('handle:')) {
    const handle = channel.youtube_channel_id.slice('handle:'.length)
    const resolved = await resolveChannelIdFromHandle(youtubeApiKey, handle)

    // Aggiorna il canale globale alla forma canonica `UC...` appena disponibile.
    const { error: channelUpdateError } = await admin
      .from('channels')
      .update({
        youtube_channel_id: resolved.channelId,
        title: resolved.title ?? channel.title,
        handle: handle,
      })
      .eq('id', channel.id)

    if (channelUpdateError) {
      throw new AppError('Risoluzione handle completata ma update canale fallito', 'unknown', 500, {
        cause: channelUpdateError.message,
      })
    }

    channel.youtube_channel_id = resolved.channelId
  }

  const maxResults = params.maxResults ?? 20
  const uploadsPlaylistId = await getUploadsPlaylistId(youtubeApiKey, channel.youtube_channel_id)
  const items = await listRecentPlaylistItems(youtubeApiKey, uploadsPlaylistId, maxResults)

  const upsertRows = items
    .map((item) => {
      const videoId = item.contentDetails?.videoId
      if (!videoId) return null

      const publishedAt = item.contentDetails?.videoPublishedAt ?? item.snippet?.publishedAt
      if (!publishedAt) return null

      const title = item.snippet?.title?.trim() || `Video ${videoId}`
      const description = item.snippet?.description ?? null
      const thumbnail = getBestThumbnail(item)

      return {
        channel_id: params.channelId,
        youtube_video_id: videoId,
        title,
        description,
        thumbnail_url: thumbnail,
        published_at: publishedAt,
        duration_seconds: null,
        video_url: `https://www.youtube.com/watch?v=${videoId}`,
        video_type: 'standard' as const,
        availability_status: 'available' as const,
        youtube_metadata: item as unknown as Json,
      }
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)

  if (upsertRows.length === 0) {
    await queryClient
      .from('canonical_sync_state')
      .upsert({
        channel_id: params.channelId,
        last_sync_at: new Date().toISOString(),
        last_sync_status: 'partial',
        videos_found_count: 0,
      }, { onConflict: 'channel_id' })

    return {
      channelId: params.channelId,
      importedCount: 0,
      scannedCount: items.length,
    }
  }

  // Deduplica locale per evitare errore Postgres quando lo stesso youtube_video_id
  // compare piu volte nello stesso batch di upsert.
  const dedupedRows = Array.from(
    new Map(upsertRows.map((row) => [row.youtube_video_id, row])).values()
  )

  const { data: insertedRows, error: insertError } = await queryClient
    .from('videos')
    .upsert(dedupedRows, { onConflict: 'youtube_video_id' })
    .select('id')

  if (insertError) {
    throw new AppError('Import video fallito', 'unknown', 500, { cause: insertError.message })
  }

  await queryClient
    .from('canonical_sync_state')
    .upsert({
      channel_id: params.channelId,
      last_sync_at: new Date().toISOString(),
      last_sync_status: 'success',
      videos_found_count: dedupedRows.length,
    }, { onConflict: 'channel_id' })

  await queryClient
    .from('user_provider_credentials')
    .update({
      is_valid: true,
      last_used_at: new Date().toISOString(),
      last_error: null,
    })
    .eq('user_id', params.userId)
    .eq('provider', 'youtube')

    return {
      channelId: params.channelId,
      importedCount: insertedRows?.length ?? dedupedRows.length,
      scannedCount: items.length,
    }
}
