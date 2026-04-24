/* Commento didattico:
 * Scopo del file: gestisce una API route: riceve richieste HTTP, valida i dati e restituisce una risposta al frontend.
 * Moduli richiamati: `@/lib/auth/provider`, `@/lib/utils/errors`
 * Flusso: La route viene richiamata dal client (o da altre parti server), usa servizi/utilita` in `src/lib` e poi ritorna JSON/HTTP status.
 */

import { getCurrentSession } from '@/lib/auth/provider'
import {
  getCredentialStatusesForUser,
  removeApiKey,
  saveApiKey,
  validateApiKey,
} from '@/lib/services/integrations'
import { AppError, errorResponse } from '@/lib/utils/errors'

interface IntegrationPostBody {
  provider?: 'youtube' | 'gemini'
  apiKey?: string
  action?: 'save' | 'validate'
}

interface IntegrationDeleteBody {
  provider?: 'youtube' | 'gemini'
}

function requireUserId(userId: string | null | undefined): string {
  // Verifica minima richiesta da tutte le azioni integrazioni.
  if (!userId) {
    throw new AppError('Sessione non valida', 'unauthorized', 401)
  }
  return userId
}

export async function GET() {
  try {
    const session = await getCurrentSession()
    const userId = requireUserId(session?.userId)

    // Restituisce solo stato/masking chiavi: mai la chiave in chiaro.
    const statuses = await getCredentialStatusesForUser(userId)

    return Response.json({
      data: statuses,
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

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession()
    const userId = requireUserId(session?.userId)

    const body = (await request.json().catch(() => null)) as IntegrationPostBody | null
    const provider = body?.provider

    if (!provider) {
      return errorResponse('provider mancante', 'validation', 400)
    }

    if (body?.action === 'validate') {
      // Validazione esplicita: utile quando la chiave e gia salvata e si vuole ricontrollare.
      const result = await validateApiKey({ userId, provider })
      return Response.json({ data: result, error: null, errorType: null })
    }

    const apiKey = body?.apiKey?.trim()
    if (!apiKey) {
      return errorResponse('apiKey mancante', 'validation', 400)
    }

    // Salvataggio e validazione immediata per feedback UX piu chiaro.
    const result = await saveApiKey({
      userId,
      provider,
      apiKey,
      validateNow: true,
    })

    return Response.json({ data: result, error: null, errorType: null })
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
    const userId = requireUserId(session?.userId)

    const body = (await request.json().catch(() => null)) as IntegrationDeleteBody | null
    const provider = body?.provider

    if (!provider) {
      return errorResponse('provider mancante', 'validation', 400)
    }

    await removeApiKey({ userId, provider })

    return Response.json({
      data: { message: 'Chiave rimossa correttamente' },
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
