import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isEmailAllowlisted } from '@/lib/auth/allowlist'

/**
 * Middleware for ContentFlix.
 *
 * Responsibilities:
 * 1. Refresh Supabase session on every request
 * 2. Protect private routes — redirect to login if not authenticated
 * 3. Enforce allowlist — redirect with error if not authorized
 * 4. Protect admin routes — check super_admin role
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

  // --- Public routes (no auth required) ---
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/api/auth/') ||
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

  // --- Admin route protection ---
  if (pathname.startsWith('/admin')) {
    // Check super_admin role via DB
    const { data: roleCheck } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', user.id)
      .single()

    // @ts-expect-error — nested join
    const isSuperAdmin = roleCheck?.roles?.name === 'super_admin'

    if (!isSuperAdmin) {
      // Not an admin — redirect to dashboard (forbidden)
      return NextResponse.redirect(new URL('/dashboard?error=forbidden', request.url))
    }
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
