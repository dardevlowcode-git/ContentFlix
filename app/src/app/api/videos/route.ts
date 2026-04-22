import { getCurrentSession } from '@/lib/auth/provider'
import { getVideosForUser, importChannelVideos } from '@/lib/services/videos'
import { AppError, errorResponse } from '@/lib/utils/errors'

interface VideosPostBody {
  action?: 'import_channel'
  channelId?: string
  maxResults?: number
}

function parseBoolean(value: string | null): boolean {
  return value === 'true' || value === '1'
}

function requireUserId(userId: string | null | undefined): string {
  if (!userId) {
    throw new AppError('Sessione non valida', 'unauthorized', 401)
  }
  return userId
}

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession()
    const userId = requireUserId(session?.userId)

    const { searchParams } = new URL(request.url)

    const channelId = searchParams.get('channelId') ?? undefined
    const analysisStatus = (searchParams.get('analysisStatus') as
      | 'pending'
      | 'processing'
      | 'completed'
      | 'failed'
      | null) ?? undefined

    const seenStatus = (searchParams.get('seenStatus') as 'seen' | 'unseen' | null) ?? undefined

    const onlyWatchlist = parseBoolean(searchParams.get('onlyWatchlist'))
    const search = searchParams.get('search') ?? undefined
    const languageCode = searchParams.get('languageCode') ?? session?.preferredLanguage ?? 'it'

    const limitParam = searchParams.get('limit')
    const pageParam = searchParams.get('page')

    const limit = limitParam ? Number(limitParam) : undefined
    const page = pageParam ? Number(pageParam) : undefined

    const data = await getVideosForUser({
      userId,
      channelId,
      analysisStatus,
      seenStatus,
      onlyWatchlist,
      search,
      languageCode,
      limit,
      page,
    })

    return Response.json({ data, error: null, errorType: null })
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

    const body = (await request.json().catch(() => null)) as VideosPostBody | null
    const action = body?.action ?? 'import_channel'

    if (action !== 'import_channel') {
      return errorResponse('Azione non supportata', 'validation', 400)
    }

    const channelId = body?.channelId?.trim()
    if (!channelId) {
      return errorResponse('channelId mancante', 'validation', 400)
    }

    const maxResults = typeof body?.maxResults === 'number' ? body.maxResults : undefined

    const result = await importChannelVideos({
      userId,
      channelId,
      maxResults,
    })

    return Response.json({
      data: {
        ...result,
        message: 'Import canale completato',
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
