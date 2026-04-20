import { createClient } from '@/lib/supabase/server'
import type { AuthSession } from '@/lib/types/domain'

/**
 * Auth abstraction layer.
 * All authentication logic goes through this module.
 * This abstraction makes it easy to add/swap auth providers in future versions
 * without touching the rest of the codebase.
 *
 * V1: Supabase Auth with Google OAuth only.
 * Future: Microsoft, Facebook, email/password, etc.
 */

/**
 * Gets the current authenticated session with full user context.
 * Returns null if not authenticated.
 */
export async function getCurrentSession(): Promise<AuthSession | null> {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user || !user.email) return null

  // Fetch user profile from our users table
  const { data: userProfile } = await supabase
    .from('users')
    .select('*, user_roles(role_id, roles(name))')
    .eq('email', user.email)
    .eq('status', 'active')
    .single()

  if (!userProfile) return null

  // Determine role
  // @ts-expect-error — nested join type not inferred perfectly
  const userRoles = userProfile.user_roles as Array<{ roles: { name: string } }> | null
  const isSuperAdmin = userRoles?.some((ur) => ur.roles?.name === 'super_admin') ?? false

  return {
    userId: userProfile.id,
    email: userProfile.email,
    displayName: userProfile.display_name,
    avatarUrl: userProfile.avatar_url,
    role: isSuperAdmin ? 'super_admin' : 'user',
    preferredLanguage: userProfile.preferred_language ?? 'it',
  }
}

/**
 * Gets only the Supabase auth user (lightweight, no extra DB query).
 * Use when you only need to verify authentication, not role info.
 */
export async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

/**
 * Signs out the current user.
 */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

/**
 * Returns the URL to initiate Google OAuth sign-in.
 */
export function getGoogleSignInUrl(redirectTo: string): string {
  // This is called client-side; the actual OAuth is handled by Supabase
  return `/api/auth/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`
}
