/* Commento didattico:
 * Scopo del file: gestisce l'azione rapida visto/non visto nella lista tracker.
 * Moduli richiamati: `next/navigation`, `react`
 * Flusso: al click invia una richiesta API per aggiornare lo stato e ricarica la pagina per riflettere i gruppi visti/non visti.
 */

'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface SeenStatusButtonProps {
  videoId: string
  initialSeen: boolean
  labels: {
    seen: string
    unseen: string
    markSeen: string
    markUnseen: string
    error: string
  }
  variant?: 'badge' | 'button'
}

export default function SeenStatusButton({
  videoId,
  initialSeen,
  labels,
  variant = 'button',
}: SeenStatusButtonProps) {
  const router = useRouter()
  const [isSeen, setIsSeen] = useState(initialSeen)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function toggleSeenStatus() {
    if (loading) return
    setLoading(true)
    setError(null)

    const nextSeen = !isSeen

    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_seen_status',
          videoId,
          seenStatus: nextSeen ? 'seen' : 'unseen',
        }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.error ?? labels.error)
      }

      setIsSeen(nextSeen)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : labels.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={toggleSeenStatus}
        disabled={loading}
        aria-label={isSeen ? labels.markUnseen : labels.markSeen}
        title={isSeen ? labels.markUnseen : labels.markSeen}
        className={
          variant === 'badge'
            ? `px-2.5 py-1 text-[10px] font-bold uppercase rounded-full transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
              isSeen
                ? 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                : 'bg-primary-fixed text-on-primary-fixed hover:brightness-95'
            }`
            : `px-4 py-2 rounded-full text-xs font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
              isSeen
                ? 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                : 'bg-primary text-on-primary hover:bg-primary-container'
            }`
        }
      >
        {isSeen ? labels.seen : labels.unseen}
      </button>
      {error ? <p className="text-[11px] text-error">{error}</p> : null}
    </div>
  )
}
