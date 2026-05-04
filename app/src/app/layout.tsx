/* Commento didattico:
 * Scopo del file: definisce il layout radice dell'applicazione: qui si collegano stili globali, provider e struttura base.
 * Moduli richiamati: `next`, `next-intl`, `next-intl/server`
 * Flusso: Questo modulo viene importato dove serve per mantenere separata la responsabilita` del codice.
 */

import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { cookies } from 'next/headers'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Utraya',
    template: '%s | Utraya',
  },
  description:
    'Utraya analizza automaticamente i tuoi canali YouTube preferiti così rimani sempre informato in pochi minuti.',
  keywords: ['YouTube', 'AI', 'riepiloghi', 'canali', 'video', 'intelligenza artificiale'],
  authors: [{ name: 'Utraya' }],
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    title: 'Utraya — Consuma YouTube più velocemente con l\'AI',
    description:
      'Riepiloghi AI dei tuoi canali YouTube preferiti. Capisci video da 30 minuti in 60 secondi.',
    siteName: 'Utraya',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()
  const cookieStore = await cookies()
  const themeFromCookie = cookieStore.get('theme')?.value
  const initialTheme = themeFromCookie === 'dark' ? 'dark' : 'light'

  return (
    <html lang={locale} data-theme={initialTheme} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface text-on-surface antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
