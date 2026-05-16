/* Commento didattico:
 * Scopo del file: caricare script analytics solo dopo consenso esplicito.
 * Moduli richiamati: `next/script`, `./CookieConsentProvider`
 * Flusso: legge lo stato consenso dal context e inietta GA soltanto se consenso=accepted.
 */

'use client'

import Script from 'next/script'
import { useCookieConsent } from './CookieConsentProvider'

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export default function MarketingAnalyticsScripts() {
  const { consent } = useCookieConsent()

  if (consent !== 'accepted' || !measurementId) {
    return null
  }

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${measurementId}');`}
      </Script>
    </>
  )
}
