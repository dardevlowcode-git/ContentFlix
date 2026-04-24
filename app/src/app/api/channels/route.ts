/* Commento didattico:
 * Scopo del file: gestisce una API route: riceve richieste HTTP, valida i dati e restituisce una risposta al frontend.
 * Moduli richiamati: `@/lib/auth/provider`, `@/lib/utils/errors`
 * Flusso: La route viene richiamata dal client (o da altre parti server), usa servizi/utilita` in `src/lib` e poi ritorna JSON/HTTP status.
 */

import { getCurrentSession } from '@/lib/auth/provider'
import {
  addChannelForUser,
  getChannelsForUser,
  removeChannelForUser,
  requestScanNowForUser,
} from '@/lib/services/channels'
import { AppError, errorResponse } from '@/lib/utils/errors'

interface ChannelPostBody {
  action?: 'add' | 'scan_now'
  channelUrl?: string
  channelId?: string
}

interface ChannelDeleteBody {
  channelId?: string
}

function requireSessionUserId(userId: string | null | undefined): string {
  // Helper condiviso: centralizza l'errore 401 per tutte le azioni del file.
  if (!userId) {
    throw new AppError('Sessione non valida', 'unauthorized', 401)
  }
  return userId
}

export async function GET() {
  try {
    const session = await getCurrentSession()
    const userId = requireSessionUserId(session?.userId)

    // Delega la logica dati al service (`lib/services/channels.ts`).
    const channels = await getChannelsForUser(userId)
    return Response.json({ data: channels, error: null, errorType: null })
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.type, error.statusCode ?? 500)
    }
    return errorResponse('Errore interno', 'unknown', 500)
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession()
    const userId = requireSessionUserId(session?.userId)

    const body = (await request.json().catch(() => null)) as ChannelPostBody | null
    const action = body?.action ?? 'add'

    if (action === 'scan_now') {
      if (!body?.channelId) {
        return errorResponse('channelId mancante', 'validation', 400)
      }

      // Scansione manuale: crea un job asincrono senza bloccare la richiesta HTTP.
      await requestScanNowForUser({ userId, channelId: body.channelId })
      return Response.json({
        data: { message: 'Scansione accodata' },
        error: null,
        errorType: null,
      })
    }

    const channelUrl = body?.channelUrl?.trim()
    if (!channelUrl) {
      return errorResponse('channelUrl mancante', 'validation', 400)
    }

    // Aggiunta canale: parsing URL + upsert + enqueue sync iniziale.
    const result = await addChannelForUser({ userId, channelUrl })

    return Response.json({
      data: {
        message: 'Canale aggiunto correttamente',
        ...result,
      },
      error: null,
      errorType: null,
    })
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.type, error.statusCode ?? 500)
    }
    return errorResponse('Errore interno', 'unknown', 500)
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getCurrentSession()
    const userId = requireSessionUserId(session?.userId)

    const body = (await request.json().catch(() => null)) as ChannelDeleteBody | null
    const channelId = body?.channelId?.trim()

    if (!channelId) {
      return errorResponse('channelId mancante', 'validation', 400)
    }

    const result = await removeChannelForUser({ userId, channelId })

    return Response.json({
      data: {
        message: result.alreadyRemoved ? 'Canale già rimosso' : 'Canale rimosso',
      },
      error: null,
      errorType: null,
    })
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.type, error.statusCode ?? 500)
    }
    return errorResponse('Errore interno', 'unknown', 500)
  }
}
