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
  const { searchParams, origin } = new URL(request.url)
  const forwardedHost = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
  // Usa gli header del reverse proxy per evitare redirect errati verso localhost.
  const appOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${appOrigin}/login?error=no_code`)
  }

  const supabase = await createClient()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('[Auth Callback] Exchange error:', exchangeError.message)
    return NextResponse.redirect(`${appOrigin}/login?error=exchange_failed`)
  }

  // Legge utente autenticato appena creato/aggiornato dallo scambio codice.
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return NextResponse.redirect(`${appOrigin}/login?error=no_user`)
  }

  // Controllo autorizzazione applicativa (oltre all'autenticazione OAuth).
  const allowed = await isEmailAllowlisted(user.email)
  if (!allowed) {
    // Logout immediato: autenticato ma non autorizzato all'uso del prodotto.
    await supabase.auth.signOut()
    return NextResponse.redirect(`${appOrigin}/login?error=access_denied`)
  }

  // Provisioning idempotente: crea/aggiorna record applicativi necessari.
  const identity = user.identities?.[0]
  await provisionNewUser({
    supabaseUserId: user.id,
    email: user.email,
    displayName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    avatarUrl: user.user_metadata?.avatar_url ?? null,
    provider: identity?.provider ?? 'google',
    providerUserId: identity?.id ?? user.id,
  })

  // Difesa open-redirect: si accettano solo path interni che iniziano con `/`.
  const safeRedirect = redirectTo.startsWith('/') ? redirectTo : '/dashboard'
  return NextResponse.redirect(`${appOrigin}${safeRedirect}`)
}
