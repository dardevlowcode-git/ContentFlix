/* Commento didattico:
 * Scopo del file: endpoint admin per forzare una scansione canale immediata.
 * Moduli richiamati: `next/server`, `@/lib/auth/admin`, `@/lib/supabase/admin`, `@/lib/services/channels`, `@/lib/utils/errors`
 * Flusso: valida sessione super-admin, risolve un utente attivo per il canale e avvia la scansione senza attendere scheduler.
 */

import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { requestScanNowForUser } from '@/lib/services/channels'
import { AppError } from '@/lib/utils/errors'

interface RouteContext {
  params: {
    channelId: string
  }
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * Avvia una scansione canale immediata come super-admin.
 */
export async function POST(_request: Request, context: RouteContext) {
  const adminSession = await getAdminSession()
  if (!adminSession) {
    return NextResponse.json({ data: null, error: 'Unauthorized', errorType: 'unauthorized' }, { status: 401 })
  }

  const channelId = context.params.channelId?.trim()
  if (!channelId || !uuidPattern.test(channelId)) {
    return NextResponse.json({ data: null, error: 'channelId non valido', errorType: 'validation' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: userChannel, error: userChannelError } = await supabase
    .from('user_channels')
    .select('user_id')
    .eq('channel_id', channelId)
    .eq('is_active', true)
    .order('added_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (userChannelError) {
    return NextResponse.json({ data: null, error: userChannelError.message, errorType: 'unknown' }, { status: 500 })
  }

  if (!userChannel?.user_id) {
    return NextResponse.json(
      { data: null, error: 'Nessun utente attivo associato al canale', errorType: 'not_found' },
      { status: 404 }
    )
  }

  try {
    await requestScanNowForUser({ userId: userChannel.user_id, channelId }, { asAdmin: true })
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { data: null, error: error.message, errorType: error.type },
        { status: error.statusCode ?? 500 }
      )
    }
    return NextResponse.json({ data: null, error: 'Errore interno', errorType: 'unknown' }, { status: 500 })
  }

  return NextResponse.json({
    data: {
      message: 'Scansione avviata',
      channelId,
      userId: userChannel.user_id,
    },
    error: null,
    errorType: null,
  })
}
