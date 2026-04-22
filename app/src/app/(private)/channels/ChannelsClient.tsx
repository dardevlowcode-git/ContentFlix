'use client'

import { useMemo, useState, type FormEvent } from 'react'
import type { UserChannelListItem } from '@/lib/services/channels'

interface ChannelsClientProps {
  initialChannels: UserChannelListItem[]
}

type BusyAction = {
  type: 'add' | 'remove' | 'scan' | 'refresh'
  channelId?: string
} | null

export default function ChannelsClient({ initialChannels }: ChannelsClientProps) {
  const [channelUrl, setChannelUrl] = useState('')
  const [channels, setChannels] = useState<UserChannelListItem[]>(initialChannels)
  const [busy, setBusy] = useState<BusyAction>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const channelsCountLabel = useMemo(() => `${channels.length} canali`, [channels.length])

  const clearFeedback = () => {
    setMessage(null)
    setError(null)
  }

  async function refreshChannels() {
    setBusy({ type: 'refresh' })

    const response = await fetch('/api/channels', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })

    const payload = (await response.json().catch(() => null)) as
      | { data: UserChannelListItem[] | null; error: string | null }
      | null

    if (!response.ok || !payload?.data) {
      throw new Error(payload?.error ?? 'Impossibile aggiornare la lista canali')
    }

    setChannels(payload.data)
  }

  async function handleAddChannel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearFeedback()

    const value = channelUrl.trim()
    if (!value) {
      setError('Inserisci un URL canale YouTube valido')
      return
    }

    setBusy({ type: 'add' })

    try {
      const response = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelUrl: value }),
      })

      const payload = (await response.json().catch(() => null)) as
        | { data: { message?: string } | null; error: string | null }
        | null

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Errore in aggiunta canale')
      }

      setChannelUrl('')
      setMessage(payload?.data?.message ?? 'Canale aggiunto')
      await refreshChannels()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore inatteso'
      setError(message)
    } finally {
      setBusy(null)
    }
  }

  async function handleRemoveChannel(channelId: string) {
    clearFeedback()

    const confirmed = window.confirm('Rimuovere questo canale dai seguiti?')
    if (!confirmed) return

    setBusy({ type: 'remove', channelId })

    try {
      const response = await fetch('/api/channels', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId }),
      })

      const payload = (await response.json().catch(() => null)) as
        | { data: { message?: string } | null; error: string | null }
        | null

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Errore in rimozione canale')
      }

      setMessage(payload?.data?.message ?? 'Canale rimosso')
      await refreshChannels()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore inatteso'
      setError(message)
    } finally {
      setBusy(null)
    }
  }

  async function handleScanNow(channelId: string) {
    clearFeedback()
    setBusy({ type: 'scan', channelId })

    try {
      const response = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scan_now', channelId }),
      })

      const payload = (await response.json().catch(() => null)) as
        | { data: { message?: string } | null; error: string | null }
        | null

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Errore durante la scansione')
      }

      setMessage(payload?.data?.message ?? 'Scansione accodata')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore inatteso'
      setError(message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="p-8 max-w-5xl">
      <header className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2">
            Canali
          </h1>
          <p className="text-on-surface-variant">
            Segui nuovi canali YouTube e gestisci le tue preferenze di sincronizzazione.
          </p>
        </div>
      </header>

      <div className="bg-surface-container-lowest rounded-2xl p-6 mb-8 shadow-ambient">
        <h2 className="font-headline text-lg font-bold text-primary mb-1">Segui un nuovo canale</h2>
        <p className="text-sm text-on-surface-variant mb-4">
          Sincronizza qualsiasi canale YouTube tramite handle pubblico o URL.
        </p>

        <form className="flex flex-col gap-3" onSubmit={handleAddChannel}>
          <div className="flex gap-3">
            <label className="flex-1 flex items-center gap-3 bg-surface-container-low rounded-xl px-4 py-3">
              <svg className="w-5 h-5 text-on-surface-variant shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                />
              </svg>
              <input
                type="text"
                value={channelUrl}
                onChange={(event) => setChannelUrl(event.target.value)}
                placeholder="youtube.com/@handle o youtube.com/channel/UC..."
                className="w-full bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant outline-none"
                aria-label="URL canale YouTube"
                disabled={busy?.type === 'add'}
              />
            </label>

            <button
              type="submit"
              disabled={busy?.type === 'add'}
              className="gradient-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm
                         hover:shadow-primary-glow transition-all active:scale-95 flex items-center gap-2
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {busy?.type === 'add' ? 'Aggiunta...' : 'Aggiungi canale'}
            </button>
          </div>
        </form>

        <p className="text-xs text-on-surface-variant mt-3">
          Formati supportati:{' '}
          <code className="bg-surface-container px-1.5 py-0.5 rounded text-xs">youtube.com/@handle</code>
          {' '}e{' '}
          <code className="bg-surface-container px-1.5 py-0.5 rounded text-xs">youtube.com/channel/UC...</code>
        </p>

        {message && <p className="mt-3 text-sm text-green-700">{message}</p>}
        {error && <p className="mt-3 text-sm text-error">{error}</p>}
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline text-xl font-bold text-on-surface">Canali seguiti</h2>
          <span className="text-sm text-on-surface-variant">{channelsCountLabel}</span>
        </div>

        {channels.length === 0 ? (
          <div className="bg-surface-container-low rounded-2xl p-12 text-center">
            <p className="text-on-surface-variant">Non stai ancora seguendo nessun canale.</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-ambient">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-container-low">
              <div className="col-span-5 text-label-caps text-on-surface-variant">Canale</div>
              <div className="col-span-2 text-label-caps text-on-surface-variant">Ultima scansione</div>
              <div className="col-span-2 text-label-caps text-on-surface-variant">Frequenza</div>
              <div className="col-span-2 text-label-caps text-on-surface-variant">Stato</div>
              <div className="col-span-1 text-label-caps text-on-surface-variant">Azioni</div>
            </div>

            {channels.map((item, index) => {
              const channel = item.channel
              const preferences = item.preferences
              const syncState = item.syncState

              const scanBusy = busy?.type === 'scan' && busy.channelId === channel.id
              const removeBusy = busy?.type === 'remove' && busy.channelId === channel.id

              return (
                <div
                  key={item.userChannel.id}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 items-center
                             ${index % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low'}
                             hover:bg-surface-container transition-colors`}
                >
                  <div className="col-span-5 flex items-center gap-3">
                    {channel.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={channel.thumbnail_url}
                        alt={channel.title}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                        {channel.title?.[0] ?? '?'}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-on-surface text-sm">{channel.title}</p>
                      <p className="text-xs text-on-surface-variant">
                        {channel.handle ? `@${channel.handle}` : channel.youtube_channel_id}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-2 text-sm text-on-surface-variant">
                    {syncState?.last_sync_at
                      ? new Date(syncState.last_sync_at).toLocaleDateString('it-IT')
                      : 'Mai'}
                  </div>

                  <div className="col-span-2 text-sm text-on-surface-variant">
                    {preferences?.sync_frequency_hours === 24
                      ? 'Ogni giorno'
                      : preferences?.sync_frequency_hours === 168
                        ? 'Ogni settimana'
                        : `Ogni ${preferences?.sync_frequency_hours ?? 24}h`}
                  </div>

                  <div className="col-span-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full
                                ${channel.status === 'active'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-error-container text-error'}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full
                                  ${channel.status === 'active' ? 'status-active' : 'status-error'}`}
                      />
                      {channel.status === 'active' ? 'Attivo' : 'Errore'}
                    </span>
                  </div>

                  <div className="col-span-1 flex items-center gap-2">
                    <button
                      title="Scansiona ora"
                      disabled={scanBusy}
                      onClick={() => handleScanNow(channel.id)}
                      className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-all disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                        />
                      </svg>
                    </button>

                    <button
                      title="Rimuovi canale"
                      disabled={removeBusy}
                      onClick={() => handleRemoveChannel(channel.id)}
                      className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-all disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
