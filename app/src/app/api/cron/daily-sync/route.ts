/* Commento didattico:
 * Scopo del file: endpoint cron giornaliero compatibile Vercel per avviare il daily sync dei canali.
 * Moduli richiamati: `next/server`, `@/lib/services/daily-sync`, `@/lib/utils/errors`
 * Flusso: valida Authorization Bearer con CRON_SECRET, delega al service e restituisce un riepilogo JSON.
 */

import { NextResponse } from 'next/server'
import { runDailyChannelSync } from '@/lib/services/daily-sync'
import { AppError } from '@/lib/utils/errors'

/**
 * Trigger HTTP del job giornaliero.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json(
      { success: false, data: null, error: 'CRON_SECRET non configurato', errorType: 'structural' },
      { status: 500 }
    )
  }

  const authorization = request.headers.get('authorization')
  if (authorization !== `Bearer ${secret}`) {
    return NextResponse.json(
      { success: false, data: null, error: 'Unauthorized', errorType: 'unauthorized' },
      { status: 401 }
    )
  }

  try {
    const result = await runDailyChannelSync()

    return NextResponse.json(
      {
        success: result.success,
        data: result,
        error: null,
        errorType: null,
      },
      { status: result.success ? 200 : 207 }
    )
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: error.message,
          errorType: error.type,
        },
        { status: error.statusCode ?? 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        data: null,
        error: 'Errore interno',
        errorType: 'unknown',
      },
      { status: 500 }
    )
  }
}
