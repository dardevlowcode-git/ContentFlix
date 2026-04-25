/* Commento didattico:
 * Scopo del file: intercetta le richieste prima delle pagine/API per applicare regole trasversali (es. auth, lingua, redirect).
 * Moduli richiamati: `@supabase/ssr`, `next/server`, `@/lib/auth/allowlist`
 * Flusso: Middleware legge la richiesta, applica controlli condivisi e decide se continuare, riscrivere o reindirizzare il flusso.
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isEmailAllowlisted } from '@/lib/auth/allowlist'

const adminSessionCookieName = 'cf_admin_session'

/**
 * Middleware centrale di ContentFlix.
 *
 * Responsabilita principali:
 * 1. Aggiornare la sessione Supabase ad ogni richiesta.
 * 2. Proteggere le pagine private (redirect a /login se utente non autenticato).
 * 3. Applicare allowlist (email autorizzate).
 * 4. Proteggere area admin con cookie dedicato (non dipende da Google OAuth).
 * 5. Evitare che utenti gia autenticati restino sulla pagina /login.
 *
 * Moduli richiamati:
 * - `isEmailAllowlisted` in `lib/auth/allowlist.ts` per la regola di accesso.
 * - Cookie admin emesso da `lib/auth/admin.ts` e API `api/admin/auth/*`.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Copia i cookie sia nella request che nella response:
          // serve a mantenere allineato il refresh token durante la stessa richiesta.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session: questa chiamata e il punto base di tutto il controllo accessi.
  // Evitare logica intermedia prima di leggere `user`, per non lavorare su stato vecchio.
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const hasAdminSessionCookie = Boolean(request.cookies.get(adminSessionCookieName)?.value)

  // --- Route pubbliche (non richiedono login) ---
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/admin/login' ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/admin/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon')
  ) {
    // Se l'utente e gia autenticato e autorizzato, non ha senso restare su /login.
    if (pathname === '/login' && user?.email) {
      const allowlisted = await isEmailAllowlisted(user.email)
      if (allowlisted) {
        // Evita loop login/dashboard:
        // utente presente in Supabase Auth ma non ancora provisionato in tabella `users`.
        // Il provisioning avviene nel callback OAuth (`api/auth/callback/route.ts`).
        const { data: appUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .eq('status', 'active')
          .maybeSingle()

        if (appUser) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    }

    return supabaseResponse
  }

  // --- API admin (richiedono cookie admin, esclusi endpoint auth gia gestiti) ---
  if (pathname.startsWith('/api/admin/')) {
    if (!hasAdminSessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return supabaseResponse
  }

  // --- Route super-admin (flusso indipendente da Google OAuth) ---
  if (pathname.startsWith('/admin')) {
    if (!hasAdminSessionCookie) {
      const adminLoginUrl = new URL('/admin/login', request.url)
      adminLoginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(adminLoginUrl)
    }
    return supabaseResponse
  }

  // --- Route protette utente standard (tutto il resto) ---
  if (!user || !user.email) {
    // Utente non autenticato: salviamo la destinazione per tornare dopo il login.
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // --- Verifica allowlist ---
  const isAllowlisted = await isEmailAllowlisted(user.email)
  if (!isAllowlisted) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', 'access_denied')
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
