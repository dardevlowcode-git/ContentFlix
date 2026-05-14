/* Commento didattico:
 * Scopo del file: intercetta le richieste prima delle pagine/API per applicare regole trasversali (es. auth, lingua, redirect).
 * Moduli richiamati: `@supabase/ssr`, `next/server`, `@/lib/auth/allowlist`
 * Flusso: Middleware legge la richiesta, applica controlli condivisi e decide se continuare, riscrivere o reindirizzare il flusso.
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isEmailAllowlisted } from '@/lib/auth/allowlist'

const adminSessionCookieName = 'cf_admin_session'
const textEncoder = new TextEncoder()

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  return response
}

function decodeBase64Url(input: string): Uint8Array | null {
  try {
    const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    const binary = atob(padded)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  } catch {
    return null
  }
}

async function verifyAdminSessionCookie(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue) return false
  const secret = process.env.SUPERADMIN_SESSION_SECRET?.trim()
  if (!secret) return false

  const [payload, signature] = cookieValue.split('.')
  if (!payload || !signature) return false

  const payloadBytes = textEncoder.encode(payload)
  const signatureBytes = decodeBase64Url(signature)
  if (!signatureBytes) return false

  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  )

  const validSignature = await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes as unknown as BufferSource,
    payloadBytes as unknown as BufferSource
  )
  if (!validSignature) return false

  const payloadDecoded = decodeBase64Url(payload)
  if (!payloadDecoded) return false

  try {
    const parsed = JSON.parse(new TextDecoder().decode(payloadDecoded)) as { exp?: number }
    return typeof parsed.exp === 'number' && Date.now() <= parsed.exp
  } catch {
    return false
  }
}

/**
 * Middleware centrale di Utraya.
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
  let supabaseResponse = applySecurityHeaders(NextResponse.next({ request }))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          // Copia i cookie sia nella request che nella response:
          // serve a mantenere allineato il refresh token durante la stessa richiesta.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = applySecurityHeaders(NextResponse.next({ request }))
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
  const adminSessionCookie = request.cookies.get(adminSessionCookieName)?.value
  const hasValidAdminSession = await verifyAdminSessionCookie(adminSessionCookie)

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
    // Se l'utente e gia autenticato e autorizzato, non ha senso restare su home/login.
    if ((pathname === '/login' || pathname === '/') && user?.email) {
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
          return applySecurityHeaders(NextResponse.redirect(new URL('/dashboard', request.url)))
        }
      }
    }

    return supabaseResponse
  }

  // --- API admin (richiedono cookie admin, esclusi endpoint auth gia gestiti) ---
  if (pathname.startsWith('/api/admin/')) {
    if (!hasValidAdminSession) {
      const response = applySecurityHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      if (adminSessionCookie) {
        response.cookies.set({
          name: adminSessionCookieName,
          value: '',
          path: '/',
          maxAge: 0,
        })
      }
      return response
    }
    return supabaseResponse
  }

  // --- Route super-admin (flusso indipendente da Google OAuth) ---
  if (pathname.startsWith('/admin')) {
    if (!hasValidAdminSession) {
      if (adminSessionCookie) {
        const response = applySecurityHeaders(NextResponse.redirect(new URL('/admin/login', request.url)))
        response.cookies.set({
          name: adminSessionCookieName,
          value: '',
          path: '/',
          maxAge: 0,
        })
        return response
      }

      const adminLoginUrl = new URL('/admin/login', request.url)
      adminLoginUrl.searchParams.set('redirectTo', pathname)
      return applySecurityHeaders(NextResponse.redirect(adminLoginUrl))
    }
    return supabaseResponse
  }

  // --- Route protette utente standard (tutto il resto) ---
  if (!user || !user.email) {
    // Utente non autenticato: salviamo la destinazione per tornare dopo il login.
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return applySecurityHeaders(NextResponse.redirect(loginUrl))
  }

  // --- Verifica allowlist ---
  const isAllowlisted = await isEmailAllowlisted(user.email)
  if (!isAllowlisted) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', 'access_denied')
    return applySecurityHeaders(NextResponse.redirect(loginUrl))
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
