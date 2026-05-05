import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const exchangeCodeForSessionMock = vi.fn()
const getUserMock = vi.fn()
const signOutMock = vi.fn()
const isEmailAllowlistedMock = vi.fn()
const provisionNewUserMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      exchangeCodeForSession: exchangeCodeForSessionMock,
      getUser: getUserMock,
      signOut: signOutMock,
    },
  })),
}))

vi.mock('@/lib/auth/allowlist', () => ({
  isEmailAllowlisted: isEmailAllowlistedMock,
  provisionNewUser: provisionNewUserMock,
}))

let GET: typeof import('@/app/api/auth/callback/route').GET

function callbackRequest(url: string): Request {
  return new Request(url, { method: 'GET' })
}

describe('GET /api/auth/callback', () => {
  beforeAll(async () => {
    ;({ GET } = await import('@/app/api/auth/callback/route'))
  })

  beforeEach(() => {
    vi.resetAllMocks()
    process.env.APP_ORIGIN = 'https://app.contentflix.test'

    exchangeCodeForSessionMock.mockResolvedValue({ error: null })
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          user_metadata: {},
          identities: [{ provider: 'google', id: 'identity-1' }],
        },
      },
    })
    isEmailAllowlistedMock.mockResolvedValue(true)
    provisionNewUserMock.mockResolvedValue(undefined)
  })

  it('ignora Host/X-Forwarded-Host e usa APP_ORIGIN nel redirect', async () => {
    const response = await GET(callbackRequest('https://evil.test/api/auth/callback?code=abc') as never)
    expect(response.headers.get('location')).toBe('https://app.contentflix.test/dashboard')
  })

  it('blocca redirect assoluti malevoli', async () => {
    const response = await GET(
      callbackRequest('https://app.contentflix.test/api/auth/callback?code=abc&redirectTo=https%3A%2F%2Fevil.test%2Fpwn') as never
    )
    expect(response.headers.get('location')).toBe('https://app.contentflix.test/dashboard')
  })

  it('blocca redirect protocol-relative malevoli', async () => {
    const response = await GET(
      callbackRequest('https://app.contentflix.test/api/auth/callback?code=abc&redirectTo=%2F%2Fevil.test%2Fpwn') as never
    )
    expect(response.headers.get('location')).toBe('https://app.contentflix.test/dashboard')
  })

  it('accetta solo path relativi interni', async () => {
    const response = await GET(
      callbackRequest('https://app.contentflix.test/api/auth/callback?code=abc&redirectTo=%2Fdashboard%3Ftab%3Dchannels') as never
    )
    expect(response.headers.get('location')).toBe('https://app.contentflix.test/dashboard?tab=channels')
  })
})
