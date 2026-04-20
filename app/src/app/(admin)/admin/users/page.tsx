import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

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

  return (
    <div className="p-8 max-w-6xl">
      <header className="mb-10">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-1">
          Gestione utenti
        </h1>
        <p className="text-on-surface-variant text-sm">
          Gestisci l&apos;accesso a ContentFlix tramite allowlist.
        </p>
      </header>

      {/* Add to allowlist */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 mb-8 shadow-ambient">
        <h2 className="font-headline text-base font-bold text-on-surface mb-1">
          Aggiungi all&apos;allowlist
        </h2>
        <p className="text-sm text-on-surface-variant mb-4">
          Inserisci l&apos;indirizzo email da autorizzare ad accedere a ContentFlix.
        </p>
        <div className="flex gap-3">
          <input
            type="email"
            placeholder="email@esempio.it"
            className="input-field flex-1"
          />
          <button
            className="gradient-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm
                       hover:shadow-primary-glow transition-all active:scale-95 shrink-0"
          >
            Autorizza accesso
          </button>
        </div>
      </div>

      {/* Users table */}
      <section>
        <h2 className="font-headline text-xl font-bold text-on-surface mb-4">
          Utenti ({users?.length ?? 0})
        </h2>
        <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-ambient">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-container-low">
            <div className="col-span-4 text-label-caps text-on-surface-variant">Utente</div>
            <div className="col-span-3 text-label-caps text-on-surface-variant">Ruolo</div>
            <div className="col-span-2 text-label-caps text-on-surface-variant">Stato</div>
            <div className="col-span-2 text-label-caps text-on-surface-variant">Registrato il</div>
            <div className="col-span-1 text-label-caps text-on-surface-variant">Azioni</div>
          </div>

          {!users || users.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant">
              Nessun utente registrato.
            </div>
          ) : (
            users.map((user, i) => {
              // @ts-expect-error — nested join
              const role = user.user_roles?.[0]?.roles?.name ?? 'user'
              const isSuperAdmin = role === 'super_admin'

              return (
                <div
                  key={user.id}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 items-center
                               ${i % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low'}
                               hover:bg-surface-container transition-colors`}
                >
                  {/* User */}
                  <div className="col-span-4 flex items-center gap-3">
                    {user.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold
                                        ${isSuperAdmin ? 'gradient-ai' : 'gradient-primary'}`}>
                        {(user.display_name ?? user.email)[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{user.display_name ?? '—'}</p>
                      <p className="text-xs text-on-surface-variant">{user.email}</p>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="col-span-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full
                                      ${isSuperAdmin ? 'badge-ai' : 'bg-surface-container text-on-surface-variant'}`}>
                      {isSuperAdmin ? 'Super-Admin' : 'Utente'}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                                      ${user.status === 'active' ? 'bg-green-100 text-green-700' :
                                        user.status === 'suspended' ? 'bg-amber-100 text-amber-700' :
                                        'bg-error-container text-error'}`}>
                      {user.status === 'active' ? 'Attivo' :
                       user.status === 'suspended' ? 'Sospeso' : 'Eliminato'}
                    </span>
                  </div>

                  {/* Registered */}
                  <div className="col-span-2 text-sm text-on-surface-variant">
                    {new Date(user.created_at).toLocaleDateString('it-IT')}
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center gap-1">
                    {!isSuperAdmin && user.status === 'active' && (
                      <button
                        title="Sospendi"
                        className="p-1.5 text-on-surface-variant hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all text-xs"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}
