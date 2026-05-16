/* Commento didattico:
 * Scopo del file: banner consenso cookie per superficie marketing.
 * Moduli richiamati: `next-intl`, `./CookieConsentProvider`
 * Flusso: mostra il banner finché il consenso non è espresso e salva la scelta nel cookie.
 */

'use client'

import { useTranslations } from 'next-intl'
import { useCookieConsent } from './CookieConsentProvider'

export default function CookieBanner() {
  const t = useTranslations()
  const { consent, setConsent } = useCookieConsent()

  if (consent !== 'unset') {
    return null
  }

  return (
    <aside className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-5xl rounded-[20px] bg-lifted-cream p-5 shadow-ambient">
      <p className="text-sm font-semibold text-on-surface">{t('marketing.cookies.title')}</p>
      <p className="mt-2 text-sm text-on-surface-variant">{t('marketing.cookies.description')}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setConsent('accepted')}
          className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-on-primary"
        >
          {t('marketing.cookies.acceptAll')}
        </button>
        <button
          type="button"
          onClick={() => setConsent('rejected')}
          className="rounded-full bg-surface-container-low px-4 py-2 text-xs font-semibold text-on-surface"
        >
          {t('marketing.cookies.rejectNonEssential')}
        </button>
        <button
          type="button"
          onClick={() => setConsent('accepted')}
          className="rounded-full bg-surface-container-low px-4 py-2 text-xs font-semibold text-on-surface"
        >
          {t('marketing.cookies.customize')}
        </button>
      </div>
    </aside>
  )
}
