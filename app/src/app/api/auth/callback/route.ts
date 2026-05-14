/* Commento didattico:
 * Scopo del file: gestisce una API route: riceve richieste HTTP, valida i dati e restituisce una risposta al frontend.
 * Moduli richiamati: `@/lib/supabase/server`, `@/lib/auth/allowlist`, `next/server`
 * Flusso: La route viene richiamata dal client (o da altre parti server), usa servizi/utilita` in `src/lib` e poi ritorna JSON/HTTP status.
 */

import { createClient } from '@/lib/supabase/server'
import { provisionNewUser, isEmailAllowlisted } from '@/lib/auth/allowlist'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Callback OAuth richiamato da Supabase dopo login Google.
 *
 * Flusso end-to-end:
 * 1. Scambia il `code` con sessione Supabase.
 * 2. Verifica allowlist (`lib/auth/allowlist.ts`).
 * 3. Esegue provisioning utente al primo accesso.
 * 4. Redirige alla destinazione richiesta o a `/login` con errore.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const appOrigin = process.env.APP_ORIGIN?.trim()
  if (!appOrigin) {
    return NextResponse.json(
      { data: null, error: 'APP_ORIGIN non configurato', errorType: 'structural', errorCode: 'misconfigured_app' },
      { status: 500 }
    )
  }

  let appUrl: URL
  try {
    appUrl = new URL(appOrigin)
  } catch {
    return NextResponse.json(
      { data: null, error: 'APP_ORIGIN non valido', errorType: 'structural', errorCode: 'misconfigured_app' },
      { status: 500 }
    )
  }

  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'
  const safeRedirect = resolveSafeRedirectPath(redirectTo)

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', appUrl))
  }

  const supabase = await createClient()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('[Auth Callback] Exchange error:', exchangeError.message)
    return NextResponse.redirect(new URL('/login?error=exchange_failed', appUrl))
  }

  // Legge utente autenticato appena creato/aggiornato dallo scambio codice.
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return NextResponse.redirect(new URL('/login?error=no_user', appUrl))
  }

  // Controllo autorizzazione applicativa (oltre all'autenticazione OAuth).
  const allowed = await isEmailAllowlisted(user.email)
  if (!allowed) {
    // Logout immediato: autenticato ma non autorizzato all'uso del prodotto.
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login?error=access_denied', appUrl))
  }

  // Provisioning idempotente: crea/aggiorna record applicativi necessari.
  const identity = user.identities?.[0]
  const provisionResult = await provisionNewUser({
    supabaseUserId: user.id,
    email: user.email,
    displayName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    avatarUrl: user.user_metadata?.avatar_url ?? null,
    provider: identity?.provider ?? 'google',
    providerUserId: identity?.id ?? user.id,
  })

  if (!provisionResult.success) {
    console.error('[Auth Callback] Provisioning error:', provisionResult.error)
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login?error=exchange_failed', appUrl))
  }

  return NextResponse.redirect(new URL(safeRedirect, appUrl))
}

function resolveSafeRedirectPath(value: string): string {
  let decoded = value.trim()
  try {
    decoded = decodeURIComponent(value).trim()
  } catch {
    return '/dashboard'
  }
  if (!decoded.startsWith('/')) return '/dashboard'
  if (decoded.startsWith('//')) return '/dashboard'
  if (decoded.includes('\\')) return '/dashboard'
  if (decoded.includes('://')) return '/dashboard'

  try {
    const parsed = new URL(decoded, 'https://app.local')
    if (parsed.origin !== 'https://app.local') return '/dashboard'
    if (!parsed.pathname.startsWith('/')) return '/dashboard'
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return '/dashboard'
  }
}
