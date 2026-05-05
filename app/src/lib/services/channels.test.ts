import { describe, expect, it } from 'vitest'
import { AppError } from '@/lib/utils/errors'
import { detectScanBlockedReasonFromError } from '@/lib/services/channels'

describe('detectScanBlockedReasonFromError', () => {
  it('riconosce mancanza API key YouTube', () => {
    const reason = detectScanBlockedReasonFromError(
      new AppError('Configura prima la chiave YouTube API', 'validation', 400)
    )

    expect(reason).toBe('missing_youtube_api_key')
  })

  it('ignora errori non correlati', () => {
    const reason = detectScanBlockedReasonFromError(
      new AppError('Errore upstream YouTube', 'structural', 422)
    )

    expect(reason).toBeNull()
  })
})
