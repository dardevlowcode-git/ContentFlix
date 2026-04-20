import { createClient } from '@/lib/supabase/server'
import { provisionNewUser, isEmailAllowlisted } from '@/lib/auth/allowlist'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * OAuth callback handler.
 * Called by Supabase after successful Google OAuth.
 *
 * Flow:
 * 1. Exchange code for session
 * 2. Check allowlist
 * 3. Provision user if first login
 * 4. Redirect to dashboard or login with error
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const supabase = await createClient()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('[Auth Callback] Exchange error:', exchangeError.message)
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`)
  }

  // Get the newly authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return NextResponse.redirect(`${origin}/login?error=no_user`)
  }

  // Check allowlist
  const allowed = await isEmailAllowlisted(user.email)
  if (!allowed) {
    // Sign them out immediately — they authenticated but are not authorized
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/login?error=access_denied`)
  }

  // Provision user on first login (upsert-safe)
  const identity = user.identities?.[0]
  await provisionNewUser({
    supabaseUserId: user.id,
    email: user.email,
    displayName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    avatarUrl: user.user_metadata?.avatar_url ?? null,
    provider: identity?.provider ?? 'google',
    providerUserId: identity?.id ?? user.id,
  })

  // Redirect to the intended destination
  const safeRedirect = redirectTo.startsWith('/') ? redirectTo : '/dashboard'
  return NextResponse.redirect(`${origin}${safeRedirect}`)
}
