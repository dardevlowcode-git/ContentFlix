/* Commento didattico:
 * Scopo del file: incapsula la logica di accesso ai dati e le operazioni di dominio, separandole dalla UI.
 * Moduli richiamati: `@/lib/supabase/server`, `@/lib/supabase/admin`, `@/lib/utils/errors`, `@/lib/utils/youtube-url`, `@/lib/types/database`
 * Flusso: Le funzioni del servizio vengono chiamate da API route o pagine server: qui avviene l'orchestrazione delle query e delle trasformazioni dati.
 */

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AppError } from '@/lib/utils/errors'
import { normalizeChannelUrl, parseYouTubeChannelUrl } from '@/lib/utils/youtube-url'
import type { Database } from '@/lib/types/database'

type UserChannelRow = Database['public']['Tables']['user_channels']['Row']
type ChannelRow = Database['public']['Tables']['channels']['Row']
type UserChannelPreferenceRow = Database['public']['Tables']['user_channel_preferences']['Row']
type CanonicalSyncStateRow = Database['public']['Tables']['canonical_sync_state']['Row']

export interface UserChannelListItem {
  userChannel: UserChannelRow
  channel: ChannelRow
  preferences: UserChannelPreferenceRow | null
  syncState: CanonicalSyncStateRow | null
}

