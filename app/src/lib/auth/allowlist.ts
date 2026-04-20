import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Allowlist enforcement logic.
 *
 * A user can access ContentFlix ONLY if:
 * 1. They authenticate with Google (handled by Supabase Auth)
 * 2. Their email is present and active in allowlist_entries
 *
 * This is intentionally strict in V1 — no self-registration.
 */

/**
 * Checks if an email is in the active allowlist.
 * Uses admin client to bypass RLS for this security-critical check.
 */
export async function isEmailAllowlisted(email: string): Promise<boolean> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('allowlist_entries')
    .select('id, is_active')
    .eq('email', email.toLowerCase().trim())
    .eq('is_active', true)
    .single()

  if (error || !data) return false
  return data.is_active
}

/**
 * Adds an email to the allowlist.
 * Called by admin when granting access to a new user.
 */
export async function addToAllowlist(
  email: string,
  addedByAdminId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase.from('allowlist_entries').upsert(
    {
      email: email.toLowerCase().trim(),
      added_by: addedByAdminId,
      is_active: true,
    },
    { onConflict: 'email' }
  )

  if (error) return { success: false, error: error.message }
  return { success: true }
}

/**
 * Removes/deactivates an email from the allowlist.
 * The user can no longer log in after this.
 */
export async function removeFromAllowlist(email: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('allowlist_entries')
    .update({ is_active: false })
    .eq('email', email.toLowerCase().trim())

  if (error) return { success: false, error: error.message }
  return { success: true }
}

/**
 * Provisions a new user in the users table after first successful login.
 * Called from the OAuth callback when a user authenticates for the first time.
 */
export async function provisionNewUser(params: {
  supabaseUserId: string
  email: string
  displayName: string | null
  avatarUrl: string | null
  provider: string
  providerUserId: string
}): Promise<{ success: boolean; userId?: string; error?: string }> {
  const supabase = createAdminClient()

  // Create user record
  const { data: user, error: userError } = await supabase
    .from('users')
    .upsert(
      {
        id: params.supabaseUserId,
        email: params.email.toLowerCase().trim(),
        display_name: params.displayName,
        avatar_url: params.avatarUrl,
        preferred_language: 'it',
        status: 'active',
      },
      { onConflict: 'id' }
    )
    .select('id')
    .single()

  if (userError || !user) {
    return { success: false, error: userError?.message ?? 'Failed to create user' }
  }

  // Create user_identity record
  await supabase.from('user_identities').upsert(
    {
      user_id: user.id,
      provider: params.provider,
      provider_user_id: params.providerUserId,
      email: params.email.toLowerCase().trim(),
    },
    { onConflict: 'user_id,provider' }
  )

  // Assign default 'user' role
  const { data: userRole } = await supabase
    .from('roles')
    .select('id')
    .eq('name', 'user')
    .single()

  if (userRole) {
    await supabase.from('user_roles').upsert(
      { user_id: user.id, role_id: userRole.id },
      { onConflict: 'user_id,role_id' }
    )
  }

  // Create default watchlist
  await supabase.from('watchlists').upsert(
    { user_id: user.id, name: 'Da vedere', is_default: true },
    { onConflict: 'user_id,is_default' }
  )

  return { success: true, userId: user.id }
}
