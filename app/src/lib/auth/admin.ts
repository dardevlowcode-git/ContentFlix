import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

export const adminSessionCookieName = 'cf_admin_session'
const adminSessionDurationSeconds = 60 * 60 * 12 // 12 hours

interface AdminAuthConfig {
  username: string
  passwordHash: string
  sessionSecret: string
}

export interface AdminSession {
  username: string
}

function getAdminAuthConfig(): AdminAuthConfig | null {
  const username = process.env.SUPERADMIN_USERNAME?.trim()
  const passwordHash = process.env.SUPERADMIN_PASSWORD_HASH?.trim().toLowerCase()
  const sessionSecret = process.env.SUPERADMIN_SESSION_SECRET?.trim()

  if (!username || !passwordHash || !sessionSecret) {
    return null
  }

  return { username, passwordHash, sessionSecret }
}

function requireAdminAuthConfig(): AdminAuthConfig {
  const config = getAdminAuthConfig()
  if (!config) {
    throw new Error(
      'Missing super admin auth config. Set SUPERADMIN_USERNAME, SUPERADMIN_PASSWORD_HASH and SUPERADMIN_SESSION_SECRET.'
    )
  }
  return config
}

function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function safeStringEquals(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)
  if (aBuffer.length !== bBuffer.length) return false
  return timingSafeEqual(aBuffer, bBuffer)
}

function toBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function createSessionToken(username: string, secret: string): string {
  const exp = Date.now() + adminSessionDurationSeconds * 1000
  const nonce = randomBytes(8).toString('hex')
  const payload = toBase64Url(JSON.stringify({ u: username, exp, n: nonce }))
  const signature = signPayload(payload, secret)
  return `${payload}.${signature}`
}

function parseAndVerifyToken(token: string, secret: string): AdminSession | null {
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  const expectedSignature = signPayload(payload, secret)
  if (!safeStringEquals(signature, expectedSignature)) return null

  try {
    const parsed = JSON.parse(fromBase64Url(payload)) as { u?: string; exp?: number }
    if (!parsed.u || typeof parsed.exp !== 'number') return null
    if (Date.now() > parsed.exp) return null
    return { username: parsed.u }
  } catch {
    return null
  }
}

export function verifySuperAdminCredentials(username: string, password: string): boolean {
  const config = getAdminAuthConfig()
  if (!config) return false
  const normalizedUsername = username.trim()
  const computedPasswordHash = sha256Hex(password)

  return (
    safeStringEquals(normalizedUsername, config.username) &&
    safeStringEquals(computedPasswordHash, config.passwordHash)
  )
}

export function buildAdminSessionCookieValue(username: string): string {
  const { sessionSecret } = requireAdminAuthConfig()
  return createSessionToken(username, sessionSecret)
}

export function readAdminSessionFromCookieValue(cookieValue: string | undefined): AdminSession | null {
  if (!cookieValue) return null
  const config = getAdminAuthConfig()
  if (!config) return null
  return parseAndVerifyToken(cookieValue, config.sessionSecret)
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  return readAdminSessionFromCookieValue(cookieStore.get(adminSessionCookieName)?.value)
}

export function getAdminSessionMaxAge(): number {
  return adminSessionDurationSeconds
}
