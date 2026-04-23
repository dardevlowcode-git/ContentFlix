import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isEmailAllowlisted } from '@/lib/auth/allowlist'

const adminSessionCookieName = 'cf_admin_session'

/**
 * Middleware for ContentFlix.
 *
 * Responsibilities:
 * 1. Refresh Supabase session on every request
 * 2. Protect private routes — redirect to login if not authenticated
 * 3. Enforce allowlist — redirect with error if not authorized
 * 4. Protect admin routes — dedicated super-admin username/password session
 * 5. Redirect authenticated users away from /login
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

  // Refresh session — IMPORTANT: do not write any logic between these calls
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const hasAdminSessionCookie = Boolean(request.cookies.get(adminSessionCookieName)?.value)

  // --- Public routes (no auth required) ---
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/admin/login' ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/admin/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon')
  ) {
    // Redirect authenticated + allowlisted users away from /login
    if (pathname === '/login' && user?.email) {
      const allowlisted = await isEmailAllowlisted(user.email)
      if (allowlisted) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    if (pathname === '/admin/login' && hasAdminSessionCookie) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    return supabaseResponse
  }

  // --- Super-admin routes (independent from Google OAuth) ---
  if (pathname.startsWith('/admin')) {
    if (!hasAdminSessionCookie) {
      const adminLoginUrl = new URL('/admin/login', request.url)
      adminLoginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(adminLoginUrl)
    }
    return supabaseResponse
  }

  // --- Protected routes (everything else) ---
  if (!user || !user.email) {
    // Not authenticated — redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // --- Allowlist check ---
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