function firstOrNull<T>(value: T | T[] | null | undefined): T | null {
  // Uniforma il formato Supabase: alcune relazioni possono arrivare come array o singolo oggetto.
  if (!value) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

function buildFallbackChannel(parsedType: 'handle' | 'channel_id', parsedValue: string) {
  if (parsedType === 'channel_id') {
    return {
      youtubeChannelId: parsedValue,
      handle: null as string | null,
      title: `Canale ${parsedValue.slice(0, 8)}...`,
      customUrl: `https://www.youtube.com/channel/${parsedValue}`,
    }
  }

  const normalizedHandle = parsedValue.toLowerCase().trim()
  return {
    // Fallback temporaneo V1:
    // quando arriva solo `@handle`, salviamo un id tecnico locale (`handle:*`).
    // Sara convertito in vero `UC...` quando sara disponibile la risoluzione via API YouTube.
    youtubeChannelId: `handle:${normalizedHandle}`,
    handle: normalizedHandle,
    title: `@${normalizedHandle}`,
    customUrl: `https://www.youtube.com/@${normalizedHandle}`,
  }
}

export async function getChannelsForUser(userId: string): Promise<UserChannelListItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_channels')
    .select(`
      *,
      channels(
        *,
        canonical_sync_state(*)
      ),
      user_channel_preferences(*)
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('added_at', { ascending: false })

  if (error) {
    throw new AppError('Impossibile caricare i canali utente', 'unknown', 500, { cause: error.message })
  }

  return (data ?? [])
    .map((row) => {
      // Compone un DTO unico per UI privata aggregando:
      // - relazione utente-canale,
      // - metadati canale,
      // - preferenze utente,
      // - stato sync canonico.
      const channel = firstOrNull((row as { channels?: ChannelRow | ChannelRow[] | null }).channels)
      if (!channel) return null

      const preferences = firstOrNull((row as { user_channel_preferences?: UserChannelPreferenceRow | UserChannelPreferenceRow[] | null }).user_channel_preferences)

      const rawSyncState = (channel as ChannelRow & {
        canonical_sync_state?: CanonicalSyncStateRow | CanonicalSyncStateRow[] | null
      }).canonical_sync_state
      const syncState = firstOrNull(rawSyncState)

      return {
        userChannel: {
          id: row.id,
          user_id: row.user_id,
          channel_id: row.channel_id,
          is_active: row.is_active,
          added_at: row.added_at,
          removed_at: row.removed_at,
        },
        channel,
        preferences,
        syncState,
      }
    })
    .filter((item): item is UserChannelListItem => item !== null)
}

export async function addChannelForUser(params: { userId: string; channelUrl: string }) {
  const parsed = parseYouTubeChannelUrl(params.channelUrl)

  if (parsed.type === 'invalid') {
    throw new AppError(
      'URL canale non valido. Usa youtube.com/@handle oppure youtube.com/channel/UC... ',
      'validation',
      400
    )
  }

  const supabase = createAdminClient()
  const fallback = buildFallbackChannel(parsed.type, parsed.value)

  // Upsert canale globale: evita duplicati se utenti diversi seguono lo stesso canale.
  const { data: channel, error: channelError } = await supabase
    .from('channels')
    .upsert(
      {
        youtube_channel_id: fallback.youtubeChannelId,
        handle: fallback.handle,
        title: fallback.title,
        custom_url: fallback.customUrl,
        status: 'active',
      },
      { onConflict: 'youtube_channel_id' }
    )
    .select('*')
    .single()

  if (channelError || !channel) {
    throw new AppError('Impossibile creare/aggiornare il canale', 'unknown', 500, {
      cause: channelError?.message,
    })
  }

  // Upsert associazione utente<->canale: riattiva una riga esistente se era stata rimossa.
  const { data: userChannel, error: userChannelError } = await supabase
    .from('user_channels')
    .upsert(
      {
        user_id: params.userId,
        channel_id: channel.id,
        is_active: true,
        removed_at: null,
      },
      { onConflict: 'user_id,channel_id' }
    )
    .select('*')
    .single()

  if (userChannelError || !userChannel) {
    throw new AppError("Impossibile associare il canale all'utente", 'unknown', 500, {
      cause: userChannelError?.message,
    })
  }

  // Inizializza preferenze minime per permettere sync periodica.
  const { error: preferenceError } = await supabase
    .from('user_channel_preferences')
    .upsert(
      {
        user_channel_id: userChannel.id,
        sync_frequency_hours: 24,
        is_paused: false,
      },
      { onConflict: 'user_channel_id' }
    )

  if (preferenceError) {
    throw new AppError('Canale aggiunto ma preferenze non inizializzate', 'unknown', 500, {
      cause: preferenceError.message,
    })
  }

  // Garantisce presenza dello stato sync canonico (una riga per canale globale).
  await supabase
    .from('canonical_sync_state')
    .upsert(
      {
        channel_id: channel.id,
      },
      { onConflict: 'channel_id' }
    )

  const normalized = normalizeChannelUrl(parsed)
  const deduplicationKey = `sync:channel:${channel.id}`

  // Coda job asincrono:
  // il worker leggera `jobs` e avviera la sync reale senza bloccare la risposta API.
  // La deduplicazione evita di accodare piu job identici in rapida sequenza.
  await supabase
    .from('jobs')
    .upsert(
      {
        job_type: 'sync_channel_delta',
        status: 'pending',
        priority: 4,
        payload: {
          channelId: channel.id,
          userId: params.userId,
          source: 'add_channel',
          normalizedChannelUrl: normalized,
        },
        deduplication_key: deduplicationKey,
        created_by_user_id: params.userId,
      },
      { onConflict: 'deduplication_key' }
    )

  return {
    channelId: channel.id,
    normalizedChannelUrl: normalized,
  }
}

export async function removeChannelForUser(params: { userId: string; channelId: string }) {
  const supabase = await createClient()

  const { data: userChannel, error: lookupError } = await supabase
    .from('user_channels')
    .select('id, is_active')
    .eq('user_id', params.userId)
    .eq('channel_id', params.channelId)
    .single()

  if (lookupError || !userChannel) {
    throw new AppError('Canale non trovato per questo utente', 'not_found', 404, {
      cause: lookupError?.message,
    })
  }

  if (!userChannel.is_active) {
    return { alreadyRemoved: true }
  }

  const { error: removeError } = await supabase
    .from('user_channels')
    .update({
      is_active: false,
      removed_at: new Date().toISOString(),
    })
    .eq('id', userChannel.id)

  if (removeError) {
    throw new AppError('Impossibile rimuovere il canale', 'unknown', 500, {
      cause: removeError.message,
    })
  }

  return { alreadyRemoved: false }
}

export async function requestScanNowForUser(params: { userId: string; channelId: string }) {
  const supabase = await createClient()

  const { data: userChannel, error: userChannelError } = await supabase
    .from('user_channels')
    .select('id')
    .eq('user_id', params.userId)
    .eq('channel_id', params.channelId)
    .eq('is_active', true)
    .single()

  if (userChannelError || !userChannel) {
    throw new AppError('Canale non disponibile per la scansione', 'forbidden', 403, {
      cause: userChannelError?.message,
    })
  }

  const admin = createAdminClient()
  const windowKey = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')

  // Chiave dedup con finestra temporale: permette scansioni ripetute,
  // ma evita spam di job multipli nello stesso minuto.
  const { error: jobError } = await admin.from('jobs').insert({
    job_type: 'sync_channel_delta',
    status: 'pending',
    priority: 3,
    payload: {
      channelId: params.channelId,
      userId: params.userId,
      source: 'manual_scan',
    },
    deduplication_key: `manual_scan:${params.userId}:${params.channelId}:${windowKey}`,
    created_by_user_id: params.userId,
  })

  if (jobError) {
    throw new AppError('Impossibile schedulare la scansione', 'unknown', 500, {
      cause: jobError.message,
    })
  }

  return { queued: true }
}
