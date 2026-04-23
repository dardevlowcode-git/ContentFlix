import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminUsersClient from './AdminUsersClient'

export const metadata: Metadata = { title: 'Admin — Utenti' }

export default async function AdminUsersPage() {
  const supabase = createAdminClient()

  const { data: users } = await supabase
    .from('users')
    .select(`
      *,
      user_roles(role_id, roles(name)),
      allowlist_entries(is_active)
    `)
    .order('created_at', { ascending: false })

  const { data: allowlist } = await supabase
    .from('allowlist_entries')
    .select('*')
    .order('added_at', { ascending: false })

  return <AdminUsersClient initialUsers={users ?? []} initialAllowlist={allowlist ?? []} />
}
