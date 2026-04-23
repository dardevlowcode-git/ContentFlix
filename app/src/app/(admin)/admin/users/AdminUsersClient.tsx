'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'

interface UserRow {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  status: 'active' | 'suspended' | 'deleted'
  created_at: string
  user_roles?: Array<{ roles?: { name?: string | null } | null }> | null
}

interface AllowlistRow {
  id: string
  email: string
  is_active: boolean
  added_at: string
}

interface AdminUsersClientProps {
  initialUsers: UserRow[]
  initialAllowlist: AllowlistRow[]
  schemaError?: string | null
}

type BusyState =
  | { type: 'authorize' }
  | { type: 'revoke'; email: string }
  | null

export default function AdminUsersClient({
  initialUsers,
  initialAllowlist,
  schemaError = null,
}: AdminUsersClientProps) {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()

  const [emailInput, setEmailInput] = useState('')
  const [busy, setBusy] = useState<BusyState>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const activeAllowlist = useMemo(
    () => initialAllowlist.filter((entry) => entry.is_active),
    [initialAllowlist]
  )

  function clearFeedback() {
    setMessage(null)
    setError(null)
  }

  async function handleAuthorize(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearFeedback()

    const email = emailInput.trim().toLowerCase()
    if (!email) {
      setError(t('admin.users.emailRequired'))
      return
    }

    setBusy({ type: 'authorize' })

    try {
      const response = await fetch('/api/admin/allowlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const payload = (await response.json().catch(() => null)) as
        | { data: { message?: string } | null; error: string | null }
        | null

      if (!response.ok) {
        throw new Error(payload?.error ?? t('admin.users.authorizeError'))
      }

      setMessage(payload?.data?.message ?? t('admin.users.authorized'))
      setEmailInput('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setBusy(null)
    }
  }

  async function handleRevoke(email: string) {
    clearFeedback()

    const confirmed = window.confirm(t('admin.users.revokeConfirm'))
    if (!confirmed) return

    setBusy({ type: 'revoke', email })

    try {
      const response = await fetch('/api/admin/allowlist', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const payload = (await response.json().catch(() => null)) as
        | { data: { message?: string } | null; error: string | null }
        | null

      if (!response.ok) {
        throw new Error(payload?.error ?? t('admin.users.revokeError'))
      }

      setMessage(payload?.data?.message ?? t('admin.users.revoked'))
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="p-8 max-w-6xl">
      <header className="mb-10">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-1">
          {t('admin.users.title')}
        </h1>
        <p className="text-on-surface-variant text-sm">
          {t('admin.users.subtitle')}
        </p>
      </header>

      <div className="bg-surface-container-lowest rounded-2xl p-6 mb-8 shadow-ambient">
        <h2 className="font-headline text-base font-bold text-on-surface mb-1">
          {t('admin.users.allowlistUser')}
        </h2>
        <p className="text-sm text-on-surface-variant mb-4">
          {t('admin.users.allowlistDescription')}
        </p>

        <form className="flex gap-3" onSubmit={handleAuthorize}>
          <input
            type="email"
            placeholder={t('admin.users.emailPlaceholder')}
            className="input-field flex-1"
            value={emailInput}
            onChange={(event) => setEmailInput(event.target.value)}
            disabled={busy?.type === 'authorize' || Boolean(schemaError)}
          />
          <button
            type="submit"
            disabled={busy?.type === 'authorize' || Boolean(schemaError)}
            className="gradient-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm
                       hover:shadow-primary-glow transition-all active:scale-95 shrink-0
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy?.type === 'authorize' ? t('common.loading') : t('admin.users.authorizeAccess')}
          </button>
        </form>

        {schemaError && <p className="mt-3 text-sm text-error">{schemaError}</p>}
        {message && <p className="mt-3 text-sm text-green-700">{message}</p>}
        {error && <p className="mt-3 text-sm text-error">{error}</p>}
      </div>

      <section className="mb-8">
        <h2 className="font-headline text-xl font-bold text-on-surface mb-4">
          {t('admin.users.allowlistTitle')} ({activeAllowlist.length})
        </h2>

        {activeAllowlist.length === 0 ? (
          <div className="bg-surface-container-low rounded-2xl p-8 text-center text-on-surface-variant">
            {t('admin.users.allowlistEmpty')}
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-ambient">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-container-low">
              <div className="col-span-6 text-label-caps text-on-surface-variant">{t('admin.users.email')}</div>
              <div className="col-span-3 text-label-caps text-on-surface-variant">{t('admin.users.registeredAt')}</div>
              <div className="col-span-3 text-label-caps text-on-surface-variant">{t('admin.users.actions')}</div>
            </div>

            {activeAllowlist.map((entry, index) => {
              const revokeBusy = busy?.type === 'revoke' && busy.email === entry.email
              return (
                <div
                  key={entry.id}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 items-center
                    ${index % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low'}`}
                >
                  <div className="col-span-6 text-sm text-on-surface">{entry.email}</div>
                  <div className="col-span-3 text-sm text-on-surface-variant">
                    {new Date(entry.added_at).toLocaleDateString(locale)}
                  </div>
                  <div className="col-span-3">
                    <button
                      type="button"
                      disabled={revokeBusy}
                      onClick={() => handleRevoke(entry.email)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-error
                                 hover:bg-error-container/40 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {t('admin.users.revokeAccess')}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-headline text-xl font-bold text-on-surface mb-4">
          {t('admin.users.title')} ({initialUsers.length})
        </h2>
        <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-ambient">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-container-low">
            <div className="col-span-4 text-label-caps text-on-surface-variant">{t('admin.users.user')}</div>
            <div className="col-span-3 text-label-caps text-on-surface-variant">{t('admin.users.role')}</div>
            <div className="col-span-2 text-label-caps text-on-surface-variant">{t('admin.users.status')}</div>
            <div className="col-span-2 text-label-caps text-on-surface-variant">{t('admin.users.registeredAt')}</div>
            <div className="col-span-1 text-label-caps text-on-surface-variant">{t('admin.users.actions')}</div>
          </div>

          {initialUsers.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant">
              {t('admin.users.empty')}
            </div>
          ) : (
            initialUsers.map((user, i) => {
              const role = user.user_roles?.[0]?.roles?.name ?? 'user'
              const isSuperAdmin = role === 'super_admin'

              return (
                <div
                  key={user.id}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 items-center
                               ${i % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low'}
                               hover:bg-surface-container transition-colors`}
                >
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
                      <p className="text-sm font-semibold text-on-surface">{user.display_name ?? t('common.unknown')}</p>
                      <p className="text-xs text-on-surface-variant">{user.email}</p>
                    </div>
                  </div>

                  <div className="col-span-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full
                                      ${isSuperAdmin ? 'badge-ai' : 'bg-surface-container text-on-surface-variant'}`}>
                      {isSuperAdmin ? t('admin.superAdmin') : t('admin.users.standardUser')}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                                      ${user.status === 'active' ? 'bg-green-100 text-green-700'
                        : user.status === 'suspended' ? 'bg-amber-100 text-amber-700'
                          : 'bg-error-container text-error'}`}>
                      {user.status === 'active' ? t('admin.users.statusActive')
                        : user.status === 'suspended' ? t('admin.users.statusSuspended')
                          : t('admin.users.statusDeleted')}
                    </span>
                  </div>

                  <div className="col-span-2 text-sm text-on-surface-variant">
                    {new Date(user.created_at).toLocaleDateString(locale)}
                  </div>

                  <div className="col-span-1">
                    {!isSuperAdmin && (
                      <button
                        type="button"
                        title={t('admin.users.suspend')}
                        className="p-1.5 text-on-surface-variant hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all text-xs"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                          />
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
